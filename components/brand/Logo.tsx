import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-elevated text-ink transition group-hover:border-accent/60">
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M5 24V8l11 12L27 8v16"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="13" stroke="rgb(var(--accent))" strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="27" cy="8" r="2.4" fill="rgb(var(--accent))" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-bold tracking-tight text-ink">Mythos</span>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-accent font-semibold">RUNNING</span>
      </span>
    </Link>
  );
}
