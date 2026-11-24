#!/usr/bin/env node
// charities-register-grantmaker-replication.mjs — independent replication of the
// Charities Register "probable grantmaker" census.
//
// Backs research/findings/grant-access/charities-register-grantmaker-census-replication.md,
// which re-tests the figures in
//   research/findings/grant-access/charities-register-grantmaker-census.md
//   (5,568 entities / NZ$1,210,961,861 in a 2026-07-02 pull)
// so a reviewer can regenerate every number instead of trusting one pull.
//
// It computes the published figure two ways:
//   A. "faithful"    — the published join logic, unchanged, on the
//                      GrpOrgLatestReturns view.
//   B. "independent" — the same definition, but the latest return per entity
//                      is selected by this script from the raw AnnualReturn
//                      table, joined to registered Organisations and Groups.
// Then it runs sensitivity checks on set A: stale returns, Group/member
// overlap, entities funded mainly by non-government grants (possible
// regranting), concentration, grant spend above total expenditure, and change
// since the July pull. It also emits a deterministic spot-check sample.
//
// It fetches ONLY public, aggregate, organisation-level data from the
// Charities Services open-data service (CC BY 3.0 NZ). No officer data.
//
// Usage:
//   node scripts/research/charities-register-grantmaker-replication.mjs \
//     > research/data/charities-register-grantmaker-replication/run-YYYY-MM-DD.json
//   Add `--cache <dir>` to keep the raw pulls on disk and re-use them.
//
// The register is live and mutable, so a later run will differ; the output is
// a dated, reproducible-as-of-access record.

import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.odata.charities.govt.nz";
const REGISTERED = "RegistrationStatus eq 'Registered'";
const PUBLISHED = { pulledAt: "2026-07-02T10:33:00Z", conservativeCount: 5568, conservativeSum: 1210961861, broadCount: 10873, broadSum: 1855868384 };
const FIRST_YEAR = 2007; // the register opened in 2007
const STALE_BEFORE = "2024-01-01"; // a latest return older than this is stale
const PASS_THROUGH_SHARE = 0.5;

// Grant spend: the four payment fields the original finding sums.
const SPEND_FIELDS = ["GrantsPaidWithinNZ", "GrantsPaidOutsideNZ", "GrantsorDonationsPaid", "GrantsAndDonationsMade"];
// Non-government grant income (legacy + current forms). Government grants are
// excluded: they are not in the register total, so they cannot double count.
const GRANT_INCOME_FIELDS = ["GrantsRevenueFromOtherSources", "GeneralGrantsReceived", "AllOtherGrantsAndSponsorship"];

const cacheIdx = process.argv.indexOf("--cache");
const CACHE = cacheIdx > 0 ? process.argv[cacheIdx + 1] : null;
if (CACHE) fs.mkdirSync(CACHE, { recursive: true });

const log = (...a) => console.error("[replication]", ...a);
const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));
const spend = (r) => SPEND_FIELDS.reduce((s, f) => s + num(r[f]), 0);
const sum = (rows, fn = spend) => rows.reduce((s, r) => s + fn(r), 0);
const round = (n) => Math.round(n);

function buildUrl(entity, params) {
  const q = Object.entries({ ...params, $format: "json", $returnall: "true" })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `${BASE}/${entity}?${q}`;
}

