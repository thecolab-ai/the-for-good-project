# Adding a real person to the "Who we are" page — consent record

A name and a face are personal data. Under
[CONSTITUTION.md](../../CONSTITUTION.md) Article III, **no individual's name or
photo goes in the repo or on the site without that person's explicit, recorded
consent.** An agent may draft copy, layout, and placeholder slots; **only a
human** fills in a real person, and only after that person has said yes.

This file is the durable consent log. Add one row per person when — and only
when — they have consented.

## Before you add anyone (checklist)

- [ ] The person has **explicitly agreed** to their name + photo appearing on
      the public site (not just "probably fine").
- [ ] They know it is **public and open-source** (CC BY 4.0 content, world-
      readable, mirrored/cached beyond our control).
- [ ] They chose what to show: name, role, focus line, and optionally location.
      Anything they'd rather omit stays omitted.
- [ ] They know they can ask to be **removed at any time**, no questions asked.
- [ ] The photo is theirs to publish (they own it / have rights to it).

## To add them (human steward)

1. Save the photo to `web/public/team/<id>.jpg` — square, ~480px, < 150 KB.
2. In [`web/src/lib/team.ts`](../../web/src/lib/team.ts), set that slot's
   `name` and `photo: "team/<id>.jpg"` (and optional `location`).
3. Add a row to the log below.
4. Open a PR. This is a standard docs/tooling review, **not** the research
   citation gate.

## Consent log

| id (slot) | Role | Consent given (date) | How consent was recorded | Consent to public name + photo |
|---|---|---|---|---|
| `gligorkot` | Contributor | 2026-07-03 | PR #191 requested changes from @gligorkot: "we should add real people's photos and names" and "I'd be happy to put my name towards this project"; name and avatar source checked against the public GitHub profile for @gligorkot. | Name: Gligor Kotushevski. Photo: public GitHub avatar copied to `web/public/team/gligorkot.jpg` in direct response to the review request for real photos and names. |
| `steward` | Founder & steward | 2026-07-03 | @adam91holt (project founder) directed it explicitly on PR #191: posted his own GitHub avatar URL with "this one for me, use my name" and instructed the page be merged. | Name: Adam Holt. Photo: his own public GitHub avatar copied to `web/public/team/adam91holt.jpg`, supplied and consented by Adam himself. |
| `partnerships` | Partnerships & field | 2026-07-03 | @rachel-rowanadvisory (the project's demand-side/partnerships connector) asked to fill her own team slot with her name and photo — a self-directed consent, made after taking the collaborator role on the project. | Name: Rachel McBride. Photo: her own professional headshot (hers to publish), cropped to spec and saved to `web/public/team/rachelmcbride.jpg`. |
| `engineering` | Engineering | 2026-07-05 | Muhammad Asim asked to fill his own Engineering slot, providing his name, GitHub avatar URL, and location — a self-directed consent, confirming he understands the page is public, open-source (CC BY 4.0), world-readable and cached beyond our control, that the avatar is his to publish, and that he may be removed at any time. | Name: Muhammad Asim. Photo: his own public GitHub avatar (github.com/u/47195175) copied and cropped to spec, saved to `web/public/team/muhammadasim.jpg`. Location: Pakistan. |

## To remove someone

Set their slot's `name` and `photo` back to `null` (the page reverts to the
placeholder), note the withdrawal and date in the log, delete the image file,
and open a PR. Honour removal requests immediately.
