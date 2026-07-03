import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, UserRound, Lock } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TEAM, isConsented, consentedCount, type TeamMember } from "@/lib/team";

const base = import.meta.env.BASE_URL;

function initials(role: string): string {
  return role
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function MemberCard({ m }: { m: TeamMember }) {
  const consented = isConsented(m);
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-border">
          {consented && m.photo ? (
            <AvatarImage src={`${base}${m.photo}`} alt={m.name ?? m.role} />
          ) : null}
          <AvatarFallback
            className={
              consented
                ? "brand-gradient text-lg font-semibold text-white"
                : "bg-secondary text-muted-foreground"
            }
          >
            {consented ? initials(m.name ?? m.role) : <UserRound className="h-7 w-7" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          {consented ? (
            <div className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{m.name}</div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Name added with consent
            </div>
          )}
          <div className="text-sm font-medium text-brand-cyan-dark">{m.role}</div>
          {consented && m.location ? (
            <div className="text-xs text-muted-foreground">{m.location}</div>
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{m.focus}</p>
    </Card>
  );
}

export default function Team() {
  const { data } = useSnapshot();
  const repo = data?.repo.url || "https://github.com/thecolab-ai/the-for-good-project";
  const total = TEAM.length;

  return (
    <div>
      <PageHeader title="Who we are">
        The For Good Project is built by real people in Aotearoa, working alongside AI — not an anonymous
        experiment. AI does the heavy lifting; people decide whether any of it matters. Here's who's steering it.
      </PageHeader>

      {/* Consent note — honest about who has signed off */}
      <Card className="mb-8 flex flex-col gap-3 border-brand-cyan/30 bg-accent/40 p-5 sm:flex-row sm:items-center">
        <ShieldCheck className="h-6 w-6 shrink-0 text-brand-cyan-dark" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">A name and a face are personal data.</strong> Nobody's name or photo
          appears here until that person has explicitly said yes — the same consent rule we hold for every partner.
          {consentedCount < total ? (
            <> Slots still showing a placeholder are roles awaiting a team member's own sign-off.</>
          ) : null}{" "}
          <a
            href={`${repo}/blob/main/projects/brand-identity/README.md`}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            How this works
          </a>
          .
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </div>

      {/* Why a human team, not a black box */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground">Why we put our faces to it</h2>
        <p className="mt-3 text-muted-foreground">
          Trust is the whole game. A charity GM or a policy analyst deciding whether to rely on our work needs to know
          there are named, accountable people behind it — not just a model. Showing the real people behind a site is a
          long-standing marker of credibility on the web, and in Aotearoa public trust in the charitable sector is
          something the sector actively measures and works to earn.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> Everything we publish is cited, and independently challenged before it's accepted.</li>
          <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> A human makes every judgement call — nothing moves toward a solution unsteered.</li>
          <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> We protect people: no personal or identifying data, ever, including our own team's without consent.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl brand-gradient p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Want to work with us?</h2>
          <p className="mt-1 max-w-xl text-white/85">See what we stand for and how we partner with charities, councils and agencies.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/partners"><Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">For partners <ArrowRight className="h-4 w-4" /></Button></Link>
          <a href={repo} target="_blank" rel="noreferrer"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">The work in the open</Button></a>
        </div>
      </div>
    </div>
  );
}
