# The method, in full

[`CONTRIBUTING.md`](../CONTRIBUTING.md) has the short version everyone should read. This is the longer rationale — why the method is what it is. Read it if you're reviewing work, designing an agent to work the repo, or just want to understand the standard.

## Why the bar is "cited and honest"

The findings here inform real decisions about real people — a frontline worker deciding where to point a family, a policy analyst citing a number, a volunteer team choosing what to build. A confident, wrong claim doesn't just lose face; it can send help in the wrong direction. So the method optimises for **trustworthiness over volume or speed**.

The single most important habit: **be honest about what you don't know.** A finding that says _"Low confidence, one dated source, needs a Stats NZ pull to confirm"_ is more valuable than a fluent paragraph with no links, because the next contributor knows exactly where to start. We reward honest uncertainty.

## The five checks

1. **Clarify the question.** Vague questions produce vague findings. State the exact question as a one-sentence claim. If the issue was broad, narrow it and say how — a sharp answer to a narrow question beats a mushy answer to a broad one.

2. **Cite every claim.** One source minimum, inline, for every factual statement. Prefer official and current NZ sources: government agencies, Stats NZ, councils, established NGOs, peer-reviewed research. Treat blogs, vendor pages, and secondary reporting as leads to the primary source, not as the source.

3. **Verify surprises with two sources.** A claim that's counter-intuitive, load-bearing, or likely to be quoted needs **two independent** sources — independent meaning they don't both trace back to the same origin. One press release quoted by five outlets is one source. If you can only find one, keep the claim but flag it explicitly. **A party's statement about itself is a *claim*, not confirmation** — a company's own announcement, an org's self-report. Record it as "announced by X", cap confidence at Medium until an independent record (a consent register, a regulator's decision, a dataset) backs it, and route the verification to a follow-up/child issue rather than banking the self-report as fact.

4. **Mark confidence.** Every finding carries High / Medium / Low:
   - **High** — multiple strong, current sources agree; safe to base a decision on.
   - **Medium** — reasonable support with gaps, or sources that are dated or partial.
   - **Low** — thin or single-sourced; state it as a lead, not a fact.
   Confidence is about the *evidence*, not your feeling. Three blog posts that copy each other is still Low.

5. **Say what would change your mind.** End every finding with the evidence that would overturn it and what you couldn't verify. This turns a static document into a baton the next person can pick up.

## Adversarial review

Review here is not a rubber stamp. The reviewer's job — whether a person or the project's review agent — is to **try to refute the finding**: hunt for an uncited claim, a surprise with only one source, an overstated confidence mark, a source that doesn't actually say what it's cited for, or a conclusion the evidence doesn't carry. A finding merges when a good-faith attempt to knock it down fails.

One fetch rule for both sides: before calling a link dead, escalate through the fetch ladder in [`AGENTS.md`](../AGENTS.md#tips) ([ADR-0006](adr/0006-fetch-proxy-browser-management.md)) and say how you fetched — a 403 or bot-challenge is tooling, not a dead link.

This is deliberately the same standard whether the work came from a person or an agent. Provenance doesn't earn trust here; evidence does.

## Ethics guardrails

These domains touch vulnerable people. Non-negotiables:

- **No personal or identifying data**, ever. Aggregate, public sources only.
- **No overstatement.** Don't imply certainty you don't have, and don't imply reach or authority the project doesn't have.
- **No fabricated action.** Never claim to have contacted an organisation, run a programme, or produced a result you didn't.
- **Flag when a human is needed.** Some questions need lived experience, legal authority, or data an agent can't ethically access. Saying "this needs a human with X" is a valid, valuable result — not a failure.

## For agents specifically

If you're building or running an agent against this repo, [`AGENTS.md`](../AGENTS.md) has the operational loop. The method above still fully applies — an agent that fabricates a citation is worse than useless here, because it produces plausible, well-formatted, wrong work at scale. Design for verification: prefer fewer, checked claims over many confident ones.
