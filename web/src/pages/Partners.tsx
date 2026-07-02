import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Landmark, ShieldCheck, Users, ClipboardCheck, Eye, Lock, FileText } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { PageHeader } from "@/components/shared/PageHeader";
import { SystemDiagram } from "@/components/shared/SystemDiagram";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROMISES = [
  { icon: ShieldCheck, title: "Everything is cited", body: "Every claim is backed by a real, current source. Surprising claims need two independent ones. We mark our confidence honestly — and we tell you plainly what we could not verify." },
  { icon: Eye, title: "A human always decides", body: "AI does the heavy lifting — gathering, drafting, cross-checking. People decide whether any of it matters and what happens next. Nothing moves toward a solution without a human steering it." },
  { icon: Lock, title: "We protect people", body: "No personal or identifying data, ever. In sensitive areas, someone with real domain authority signs off before anything is shared. We don't overstate what we know." },
  { icon: FileText, title: "You see it before anyone else", body: "Work done with you is yours to review first. Nothing about your organisation or your people gets published without your say-so." },
];

export default function Partners() {
  const { data } = useSnapshot();
  const repo = data?.repo.url || "https://github.com/thecolab-ai/the-for-good-project";

  return (
    <div>
      <PageHeader title="For charities, councils & government">
        We're a New Zealand community that pairs deep human expertise with serious AI capacity to research hard public problems — rigorously, transparently, and for free. If you carry one of those problems, we'd like to help. Here's the idea, what we stand for, and what we'd ask of you.
      </PageHeader>

      {/* The idea */}
      <Card className="mb-10 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground">The idea, in one minute</h2>
        <p className="mt-3 text-muted-foreground">
          A lot of skilled people have spare AI capacity. Aotearoa has hard problems that nobody has the hours to chip away at — cost of living, access to support people are entitled to, transparency, fairness for people doing it tough. This project puts those two things together: a shared, open workspace where people and AI agents work a real problem to a standard high enough that a real decision can rest on it.
        </p>
        <p className="mt-3 text-muted-foreground">
          It is <strong>not</strong> a pile of AI-generated words. Every piece of work is cited, independently challenged before it's accepted, and turned into a plain-English brief a busy decision-maker can actually use. The measure of success isn't how much we produce — it's whether a real person or organisation is genuinely better off.
        </p>
      </Card>

      {/* How the system works */}
      <h2 className="mb-2 font-serif text-2xl font-bold">How the system works</h2>
      <p className="mb-5 text-muted-foreground">From one problem to a real, trustworthy result — with people in charge of every judgement call.</p>
      <SystemDiagram />

      {/* Two audiences */}
      <h2 className="mb-5 mt-12 font-serif text-2xl font-bold">Where you fit</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-indigo/10"><HeartHandshake className="h-5 w-5 text-brand-indigo" /></div>
            <div className="font-serif text-lg font-semibold">Charities, NFPs & community organisations</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            You see the problems first-hand. You know where the system fails the people you serve — and you rarely have time or budget to gather the evidence that would help fix it.
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">What we can do with you:</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-brand-indigo">•</span> Turn a problem you live with into properly-researched, cited evidence you can use for funding, advocacy, or service design.</li>
            <li className="flex gap-2"><span className="text-brand-indigo">•</span> Build small, genuinely useful tools — and connect people who need help straight to services like yours.</li>
            <li className="flex gap-2"><span className="text-brand-indigo">•</span> Keep you in the driver's seat: you steer what's worth doing and check it against reality on the ground.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/15"><Landmark className="h-5 w-5 text-brand-cyan-dark" /></div>
            <div className="font-serif text-lg font-semibold">Government, regulators & policy teams</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            You own problems that are broad, multi-faceted, and under-resourced. We can do rigorous, transparent groundwork — and hand you a defensible, plain-English brief, not a black box.
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">What we can do with you:</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> Take one well-scoped question and produce cited analysis your team can scrutinise line by line.</li>
            <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> Surface real, current data — not just aggregates — on issues like everyday prices and the cost of credit.</li>
            <li className="flex gap-2"><span className="text-brand-cyan-dark">•</span> Show a repeatable, trustworthy way to bring AI to public problems safely — with a human in the loop at every gate.</li>
          </ul>
        </Card>
      </div>

      {/* Our promise */}
      <h2 className="mb-2 mt-12 font-serif text-2xl font-bold">What we stand for</h2>
      <p className="mb-5 text-muted-foreground">The whole thing only works if it can be trusted. So these are non-negotiable.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {PROMISES.map((p) => (
          <Card key={p.title} className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10"><p.icon className="h-5 w-5 text-emerald-600" /></div>
              <div className="font-serif font-semibold">{p.title}</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        We even track our partnerships in the open — behind a strict consent gate. Until you say otherwise, you appear as a role and sector only, never a name.{" "}
        <a href={`${repo}/blob/main/partners/README.md`} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2 hover:text-foreground">How that works</a>.
      </p>

      {/* The ask */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-brand-orange" />
          <h2 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground">The ask</h2>
        </div>
        <p className="mt-3 text-muted-foreground">
          We're not asking for money, and we're not asking you to adopt anything unproven. To start, we'd value <strong>one or more</strong> of these:
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-semibold text-brand-orange">1</span>
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">A real problem, in your words.</strong> The single issue you most wish someone had the evidence to tackle.</div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-semibold text-brand-orange">2</span>
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">A little of an expert's time.</strong> Someone who knows the area to sanity-check whether our work matches reality.</div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-semibold text-brand-orange">3</span>
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">A door.</strong> If the work is good, an introduction to the person or team who could actually use it.</div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-semibold text-brand-orange">4</span>
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">Honest feedback.</strong> Tell us when we've missed the point. That's how we get it right.</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl brand-gradient p-8 text-center text-white">
        <Users className="mx-auto h-8 w-8 opacity-90" />
        <h2 className="mt-3 font-serif text-2xl font-bold">Bring us a problem worth solving</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/85">
          If you carry a problem that affects real New Zealanders and you'd like serious, honest help with the evidence — let's talk. Small first step, no cost, no lock-in.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href="https://thecolab.ai/contact" target="_blank" rel="noreferrer"><Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">Get in touch <ArrowRight className="h-4 w-4" /></Button></a>
          <a href={repo} target="_blank" rel="noreferrer"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">See the work in the open</Button></a>
        </div>
      </div>
    </div>
  );
}
