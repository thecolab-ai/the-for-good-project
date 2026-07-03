# Git workflow — version control on this repo

> **Scope:** this doc owns the *git mechanics* — branches, pushing, worktrees,
> staying in sync, cleaning up. It does **not** re-explain the pipeline, the
> research method, the labels, or where files go. Those live in their canonical
> homes and this doc defers to them:
> - Pipeline, method, PR checklist → [`CONTRIBUTING.md`](../CONTRIBUTING.md)
> - The agent loop + exact claim/PR/fork/escalation commands → [`AGENTS.md`](../AGENTS.md)
> - Scripts and labels → [`docs/AUTOMATION.md`](AUTOMATION.md)
> - The map of it all → [`docs/OVERVIEW.md`](OVERVIEW.md)
>
> If anything here ever disagrees with those, **they win** — open an issue so we
> fix this doc.

This is written for someone who has used git happily for their **own** projects but has never worked on a repo *with other
people* — never pushed to a shared `main`, never opened a pull request, and has
always kept different **projects** in different editor windows rather than
different **branches of one project**. If that's you, read the mental-shift
section first. If you're an AI agent handling git on someone's behalf, jump to
[Rules for AI agents](#rules-for-ai-agents-handling-git-here) — but the rest
applies to you too.

It's deliberately tool-agnostic. "Your editor/agent" means whatever you use —
an IDE, a desktop assistant, a terminal CLI, a coding agent. The git commands
are the same everywhere; only the buttons differ.

---

## The golden rules (the whole doc in ten lines)

1. **Never commit to `main`. Never push to `main`.** It's branch-protected; you
   can't anyway. All work lands via a pull request.
2. **One issue → one branch → one PR.** Keep each branch to a single piece of work.
3. **Name the branch `<area>/<short-slug>`** (e.g. `research/grant-discovery`).
4. **Reference the issue in the commit** — `(Closes #123)`, except **Discover**
   issues use `(Part of #123)` so the stream root stays open. (Why: [AGENTS.md](../AGENTS.md).)
5. **A PR is reviewed by someone *other* than the author** before it can merge.
   You can't approve or merge your own work.
6. **Want several things open at once?** Use **worktrees**, not several clones —
   one repo, many folders, each on a different branch.
7. **Keep local config out of commits** — your `CLAUDE.md` and
   `.claude/settings.local.json` are personal and already gitignored.
8. **Merges are squash-merges**, so don't agonise over tidy branch history — it
   collapses to one commit on merge.
9. **After your PR merges, delete the branch and clean up any worktree.**
10. **When a step needs write access you don't have, escalate — don't work
    around it.** ([ADR-0009](adr/0009-maintainer-escalation-handoff.md))

---

## The mental shift: solo git → a shared repo

Three habits from solo work will trip you up. Here's the correction for each.

### 1. "I commit straight to `main`." → You never touch `main` directly.

On your own projects, `main` is just where you work. Here, `main` is the
published, protected trunk — the version everyone builds on. You are not allowed
to push to it, and that's the safety rail, not a limitation. **Every change goes
onto a branch and enters `main` only through a reviewed PR.** Your local `main`
should stay a clean mirror of the remote — you *read* from it (to start new
branches), you never *write* to it.

### 2. "A commit is done when I commit it." → A commit is a *proposal* until reviewed.

Committing and pushing a branch doesn't change the project. Opening a **pull
request** says "please consider pulling my branch into `main`." It then gets an
**adversarial review by a different identity than you** — whose job is to *refute*
your claims, not rubber-stamp them — and only merges if it survives. You are
accountable for what merges under your name, even when an agent did the typing.

### 3. "Different windows = different projects." → Here, different windows = different *branches of the same project*.

This is the big one for multi-tasking. You're used to one folder per window. On
a shared repo you'll often want branch A open in one window while branch B is
open in another — e.g. writing a finding while a review runs. The tool for that
is a **git worktree** (see [Working on several things at once](#working-on-several-things-at-once-worktrees)).
Don't clone the repo twice — worktrees are cheaper and stay in sync.

---

## The branch model

- **`main`** — protected trunk. Never committed to directly.
- **Working branches** — one per issue, named `<area>/<short-slug>`:
  - `research/<slug>`, `discover/<slug>`, `docs/<slug>`, `build/<slug>`, etc.
  - `<slug>` is short-kebab-case, matching the work (e.g. `research/holiday-programme-subsidies`).
- Keep a branch to **one issue**. If the work splits, that's new issues and new
  branches — don't pile unrelated changes onto one branch.

Commit message shape (mirrors [AGENTS.md](../AGENTS.md), which is canonical):

```
<area>: <what changed> (Closes #<n>)
# Discover issues only — the root must stay open for the stream:
discover: <what changed> (Part of #<n>)
```

Carry `Part of #<parent>` (and `Stream: #<root>` when the parent isn't the root)
in the PR body so the stream label propagates.

---

## The everyday flow

Two paths, depending on whether you have **write access** to this repo. Most
contributors don't — that's normal and fully supported. Both paths produce the
same thing: a PR that gets reviewed.

### If you have write access (push branches to this repo)

```bash
git checkout main
git fetch origin && git pull --ff-only        # start from an up-to-date main
git checkout -b research/<slug>               # branch for your one issue

# ...do the work, then:
npm run validate                              # required for findings/solutions before pushing
git add -A
git commit -m "research: <summary> (Closes #<n>)"
git push -u origin research/<slug>
gh pr create --fill --body "Closes #<n>. Part of #<parent>."
```

### If you don't have write access (the fork path — most contributors)

You can't push branches or edit labels on this repo; you fork and open the PR
across repos. The exact commands are canonical in
[AGENTS.md → "No write access?"](../AGENTS.md#no-write-access-most-contributors);
the shape is:

```bash
gh repo fork --remote --remote-name fork
git checkout -b research/<slug>
# ...work...
git push -u fork research/<slug>
gh pr create --repo thecolab-ai/the-for-good-project \
  --head <your-username>:research/<slug> --base main --fill \
  --body "Closes #<n>. <summary>"
```

To *claim* an issue without label rights, just comment on it — don't fight the
403. (Details: [AGENTS.md](../AGENTS.md).)

### Either way: review happens, then merge

Someone (or the review agent via [`review_work.sh`](AUTOMATION.md)) reviews your
PR. On approval it **squash-merges** and the linked issue closes. You don't merge
your own work.

---

## Working on several things at once (worktrees)

A **worktree** lets one clone have several working folders at once, each checked
out to a different branch, all sharing the same history (`.git`). This is how you
get "branch A in one window, branch B in another" without re-cloning.

**Create a worktree for a branch:**

```bash
# from inside your main folder — new branch + new sibling folder in one step:
git worktree add "../tfg-<slug>" -b research/<slug>

# or check out an EXISTING branch into its own folder:
git worktree add "../tfg-<slug>" some-existing-branch
```

Then **open that folder as a separate project** in a second window/instance of
whatever tool you use (a new IDE window, a second agent session, another
terminal). Each window is fully independent — its own terminal and its own
agent context — but they share one history, so a commit in one is immediately
visible to the others.

**Rules that keep worktrees safe:**

- **The same branch can't be checked out in two worktrees at once** — git blocks
  it on purpose. Each window is a *different* branch. (That's the point.)
- **Put worktree folders outside your main project folder** (siblings), so tools
  don't index one inside the other and you never commit one into the other.
- **Your uncommitted changes are per-folder.** A worktree only sees *committed*
  history, never another folder's uncommitted edits — so work in progress in one
  window can't leak into another.
- **Clean up properly** — don't just delete the folder:
  ```bash
  git worktree list                    # see all active worktrees
  git worktree remove "../tfg-<slug>"  # remove one cleanly
  git worktree prune                   # tidy up after a folder was deleted manually
  ```

> **Heads-up specific to this repo:** the automation scripts
> ([`review_work.sh`](AUTOMATION.md) etc.) create their **own** throwaway
> worktrees under `/tmp/fg-worktree.*` while they run, and remove them
> automatically. If `git worktree list` shows one of those mid-run, it's the
> script's — leave it alone; it cleans itself up.

---

## Staying in sync

`main` moves while you work. Keep up to date so your PR merges cleanly.

**Refresh your local `main` (read-only mirror):**

```bash
git checkout main
git fetch origin
git pull --ff-only          # fast-forward only; main should never need a merge commit
```

**Bring your branch up to date with `main`** before/while a PR is open:

```bash
git checkout research/<slug>
git fetch origin
git merge origin/main       # simplest and safe for beginners
# (experienced users may prefer: git rebase origin/main)
```

Because merges are **squash-merges**, your branch's internal history is discarded
on merge — so a merge commit from `origin/main` on your branch is harmless, and
you don't need a pristine linear history. Optimise for *correct*, not *tidy*.

**Reworking after a "changes requested" review:** commit the fixes and push again
to the *same* branch — the PR updates in place and gets re-reviewed. If it's your
own branch, force-pushing your own rework (`git push --force-with-lease`) is fine;
**never force-push a branch someone else shares.**

---

## Local, uncommitted config — keep it out of git

Working on this repo with an AI agent creates **personal** files that must never
be committed:

- **`/CLAUDE.md`** (root) — a local pointer so Claude Code loads this repo's
  `AGENTS.md`. Yours, not shared.
- **`.claude/settings.local.json`** — your local tool/permission settings.

Both are gitignored at the repo level, so a normal `git add -A` won't pick them
up. If you ever see them in `git status` staged, unstage them — don't commit your
personal agent config into the shared repo. (Shared, checked-in agent config
lives in `AGENTS.md` and the tracked `.claude/skills/` — those *are* meant to be
in git; your per-machine config is not.)

---

## Cleaning up after a merge

Once your PR is squash-merged:

```bash
git checkout main
git fetch origin && git pull --ff-only        # pull in your now-merged work
git branch -d research/<slug>                 # delete the local branch
git worktree remove "../tfg-<slug>"           # if you used a worktree
git remote prune origin                       # tidy deleted remote branches
```

The remote branch is usually auto-deleted by the squash-merge (`--delete-branch`).
Leaving old local branches and worktrees around isn't dangerous, just clutter.

---

## Rules for AI agents handling git here

If you're an agent doing git on a contributor's behalf, follow these so you match
the repository's expectations every time. These restate the golden rules in
imperative form.

1. **Never commit or push to `main`.** Always create a branch first. If you find
   yourself on `main` with changes, branch before committing.
2. **Branch per issue, named `<area>/<slug>`.** One issue's work per branch and
   PR. Don't bundle unrelated changes.
3. **Reference the issue correctly:** `(Closes #<n>)` normally; `(Part of #<n>)`
   for Discover issues (and any stream ROOT), never `Closes`, so the stream
   stays open. Carry `Part of`/`Stream:` in the PR body.
4. **Run `npm run validate` before pushing** any finding or solution; don't push
   work you haven't validated.
5. **Confirm before outward, hard-to-reverse actions** in an interactive session
   — pushing a branch, opening a PR, posting a review, merging — unless the user
   has explicitly opted into an unattended run. (The autopilot scripts in
   [AUTOMATION.md](AUTOMATION.md) *are* that opt-in; a normal chat session is
   not.)
6. **Never review or merge the author's own PR.** An adversarial review must come
   from a different identity; branch protection enforces it. Don't try to route
   around it.
7. **Never force-push a branch you don't own.** Force-with-lease is fine only on
   the author's own PR branch during rework.
8. **Never create, apply, or remove the `review: human-only` label**, and never
   act on a PR that carries it — those are human-maintainer only. ([AGENTS.md](../AGENTS.md))
9. **Keep personal config uncommitted** — never stage `CLAUDE.md` or
   `.claude/settings.local.json`.
10. **When a step needs write access you lack, escalate — don't retry the 403 or
    work around the permission.** Post the exact commands for a maintainer per
    [ADR-0009](adr/0009-maintainer-escalation-handoff.md).
11. **Use worktrees, not destructive checkouts, to work multiple branches.** Never
    stash or discard a user's uncommitted work to switch branches — spin up a
    worktree instead.

---

## Quick command reference

```bash
# start work
git checkout main && git fetch origin && git pull --ff-only
git checkout -b research/<slug>

# save + share
npm run validate
git add -A && git commit -m "research: <summary> (Closes #<n>)"
git push -u origin research/<slug>          # or: git push -u fork research/<slug>
gh pr create --fill

# work several branches at once
git worktree add "../tfg-<slug>" -b research/<slug>
git worktree list
git worktree remove "../tfg-<slug>"

# stay in sync
git fetch origin
git merge origin/main                       # update your branch

# after merge
git checkout main && git pull --ff-only
git branch -d research/<slug>
git remote prune origin
```

---

*This doc owns git mechanics only. For **what** to work on and **how to research
it**, start at [`CONTRIBUTING.md`](../CONTRIBUTING.md); for the agent loop and the
authoritative claim/PR/fork/escalation commands, see [`AGENTS.md`](../AGENTS.md).*
