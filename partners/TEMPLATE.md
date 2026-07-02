---
org: ""                # organisation name IF org-named consent given, else "" (rely on org-type)
org-type: regulator    # regulator | agency | funder | nfp | community | academic
sector: ""             # e.g. financial-conduct, statistics, social-investment, grocery, child-welfare
role: connector        # connector | sme | early-user | advisory | data-provider
status: exploring      # exploring | intro-made | in-conversation | committed | active
consent: private       # private | org-named | fully-public — DEFAULT private, see partners/README.md
streams: []            # issue #s this partner informs or could use, e.g. [60, 61]
updated: YYYY-MM-DD
---

<!--
Consent gate (hard rule — CONSTITUTION.md Art III):
  private      → role + sector + org-type only. No org name, no individual's name.
  org-named    → organisation may be named. Still NO individual's name or contact detail.
  fully-public → a named individual may appear because they explicitly said yes.
                 Record when/how consent was given in the interaction log.
Write the whole body to the consent level above. When in doubt: private.
-->

# {Role at [org-type]} — e.g. "A senior analyst at [a statistics agency]"

## Who they are (at this consent level)

One or two sentences: the role, the kind of organisation, why they're relevant
to this project. No detail that exceeds the `consent:` level.

## What they can help with

- Which streams/questions they can inform (mirror the `streams:` list, with a
  word on *how* — e.g. "can sanity-check findings on #60 against how fee
  disclosure actually works").
- What kind of authority or lived knowledge they bring (domain, data, doors).

## The ask

What we want from them, small and specific. E.g. "an hour to tell us the
right question to ask", "review one brief before publication", "an
introduction to the team that owns this problem".

## Our promise

Rigorous, cited work. Nothing published about them or their people without
their sign-off. They see anything involving them before anyone else. They can
walk away at any time, no questions asked.

## Interaction log

Newest first. Dated. Written to the consent level. Consent escalations are
recorded here explicitly.

- **YYYY-MM-DD** — e.g. "Intro made via a connector; shared the one-page
  charter; they're considering which problem to bring."
- **YYYY-MM-DD** — e.g. "Consent escalated to `org-named`: confirmed in
  writing on this date."
