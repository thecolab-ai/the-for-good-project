import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveDocHref } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Markdown({ children, className, linkBase }: { children: string; className?: string; linkBase?: string }) {
  const components: Components = {
    // Wide markdown tables scroll within the page instead of pushing the layout wider than the viewport.
    table: ({ children: tableChildren, ...props }) => (
      <div className="my-3 max-w-full overflow-x-auto">
        <table {...props}>{tableChildren}</table>
      </div>
    ),
    // Code blocks scroll horizontally rather than forcing the column to grow.
    pre: ({ children: preChildren, ...props }) => (
      <pre {...props} className="max-w-full overflow-x-auto">{preChildren}</pre>
    ),
    ...(linkBase
      ? {
          a: ({ href, children: linkChildren, ...props }) => (
            <a {...props} href={resolveDocHref(href, linkBase)} target="_blank" rel="noreferrer">{linkChildren}</a>
          ),
        }
      : {}),
  };

  return (
    <div className={cn(
      "min-w-0 max-w-full text-sm leading-relaxed text-foreground/90 [&_a]:text-brand-cyan-dark [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words",
      "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base",
      "[&_p]:my-2 [&_p]:break-words [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_li]:break-words",
      "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:break-words",
      "[&_table]:w-full [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_td]:border-b [&_td]:border-border/50 [&_td]:p-2",
      "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-cyan [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
      className
    )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
