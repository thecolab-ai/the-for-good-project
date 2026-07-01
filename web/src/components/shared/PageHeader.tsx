export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-brand-navy dark:text-foreground md:text-4xl">{title}</h1>
      {children ? <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p> : null}
    </div>
  );
}
