import { Link } from "react-router-dom";

export function Footer({ repoUrl, generatedAt }: { repoUrl?: string; generatedAt?: string }) {
  return (
    <footer className="mt-16 border-t border-border/70">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="text-center md:text-left">
          <div className="font-serif text-base font-semibold text-foreground">The For Good Project</div>
          <div>Built together, in Aotearoa. 🇳🇿 · <a href="https://thecolab.ai" className="text-brand-cyan-dark hover:underline">thecolab.ai</a></div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/submit" className="hover:text-foreground">Submit</Link>
          <Link to="/methodology" className="hover:text-foreground">Method</Link>
          {repoUrl ? <a href={repoUrl} className="hover:text-foreground">GitHub</a> : null}
        </div>
      </div>
      {generatedAt ? (
        <div className="border-t border-border/40 py-3 text-center text-xs text-muted-foreground">
          Data refreshed {new Date(generatedAt).toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" })} · rebuilt automatically as issues change
        </div>
      ) : null}
    </footer>
  );
}
