import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquareText,
  Network,
  Palette,
  PenLine,
  Shirt,
  Sparkles,
  Type,
} from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STAGE_META, STAGE_ORDER } from "@/lib/meta";

const base = import.meta.env.BASE_URL;

const brandImages = [
  {
    src: "images/brand/for-good-hero.jpg",
    title: "New Zealand evidence map",
    alt: "The For Good Project tabletop map of New Zealand with connected research cards and hands collaborating.",
    guidance: "Use for broad project introductions, partner decks, and social banners about the whole commons.",
  },
  {
    src: "images/brand/for-good-workflow.jpg",
    title: "How work moves",
    alt: "The For Good Project workflow from Discover to Research to Ideate to Build across a paper workbench.",
    guidance: "Use when explaining the four-stage operating model or orienting contributors.",
  },
  {
    src: "images/brand/for-good-trust-loop.jpg",
    title: "Evidence before action",
    alt: "The For Good Project evidence loop from Cite to Verify to Review to Build on a paper workbench.",
    guidance: "Use when explaining trust, review, citations, and why evidence comes before shipping.",
  },
];

const colors = [
  {
    name: "Warm paper",
    token: "background / brand-cream",
    hex: "#FBF9F6",
    use: "Page background, editorial space, decks, printable material.",
    text: "#1C1917",
  },
  {
    name: "Ink",
    token: "brand-navy",
    hex: "#1C1917",
    use: "Primary headings, body contrast, primary buttons.",
    text: "#FBF9F6",
  },
  {
    name: "Civic blue",
    token: "brand-indigo",
    hex: "#2E4057",
    use: "Trust anchor, research marks, data panels, serious UI accents.",
    text: "#FBF9F6",
  },
  {
    name: "Action blue",
    token: "brand-cyan",
    hex: "#0EA5E9",
    use: "Links, focus states, live paths, collaboration nodes.",
    text: "#052A3F",
  },
  {
    name: "Accessible link",
    token: "brand-cyan-dark",
    hex: "#0284C7",
    use: "Small text links and interactive labels on light surfaces.",
    text: "#FBF9F6",
  },
  {
    name: "Build orange",
    token: "brand-orange",
    hex: "#C2410C",
    use: "Sparse calls to action, decisions, build stage, warnings.",
    text: "#FBF9F6",
  },
  {
    name: "Stone line",
    token: "border",
    hex: "#E6DED5",
    use: "Rules, dividers, card borders, low-noise structure.",
    text: "#1C1917",
  },
  {
    name: "Muted ink",
    token: "muted-foreground",
    hex: "#71665E",
    use: "Supporting copy, labels, captions, metadata.",
    text: "#FBF9F6",
  },
];

const voicePrinciples = [
  {
    title: "AI does the hard graft",
    body: "Use AI for scale: scanning, summarising, cross-checking, drafting options, and making illegible systems easier to inspect.",
  },
  {
    title: "Humans steer the good",
    body: "Call on people for empathy, judgement, connection, consent, and the local knowledge that tells us what actually matters.",
  },
  {
    title: "Local reality matters",
    body: "Make room for the currently illegible and intangible parts of life in New Zealand: lived experience, relationships, culture, trust, and context.",
  },
  {
    title: "Critique must feed forward",
    body: "If something is wrong, name the gap and offer a next step, option, source, framing, or experiment that moves the work forward.",
  },
  {
    title: "Everyone can contribute",
    body: "The brand should feel like an open table: domain experts, builders, funders, community people, companies, and curious citizens can all add something useful.",
  },
  {
    title: "Name the country plainly",
    body: "Default to New Zealand. Use Aotearoa New Zealand only as an intentional dual-language nod; otherwise keep the English country name.",
  },
];

