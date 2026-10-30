import Link from "next/link";
import { Search } from "lucide-react";
import type { Article, ArticleCategory } from "@/data/types";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";
import { ArticleCard } from "./ArticleCard";
import { EmptyState } from "./PageHero";

const categories: ArticleCategory[] = ["beginner", "training", "physiology", "nutrition", "recovery", "gear", "racing"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

export function AcademyBrowser({
  articles,
  locale,
  activeCategory,
  query = "",
}: {
  articles: Article[];
  locale: Locale;
  activeCategory?: string;
  query?: string;
}) {
  const t = getT(locale, "academy");
  const common = getT(locale, "common");

  const filtered = articles.filter((article) => {
    const categoryMatch = !activeCategory || article.category === activeCategory;
    const q = normalize(query.trim());
    const textMatch =
      !q || normalize(`${article.title[locale]} ${article.excerpt[locale]} ${article.tags.join(" ")}`).includes(q);
    return categoryMatch && textMatch;
  });

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <Link
            href={localePath(locale, "/academy")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
              !activeCategory
                ? "border-accent bg-accent text-white dark:text-[#04101F]"
                : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
            )}
          >
            {t("allArticles")}
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={localePath(locale, `/academy/category/${category}`)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
                activeCategory === category
                  ? "border-accent bg-accent text-white dark:text-[#04101F]"
                  : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
              )}
            >
              {t(`categories.${category}`)}
            </Link>
          ))}
        </div>

        <form action={localePath(locale, "/academy")} className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 focus-within:border-accent/60">
          <Search className="h-4 w-4 text-subtle" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t("searchPlaceholder")}
            aria-label={common("search")}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle sm:w-56"
          />
        </form>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState title={t("noArticles")} description={common("noResults")} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, index) => (
            <ArticleCard key={article.slug} article={article} locale={locale} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