async function pull(name, entity, params) {
  const file = CACHE && path.join(CACHE, `${name}.json`);
  if (file && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const url = buildUrl(entity, params);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(300_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = (await res.json()).d;
      const rows = Array.isArray(d) ? d : d.results;
      log(`${name}: ${rows.length} rows`);
      if (file) fs.writeFileSync(file, JSON.stringify(rows));
      return rows;
    } catch (err) {
      log(`${name}: attempt ${attempt} failed (${err.message})`);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

const hasSignal = (e) =>
  e.PurposeToGiveGrantsAndDonations === true ||
  e.OrganisationGeneratesFundsGrantsDonationsToOthers === true ||
  e.MainActivityId === 2 ||
  e.MainActivityId === 3;

// OData v2 JSON dates arrive as ISO strings or "/Date(ms)/".
function isoDate(v) {
  if (!v) return null;
  const m = /\/Date\((-?\d+)/.exec(v);
  return m ? new Date(Number(m[1])).toISOString() : new Date(v).toISOString();
}

function setSummary(rows) {
  return { entities: rows.length, grantSpendNZD: round(sum(rows)) };
}

function conservativeAndBroad(rows, signalKeys, keyOf) {
  const broad = rows.filter((r) => spend(r) > 0);
  const conservative = broad.filter((r) => signalKeys.has(keyOf(r)));
  return { conservative, broad };
}

async function main() {
  const accessedAt = new Date().toISOString();

  const orgs = await pull("organisations", "Organisations", {
    $select: "OrganisationId,CharityRegistrationNumber,Name,MainActivityId,OrganisationGeneratesFundsGrantsDonationsToOthers,PurposeToGiveGrantsAndDonations,GroupId,GroupType",
    $filter: REGISTERED,
  });
  const groups = await pull("groups", "Groups", {
    $select: "GroupId,RegistrationNumber,name,MainActivityId,OrganisationGeneratesFundsGrantsDonationsToOthers,PurposeToGiveGrantsAndDonations,HasIndividualAnnualReturn,GroupType",
    $filter: REGISTERED,
  });
  const latest = await pull("latest-returns", "GrpOrgLatestReturns", {
    $select: ["Id,EntityType,CharityRegistrationNumber,AnnualReturnId,ReportingTier,YearEnded,Status,ModifiedOn,ParentGroupId,TotalExpenditure,TotalGrossIncome", ...SPEND_FIELDS, ...GRANT_INCOME_FIELDS].join(","),
    $filter: REGISTERED,
  });

  // Raw AnnualReturn table, one calendar year of YearEnded per request
  // (a single unfiltered pull times out on the service).
  const thisYear = new Date().getUTCFullYear();
  const allReturns = [];
  for (let y = FIRST_YEAR; y <= thisYear + 1; y++) {
    const rows = await pull(`annual-returns-${y}`, "AnnualReturn", {
      $select: ["AnnualReturnId,OrganisationId,GroupId,YearEnded,Status,ModifiedOn", ...SPEND_FIELDS].join(","),
      $filter: `YearEnded ge datetime'${y}-01-01T00:00:00' and YearEnded lt datetime'${y + 1}-01-01T00:00:00'`,
    });
    allReturns.push(...rows);
  }

  // ---- A. faithful re-run of the published logic -------------------------
  const signalKeys = new Set([
    ...orgs.filter(hasSignal).map((o) => `Organisation:${o.OrganisationId}`),
    ...groups.filter(hasSignal).map((g) => `Group:${g.GroupId}`),
  ]);
  const latestKey = (r) => `${r.EntityType}:${r.Id}`;
  const latestKeys = new Set(latest.map(latestKey));
  const A = conservativeAndBroad(latest, signalKeys, latestKey);

  // ---- B. independent path: latest return chosen from AnnualReturn -------
  const registered = new Map([
    ...orgs.map((o) => [`Organisation:${o.OrganisationId}`, o]),
    ...groups.map((g) => [`Group:${g.GroupId}`, g]),
  ]);
  const rawKey = (r) => (r.GroupId ? `Group:${r.GroupId}` : `Organisation:${r.OrganisationId}`);
  // Latest return per registered entity, optionally only among returns that
  // pass `keep` (used below to rebuild the register as it stood in July).
  function latestPerEntity(keep = () => true) {
    const best = new Map();
    for (const r of allReturns) {
      const k = rawKey(r);
      if (!registered.has(k) || !keep(r)) continue;
      const cur = best.get(k);
      const newer = !cur || isoDate(r.YearEnded) > isoDate(cur.YearEnded) ||
        (isoDate(r.YearEnded) === isoDate(cur.YearEnded) && r.AnnualReturnId > cur.AnnualReturnId);
      if (newer) best.set(k, r);
    }
    return best;
  }
  const latestRaw = latestPerEntity();
  const Brows = [...latestRaw.values()];
  const B = conservativeAndBroad(Brows, signalKeys, rawKey);

  const aCons = new Map(A.conservative.map((r) => [latestKey(r), r]));
  const bCons = new Map(B.conservative.map((r) => [rawKey(r), r]));
  const onlyA = [...aCons.keys()].filter((k) => !bCons.has(k));
  const onlyB = [...bCons.keys()].filter((k) => !aCons.has(k));
  const both = [...aCons.keys()].filter((k) => bCons.has(k));
  const sameReturn = both.filter((k) => aCons.get(k).AnnualReturnId === bCons.get(k).AnnualReturnId);
  const sameSpend = both.filter((k) => Math.abs(spend(aCons.get(k)) - spend(bCons.get(k))) < 1);

  const nameOf = (r) => (r.EntityType === "Group" ? groups.find((g) => g.GroupId === r.Id)?.name : orgs.find((o) => o.OrganisationId === r.Id)?.Name);

  // ---- sensitivity checks on set A (conservative) -------------------------
  const cons = A.conservative;
  const year = (r) => isoDate(r.YearEnded)?.slice(0, 4);
  const byYear = {};
  for (const r of cons) {
    const y = year(r);
    byYear[y] ??= { entities: 0, grantSpendNZD: 0 };
    byYear[y].entities += 1;
    byYear[y].grantSpendNZD += round(spend(r));
  }
  const stale = cons.filter((r) => isoDate(r.YearEnded) < `${STALE_BEFORE}T00:00:00.000Z`);

  // Group/member overlap: member returns sitting under a Group that is itself
  // in the set. If the Group return consolidates its members, this money is
  // counted twice. Membership comes from Organisations.GroupId and from
  // GrpOrgLatestReturns.ParentGroupId.
  const orgGroup = new Map(orgs.map((o) => [o.OrganisationId, o.GroupId]));
  const consGroupIds = new Set(cons.filter((r) => r.EntityType === "Group").map((r) => r.Id));
  const memberUnderConsGroup = cons.filter(
    (r) => r.EntityType === "Organisation" && (consGroupIds.has(r.ParentGroupId) || consGroupIds.has(orgGroup.get(r.Id))),
  );

  // Possible regranting: majority of gross income is non-government grants.
  const grantIncome = (r) => GRANT_INCOME_FIELDS.reduce((s, f) => s + num(r[f]), 0);
  const passThrough = cons.filter((r) => num(r.TotalGrossIncome) > 0 && grantIncome(r) / num(r.TotalGrossIncome) >= PASS_THROUGH_SHARE);

  // Grantmakers the four spend fields cannot see: a signal entity whose latest
  // return has all four fields empty (null, not zero). Tier 1/2 returns only
  // gained a grant-spend field with the new return form, so older large
  // returns are blind here. TotalExpenditure is an upper bound, not a grant sum.
  const blind = latest.filter((r) => signalKeys.has(latestKey(r)) && SPEND_FIELDS.every((f) => r[f] === null || r[f] === undefined));
  const blindByTier = {};
  for (const r of blind) blindByTier[r.ReportingTier] = (blindByTier[r.ReportingTier] ?? 0) + 1;

  // Which spend field carries the money, by year of the return, across every
  // return filed by a signal entity. Shows when each field came into use.
  const coverage = {};
  for (const r of allReturns) {
    if (!signalKeys.has(rawKey(r))) continue;
    const y = year(r);
    coverage[y] ??= { returns: 0, allSpendFieldsNull: 0, nonNull: Object.fromEntries(SPEND_FIELDS.map((f) => [f, 0])), sumNZD: Object.fromEntries(SPEND_FIELDS.map((f) => [f, 0])) };
    const c = coverage[y];
    c.returns += 1;
    if (SPEND_FIELDS.every((f) => r[f] === null || r[f] === undefined)) c.allSpendFieldsNull += 1;
    for (const f of SPEND_FIELDS) {
      if (r[f] !== null && r[f] !== undefined) c.nonNull[f] += 1;
      c.sumNZD[f] += round(num(r[f]));
    }
  }

  const overExpenditure = cons.filter((r) => num(r.TotalExpenditure) > 0 && spend(r) > num(r.TotalExpenditure) + 1);
  const multiField = cons.filter((r) => {
    const pos = SPEND_FIELDS.filter((f) => num(r[f]) > 0);
    return pos.length > 1 && !(pos.length === 2 && pos.includes("GrantsPaidWithinNZ") && pos.includes("GrantsPaidOutsideNZ"));
  });

  const sorted = [...cons].sort((a, b) => spend(b) - spend(a));
  const total = sum(cons);
  const share = (n) => ({ entities: n, grantSpendNZD: round(sum(sorted.slice(0, n))), shareOfTotal: +(sum(sorted.slice(0, n)) / total).toFixed(4) });
  const bands = [1e3, 1e4, 1e5, 1e6].map((t) => ({ atLeastNZD: t, entities: cons.filter((r) => spend(r) >= t).length }));

  const pulledAt = new Date(PUBLISHED.pulledAt).toISOString();
  const changedSinceJuly = cons.filter((r) => isoDate(r.ModifiedOn) > pulledAt);

  // July proxy: drop every return modified after the published pull, then
  // re-pick the latest return. Entities registered or deregistered since July
  // cannot be rebuilt (today's registered list is used), so this is a proxy.
  const julyRows = [...latestPerEntity((r) => isoDate(r.ModifiedOn) <= pulledAt).values()];
  const july = conservativeAndBroad(julyRows, signalKeys, rawKey);

  // Fixed-year view: one financial year per entity instead of a mix of years.
  // Calendar year of YearEnded = the financial year label used here.
  const fixedYear = (y) => {
    const rows = [...latestPerEntity((r) => isoDate(r.YearEnded)?.slice(0, 4) === String(y)).values()];
    const s = conservativeAndBroad(rows, signalKeys, rawKey);
    return { yearEnded: String(y), conservative: setSummary(s.conservative), broad: setSummary(s.broad) };
  };

  // ---- deterministic spot-check sample ------------------------------------
  // 5 from the top 50 by grant spend (ranks 1, 11, 21, 31, 41) plus 15 evenly
  // spaced through the rest of the set, sorted by registration number.
  // Registration numbers only: small private trusts are often named after a
  // person. Names appear only in top10, which are large institutions.
  const rest = sorted.slice(50).sort((a, b) => a.CharityRegistrationNumber.localeCompare(b.CharityRegistrationNumber));
  const step = Math.floor(rest.length / 15);
  const picks = [0, 10, 20, 30, 40].map((i) => sorted[i]).concat(Array.from({ length: 15 }, (_, i) => rest[i * step]));
  const sample = picks.map((r) => ({
    registrationNumber: r.CharityRegistrationNumber,
    entityType: r.EntityType,
    yearEnded: isoDate(r.YearEnded)?.slice(0, 10),
    reportingTier: r.ReportingTier,
    grantSpendNZD: round(spend(r)),
    fields: Object.fromEntries(SPEND_FIELDS.map((f) => [f, r[f]])),
    totalExpenditureNZD: num(r.TotalExpenditure),
    summaryUrl: `https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/charity-summary/?ent=${r.CharityRegistrationNumber}`,
  }));

  const out = {
    meta: {
      accessedAt,
      source: `${BASE} (Charities Services open data, CC BY 3.0 NZ)`,
      published: PUBLISHED,
      definitions: {
        explicitSignal: "PurposeToGiveGrantsAndDonations OR OrganisationGeneratesFundsGrantsDonationsToOthers OR MainActivityId in {2,3}",
        grantSpend: SPEND_FIELDS.join(" + "),
        conservative: "explicit signal AND grantSpend > 0 on the latest return",
        broad: "grantSpend > 0 on the latest return",
        staleBefore: STALE_BEFORE,
        passThrough: `(${GRANT_INCOME_FIELDS.join(" + ")}) / TotalGrossIncome >= ${PASS_THROUGH_SHARE}`,
      },
      pulls: {
        registeredOrganisations: orgs.length,
        registeredGroups: groups.length,
        latestReturnRows: latest.length,
        annualReturnRowsAllYears: allReturns.length,
      },
    },
    faithful: {
      signalEntities: signalKeys.size,
      signalWithLatestReturn: [...signalKeys].filter((k) => latestKeys.has(k)).length,
      signalWithoutLatestReturn: [...signalKeys].filter((k) => !latestKeys.has(k)).length,
      conservative: setSummary(A.conservative),
      broad: setSummary(A.broad),
      changeVsPublished: {
        conservativeEntities: A.conservative.length - PUBLISHED.conservativeCount,
        conservativeSpendNZD: round(sum(A.conservative) - PUBLISHED.conservativeSum),
        broadEntities: A.broad.length - PUBLISHED.broadCount,
        broadSpendNZD: round(sum(A.broad) - PUBLISHED.broadSum),
      },
    },
    independent: {
      registeredEntitiesWithAnyReturn: latestRaw.size,
      conservative: setSummary(B.conservative),
      broad: setSummary(B.broad),
      agreementWithFaithful: {
        inBoth: both.length,
        onlyFaithful: onlyA.length,
        onlyIndependent: onlyB.length,
        sameAnnualReturnId: sameReturn.length,
        sameGrantSpend: sameSpend.length,
        onlyFaithfulSample: onlyA.slice(0, 10),
        onlyIndependentSample: onlyB.slice(0, 10),
      },
    },
    sensitivity: {
      latestReturnYear: byYear,
      stale: { ...setSummary(stale), largest: [...stale].sort((a, b) => spend(b) - spend(a)).slice(0, 5).map((r) => ({ registrationNumber: r.CharityRegistrationNumber, yearEnded: isoDate(r.YearEnded).slice(0, 10), grantSpendNZD: round(spend(r)) })) },
      groupMemberOverlap: { groupsInSet: consGroupIds.size, groupSpendNZD: round(sum(cons.filter((r) => r.EntityType === "Group"))), membersUnderGroupsInSet: setSummary(memberUnderConsGroup) },
      passThrough: setSummary(passThrough),
      spendFieldCoverageByYear: coverage,
      blindSignalEntities: { entities: blind.length, byTier: blindByTier, totalExpenditureUpperBoundNZD: round(sum(blind, (r) => num(r.TotalExpenditure))) },
      grantSpendAboveTotalExpenditure: setSummary(overExpenditure),
      multipleSpendFieldsPositive: setSummary(multiField),
      concentration: { top10: share(10), top50: share(50), top165: share(165) },
      sizeBands: bands,
      changedSinceJulyPull: { ...setSummary(changedSinceJuly), note: "ModifiedOn later than the published pull time" },
      julyProxy: { conservative: setSummary(july.conservative), broad: setSummary(july.broad), note: "returns modified after the published pull removed, latest re-picked" },
      fixedYears: [2023, 2024, 2025].map(fixedYear),
      top10: sorted.slice(0, 10).map((r) => ({
        registrationNumber: r.CharityRegistrationNumber,
        name: nameOf(r),
        yearEnded: isoDate(r.YearEnded).slice(0, 10),
        grantSpendNZD: round(spend(r)),
        // Every return on file: null means all four spend fields were empty.
        history: allReturns
          .filter((x) => rawKey(x) === latestKey(r))
          .sort((a, b) => (isoDate(a.YearEnded) < isoDate(b.YearEnded) ? -1 : 1))
          .map((x) => ({ yearEnded: isoDate(x.YearEnded).slice(0, 10), grantSpendNZD: SPEND_FIELDS.every((f) => x[f] === null || x[f] === undefined) ? null : round(spend(x)) })),
      })),
      yearEnded2026: setSummary(cons.filter((r) => year(r) === "2026")),
    },
    spotCheckSample: sample,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
