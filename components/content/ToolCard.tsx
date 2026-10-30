import Link from "next/link";
import {
  Activity,
  CalendarClock,
  CalendarRange,
  ClipboardList,
  Flame,
  Footprints,
  Gauge,
  HeartPulse,
  Medal,
  Mountain,
  Rows3,
  Ruler,
  Timer,
  TrendingUp,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import type { ToolMeta } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { Badge } from "@/components/ui/Badge";

const iconMap = {
  Activity,
  CalendarClock,
  CalendarRange,
  ClipboardList,
  Flame,
  Footprints,
  Gauge,
  HeartPulse,
  Medal,
  Mountain,
  Rows3,
  Ruler,
  Timer,
  TrendingUp,
  Trophy,
} as const;

export function ToolCard({ tool, locale, showCategory = true }: { tool: ToolMeta; locale: Locale; showCategory?: boolean }) {
  const t = getT(locale, "tools");
  const common = getT(locale, "common");
  const Icon = iconMap[tool.icon as keyof typeof iconMap] ?? Timer;

  return (
    <Link
      href={`/${locale}/tools/${tool.slug}`}
      className="group card card-hover flex flex-col p-5"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-elevated text-accent transition group-hover:border-accent/50">
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink transition group-hover:text-accent">
        {t(`items.${tool.slug}.name`)}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{t(`items.${tool.slug}.desc`)}</p>
      <div className="mt-auto flex items-center gap-2 pt-4">
        {showCategory ? <Badge tone="outline">{t(`category${tool.category.charAt(0).toUpperCase()}${tool.category.slice(1)}`)}</Badge> : null}
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{common("free")}</span>
      </div>
    </Link>
  );
}
