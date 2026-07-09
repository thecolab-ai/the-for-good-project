# ADR-0023: A party's statement about itself is a claim, not confirmation (method check 3)

- **Status:** proposed (ratified on merge by the human maintainer; agents do not
  self-ratify changes to the method the review gate judges against)
- **Date:** 2026-07-09
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Opus 4.8)
  at his direction
- **Discussion:** PR #221 — evidence drawn from the DataGrid Makarewa stream (#212)
  and its consent-record child (#214)
- **Relates to:** ADR-0001 (human gates — this is a method change, so it merges by a
  maintainer's hand, not an agent approval)

## Context

Check 3 of [`METHOD.md`](../METHOD.md) already requires two *independent* sources for a
surprising or load-bearing claim, and already says that outlets tracing back to a common
origin count as one source: "one press release quoted by five outlets is one source."

It was silent on the sharper case, the one that keeps arising: **the origin is itself a
party to the claim.** A company announces its own approvals; an organisation self-reports
its own reach. Five outlets repeat it. Rule 3 correctly collapses those five to one — but
gives the researcher no guidance that the remaining one is an interested party, and so
reads as though a single well-attributed source discharges the obligation.

The DataGrid Makarewa stream (#212) is the worked example, and it is not hypothetical. The
company's own announcement described a 280MW campus with "full resource consent" from three
councils. The independent record, once pulled, said something materially different: the
Environment Southland commissioner's decision of 11 March 2026 grants nine regional consents
for a data centre of **up to 240MW of IT capacity**; the Southland District Council and
Invercargill City Council decision documents could not be located in public records at all;
and the fast-track pathway the coverage implied was never the operative one — MBIE's briefing
records that DataGrid applied for Schedule 2 listing and **was not chosen**. Three separate
divergences between the self-report and the register, in a single stream. Two of them were
caught only because verification was routed to a child issue (#214) rather than banked as
fact.

The cost of getting this wrong is asymmetric. A self-report absorbed as confirmation
propagates into a finding, into a synthesis, and then into someone's decision — and it
propagates wearing a citation, which is what makes it dangerous.

## Decision

We will extend check 3 with one sentence: **a party's statement about itself is a claim, not
confirmation.** Concretely, a researcher who has only the interested party's word:

1. **Records it as what it is** — "announced by X", not "X has Y". The announcement is a
   fact; the thing announced is not yet one. A self-report is strong evidence *that the
   statement was made*, and weak evidence *that its content is true*. Those are different
   propositions and the finding must not conflate them.
2. **Caps confidence at Medium** for the announced content, until an independent record —
   a consent register, a regulator's decision, a dataset — backs it.
3. **Routes the verification to a follow-up or child issue** rather than banking the
   self-report as fact. The gap becomes tracked work, not a silent assumption.

Options seriously considered and why they lost:

- **Leave rule 3 as-is and rely on reviewer judgement.** Rejected: #212 is direct evidence
  that the current wording doesn't reliably prompt the catch. The rule already implies this;
  making it explicit is what converts an implication into a check a reviewer can apply.
- **Cap self-reports at Low.** Rejected as too harsh, and as bad epistemics. An identified
  company's on-record announcement about its own project is genuinely more than a lead — it
  is simply not independent. Medium is the confidence ladder's existing name for "reasonable
  support with gaps," which is exactly the situation.
- **Forbid citing self-reports.** Rejected: often the announcement *is* the primary source
  for the fact that an announcement occurred, and sometimes it is the only public record of
  a plan. The defect is treating it as corroboration, not citing it.

## Consequences

- Reviewers gain a bright line where they previously had to argue from the spirit of rule 3.
  "Your two sources both trace to the subject" becomes a citable objection.
- More child issues get opened, and some findings sit at Medium longer than an author would
  like. We accept that: a finding parked at Medium with a tracked verification issue is more
  useful than one at High resting on an interested party's word.
- The rule applies reflexively, and uncomfortably so — including to a PR body asserting its
  own provenance or its own sign-off. That is a feature. It was the reviewer's objection to
  this very PR, and the objection was correct.
- Findings already merged on the strength of a self-report are not retroactively invalid;
  they are candidates for the follow-up loop (ADR-0012), not for reopening.

## What would change this decision

Evidence that the Medium cap is routinely being overridden or worked around (the rule would
need teeth in the validator, not just prose); a pattern of verification child issues opened
under this rule and never worked, so the cap becomes a place claims go to die rather than to
get checked; or a class of self-report where the party is under a binding legal duty to
report accurately (a listed company's disclosure, a statutory return) where "independent" may
warrant a narrower reading than this ADR gives it.
