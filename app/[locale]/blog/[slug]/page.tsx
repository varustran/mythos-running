import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, DollarSign, Calendar, User, Sparkles } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { starterCommunityPosts } from "@/data/blog";
import { DiscussionThread } from "@/components/blog/DiscussionThread";

export async function generateStaticParams() {
  const locales = ["vi", "en", "zh-CN", "ja"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of starterCommunityPosts) {
      params.push({ locale, slug: post.slug });
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
  const post = starterCommunityPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `blog/${slug}`,
    title: `${post.title} — Myso Diễn Đàn & Blog`,
    description: post.excerpt,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const post = starterCommunityPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="container-page py-10 sm:py-14 max-w-4xl">
      <Link
        href={localePath(locale, "/blog")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>{locale === "vi" ? "Trở về diễn đàn thảo luận" : "Back to Discussions"}</span>
      </Link>

      {/* Hero Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs text-cyan-400 font-bold">
            {post.flair || "[Thảo luận]"}
          </span>
          <span className="rounded-full bg-accent/10 px-3 py-0.5 font-mono text-xs text-accent font-semibold">
            {post.domain}
          </span>
          {post.monetizationEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 font-mono text-xs text-teal font-medium">
              <DollarSign className="h-3 w-3" />
              Creator Rewards Active
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.2]">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-subtle border-y border-line py-3">
          <span className="flex items-center gap-1.5 text-ink font-semibold">
            <User className="h-3.5 w-3.5 text-accent" />
            {post.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.viewsCount} lượt xem
          </span>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="my-6 aspect-[16/9] w-full rounded-2xl overflow-hidden border border-line shadow-md">
        <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
      </div>

      {/* Excerpt */}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 text-sm sm:text-base font-medium text-ink italic leading-relaxed mb-6">
        "{post.excerpt}"
      </div>

      {/* Article Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-ink leading-relaxed space-y-4">
        {post.content.split("\n\n").map((para, idx) => (
          <p key={idx} className="text-sm sm:text-base text-muted leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Creator Support Box */}
      <div className="mt-10 rounded-2xl border border-teal/40 bg-teal/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/10 text-teal border border-teal/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-ink">Myso Creator Revenue Sharing</h4>
            <p className="text-xs text-muted">Lượt xem thực của bạn đóng góp trực tiếp vào quỹ thu nhập minh bạch của {post.authorName}.</p>
          </div>
        </div>
        <Link
          href={localePath(locale, "/blog/create")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-sm whitespace-nowrap"
        >
          Trở thành tác giả Myso
        </Link>
      </div>

      {/* Interactive Myso Discussion Thread */}
      <DiscussionThread
        postSlug={post.slug}
        postTitle={post.title}
        initialUpvotes={post.upvotes}
        locale={locale}
      />
    </article>
  );
}
