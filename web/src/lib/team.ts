// The people behind The For Good Project — the "Who we are" data.
//
// HUMAN GATE (issue #185, CONSTITUTION.md Art. III): a real name or face is
// personal data. No individual's name or photo is added here without that
// person's explicit, recorded consent. An agent may draft the role slots, the
// copy, and the layout — but only a human fills `name` and `photo`, and does so
// only after that specific person has said yes.
//
// Until a slot is consented, leave `name` and `photo` as null. The page renders
// a dignified "joining soon / consent pending" placeholder rather than a real
// identity, so the site is honest about who has actually signed off.
//
// To add a real person (human steward only):
//   1. Get explicit consent from that person for their name + photo on the site.
//   2. Drop their image in `web/public/team/<id>.jpg` (square, ~480px, <150KB).
//   3. Set `name` and `photo: "team/<id>.jpg"` on their slot below.
//   4. Note the consent (who, when, how) in projects/brand-identity/CONSENT.md.
// See projects/brand-identity/README.md for the full process.

export type TeamMember = {
  /** Stable slug — also the photo filename under public/team/. Never a real name. */
  id: string;
  /** The role/hat this person wears on the project. Safe to publish. */
  role: string;
  /** One plain line on what they steer. Safe to publish. */
  focus: string;
  /** Real name — null until the person consents; supplied by a human only. */
  name: string | null;
  /** Photo path under /public (e.g. "team/ada.jpg") — null until consented. */
  photo: string | null;
  /** Optional, e.g. "Auckland" — omit if the person would rather not say. */
  location?: string;
};

// Placeholder role slots. These describe the *shape* of the team and the
// project's roles; they are not claims that named individuals exist. Real
// people replace these one signed-off consent at a time (see header above).
export const TEAM: TeamMember[] = [
  {
    id: "steward",
    role: "Founder & steward",
    focus: "Sets direction, makes the human gate calls, and carries the relationships.",
    name: "Adam Holt",
    photo: "team/adam91holt.jpg",
  },
  {
    id: "gligorkot",
    role: "Contributor",
    focus: "Reviews and contributes to the open project, keeping the public work tied to real people.",
    name: "Gligor Kotushevski",
    photo: "team/gligorkot.jpg",
  },
  {
    id: "engineering",
    role: "Engineering",
    focus: "Builds the open workspace, the agent runners, and this site.",
    name: "Muhammad Asim",
    photo: "team/muhammadasim.jpg",
    location: "Pakistan",
  },
  {
    id: "partnerships",
    role: "Partnerships & field",
    focus: "Brings charities, councils and agencies the real problems worth working on.",
    name: "Rachel McBride",
    photo: "team/rachelmcbride.jpg",
  },
  {
    id: "mwwhg",
    role: "Mission & delivery",
    focus: "Bridges the technical and the people, keeping the work pointed at the mission.",
    name: "Matt Wood",
    photo: "team/mwwhg.jpg",
  },
];

/** Whether a slot has a human-supplied, consented identity to show. */
export function isConsented(m: TeamMember): boolean {
  return Boolean(m.name);
}

/** How many of the team slots have a real, consented person behind them. */
export const consentedCount = TEAM.filter(isConsented).length;
