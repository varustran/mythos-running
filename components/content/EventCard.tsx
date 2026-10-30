import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import type { RunningEvent } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function EventCard({ event, locale }: { event: RunningEvent; locale: Locale }) {
  const t = getT(locale, "events");
  const common = getT(locale, "common");
  const date = new Date(event.date);
  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(date).toUpperCase();

  return (
    <Link href={`/${locale}/events/${event.slug}`} className="group card card-hover flex gap-5 p-5 sm:p-6">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-elevated">
        <span className="font-display text-xl font-semibold leading-none text-ink">{day}</span>
        <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-subtle">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent">{event.city}</span>
          {event.sample ? <Badge tone="outline">{common("sampleData")}</Badge> : null}
        </div>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-ink transition group-hover:text-accent sm:text-lg">
          {event.title[locale]}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-subtle" />
            {event.location[locale]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-subtle" />
            {formatDate(event.date, locale)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {event.distances.map((distance) => (
              <span key={distance} className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.6rem] text-muted">
                {distance} km
              </span>
            ))}
          </div>
          <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
