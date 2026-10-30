import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, Edit3, ShieldCheck, Share2, BookOpen } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { curatedWikiArticles } from "@/lib/wiki/wikipedia";

export async function generateStaticParams() {
  const locales = ["vi", "en", "zh-CN", "ja"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const art of curatedWikiArticles) {
      params.push({ locale, slug: art.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = curatedWikiArticles.find((a) => a.slug === slug);
  if (!article) return {};

  return buildMetadata({
    locale,
    path: `wiki/${slug}`,
    title: `${article.title} — Myso Wiki`,
    description: article.summary,
    image: article.thumbnail,
  });
}

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const article = curatedWikiArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <article className="container-page py-12 sm:py-16 max-w-4xl">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={localePath(locale, "/wiki")}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4 text-accent" />
          <span>{locale === "vi" ? "Trở về Myso Wiki" : "Back to Myso Wiki"}</span>
        </Link>

        <Link
          href={localePath(locale, `/wiki/propose?import_title=${encodeURIComponent(article.title)}`)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink hover:border-accent transition"
        >
          <Edit3 className="h-3.5 w-3.5 text-accent" />
          <span>{locale === "vi" ? "Đề xuất sửa bài này" : "Propose Edit"}</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent font-semibold">
            {article.domain}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 font-mono text-xs text-teal font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            2-Peer IP Verified
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
          {article.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed font-sans">
          {article.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-subtle pt-4 border-t border-line/60">
          <span>{article.views.toLocaleString()} lượt đọc</span>
          <span>{article.contributorsCount} người đóng góp</span>
          <span>Cập nhật gần nhất: {article.lastUpdated}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="py-8 prose prose-slate dark:prose-invert max-w-none text-ink leading-relaxed">
        {article.content.split("\n\n").map((para, i) => {
          if (para.startsWith("### ")) {
            return (
              <h3 key={i} className="font-display text-xl font-bold mt-8 mb-3 text-ink">
                {para.replace("### ", "")}
              </h3>
            );
          }
          if (para.startsWith("1. ") || para.startsWith("- ")) {
            const lines = para.split("\n");
            return (
              <ul key={i} className="space-y-2 my-4 list-disc pl-5">
                {lines.map((l, j) => (
                  <li key={j} className="text-sm sm:text-base leading-relaxed text-muted">
                    {l.replace(/^[0-9]+\.\s+|^-\s+/, "")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-sm sm:text-base leading-relaxed text-muted mb-4">
              {para}
            </p>
          );
        })}
      </div>

      {/* Verified Sources & References */}
      <div className="mt-12 rounded-2xl border border-teal/40 bg-teal/5 p-6">
        <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-teal flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4" />
          Tài liệu tham khảo & Nguồn dẫn mở
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted">{article.sourceName}</span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline inline-flex items-center gap-1"
            >
              Xem nguồn gốc <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
