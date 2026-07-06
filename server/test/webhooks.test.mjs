/**
 * Webhook route + reducer tests (Implementer A).
 *
 * Coverage (per the orchestrator spec):
 *  - valid / invalid / missing X-Hub-Signature-256
 *  - X-GitHub-Delivery dedupe (duplicate → 200, reduce runs once)
 *  - issues / pull_request mirror upserts + live-feed events
 *  - PR-shaped issue_comment payloads never land in the `issues` mirror
 *  - unknown events are stored and 202'd without feed noise
 *  - mirror docs CONVERGE with what the sync job writes (same shapes)
 *
 * Real Redis + Mongo via fgtest-* containers; skipped when docker is
 * unavailable. GitHub is always the mock server — never api.github.com.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";

// config.ts snapshots env at import time — set the secret BEFORE any dist
// import happens (all imports below are dynamic for exactly this reason).
const SECRET = "test-webhook-secret";
process.env.WEBHOOK_SECRET = SECRET;

const { dockerAvailable, startRedis, startMongo } = await import("./helpers/containers.mjs");
const { startMockGitHub, makeIssue, makePull } = await import("./helpers/mock-github.mjs");

const docker = await dockerAvailable();

const sign = (body) => `sha256=${createHmac("sha256", SECRET).update(body).digest("hex")}`;

/** Strip fields that legitimately differ between webhook + sync writes. */
const withoutSyncedAt = ({ syncedAt, ...rest }) => rest;

