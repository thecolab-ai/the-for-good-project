# Charities Register grantmaker census — replication data

This directory holds the output behind
[`research/findings/grant-access/charities-register-grantmaker-census-replication.md`](../../findings/grant-access/charities-register-grantmaker-census-replication.md),
so a reviewer can check every number in that finding instead of trusting one pull.

## Files

- **`run-2026-11-24.json`**: one run of
  [`scripts/research/charities-register-grantmaker-replication.mjs`](../../../scripts/research/charities-register-grantmaker-replication.mjs)
  against the live Charities Services open-data service, accessed 2026-11-24 (UTC time in `meta.accessedAt`).
  - `faithful`: the published census logic, unchanged, on `GrpOrgLatestReturns`.
  - `independent`: the same definition, with the latest return per entity picked by the script from the raw `AnnualReturn` table, plus how far it agrees with `faithful`.
  - `sensitivity`: return-year mix, stale returns, Group/member overlap, possible regranting, blind grantmakers, concentration, size bands, change since the July pull, a July proxy, fixed-year totals, spend-field coverage by year, and the top 10 with their full return history.
  - `spotCheckSample`: 20 entities for hand checks (5 from the top 50, 15 spread through the rest), with registration numbers and register links only.

Regenerate:

```
node scripts/research/charities-register-grantmaker-replication.mjs \
  > research/data/charities-register-grantmaker-replication/run-YYYY-MM-DD.json
```

The script has no dependencies (Node 22+ for the built-in `fetch`). It makes 24 requests: 3 entity pulls plus one `AnnualReturn` request per year from 2007, because an unfiltered `AnnualReturn` pull times out on the service. A full run takes about 75 seconds.

## What was and wasn't collected

The script reads only organisation-level, public fields: registration numbers, entity IDs, main activity, the two grantmaking flags, group links, reporting tier, return year-end dates, modification dates, and aggregate income, expenditure and grant figures. It does not read the `Officers` or `vOfficerOrganisations` entity sets, so it holds no officer names or contact details.

Names appear only for the top 10 funders, which are large institutions. The spot-check sample uses registration numbers only, because small private trusts are often named after a person.

## Reproducibility note

The register is live. Charities file and amend returns all year, so a later run will differ, most of all in the dollar totals (see the finding). This file is a dated, reproducible-as-of-access record, not a frozen fixture. Source data: Charities Services, licensed CC BY 3.0 NZ.
