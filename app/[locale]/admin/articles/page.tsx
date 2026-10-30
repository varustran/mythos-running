import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { articles } from "@/data/articles";
import { formatDate } from "@/lib/utils";

export default async function AdminArticlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");
  const academy = getT(locale, "academy");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">{t("articles")}</h1>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{articles.length}</span>
      </div>

      <div className="card overflow-x-auto p-2">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-b border-line">
              {[t("title"), t("category"), t("status"), t("published")].map((head) => (
                <th key={head} className="px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.slug} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3">
                  <Link href={localePath(locale, `/academy/${article.slug}`)} className="inline-flex items-center gap-1.5 text-ink hover:text-accent">
                    {article.title[locale]} <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-3 py-3 text-muted">{academy(`categories.${article.category}`)}</td>
                <td className="px-3 py-3 text-teal">{t("published")}</td>
                <td className="px-3 py-3 text-subtle">{formatDate(article.publishedAt, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-subtle">{t("seedContentNote")}</p>
    </div>
  );
}
