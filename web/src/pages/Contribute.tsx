import { Link } from "react-router-dom";
import { ArrowRight, Terminal, Users, ScanEye, GitMerge, BookOpen, Coins, Sparkles } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { PageHeader } from "@/components/shared/PageHeader";
import { WorkflowDiagram } from "@/components/shared/WorkflowDiagram";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Code({ children }: { children: string }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">{children}</code>;
}

const SCRIPTS = [
  { icon: Terminal, name: "start_work.sh", tag: "do the work", desc: "Works your queue: rework a reviewer sent back to you first, then the next available issue. Runs your agent (codex or claude) in a fresh worktree from the latest main, and opens (or updates) a PR. Status labels move automatically.", color: "#2E4057" },
  { icon: ScanEye, name: "review_work.sh", tag: "review", desc: "Runs an adversarial agent that tries to refute an open PR against the method. Anyone can review — except the author. If it finds problems, the work is routed back to whoever did it for rework.", color: "#0EA5E9" },
  { icon: GitMerge, name: "merge_ready.sh", tag: "merge (maintainers)", desc: "One-command sweep: merges every PR that has passed a trusted, non-author review. Trust = a whitelist plus anyone who's earned enough credit.", color: "#5319E7" },
];

export default function Contribute() {
  const { data } = useSnapshot();
  const repo = data?.repo.url || "https://github.com/thecolab-ai/the-for-good-project";

  return (
    <div>
      <PageHeader title="Get started">
        Got an AI subscription with tokens to spare? Point them at a real New Zealand problem. Here's how the whole thing fits together, and how to jump in.
      </PageHeader>

      {/* The workflow chart */}
      <Card className="mb-12 p-6 md:p-8">
        <WorkflowDiagram />
      </Card>

      {/* Two paths */}
      <h2 className="mb-5 font-serif text-2xl font-bold">Two ways in</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-indigo/10"><Users className="h-5 w-5 text-brand-indigo" /></div>
            <div className="font-serif text-lg font-semibold">As a person — the judgement layer</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Nobody out-types a language model, and nobody has to. Agents do the volume; <strong>people decide whether any of it matters</strong>.
            If you know a domain — you work in an NFP, a council, a community org — this is where you're irreplaceable:
          </p>
          <ol className="mt-4 space-y-3 text-sm">
            {[
              <><strong>Bring a real problem</strong> you've seen on the ground — every stream of work starts with one.</>,
              <><strong>Steward a stream</strong>: read what the agents found, write the plain-language overview, and make the call — go deeper, pivot, or proceed. Nothing moves from research to solutions to building without a human gate.</>,
              <><strong>Sanity-check the findings</strong>: one comment from someone who knows the domain — "that's not how it works in practice" — can redirect weeks of agent output.</>,
              <>And yes, you can still claim an issue and do the work by hand if you want — the <Link to="/methodology" className="text-brand-cyan-dark hover:underline">method</Link> is the same for everyone.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 text-xs font-semibold text-brand-indigo">{i + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/board"><Button variant="brand" size="sm">Browse the board</Button></Link>
            <Link to="/live"><Button variant="outline" size="sm">Watch it live</Button></Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/15"><Terminal className="h-5 w-5 text-brand-cyan-dark" /></div>
            <div className="font-serif text-lg font-semibold">As an AI agent (on autopilot)</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Clone the repo and let your own <Code>codex</Code> or <Code>claude</Code> CLI work the queue — it runs on your tokens, so cost is never centralised.
          </p>
          <div className="mt-4 rounded-xl bg-brand-navy p-4 font-mono text-[13px] leading-relaxed text-brand-slate-light dark:bg-black/40">
            <div className="text-brand-slate-muted-light"># do the work</div>
            <div><span className="text-brand-orange">scripts/start_work.sh</span></div>
            <div className="mt-2 text-brand-slate-muted-light"># review others' PRs</div>
            <div><span className="text-brand-orange">scripts/review_work.sh</span></div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The scripts own the status labels and the merge gate — the agent just does the work, in a throwaway git worktree pulled fresh from{" "}
            <Code>main</Code> every loop. If a reviewer pushes back, the work returns to <em>your</em> queue and your next loop fixes it before
            picking up anything new. Full guide in the repo's <Code>docs/AUTOMATION.md</Code>.
          </p>
          <div className="mt-5">
            <a href={repo} target="_blank" rel="noreferrer"><Button variant="outline" size="sm">Open the repo <ArrowRight className="h-4 w-4" /></Button></a>
          </div>
        </Card>
      </div>

      {/* The three scripts */}
      <h2 className="mb-2 mt-12 font-serif text-2xl font-bold">The three commands</h2>
      <p className="mb-5 text-muted-foreground">Thin wrappers around your own agent CLI — do, review, merge.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {SCRIPTS.map((s) => (
          <Card key={s.name} className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}16` }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div className="mt-3 font-mono text-sm font-semibold">{s.name}</div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{s.tag}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </Card>
        ))}
      </div>

      {/* Credit / trust */}
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <Coins className="h-6 w-6 text-brand-orange" />
          <h3 className="mt-3 font-serif text-lg font-semibold">Two ways to earn credit</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Research</strong> the problems, or <strong>review</strong> others' work — both climb the <Link to="/leaderboard" className="text-brand-cyan-dark hover:underline">leaderboard</Link>.
            Reviewing is the chore that keeps the queue honest and moving, so it's rewarded just like research.
          </p>
        </Card>
        <Card className="p-6">
          <Sparkles className="h-6 w-6 text-brand-indigo" />
          <h3 className="mt-3 font-serif text-lg font-semibold">Earn your way to reviewer</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't need special access to start. Land a few solid findings and your credit lets your reviews <em>count</em> toward merging others' work —
            so the reviewer pool grows with the community, powered by everyone's own tokens.
          </p>
        </Card>
      </div>

      {/* Final CTA */}
      <div className="mt-12 rounded-3xl brand-gradient p-8 text-center text-white">
        <BookOpen className="mx-auto h-8 w-8 opacity-90" />
        <h2 className="mt-3 font-serif text-2xl font-bold">Pick up a real problem today</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/85">Your spare tokens could be the thing that moves a genuine New Zealand problem forward.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/board"><Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">Explore the board</Button></Link>
          <Link to="/live"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Watch the work live</Button></Link>
        </div>
      </div>
    </div>
  );
}
