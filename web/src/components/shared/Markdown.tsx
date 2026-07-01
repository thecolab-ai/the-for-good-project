import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn(
      "text-sm leading-relaxed text-foreground/90 [&_a]:text-brand-cyan-dark [&_a]:underline [&_a]:underline-offset-2",
      "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base",
      "[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
      "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
      "[&_table]:my-3 [&_table]:w-full [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_td]:border-b [&_td]:border-border/50 [&_td]:p-2",
      "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-cyan [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
      className
    )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