const designMotifs = [
  {
    icon: FileText,
    title: "Paper workbench",
    body: "Cream paper, folders, cards, pins, notebooks, maps, and clipped reports make the work feel inspectable and concrete.",
  },
  {
    icon: Network,
    title: "Connected evidence",
    body: "Thin blue connector lines, nodes, arrows, thread, and linked cards represent lineage, citations, review, and shared work.",
  },
  {
    icon: ImageIcon,
    title: "New Zealand context",
    body: "New Zealand geography, public-sector documents, local community settings, lived context, and practical tools should appear before generic AI imagery.",
  },
  {
    icon: BadgeCheck,
    title: "Review marks",
    body: "Checks, gauges, magnifiers, stamps, and small confidence dots reinforce the promise that claims are challenged before use.",
  },
];

const toneSamples = [
  {
    label: "Project one-liner",
    copy: "A shared research commons where AI does the hard graft and humans bring the empathy, local knowledge, and judgement needed to make public-good work useful in New Zealand.",
  },
  {
    label: "Short line",
    copy: "AI does the graft. Humans steer the good.",
  },
  {
    label: "Contribution invitation",
    copy: "Bring what you know, what you can test, what you can build, or what you can see that others cannot.",
  },
  {
    label: "Feed-forward critique",
    copy: "If something is off, help move it forward: name the gap, offer options, and point to the next useful step.",
  },
  {
    label: "Trust line",
    copy: "Cite every claim, verify the surprising ones, mark confidence, and say what would change your mind.",
  },
];

const agentBrief = `Use The For Good Project brand system.

Brand essence:
- Use AI for the hard graft: scanning, summarising, cross-checking, drafting options, and making illegible systems easier to inspect.
- Call on humans for the best of humanity: empathy, judgement, connection, consent, local domain knowledge, and lived experience.
- Make room for what is currently intangible about life in New Zealand: relationships, culture, trust, access, and what people know from being close to a problem.
- The project is a shared commons, not a single-company brand. Use "The For Good Project" as the primary mark.
- Contribution energy is feed-forward: critique should name the gap and offer options, sources, framing, experiments, or next steps.
- Trust is the product: cite, verify, review, then build.
- Country naming: default to "New Zealand". Use "Aotearoa New Zealand" only when an intentional dual-language nod is appropriate; otherwise keep the English country name.

Visual direction:
- Warm paper workbench, cream background, dark ink serif headlines.
- Deep blue and action blue for collaboration, research, links, paths, nodes, and UI.
- Orange only as a sparse decision/build accent.
- Use real New Zealand context, public documents, maps, cards, folders, pins, notebooks, and hands working together.
- Show connected evidence: thin blue lines, nodes, arrows, thread, review marks, gauges, magnifiers, check marks.
- Keep the logo lockup standalone as "The For Good Project". Credit founding or partner organisations in supporting context, not inside the core mark.

Avoid:
- Futuristic neon AI, robot mascots, glossy black dashboards, generic global city stock imagery, cute charity tropes, single-company bylines in the core mark, critique without options, exaggerated impact claims, or unsupported statistics.

Core copy:
- The For Good Project
- AI does the graft. Humans steer the good.
- Discover -> Research -> Ideate -> Build
- Evidence before action
- Bring what you know. Help move the work forward.
`;

function asset(path: string) {
  return `${base}${path}`;
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof Palette;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-cyan-dark">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>
        <h2 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground md:text-3xl">{title}</h2>
        {children ? <p className="mt-2 text-muted-foreground">{children}</p> : null}
      </div>
    </div>
  );
}

function Swatch({ color }: { color: (typeof colors)[number] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex min-h-28 flex-col justify-between p-4" style={{ backgroundColor: color.hex, color: color.text }}>
        <div className="text-sm font-semibold">{color.name}</div>
        <div className="font-mono text-xs">{color.hex}</div>
      </div>
      <div className="p-4">
        <div className="font-mono text-xs text-brand-cyan-dark">{color.token}</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{color.use}</p>
      </div>
    </Card>
  );
}

function SpecBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function DoDont() {
  const dos = [
    "Use The For Good Project as the primary standalone lockup.",
    "Credit founding or partner organisations in supporting context, not inside the mark.",
    "Pair editorial serif headlines with plain, compact UI text.",
    "Use blue connector motifs to show lineage and collaboration.",
    "Make room for human judgement, lived context, and local knowledge.",
    "Turn critique into options, sources, next questions, or practical experiments.",
  ];
  const donts = [
    "Do not lock the project mark to a single company byline.",
    "Do not use robot mascots, neon AI tropes, or sci-fi tunnel visuals.",
    "Do not imply agents make human-gated decisions.",
    "Do not treat critique as a spectator sport; it should move the work forward.",
    "Do not publish names, faces, partners, or personal details without consent.",
    "Do not make unsupported claims like 'proven impact' unless evidence exists.",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">Do</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {dos.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">Avoid</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {donts.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function BrandKit() {
  const { data } = useSnapshot();
  const repo = data?.repo.url || "https://github.com/thecolab-ai/the-for-good-project";

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-brand-navy text-white shadow-sm">
        <img
          src={asset("images/brand/for-good-hero.jpg")}
          alt="The For Good Project brand reference: a tabletop New Zealand evidence map with connected research cards."
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/78 to-brand-navy/10" />
        <div className="relative max-w-3xl px-6 py-16 md:px-10 md:py-20">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div className="font-serif text-2xl font-bold leading-none">The For Good Project</div>
          </div>
          <h1 className="mt-8 font-serif text-4xl font-bold leading-tight md:text-6xl">
            Brand kit for human-led, AI-powered public-good work.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/82">
            A practical design system for work where AI does the hard graft and humans bring the empathy, judgement, connection, and local knowledge.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#agent-brief">
              <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">
                Copy the agent brief <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={`${repo}/tree/main/projects/brand-identity`} target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="border-white/35 bg-white/5 text-white hover:bg-white/10">
                Source notes
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Essence",
            body: "AI helps with scale, grind, pattern-finding, drafting, and making illegible systems easier to inspect.",
          },
          {
            title: "Human role",
            body: "People steer what matters through empathy, lived experience, connection, ethics, and local domain knowledge.",
          },
          {
            title: "Contribution energy",
            body: "Anyone can help move the work forward. Critique should become options, sources, better framing, or next steps.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <div className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{item.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </Card>
        ))}
      </section>

      <section>
        <SectionHeading icon={Palette} eyebrow="01 / Colour" title="Palette and tokens">
          The palette comes from the current app tokens and the supplied visual references: warm paper, dark ink, serious blue, action blue, and sparse orange.
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {colors.map((color) => (
            <Swatch key={color.name} color={color} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading icon={Type} eyebrow="02 / Typography" title="Editorial headlines, utilitarian UI">
          The type system should feel credible in a report and efficient in a product interface.
        </SectionHeading>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Display / Playfair Display</div>
            <div className="mt-3 font-serif text-5xl font-bold leading-tight text-brand-navy dark:text-foreground">
              Evidence before action.
            </div>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Use serif display type for page titles, campaign lines, manifesto statements, and major section headings.
              Keep it crisp, not ornamental.
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Body and UI / Inter</div>
            <p className="text-base leading-relaxed text-foreground">
              Body copy is direct and legible. UI labels are compact, sentence-case, and practical.
            </p>
            <div className="mt-5 rounded-lg bg-muted p-4 font-mono text-sm">
              font-serif: Playfair Display
              <br />
              font-sans: Inter
              <br />
              font-mono: JetBrains Mono
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeading icon={Sparkles} eyebrow="03 / Visual language" title="Make the invisible work visible">
          The imagery should show evidence, lived context, relationships, decisions, and local knowledge being gathered, checked, linked, and turned into action - not abstract AI magic.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {designMotifs.map((motif) => (
            <Card key={motif.title} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-cyan/12">
                <motif.icon className="h-5 w-5 text-brand-cyan-dark" />
              </div>
              <div className="mt-4 font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{motif.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{motif.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {brandImages.map((image) => (
            <Card key={image.src} className="overflow-hidden">
              <img src={asset(image.src)} alt={image.alt} className="aspect-[16/9] w-full object-cover" loading="lazy" />
              <div className="p-4">
                <div className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{image.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{image.guidance}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading icon={LayoutGrid} eyebrow="04 / Product UI" title="Reusable interface patterns">
          Web and app surfaces should stay quiet, scan-friendly, and evidence-led. Use cards for repeated items, not as decoration around every section.
        </SectionHeading>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant="brand">Primary action</Button>
              <Button variant="outline">Secondary action</Button>
              <Button variant="ghost">Quiet action</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {STAGE_ORDER.map((stage, index) => {
                const meta = STAGE_META[stage];
                const Icon = meta.icon;
                return (
                  <div key={stage} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.color}16` }}>
                        <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    </div>
                    <div className="mt-3 font-serif text-base font-semibold">{meta.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.blurb}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">Component rules</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Radius: mostly 8-12px, never pill-heavy unless it is a tag.</li>
              <li>Buttons: compact, icon-aware, clear command labels.</li>
              <li>Data: favour tables, lists, bars, and lineage over decoration.</li>
              <li>States: show open, claimed, review, blocked, and done plainly.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeading icon={MessageSquareText} eyebrow="05 / Voice" title="Tone of voice">
          The voice is calm, rigorous, generous, and useful. It should invite people to contribute what they know and turn critique into forward motion.
        </SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {voicePrinciples.map((principle) => (
              <Card key={principle.title} className="p-5">
                <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <h3 className="font-serif text-lg font-semibold text-brand-navy dark:text-foreground">Approved copy blocks</h3>
            <div className="mt-4 space-y-3">
              {toneSamples.map((sample) => (
                <SpecBlock key={sample.label} label={sample.label}>
                  <p className="text-sm leading-relaxed text-foreground">{sample.copy}</p>
                </SpecBlock>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeading icon={PenLine} eyebrow="06 / Logo and marks" title="Use the mark as a shared project anchor">
          The primary lockup is The For Good Project on its own. The Colab can be credited as a founder in supporting context, but the core mark should stay open to every contributor and partner.
        </SectionHeading>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark size={44} />
                <div>
                  <div className="font-serif text-2xl font-bold leading-none text-brand-navy dark:text-foreground">The For Good Project</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Use the standalone mark for app chrome, small badges, social avatars, partner material, and shared contributor work. Add founding or partner credits nearby only when the context needs them.
              </p>
            </div>
          </Card>
          <DoDont />
        </div>
      </section>

      <section>
        <SectionHeading icon={Shirt} eyebrow="07 / Media, merch, and campaigns" title="Extend the system without diluting it">
          The brand should work on a website, a workshop handout, a graphic, a T-shirt, and a product screen.
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Decks and reports",
              body: "Use large serif statements, generous paper margins, blue rules, small confidence/status marks, and specific evidence captions.",
            },
            {
              icon: ImageIcon,
              title: "Social graphics",
              body: "Lead with one useful claim or workflow step. Keep text short enough to read on a phone and leave visible paper texture or workspace context.",
            },
            {
              icon: Shirt,
              title: "T-shirts and merch",
              body: "Prefer simple lockups: mark, project name, or lines like 'AI does the graft. Humans steer the good.' Keep orange to one small accent.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="h-6 w-6 text-brand-indigo" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-brand-navy dark:text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="agent-brief">
        <SectionHeading icon={Bot} eyebrow="08 / Agent input" title="Reusable creative brief for other agents">
          Give this block to an image, design, marketing, or product agent before asking it to create new brand material.
        </SectionHeading>
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted px-5 py-3 text-sm font-medium">Brand prompt</div>
          <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-foreground">
            {agentBrief}
          </pre>
        </Card>
      </section>

      <section className="rounded-3xl brand-gradient p-8 text-white md:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold">Keep the system close to the work.</h2>
            <p className="mt-2 max-w-2xl text-white/82">
              When in doubt, return to the method: cite, verify, review, build. The visual system exists to make that chain easier to trust.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/methodology">
              <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">
                Read the method
              </Button>
            </Link>
            <Link to="/contribute">
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                Use it in the project
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
