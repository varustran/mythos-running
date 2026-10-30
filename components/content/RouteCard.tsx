import Link from "next/link";
import { Mountain, Route as RouteIcon, Star, ArrowUpRight } from "lucide-react";
import type { RunningRoute } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";

export function RouteCard({ route, locale, index = 1 }: { route: RunningRoute; locale: Locale; index?: number }) {
  const t = getT(locale, "routes");
  const common = getT(locale, "common");

  return (
    <Link href={`/${locale}/routes/${route.slug}`} className="group card card-hover overflow-hidden">
      <div className="relative">
        <Artwork seed={index + 1} label={t("communityRating")} className="aspect-[16/9] w-full" />
        <Badge tone="teal" className="absolute left-4 top-4 bg-canvas/85 backdrop-blur">
          {common(route.difficulty)}
        </Badge>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-canvas/85 px-2 py-1 font-mono text-[0.62rem] text-ink backdrop-blur">
          <Star className="h-3 w-3 fill-accent text-accent" />
          {route.rating.toFixed(1)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
          {route.name[locale]}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{route.description[locale]}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <RouteIcon className="h-3.5 w-3.5 text-subtle" />
              {route.distanceKm} km
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-subtle" />
              {route.elevationM} m
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
