"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Search,
  Sparkles,
  TrendingUp,
  Code2,
  Terminal,
  BookOpen,
  Zap,
  Lock,
  Coins,
  MessageCircle,
  Heart,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/settings";

const TOPICS = [
  { id: "all", name: "Tất cả", icon: Sparkles },
  { id: "dev", name: "Code & Dev", icon: Code2 },
  { id: "ai", name: "AI & Prompts", icon: Terminal },
  { id: "research", name: "Nghiên cứu", icon: BookOpen },
  { id: "alpha", name: "Alpha & Web3", icon: Zap },
];

const POPULAR_TAGS = [
  "AI",
  "Fullstack",
  "Web3",
  "Solidity",
  "PromptEngineering",
  "Research",
  "Nextjs",
  "Rust",
  "MachineLearning",
  "Security",
];

export default function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag");

  const [searchQuery, setSearchQuery] = useState(initialTag ? `#${initialTag}` : "");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch("/api/social/posts?feed=popular");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.posts)) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (selectedTopic !== "all" && p.category !== selectedTopic) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/^#/, "");
      const inContent = p.content?.toLowerCase().includes(q);
      const inAuthor = p.author_name?.toLowerCase().includes(q) || p.author_handle?.toLowerCase().includes(q);
      const inCategory = p.category?.toLowerCase().includes(q);
      return inContent || inAuthor || inCategory;
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col divide-y divide-[#27272A]/70">
      {/* Header & Search */}
      <div className="p-6 flex flex-col gap-4 bg-gradient-to-b from-[#18181B]/80 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#FAFAFA] tracking-tight">
              Khám Phá Chủ Đề & Tri Thức
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              Tìm kiếm mã nguồn, AI prompts, bài phân tích chuyên sâu từ cộng đồng
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa, hashtag (#AI, #Solidity), tên tác giả..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121215] border border-[#27272A] text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-amber-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-[#FAFAFA]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Trending tags pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <TrendingUp className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(`#${tag}`)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 transition ${
                searchQuery === `#${tag}`
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46]"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto bg-[#0E0E11] scrollbar-none">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isSelected = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isSelected
                  ? "bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46]"
                  : "text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{topic.name}</span>
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-[#71717A]">
          <span>Tìm thấy {filteredPosts.length} kết quả</span>
          <span>Sắp xếp theo độ phổ biến</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#71717A]">
            <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải bài viết...</span>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] transition flex flex-col gap-3"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-[#18181B] border border-[#27272A] grid place-items-center text-xs font-bold text-amber-400">
                      {post.author_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#FAFAFA]">
                        {post.author_name}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono">
                        @{post.author_handle}
                      </span>
                    </div>
                  </div>

                  {post.is_locked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="h-3 w-3" />
                      <span>
                        {post.unlock_price_gold ? `${post.unlock_price_gold} Gold` : `${post.unlock_price_points} pts`}
                      </span>
                    </span>
                  )}
                </div>

                {/* Content preview */}
                <p className="text-xs text-[#D4D4D8] line-clamp-3 leading-relaxed">
                  {post.public_preview || post.content}
                </p>

                {/* Post Footer stats */}
                <div className="flex items-center justify-between pt-2 border-t border-[#27272A]/50 text-xs text-[#71717A]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.likes_count || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.comments_count || 0}</span>
                    </span>
                  </div>

                  <Link
                    href={`/?highlight=${post.id}`}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-semibold text-[#FAFAFA]">
              Không tìm thấy bài viết phù hợp
            </p>
            <p className="text-xs text-[#71717A]">
              Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hashtag.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
