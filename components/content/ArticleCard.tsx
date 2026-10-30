import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Article } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { formatDate, cn } from "@/lib/utils";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";

export function ArticleCard({
  article,
  locale,
  index = 1,
  large = false,
}: {
  article: Article;
  locale: Locale;
  index?: number;
  large?: boolean;
}) {
  const t = getT(locale, "academy");
  const common = getT(locale, "common");

  const categoryImages: Record<string, string> = {
    beginner: "/images/academy-beginner.jpg",
    training: "/images/academy-training.jpg",
    physiology: "/images/academy-physiology.jpg",
    nutrition: "/images/academy-hydration.jpg",
    recovery: "/images/hero-running.jpg",
    racing: "/images/route-kinh-thanh.jpg",
    gear: "/images/gear-shoes.jpg",
  };

  return (
    <Link
      href={`/${locale}/academy/${article.slug}`}
      className={cn("group card card-hover flex flex-col overflow-hidden", large && "md:flex-row")}
    >
      <div className={cn("relative", large ? "md:w-1/2" : "")}>
        <Artwork
          seed={index}
          image={categoryImages[article.category]}
          label={t(`categories.${article.category}`)}
          className={cn("aspect-[16/10] w-full", large && "md:h-full md:aspect-auto")}
        />
        {article.featured ? (
          <Badge tone="accent" className="absolute left-4 top-4 bg-canvas/90 backdrop-blur">
            {common("featured")}
          </Badge>
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col p-5 sm:p-6", large && "md:p-8")}>
        <div className="mb-3 flex items-center gap-2 text-[0.68rem] text-subtle">
          <span className="font-mono uppercase tracking-[0.14em] text-accent">{t(`categories.${article.category}`)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        </div>
        <h3 className={cn("font-display font-semibold leading-snug tracking-tight text-ink transition group-hover:text-accent", large ? "text-2xl sm:text-3xl" : "text-lg")}>
          {article.title[locale]}
        </h3>
        <p className={cn("mt-2.5 text-sm leading-relaxed text-muted", large ? "line-clamp-3" : "line-clamp-3")}>
          {article.excerpt[locale]}
        </p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
            {article.readingMinutes} {common("minutesRead")}
          </span>
          <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
