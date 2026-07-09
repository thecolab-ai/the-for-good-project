---
stream: 667
title: "Are most changes to NZ law really 'repeals'? Counting instead of guessing"
state: awaiting-direction
steward: ""
domain: civic-transparency
updated: 2026-07-08
image: ""
---

# Are most changes to NZ law really "repeals"? Counting instead of guessing

## The problem, in plain language

A widely shared article claims New Zealand is "the fastest repealer in the
West" — that our parliaments spend their time undoing laws. Whether that is
fair depends almost entirely on what counts as a "repeal": removing a whole
Act, revoking a section, replacing wording, or any recorded change to law. This
stream set out to make those definitions visible and test the claim with data.
The research round is complete and the stream is now waiting on a human
steward's direction.

## What we've learned so far

- **In the completed official-text sample, narrow repeals were clearly a
  minority.** Across five selected 2025 Amendment Acts, 6 of 142 substantive
  top-level amending provisions were repeal/revoke provisions; even adding
  delete provisions gives 10 of 142. Insert-only provisions were the largest
  group, at 76 of 142 (confidence: Medium) — [five-Act official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md)
- **The answer is sensitive to the definition, but the tested definitions still
  do not make repeals a majority.** In the five-Act sample, the broadest tested
  "removal or replacement" view reached 66 of 142 provisions. In a separate
  recent 120-record mirror sample, narrow repeal was about 11%, while counting
  every replace record as repeal raised it to about 23% (confidence: Medium) —
  [five-Act official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md),
  [definition-sensitivity finding](../research/findings/civic-transparency/repeal-replace-sensitivity.md)
- **A heading that says "amended" can hide very different operations.** The
  now-completed 142-provision extraction table found 23 provisions — about one
  in six — that mixed more than one kind of change (insert, replace, repeal,
  delete) under a single "amended" heading, so counting by headings alone
  would misstate the numbers. That table is still a single manual
  classification, not yet independently reproduced (confidence: Low for the
  extraction table, Medium for the official-text reconciliation built on it) —
  [extraction-table sample](../research/findings/other/statutory-amendment-taxonomy-sample.md),
  [five-Act official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md)
- **The headline numbers people quote count different layers of change.** The
  article's 241,456 figure is an amendment-history event count; a related
  dataset's 15,282 figure is a count of public-Act consolidations; the official
  legislation system works in works, versions, and formats. These layers are
  related, but not interchangeable (confidence: Medium) — [counting-layers finding](../research/findings/civic-transparency/legislative-change-counts.md)
- **Across governments since 2008, repeal-type events were a modest and fairly
  steady minority in the available event data.** Repeals and revocations ranged
  from roughly 12% to 19% of recorded Act-change events per government, while
  overall change activity stayed broadly flat — though these figures come from
  the same community data pipeline behind the article, not an independent
  count (confidence: Medium) — [counting-layers finding](../research/findings/civic-transparency/legislative-change-counts.md)
- **Recent whole-Act repeals are not mostly routine spent-law tidying.** In a
  2023 to mid-2026 public-Act mirror extraction, 71 whole-Act repeal rows were
  found: none came through a classic Statutes Repeal clean-up bill, 12 were
  annual lifecycle repeals, and 59 were inside live legislative packages
  (confidence: Medium) — [whole-Act repeal finding](../research/findings/civic-transparency/whole-act-repeal-housekeeping.md)
- **A whole-statute-book answer looks possible, but not publishable without
  quality checks.** An existing volunteer-built pipeline already parses
  official XML history notes into amendment events, but its operation labels,
  older "omit" wording, unresolved records, and denominator choices need audit
  before anyone publishes a final repeal share (confidence: Medium) — [full-corpus feasibility finding](../research/findings/civic-transparency/full-corpus-amendment-classification.md)

## What we're not sure about yet

- **The findings agree, but much of the evidence shares one data family.** The
  hand-classified five-Act sample used official text, yet the larger counts and
  feasibility work still lean on the same Whiplash / nz-statute-book pipeline
  behind the public article. A direct full-corpus run from official XML or the
  PCO API has not been completed here.
