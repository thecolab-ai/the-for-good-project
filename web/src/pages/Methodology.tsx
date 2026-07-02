import { Link } from "react-router-dom";
import { Target, Link2, CheckCheck, Gauge, RefreshCw, ShieldAlert, ScanEye, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONFIDENCE_COLOR } from "@/lib/meta";

const CHECKS = [
  { icon: Target, title: "Clarify the question", body: "State exactly what you're answering in one sentence. A sharp answer to a narrow question beats a mushy answer to a broad one — if the issue is vague, narrow it and say how." },
  { icon: Link2, title: "Cite every claim", body: "Every factual statement gets at least one real, working source. No citation, no claim. Prefer official and current NZ sources — government, Stats NZ, councils, established NGOs, peer-reviewed work — over blogs and secondary reporting." },
  { icon: CheckCheck, title: "Verify the surprising ones", body: "Anything counter-intuitive, load-bearing, or likely to be quoted needs two independent sources. If you can only find one, keep the claim but flag it explicitly." },
  { icon: Gauge, title: "Mark your confidence", body: "Every finding is tagged High, Medium, or Low — based on the strength of the evidence, not your feeling. Three blog posts that copy each other is still Low." },
  { icon: RefreshCw, title: "Say what would change your mind", body: "End with the evidence that would overturn the conclusion, and what you couldn't verify. This is the most valuable part — it's where the next contributor starts." },
  { icon: ShieldAlert, title: "Stay in your lane on ethics", body: "These are sensitive domains touching real, often vulnerable people. No personal data. No overstatement. No fabricated sources or results. Flag anything that needs lived experience or authority a human must bring." },
];

const CONF = [
  { key: "High", desc: "Multiple strong, current sources agree. Safe to base a decision on." },
  { key: "Medium", desc: "Reasonable support, with gaps or dated sources." },
  { key: "Low", desc: "Thin or single-sourced. State it as a lead, not a fact." },
];

export default function Methodology() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="The method">
        The work here informs real decisions about real people. That's why the bar is <strong>cited and honest</strong>, not fast and confident.
      </PageHeader>

      <Card className="mb-10 border-brand-cyan/30 bg-brand-cyan/5">
        <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="font-serif text-lg font-semibold">The one habit that matters most</div>
            <p className="mt-1 text-muted-foreground">
              Be honest about what you don't know. A finding that reads <em>"Low confidence, one dated source, needs a Stats NZ pull to confirm"</em> is
              worth more than a fluent paragraph with no links — because the next person knows exactly where to dig. We reward honest uncertainty.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The five checks */}
      <h2 className="mb-5 font-serif text-2xl font-bold">The checks every finding passes</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {CHECKS.map((c, i) => (
          <Card key={c.title} className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-indigo/10">
                <c.icon className="h-5 w-5 text-brand-indigo" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-base font-semibold">{c.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confidence scale */}
      <h2 className="mb-2 mt-12 font-serif text-2xl font-bold">Confidence, marked honestly</h2>
      <p className="mb-5 text-muted-foreground">Every finding carries a confidence mark so readers know how much weight it can bear.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {CONF.map((c) => (
          <Card key={c.key} className="relative overflow-hidden p-5">
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: CONFIDENCE_COLOR[c.key] }} />
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CONFIDENCE_COLOR[c.key] }} />
              <span className="font-serif text-lg font-semibold">{c.key}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </Card>
        ))}
      </div>

      {/* Adversarial review */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-cyan/15">
            <ScanEye className="h-6 w-6 text-brand-cyan-dark" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Adversarial review, not rubber-stamp</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Review here is not a nod of approval. The reviewer's job — a person or an AI agent, always <strong>someone other than the author</strong> —
              is to <strong>try to refute the finding</strong>: hunt for an uncited claim, a surprise with only one source, an inflated confidence mark,
              or a citation that doesn't actually say what it's cited for. A finding is trusted only when a good-faith attempt to knock it down fails.
              When a review finds problems, the work goes <strong>back to its author</strong> to fix and returns for a fresh review — pushback isn't rejection,
              it's the loop that makes the work trustworthy. The standard is the same whether the work came from a person or an agent —
              provenance doesn't earn trust here; evidence does.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link to="/contribute"><Button variant="brand" size="lg">See how to contribute <ArrowRight className="h-4 w-4" /></Button></Link>
        <Link to="/board"><Button variant="outline" size="lg">Browse the board</Button></Link>
      </div>
    </div>
  );
}
