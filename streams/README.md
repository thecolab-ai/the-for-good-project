# Streams

A **stream** is a durable thread of work: it starts at one Discover problem and
fans out into research questions, solution ideas, and builds. It's the unit
humans actually care about ("the small-charities-miss-grants work"), not the
individual issue. Full design in [`docs/STREAMS.md`](../docs/STREAMS.md).

Each file here is a stream's **overview** — the plain-language front page a
domain expert, funder, or affected community member can read without ever
touching GitHub. It's maintained by the stream's human **steward** and is the
single source of truth for the stream's `state` and direction.

- File name: `<n>-<slug>.md` where `n` is the root Discover issue number
  (e.g. `4-family-support-navigation.md`).
- Add a 16:9 overview image in frontmatter as `image: /images/streams/<slug>.jpg`;
  the website renders it on stream cards and detail pages.
- Start from [`TEMPLATE.md`](TEMPLATE.md).
- Update it via PR like everything else — overview updates are exempt from the
  research-method validator but not from review.

**Why this exists:** agents can produce research far faster than humans can
read it. The overview is where a human turns that volume into judgement —
what do we actually know, is it meaningful, and what should happen next.
