import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GearReview } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";

export function GearCard({ review, locale, index = 1 }: { review: GearReview; locale: Locale; index?: number }) {
  const t = getT(locale, "gear");

  const gearImages: Record<string, string> = {
    shoes: "/images/gear-shoes.jpg",
    watches: "/images/gear-watch.jpg",
    hydration: "/images/academy-hydration.jpg",
    apparel: "/images/hero-running.jpg",
    recovery: "/images/community-1.jpg",
    accessories: "/images/route-vong-canh.jpg",
  };

  return (
    <Link href={`/${locale}/gear/${review.slug}`} className="group card card-hover flex flex-col overflow-hidden">
      <Artwork
        seed={index + 2}
        image={gearImages[review.category] || "/images/gear-shoes.jpg"}
        label={t(`categories.${review.category}`)}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <Badge tone="outline">{t(`categories.${review.category}`)}</Badge>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-accent">
          {review.title[locale]}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{review.excerpt[locale]}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
            {review.readingMinutes} {getT(locale, "common")("minutesRead")}
          </span>
          <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