- **The five-Act sample is complete, but still small and not independently
  redone.** It covers 142 provisions from five 2025 Acts, with one Social
  Security Act supplying just over half the provisions, and the five Acts were
  drawn from a list keyed on the word "Amendment" in the title — so Acts that
  change other laws without that word may be missed. It supports "not mostly
  narrow repeals" in that sample, not a final all-time NZ estimate.
- **The two five-Act documents rest on one shared classification table, and
  they describe their cross-check differently.** The extraction-table finding
  says the second document's rollup is only a duplicate-table consistency
  check, not independent corroboration; the reconciliation finding presents
  the mirror's labels as independently pointing the same way. A genuinely
  independent re-classification of the same Acts has not been done.
- **The definition still carries the conclusion.** Narrow repeal/revoke is
  small; repeal plus delete is also small; a broad "removal or replacement"
  view comes much closer to half in the five-Act sample. Future public use
  needs to show all of those views rather than hide the choice.
- **Older operation labels need audit.** The full-corpus feasibility finding
  flags a likely problem where old "omit" wording may be mapped as repeal even
  when some cases are closer to deleting words. That could inflate historical
  repeal counts if left uncorrected.
- **Whole-Act repeal is a different question from provision-level change.**
  The recent whole-Act work says many whole-Act repeals were live policy or
  replacement packages, while the provision-level samples ask whether most
  amending provisions are repeals. Both are useful, but they answer different
  public questions.

## What we could do about it

- **Publish a cautious public explainer on what the law-change numbers mean**
  — helps: journalists, voters, funders, and officials who encounter the
  "fastest repealer" claim. Effort: Small. Supported by the [five-Act
  official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md)
  (confidence: Medium), [definition-sensitivity finding](../research/findings/civic-transparency/repeal-replace-sensitivity.md)
  (confidence: Medium), and [counting-layers finding](../research/findings/civic-transparency/legislative-change-counts.md)
  (confidence: Medium). Would need: clear caveats that this is not yet a
  whole-statute-book official replication.
- **Build an audited full-corpus repeal-share dataset** — helps: researchers,
  media, and public agencies that need a defensible number instead of a sample.
  Effort: Large. Supported by the [full-corpus feasibility finding](../research/findings/civic-transparency/full-corpus-amendment-classification.md)
  (confidence: Medium), [five-Act official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md)
  (confidence: Medium), and [definition-sensitivity finding](../research/findings/civic-transparency/repeal-replace-sensitivity.md)
  (confidence: Medium). Would need: access to a complete official XML/API
  route, parser QA, and a published denominator.
- **Create a small reusable classification guide for future claims about
  repeals** — helps: charity staff, journalists, and civic researchers who
  need to check whether a law-change claim is counting repeal, delete, replace,
  insert, or something else. Effort: Medium. Supported by the [extraction-table
  sample](../research/findings/other/statutory-amendment-taxonomy-sample.md)
  (confidence: Low), [five-Act official-text finding](../research/findings/other/statutory-amendment-five-cluster-reconciliation.md)
  (confidence: Medium), and [whole-Act repeal finding](../research/findings/civic-transparency/whole-act-repeal-housekeeping.md)
  (confidence: Medium). Would need: examples kept short, non-legalistic, and
  checked against official text.
- **Run a targeted method audit with the existing data pipeline's author** —
  helps: anyone deciding whether the public mirror is strong enough for civic
  claims. Effort: Medium. Supported by the [full-corpus feasibility finding](../research/findings/civic-transparency/full-corpus-amendment-classification.md)
  (confidence: Medium) and [counting-layers finding](../research/findings/civic-transparency/legislative-change-counts.md)
  (confidence: Medium). Would need: raw operation text, unresolved-rate checks,
  and agreement on how to handle older "omit" and "substitute" wording.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: every tested definition of "repeal" left it short of a majority, but the larger-count evidence still needs direct official-source replication.
Signal: the completed 142-provision official-text sample is the stream's strongest evidence, but it is small, clustered, and still not a whole-statute-book estimate.
Signal: the broadest tested "removal or replacement" definition gets close enough to half that any public output should show the definition choice plainly.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
