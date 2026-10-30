"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share2,
  DollarSign,
  Eye,
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Shield,
  HelpCircle,
  ExternalLink,
  Check,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import type { CommunityPostItem } from "@/data/blog";

export function CommunityFeed({
  initialPosts,
  locale,
}: {
  initialPosts: CommunityPostItem[];
  locale: Locale;
}) {
  const [posts, setPosts] = useState<CommunityPostItem[]>(initialPosts);
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [activeSort, setActiveSort] = useState<"hot" | "new" | "top">("hot");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const tags = ["all", "[Kỹ thuật]", "[Chia sẻ]", "[Thảo luận]", "[Hỏi đáp]", "[Review]"];

  const handleVote = async (postSlug: string, direction: 1 | -1) => {
    const currentVote = userVotes[postSlug] || 0;
    let newVote: 1 | -1 | 0 = direction;
    let delta: number = direction;

    if (currentVote === direction) {
      newVote = 0;
      delta = -direction;
    } else if (currentVote !== 0) {
      delta = direction * 2;
    }

    setUserVotes((prev) => ({ ...prev, [postSlug]: newVote }));
    setPosts((prev) =>
      prev.map((p) =>
        p.slug === postSlug ? { ...p, upvotes: Math.max(0, p.upvotes + delta) } : p
      )
    );

    // Call vote API in background
    try {
      fetch("/api/blog/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "post", slug: postSlug, delta }),
      }).catch(() => {});
    } catch {}
  };

  const handleShare = (slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${locale}/blog/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  // Filter & Sort
  const filteredPosts = posts
    .filter((p) => (selectedTag === "all" ? true : p.flair === selectedTag))
    .sort((a, b) => {
      if (activeSort === "new") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (activeSort === "top") {
        return b.upvotes - a.upvotes;
      }
      // Hot: combination of upvotes & recency
      return b.upvotes * 2 + (b.monetizationEnabled ? 1 : 0) - (a.upvotes * 2);
    });

  const getFlairBadgeColor = (flair: string) => {
    switch (flair) {
      case "[Kỹ thuật]":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
      case "[Chia sẻ]":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "[Thảo luận]":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "[Review]":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";
      case "[Hỏi đáp]":
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      default:
        return "border-accent/30 bg-accent/10 text-accent";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Feed Column (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Sort & Filter Bar */}
        <div className="rounded-2xl border border-line bg-surface p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          {/* Sorting Tabs (Hot / New / Top) */}
          <div className="flex items-center gap-1 bg-canvas/60 p-1 rounded-xl border border-line/60">
            <button
              onClick={() => setActiveSort("hot")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSort === "hot"
                  ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{locale === "vi" ? "Sôi nổi" : "Hot"}</span>
            </button>
            <button
              onClick={() => setActiveSort("new")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSort === "new"
                  ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{locale === "vi" ? "Mới nhất" : "New"}</span>
            </button>
            <button
              onClick={() => setActiveSort("top")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSort === "top"
                  ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{locale === "vi" ? "Nhiều vote nhất" : "Top"}</span>
            </button>
          </div>

          {/* Quick Create Link on mobile */}
          <Link
            href={localePath(locale, "/blog/create")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent/15 border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{locale === "vi" ? "Đăng thảo luận" : "New Thread"}</span>
          </Link>
        </div>

        {/* Category Flairs Quick Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-mono whitespace-nowrap transition border ${
                selectedTag === tag
                  ? "border-accent bg-accent/20 text-accent font-bold"
                  : "border-line bg-surface/60 text-muted hover:text-ink hover:border-line"
              }`}
            >
              {tag === "all" ? (locale === "vi" ? "Tất cả chủ đề" : "All Threads") : tag}
            </button>
          ))}
        </div>

        {/* Post Items */}
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const userVote = userVotes[post.slug] || 0;
            return (
              <article
                key={post.id}
                className="group rounded-2xl border border-line bg-surface hover:border-accent/50 transition-all p-4 sm:p-5 flex gap-4 shadow-sm"
              >
                {/* Left Community Voting Column */}
                <div className="flex flex-col items-center justify-start pt-1 gap-1 text-muted">
                  <button
                    onClick={() => handleVote(post.slug, 1)}
                    className={`p-1 rounded-md hover:bg-canvas transition ${
                      userVote === 1 ? "text-accent bg-accent/10" : "text-muted hover:text-accent"
                    }`}
                    title="Đồng tình / Upvote"
                  >
                    <ChevronUp className="h-5 w-5 stroke-[2.5]" />
                  </button>
                  <span
                    className={`font-mono text-xs font-bold ${
                      userVote === 1
                        ? "text-accent"
                        : userVote === -1
                        ? "text-rose-500"
                        : "text-ink"
                    }`}
                  >
                    {post.upvotes}
                  </span>
                  <button
                    onClick={() => handleVote(post.slug, -1)}
                    className={`p-1 rounded-md hover:bg-canvas transition ${
                      userVote === -1 ? "text-rose-500 bg-rose-500/10" : "text-muted hover:text-rose-500"
                    }`}
                    title="Không đồng tình / Downvote"
                  >
                    <ChevronDown className="h-5 w-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Right Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Top Thread Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-bold text-[0.65rem] ${getFlairBadgeColor(
                        post.flair || "[Thảo luận]"
                      )}`}
                    >
                      {post.flair || "[Thảo luận]"}
                    </span>
                    <span className="text-subtle font-medium">{post.domain}</span>
                    <span className="text-line">•</span>
                    <span className="text-muted">Đăng bởi <strong className="text-ink font-semibold">{post.authorName}</strong></span>
                    <span className="text-line">•</span>
                    <span className="text-subtle">{post.publishedAt}</span>
                  </div>

                  {/* Thread Title */}
                  <h3 className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-accent transition leading-snug">
                    <Link href={localePath(locale, `/blog/${post.slug}`)}>{post.title}</Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60 text-xs font-mono text-muted">
                    <div className="flex items-center gap-4">
                      <Link
                        href={localePath(locale, `/blog/${post.slug}#comments`)}
                        className="inline-flex items-center gap-1.5 hover:text-accent transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Thảo luận</span>
                      </Link>

                      <button
                        onClick={() => handleShare(post.slug)}
                        className="inline-flex items-center gap-1.5 hover:text-accent transition"
                      >
                        {copiedSlug === post.slug ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-teal" />
                            <span className="text-teal">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Chia sẻ</span>
                          </>
                        )}
                      </button>

                      <span className="inline-flex items-center gap-1 text-subtle">
                        <Eye className="h-3.5 w-3.5" />
                        {post.viewsCount} lượt xem
                      </span>
                    </div>

                    {post.monetizationEnabled && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-[0.68rem] text-teal font-semibold">
                        <DollarSign className="h-3 w-3" />
                        Quỹ tác giả
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar Column (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Community Guidelines Card */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-accent" />
            <h4 className="font-display text-sm font-bold text-ink">Quy tắc cộng đồng Myso</h4>
          </div>
          <p className="text-xs text-muted leading-relaxed mb-4">
            Cộng đồng Myso hoạt động theo cơ chế mở, tôn trọng tự do biểu đạt, văn minh phản biện và đề cao tính thực chứng.
          </p>
          <ul className="space-y-2 text-xs text-muted">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">1.</span>
              <span>Chia sẻ kiến thức có dẫn chứng hoặc kiểm chứng thực tế.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">2.</span>
              <span>Tranh luận tập trung vào quan điểm, không công kích cá nhân.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">3.</span>
              <span>Không spam link quảng cáo vô căn cứ, lừa đảo hoặc vi phạm pháp luật.</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-line">
            <Link
              href={localePath(locale, "/blog/create")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tạo chủ đề thảo luận mới</span>
            </Link>
          </div>
        </div>

        {/* Creator Monetization Box */}
        <div className="rounded-2xl border border-teal/30 bg-teal/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <h4 className="font-display text-sm font-bold text-ink">Kiếm tiền từ bài viết</h4>
          </div>
          <p className="text-xs text-muted leading-relaxed mb-4">
            Đăng bài đạt chuẩn cộng đồng, thu hút lượt đọc thực và nhận chia sẻ doanh thu minh bạch định kỳ qua ví điện tử.
          </p>
          <Link
            href={localePath(locale, "/monetization")}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-teal hover:underline"
          >
            <span>Tìm hiểu biểu phí RPM & điều kiện</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