test("webhooks", { skip: docker ? false : "docker unavailable" }, async (t) => {
  const [{ default: Fastify }, stores, webhooks, reduce, state, sync] = await Promise.all([
    import("fastify"),
    import("../dist/orchestrator/stores.js"),
    import("../dist/routes/webhooks.js"),
    import("../dist/github/reduce.js"),
    import("../dist/state.js"),
    import("../dist/github/sync.js"),
  ]);

  const redis = await startRedis();
  const mongo = await startMongo();
  const mock = await startMockGitHub();
  const orch = await stores.connectOrchestrator({
    redisUrl: redis.url,
    mongoUrl: mongo.url,
    mongoDb: "fgtest_webhooks",
    githubToken: "fgtest-token",
    githubRepo: "example/repo",
    githubApiUrl: mock.url,
    maxSyncPages: 20,
  });
  assert.ok(orch, "orchestrator connected");

  const store = new state.FleetStore();
  const app = Fastify({ logger: false });
  webhooks.registerWebhookRoutes(app, store, orch);
  await app.ready();

  t.after(async () => {
    await app.close();
    await orch.close();
    await mock.close();
    await redis.stop();
    await mongo.stop();
  });

  const issues = () => orch.db.collection("issues");
  const pulls = () => orch.db.collection("pulls");
  const deliveries = () => orch.db.collection("webhook_deliveries");

  const post = (event, payload, { deliveryId = randomUUID(), signature, headers = {} } = {}) => {
    const body = JSON.stringify(payload);
    return app.inject({
      method: "POST",
      url: "/api/v1/webhooks/github",
      headers: {
        "content-type": "application/json",
        "x-github-event": event,
        "x-github-delivery": deliveryId,
        "x-hub-signature-256": signature ?? sign(body),
        ...headers,
      },
      payload: body,
    });
  };

  // ---------------------------------------------------------------- signature

  await t.test("valid signature: issues.opened upserts mirror + feeds issue_opened", async () => {
    const raw = makeIssue({
      number: 101,
      title: "Research question X",
      labels: ["status: available", "stage: research", "stream:12"],
      assignees: ["bob"],
      body: "What would it take?",
      user: "alice",
    });
    const res = await post("issues", { action: "opened", issue: raw, sender: { login: "alice" } });
    assert.equal(res.statusCode, 202);
    assert.deepEqual(res.json(), { ok: true });

    const doc = await issues().findOne({ _id: 101 });
    assert.ok(doc, "mirror doc written");
    assert.equal(typeof doc.syncedAt, "string");
    assert.deepEqual(withoutSyncedAt(doc), {
      _id: 101,
      number: 101,
      title: "Research question X",
      state: "open",
      labels: ["status: available", "stage: research", "stream:12"],
      assignees: ["bob"],
      body: "What would it take?",
      user: "alice",
      htmlUrl: raw.html_url,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      closedAt: null,
    });

    const event = store.recentEvents()[0];
    assert.equal(event.kind, "issue_opened");
    assert.ok(event.text.includes("#101"), event.text);
    assert.equal(event.handle, "alice");
    assert.equal(event.ref, "#101");

    const stored = await deliveries().findOne({ issueNumber: 101 });
    assert.ok(stored, "delivery stored");
    assert.equal(stored.event, "issues");
    assert.equal(stored.action, "opened");
    assert.equal(stored.sender, "alice");
  });

  await t.test("invalid signature → 401, nothing stored", async () => {
    const before = await deliveries().countDocuments();
    const payload = { action: "opened", issue: makeIssue({ number: 999 }) };
    const res = await post("issues", payload, { signature: `sha256=${"0".repeat(64)}` });
    assert.equal(res.statusCode, 401);
    assert.equal(await deliveries().countDocuments(), before);
    assert.equal(await issues().findOne({ _id: 999 }), null);
  });

  await t.test("missing signature → 401", async () => {
    const body = JSON.stringify({ action: "opened", issue: makeIssue({ number: 998 }) });
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/webhooks/github",
      headers: {
        "content-type": "application/json",
        "x-github-event": "issues",
        "x-github-delivery": randomUUID(),
      },
      payload: body,
    });
    assert.equal(res.statusCode, 401);
  });

  await t.test("malformed signature header (wrong scheme / bad hex) → 401", async () => {
    const payload = { action: "opened", issue: makeIssue({ number: 997 }) };
    for (const signature of ["sha1=deadbeef", "sha256=nothex!", "sha256=abcd"]) {
      const res = await post("issues", payload, { signature });
      assert.equal(res.statusCode, 401, `signature ${signature}`);
    }
  });

  // ------------------------------------------------------------------ dedupe

  await t.test("duplicate X-GitHub-Delivery → 200, reduce runs once", async () => {
    const deliveryId = randomUUID();
    const payload = {
      action: "opened",
      issue: makeIssue({ number: 102, title: "Dedupe me", user: "alice" }),
      sender: { login: "alice" },
    };
    const first = await post("issues", payload, { deliveryId });
    assert.equal(first.statusCode, 202);
    const eventsAfterFirst = store.recentEvents().length;

    const second = await post("issues", payload, { deliveryId });
    assert.equal(second.statusCode, 200);
    assert.deepEqual(second.json(), { ok: true, duplicate: true });
    assert.equal(store.recentEvents().length, eventsAfterFirst, "no second feed event");
    assert.equal(await deliveries().countDocuments({ _id: deliveryId }), 1);
  });

  // ------------------------------------------------------------- reduce paths

  await t.test("issues.labeled refreshes mirror labels without feed noise", async () => {
    const before = store.recentEvents().length;
    const raw = makeIssue({
      number: 101,
      title: "Research question X",
      labels: ["status: claimed", "stage: research", "stream:12"],
      assignees: ["bob"],
      user: "alice",
    });
    const res = await post("issues", { action: "labeled", issue: raw, sender: { login: "adam91holt" } });
    assert.equal(res.statusCode, 202);
    const doc = await issues().findOne({ _id: 101 });
    assert.deepEqual(doc.labels, ["status: claimed", "stage: research", "stream:12"]);
    assert.equal(store.recentEvents().length, before, "labeled is mirror-only");
  });

  await t.test("issues.closed feeds issue_closed", async () => {
    const raw = makeIssue({ number: 101, state: "closed", closedAt: new Date().toISOString(), user: "alice" });
    const res = await post("issues", { action: "closed", issue: raw, sender: { login: "alice" } });
    assert.equal(res.statusCode, 202);
    assert.equal((await issues().findOne({ _id: 101 })).state, "closed");
    assert.equal(store.recentEvents()[0].kind, "issue_closed");
  });

  await t.test("pull_request merged → pulls mirror + pr_merged", async () => {
    const mergedAt = new Date().toISOString();
    const raw = {
      ...makePull({ number: 207, title: "feat: thing", state: "closed", mergedAt }),
      merged: true,
    };
    const res = await post("pull_request", { action: "closed", pull_request: raw, sender: { login: "adam91holt" } });
    assert.equal(res.statusCode, 202);

    const doc = await pulls().findOne({ _id: 207 });
    assert.ok(doc);
    assert.deepEqual(withoutSyncedAt(doc), {
      _id: 207,
      number: 207,
      title: "feat: thing",
      state: "closed",
      draft: false,
      labels: [],
      user: "octocat",
      htmlUrl: raw.html_url,
      headRef: raw.head.ref,
      headSha: raw.head.sha,
      headRepoFullName: "example/repo",
      baseRef: "main",
      merged: true,
      mergedAt,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });

    const event = store.recentEvents()[0];
    assert.equal(event.kind, "pr_merged");
    assert.equal(event.ref, "#207");
  });

  await t.test("pull_request opened → pr_opened", async () => {
    const raw = makePull({ number: 208, title: "wip" });
    const res = await post("pull_request", { action: "opened", pull_request: raw, sender: { login: "carol" } });
    assert.equal(res.statusCode, 202);
    assert.equal(store.recentEvents()[0].kind, "pr_opened");
    assert.ok(await pulls().findOne({ _id: 208 }));
  });

  await t.test("issue_comment on an issue → gh_activity + mirror refresh", async () => {
    // The preceding issues.closed subtest left mirror doc #101 with state
    // "closed"; this comment's payload carries state "open", so the mirror
    // check below flips ONLY if the comment actually refreshed the doc.
    assert.equal((await issues().findOne({ _id: 101 })).state, "closed", "precondition");
    const raw = makeIssue({ number: 101, title: "Research question X", user: "alice" });
    const res = await post("issue_comment", {
      action: "created",
      issue: raw,
      comment: { body: "nice" },
      sender: { login: "carol" },
    });
    assert.equal(res.statusCode, 202);
    const event = store.recentEvents()[0];
    assert.equal(event.kind, "gh_activity");
    assert.equal(event.handle, "carol");
    assert.equal(event.ref, "#101");
    const doc = await issues().findOne({ _id: 101 });
    assert.equal(doc.state, "open", "the comment webhook refreshed the issues mirror");
    assert.equal(doc.updatedAt, raw.updated_at, "mirror carries the payload's freshness");
  });

  await t.test("issue_comment on a PR never lands in the issues mirror", async () => {
    const prShaped = { ...makeIssue({ number: 207, title: "feat: thing" }), pull_request: { url: "x" } };
    const res = await post("issue_comment", {
      action: "created",
      issue: prShaped,
      comment: { body: "lgtm" },
      sender: { login: "carol" },
    });
    assert.equal(res.statusCode, 202);
    assert.equal(await issues().findOne({ _id: 207 }), null, "PR-shaped item must not enter issues");
    assert.equal(store.recentEvents()[0].kind, "gh_activity");
    assert.ok(store.recentEvents()[0].text.includes("PR #207"));
  });

  await t.test("pull_request_review submitted → gh_activity with verdict", async () => {
    const raw = makePull({ number: 207, state: "closed" });
    const res = await post("pull_request_review", {
      action: "submitted",
      review: { state: "changes_requested" },
      pull_request: raw,
      sender: { login: "dave" },
    });
    assert.equal(res.statusCode, 202);
    const event = store.recentEvents()[0];
    assert.equal(event.kind, "gh_activity");
    assert.ok(event.text.includes("requested changes"), event.text);
  });

  await t.test("pull_request_review persists reviewer/state/commitId; synchronize moves headSha", async () => {
    const raw = makePull({ number: 209, headSha: "sha-209-1" });
    let res = await post("pull_request_review", {
      action: "submitted",
      review: { state: "changes_requested", commit_id: "sha-209-1", submitted_at: "2026-07-01T00:00:00Z", user: { login: "dave" } },
      pull_request: raw,
      sender: { login: "dave" },
    });
    assert.equal(res.statusCode, 202);
    let doc = await pulls().findOne({ _id: 209 });
    assert.equal(doc.headSha, "sha-209-1", "pull_request payload's head.sha mirrored");
    assert.deepEqual(doc.reviews, [
      { reviewer: "dave", state: "changes_requested", commitId: "sha-209-1", at: "2026-07-01T00:00:00Z" },
    ]);

    // A second reviewer APPENDS; the same reviewer+commit dedupes
    // keep-latest instead of growing the array.
    res = await post("pull_request_review", {
      action: "submitted",
      review: { state: "approved", commit_id: "sha-209-1", submitted_at: "2026-07-02T00:00:00Z", user: { login: "erin" } },
      pull_request: raw,
      sender: { login: "erin" },
    });
    assert.equal(res.statusCode, 202);
    res = await post("pull_request_review", {
      action: "edited",
      review: { state: "changes_requested", commit_id: "sha-209-1", submitted_at: "2026-07-03T00:00:00Z", user: { login: "dave" } },
      pull_request: raw,
      sender: { login: "dave" },
    });
    assert.equal(res.statusCode, 202);
    doc = await pulls().findOne({ _id: 209 });
    assert.deepEqual(
      doc.reviews.map((r) => [r.reviewer, r.state, r.at]),
      [
        ["erin", "approved", "2026-07-02T00:00:00Z"],
        ["dave", "changes_requested", "2026-07-03T00:00:00Z"],
      ],
      "dedupe by reviewer+commitId keeps the latest; distinct reviewers append",
    );

    // A DISMISSAL supersedes the entry it dismisses (same reviewer+commit,
    // same submitted_at — the payload carries the original review's) instead
    // of coexisting with it — so review dispatch's round count drops when a
    // maintainer dismisses stale changes-requests, matching the shell's
    // GraphQL states:CHANGES_REQUESTED count.
    res = await post("pull_request_review", {
      action: "dismissed",
      review: { state: "dismissed", commit_id: "sha-209-1", submitted_at: "2026-07-03T00:00:00Z", user: { login: "dave" } },
      pull_request: raw,
      sender: { login: "maintainer" },
    });
    assert.equal(res.statusCode, 202);
    doc = await pulls().findOne({ _id: 209 });
    assert.deepEqual(
      doc.reviews.map((r) => [r.reviewer, r.state]),
      [
        ["erin", "approved"],
        ["dave", "dismissed"],
      ],
      "the dismissal REPLACED dave's changes_requested entry (no ghost CR round)",
    );

    // Rework pushed: pull_request synchronize moves the mirrored head and
    // must NOT wipe the accumulated reviews ($set upsert, not replace).
    const rebased = makePull({ number: 209, headSha: "sha-209-2" });
    res = await post("pull_request", { action: "synchronize", pull_request: rebased, sender: { login: "octocat" } });
    assert.equal(res.statusCode, 202);
    doc = await pulls().findOne({ _id: 209 });
    assert.equal(doc.headSha, "sha-209-2", "synchronize updated headSha");
    assert.equal(doc.reviews.length, 2, "reviews survive the pull refresh");

    // A payload without the fields an entry needs (the minimal fixtures
    // elsewhere in this file) refreshes the mirror but appends nothing.
    res = await post("pull_request_review", {
      action: "submitted",
      review: { state: "approved" },
      pull_request: rebased,
      sender: { login: "erin" },
    });
    assert.equal(res.statusCode, 202);
    doc = await pulls().findOne({ _id: 209 });
    assert.equal(doc.reviews.length, 2, "partial review payloads never poison the doc");
  });

  await t.test("unknown event: stored, 202, no feed", async () => {
    const before = store.recentEvents().length;
    const deliveryId = randomUUID();
    const res = await post("star", { action: "created", sender: { login: "fan" } }, { deliveryId });
    assert.equal(res.statusCode, 202);
    assert.equal(store.recentEvents().length, before);
    assert.equal(await deliveries().countDocuments({ _id: deliveryId }), 1);
  });

  await t.test("ping: stored, 202, no feed", async () => {
    const before = store.recentEvents().length;
    const res = await post("ping", { zen: "Keep it logically awesome." });
    assert.equal(res.statusCode, 202);
    assert.equal(store.recentEvents().length, before);
  });

  await t.test("push to default branch feeds gh_activity; branch pushes stay quiet", async () => {
    const base = {
      repository: { default_branch: "main" },
      commits: [{ id: "a" }, { id: "b" }],
      sender: { login: "adam91holt" },
    };
    const main = await post("push", { ...base, ref: "refs/heads/main" });
    assert.equal(main.statusCode, 202);
    const event = store.recentEvents()[0];
    assert.equal(event.kind, "gh_activity");
    assert.ok(event.text.includes("2 commits"), event.text);

    const before = store.recentEvents().length;
    const branch = await post("push", { ...base, ref: "refs/heads/research/some-slug" });
    assert.equal(branch.statusCode, 202);
    assert.equal(store.recentEvents().length, before, "branch push is quiet");
  });

  await t.test("partial payload tolerated (no crash, no doc)", async () => {
    // The route swallows every reduce exception (202 regardless), so 202
    // alone proves nothing — assert the reducer contract directly too.
    assert.equal(
      await reduce.reduceWebhook(orch, { event: "issues", action: "opened", payload: { action: "opened" } }),
      null,
      "reducer refuses a payload with no issue instead of throwing or writing garbage",
    );
    const issuesBefore = await issues().countDocuments();
    const res = await post("issues", { action: "opened" }); // no issue at all
    assert.equal(res.statusCode, 202);
    assert.equal(await issues().countDocuments(), issuesBefore, "no doc written for the partial payload");
    assert.equal(await issues().findOne({ _id: null }), null, "no undefined/null-keyed garbage doc");
  });

  // ------------------------------------------------- malformed requests

  await t.test("missing/empty webhook headers → 400, nothing stored", async () => {
    const body = JSON.stringify({ action: "opened", issue: makeIssue({ number: 990 }) });
    const base = { "content-type": "application/json", "x-hub-signature-256": sign(body) };
    const cases = [
      { ...base, "x-github-delivery": randomUUID() }, // missing event
      { ...base, "x-github-event": "", "x-github-delivery": randomUUID() }, // empty event
      { ...base, "x-github-event": "issues" }, // missing delivery
      { ...base, "x-github-event": "issues", "x-github-delivery": "" }, // empty delivery
    ];
    for (const headers of cases) {
      const before = await deliveries().countDocuments();
      const res = await app.inject({ method: "POST", url: "/api/v1/webhooks/github", headers, payload: body });
      assert.equal(res.statusCode, 400, JSON.stringify(headers));
      assert.match(res.json().error, /missing webhook headers/);
      assert.equal(await deliveries().countDocuments(), before, "header-less delivery never stored");
    }
    assert.equal(await issues().findOne({ _id: 990 }), null, "mirror untouched");
  });

  await t.test("signed non-object JSON payloads → 400, nothing stored", async () => {
    for (const raw of ["[1,2]", '"str"', "null", "42"]) {
      const before = await deliveries().countDocuments();
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/webhooks/github",
        headers: {
          "content-type": "application/json",
          "x-github-event": "issues",
          "x-github-delivery": randomUUID(),
          "x-hub-signature-256": sign(raw),
        },
        payload: raw,
      });
      assert.equal(res.statusCode, 400, raw);
      assert.match(res.json().error, /invalid JSON payload/);
      assert.equal(await deliveries().countDocuments(), before);
    }
  });

  await t.test("1MB body limit: over → 413 and nothing stored; just-under → 202", async () => {
    const before = await deliveries().countDocuments();
    const over = JSON.stringify({ action: "created", filler: "x".repeat(1024 * 1024) });
    const resOver = await app.inject({
      method: "POST",
      url: "/api/v1/webhooks/github",
      headers: {
        "content-type": "application/json",
        "x-github-event": "bigload",
        "x-github-delivery": randomUUID(),
        "x-hub-signature-256": sign(over),
      },
      payload: over,
    });
    assert.equal(resOver.statusCode, 413, "an oversized delivery is refused by the route bodyLimit");
    assert.equal(await deliveries().countDocuments(), before, "nothing stored for the oversized body");

    const under = JSON.stringify({ action: "created", filler: "x".repeat(900 * 1024) });
    const resUnder = await app.inject({
      method: "POST",
      url: "/api/v1/webhooks/github",
      headers: {
        "content-type": "application/json",
        "x-github-event": "bigload",
        "x-github-delivery": randomUUID(),
        "x-hub-signature-256": sign(under),
      },
      payload: under,
    });
    assert.equal(resUnder.statusCode, 202, "the limit doesn't reject legitimate large payloads");
  });

  // -------------------------------------------------- convergence with sync

  await t.test("webhook and sync write IDENTICAL issue docs (modulo syncedAt)", async () => {
    const raw = makeIssue({
      number: 301,
      title: "Convergence issue",
      labels: ["stage: research", "status: available"],
      assignees: ["erin"],
      body: "body text",
      user: "frank",
    });
    mock.seed({ issues: [raw], pulls: [] });

    await sync.runIncrementalSync(orch);
    const fromSync = await issues().findOne({ _id: 301 });
    assert.ok(fromSync, "sync wrote the issue");

    await issues().deleteOne({ _id: 301 });
    const res = await post("issues", { action: "edited", issue: raw, sender: { login: "frank" } });
    assert.equal(res.statusCode, 202);
    const fromWebhook = await issues().findOne({ _id: 301 });
    assert.ok(fromWebhook, "webhook wrote the issue");

    assert.deepEqual(withoutSyncedAt(fromWebhook), withoutSyncedAt(fromSync));
  });

  await t.test("webhook and sync write IDENTICAL pull docs (modulo syncedAt)", async () => {
    const raw = makePull({
      number: 302,
      title: "Convergence PR",
      labels: ["stream:12"],
      user: "grace",
      headRef: "research/foo",
      headRepoFullName: "fork/repo",
    });
    mock.seed({ issues: [], pulls: [raw] });

    // Full sync reads /pulls (the complete PR shape), the fair comparison
    // for a webhook's full pull_request object.
    await sync.runFullSync(orch);
    const fromSync = await pulls().findOne({ _id: 302 });
    assert.ok(fromSync, "sync wrote the pull");

    await pulls().deleteOne({ _id: 302 });
    const res = await post("pull_request", { action: "synchronize", pull_request: raw, sender: { login: "grace" } });
    assert.equal(res.statusCode, 202);
    const fromWebhook = await pulls().findOne({ _id: 302 });
    assert.ok(fromWebhook, "webhook wrote the pull");

    assert.deepEqual(withoutSyncedAt(fromWebhook), withoutSyncedAt(fromSync));
  });

  // ------------------------------------------------------------ unit: reduce

  await t.test("reduceWebhook returns null for handled-but-quiet events", async () => {
    for (const event of ["check_run", "label", "workflow_run", "ping"]) {
      assert.equal(await reduce.reduceWebhook(orch, { event, payload: {} }), null, event);
    }
  });

  await t.test("stored issue bodies are capped (shared canonical mapper)", () => {
    const doc = sync.issueDocFromRaw(
      { ...makeIssue({ number: 400 }), body: "x".repeat(sync.ISSUE_BODY_CAP + 5000) },
      new Date().toISOString(),
    );
    assert.equal(doc.body.length, sync.ISSUE_BODY_CAP);
  });
});
