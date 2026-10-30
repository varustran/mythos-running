import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  image,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  image?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-line", className)}>
      {image ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-20 filter blur-[1px] dark:opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-transparent" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 z-0" aria-hidden="true" />
      <div className="container-page relative z-10 py-14 sm:py-20">
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="display-title max-w-4xl text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">{title}</h1>
        {description ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 h-10 w-10 rounded-full border border-dashed border-line" aria-hidden="true" />
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-muted">{description}</p> : null}
    </div>
  );
}
