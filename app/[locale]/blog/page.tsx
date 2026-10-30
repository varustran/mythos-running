import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit3, DollarSign, Sparkles } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { starterCommunityPosts } from "@/data/blog";
import { CommunityFeed } from "@/components/blog/CommunityFeed";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Diễn Đàn & Blog — Thảo Luận Mở, Chia Sẻ Đa Lĩnh Vực & Quỹ Tác Giả",
    en: "Myso Forum & Blog — Open Discussions & Creator Network",
    "zh-CN": "Myso 论坛与博客 — 开放讨论与创作者网络",
    ja: "Myso フォーラム＆ブログ — オープンディスカッションとクリエイターネットワーク",
  };

  return buildMetadata({
    locale,
    path: "blog",
    title: titles[locale as Locale] || titles.en,
    description: "Open multi-domain discussion forum and publication network, featuring transparent creator rewards and community knowledge exchange.",
  });
}

export default async function BlogHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      {/* Blog & Community Hero Header */}
      <section className="border-b border-line bg-surface/50 py-12 sm:py-16">
        <div className="container-page max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            MYSO OPEN COMMUNITY & CREATOR NETWORK
          </span>
          <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Myso Diễn Đàn & Blog
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-2xl mx-auto">
            {locale === "vi"
              ? "Không gian thảo luận mở, chia sẻ kinh nghiệm và tranh luận đa lĩnh vực. Viết bài, thu hút lượt đọc và tham gia mạng lưới sáng tạo nội dung của Myso."
              : "Unrestricted multi-domain discussion and publication network. Engage in open debates, share practical knowledge, and earn transparent creator rewards."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={localePath(locale, "/blog/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-md"
            >
              <Edit3 className="h-4 w-4" />
              {locale === "vi" ? "Đăng Bài Thảo Luận Mới" : "Create New Post"}
            </Link>

            <Link
              href={localePath(locale, "/monetization")}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-xs sm:text-sm font-semibold text-ink hover:border-accent transition"
            >
              <DollarSign className="h-4 w-4 text-teal" />
              {locale === "vi" ? "Chính Sách Kiếm Tiền" : "Monetization Policy"}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Community Discussion Feed Section */}
      <section className="container-page py-10 sm:py-14">
        <CommunityFeed initialPosts={starterCommunityPosts} locale={locale} />
      </section>
    </>
  );
}
