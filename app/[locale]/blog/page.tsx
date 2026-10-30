import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3, DollarSign, Eye, ArrowRight, Sparkles, TrendingUp, Filter } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { starterCommunityPosts } from "@/data/blog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Blog — Mạng Lưới Bài Viết Sáng Tạo & Cơ Chế Kiếm Tiền",
    en: "Myso Blog — Creator Publication Network & Monetization",
    "zh-CN": "Myso 博客 — 创作者出版网络与内容变现",
    ja: "Myso ブログ — クリエイター記事と収益化ネットワーク",
  };

  return buildMetadata({
    locale,
    path: "blog",
    title: titles[locale as Locale] || titles.en,
    description: "Multi-domain creator publishing network with transparent view-based revenue sharing and unrestricted writing freedom.",
  });
}

export default async function BlogHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      {/* Blog Hero Header */}
      <section className="border-b border-line bg-surface/50 py-16 sm:py-20">
        <div className="container-page max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            CREATOR NETWORK & REVENUE SHARING
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink">
            Myso Blog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            {locale === "vi"
              ? "Không gian viết lách tự do đa lĩnh vực. Đăng bài chia sẻ kinh nghiệm, kiến thức, và kích hoạt cơ chế kiếm tiền minh bạch theo lượt xem."
              : "Unrestricted multi-domain writing network. Publish insightful articles, build your audience, and earn transparent view-based revenue sharing."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={localePath(locale, "/blog/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg"
            >
              <Edit3 className="h-4 w-4" />
              {locale === "vi" ? "Viết Bài Mới Ngay" : "Write a New Post"}
            </Link>

            <Link
              href={localePath(locale, "/monetization")}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink hover:border-accent transition"
            >
              <DollarSign className="h-4 w-4 text-teal" />
              {locale === "vi" ? "Chính Sách Kiếm Tiền" : "Monetization Policy"}
            </Link>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container-page py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          {starterCommunityPosts.map((post) => (
            <article
              key={post.id}
              className="group card card-hover flex flex-col overflow-hidden border border-line bg-surface"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-canvas">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/20 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-canvas/80 px-2.5 py-0.5 font-mono text-[0.65rem] text-accent font-semibold backdrop-blur border border-line/60">
                  {post.domain}
                </span>

                {post.monetizationEnabled && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-teal/90 px-2.5 py-0.5 font-mono text-[0.62rem] text-black font-semibold backdrop-blur shadow">
                    <DollarSign className="h-3 w-3" />
                    +{post.estimatedEarningsUsd.toFixed(1)}$
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between text-xs text-subtle font-mono mb-2">
                  <span>Tác giả: {post.authorName}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.viewsCount.toLocaleString()}
                  </span>
                </div>

                <h2 className="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-accent transition leading-snug">
                  <Link href={localePath(locale, `/blog/${post.slug}`)}>{post.title}</Link>
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-5 flex items-center justify-between border-t border-line/60 text-xs font-mono text-muted">
                  <span>{post.publishedAt}</span>
                  <Link
                    href={localePath(locale, `/blog/${post.slug}`)}
                    className="inline-flex items-center gap-1 text-accent font-semibold hover:underline"
                  >
                    Đọc tiếp <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
