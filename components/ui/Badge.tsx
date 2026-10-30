import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "teal" | "outline";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-elevated text-muted",
    accent: "bg-accent-soft text-accent",
    teal: "bg-teal/10 text-teal",
    outline: "border border-line text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
