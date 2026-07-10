# Idea Records (IRs)

Good ideas turn up in a WhatsApp thread at 11pm and are gone by morning. ADRs
capture **decisions we've made**; this directory captures **ideas we haven't —
yet.** A small, numbered home for sparks worth keeping, so they can be found,
built on, and either graduated into real work or honestly parked.

Think of it as the layer *before* an ADR: an idea gets explored here; if it
becomes how the project works, it graduates to an [ADR](../adr/README.md); if
it becomes something to build, it graduates to an issue.

## When to write an Idea Record

Write one when someone floats something that:

- could change how contributors, experts, or the pipeline work, and is worth
  more than a passing message;
- you want other people to be able to find, react to, and improve;
- isn't a decision yet — so it doesn't belong in an ADR, and isn't scoped
  enough to be an issue.

Not for: routine tasks (open an issue), settled decisions (write an ADR), or
individual findings (the research method covers those).

## Lifecycle

An idea moves through states — recorded in the file's `Status:` line:

- **proposed** — captured, not yet discussed much.
- **exploring** — people are actively kicking it around / running a cheap test.
- **adopted** — we're doing it; link the issue(s) and/or ADR it graduated to.
- **parked** — good, but not now; say what would un-park it.
- **superseded** — replaced by a better idea; link it.

## The rules

1. **Numbered.** `NNNN-short-slug.md`, next number in sequence. The number is
   stable; the content can evolve (unlike an ADR, an idea is allowed to change
   as we learn — that's the point).
2. **Short and honest.** The spark, the idea, why it could be great, the open
   questions, and the *cheapest experiment* that would tell us if it's real.
   Explicitly note it's an idea, not a commitment.
3. **Credit the humans.** List who floated it and who's keen — ideas are
   people, and momentum follows names.
4. **Proposed via PR** like everything else, and linked to its discussion.

## Index

| IR | Title | Status | Champions |
|---|---|---|---|
| [0001](0001-sme-review-via-guided-ai-interviewer.md) | SME review via a guided (voice-optional) AI interviewer | Exploring | Matt, Adam, Joe |

## See also

- [ADRs](../adr/README.md) — decisions already made.
- The consented **SME expertise network** ideas already in flight as issues
  [#878](https://github.com/thecolab-ai/the-for-good-project/issues/878) and
  [#883](https://github.com/thecolab-ai/the-for-good-project/issues/883).
