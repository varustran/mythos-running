"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  Flag,
  Image as ImageIcon,
  Sparkles,
  Flame,
  TrendingUp,
  ShieldCheck,
  Send,
  Check,
  X,
  Lock,
  BarChart2,
  Smile,
  Hash,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { AntiSpamCaptcha } from "@/components/security/AntiSpamCaptcha";

interface SocialPostItem {
  id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string | null;
  content: string;
  media_urls?: string[];
  category: string;
  likes_count: number;
  reposts_count: number;
  comments_count: number;
  bookmarks_count: number;
  created_at: string;
}

interface SocialCommentItem {
  id: string;
  post_id: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string | null;
  content: string;
  created_at: string;
}

export function SocialFeedClient({
  initialPosts = [],
  locale,
}: {
  initialPosts?: SocialPostItem[];
  locale: Locale;
}) {
  const [posts, setPosts] = useState<SocialPostItem[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [postContent, setPostContent] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // User interaction states
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [repostedPosts, setRepostedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Comment drawers
  const [expandedPostComments, setExpandedPostComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, SocialCommentItem[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Report modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Gamification: Daily Streak
  const [streakCount, setStreakCount] = useState(3);
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Curated initial seed posts if database is fresh
  const curatedStarterPosts: SocialPostItem[] = [
    {
      id: "post-seed-1",
      author_name: "Alex Trần",
      author_handle: "alextran",
      author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "Chính thức thử nghiệm mạng xã hội #Myso! Nền tảng kết hợp mạng xã hội thời gian thực, bách khoa toàn thư mở Wikipedia và kênh chat mã hóa đầu cuối E2EE. Không gian thảo luận tự do, tôn trọng sự phản biện và minh bạch pháp lý! 🚀✨ #AI #CongNghe2026",
      media_urls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"],
      category: "ai",
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "post-seed-2",
      author_name: "Dr. Elena Nguyễn",
      author_handle: "elena_science",
      author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      content: "Nghiên cứu mới về nhịp sinh học Circadian cho thấy: Tiếp xúc ánh sáng mặt trời tự nhiên trong 30 phút đầu sau khi thức dậy giúp cải thiện 40% nồng độ dopamine và ổn định chu kỳ giấc ngủ sâu ban đêm. Chi tiết bài nghiên cứu đã được biên tập trên Myso Wiki! 🧠💡 #KhoaHoc #Biohacking",
      media_urls: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80"],
      category: "science",
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "post-seed-3",
      author_name: "Hoàng Minh",
      author_handle: "hoangminh_dev",
      author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      content: "Đã có ai thử nghiệm công nghệ WebAssembly (Wasm) kết hợp Rust để xử lý đồ họa trực tiếp trong trình duyệt chưa? Tốc độ thực thi tiệm cận native app, cực kỳ ấn tượng! Đặt câu hỏi hoặc chia sẻ repo của bạn phía dưới nhé 👇 #LapTrinh #Rust #WebAssembly",
      media_urls: [],
      category: "tech",
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  // Load feed from Supabase
  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch(`/api/social/posts?category=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
            return;
          }
        }
      } catch (err) {
        console.error("Load feed error:", err);
      }
      setPosts(curatedStarterPosts);
    }
    loadFeed();
  }, [activeTab]);

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !captchaToken) return;

    setPosting(true);
    const mediaUrls = imageUrlInput.trim() ? [imageUrlInput.trim()] : [];

    const optimisticPost: SocialPostItem = {
      id: `post-local-${Date.now()}`,
      author_name: "Bạn (Người dùng Myso)",
      author_handle: "user",
      author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      content: postContent.trim(),
      media_urls: mediaUrls,
      category: activeTab === "all" ? "general" : activeTab,
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      created_at: new Date().toISOString(),
    };

    setPosts([optimisticPost, ...posts]);
    setPostContent("");
    setImageUrlInput("");
    setShowImageField(false);

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: optimisticPost.content,
          author_name: optimisticPost.author_name,
          author_handle: optimisticPost.author_handle,
          author_avatar: optimisticPost.author_avatar,
          media_urls: mediaUrls,
          category: optimisticPost.category,
          captcha_token: captchaToken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) => prev.map((p) => (p.id === optimisticPost.id ? data.post : p)));
        }
      }
    } catch (err) {
      console.error("Post create failed:", err);
    } finally {
      setPosting(false);
    }
  };

  // Reactions: Like
  const handleLike = async (postId: string) => {
    const isLiked = likedPosts[postId] || false;
    const delta = isLiked ? -1 : 1;
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count + delta) } : p))
    );

    try {
      fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, type: "like", delta }),
      }).catch(() => {});
    } catch {}
  };

  // Reactions: Repost
  const handleRepost = async (postId: string) => {
    const isReposted = repostedPosts[postId] || false;
    const delta = isReposted ? -1 : 1;
    setRepostedPosts((prev) => ({ ...prev, [postId]: !isReposted }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reposts_count: Math.max(0, p.reposts_count + delta) } : p))
    );

    try {
      fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, type: "repost", delta }),
      }).catch(() => {});
    } catch {}
  };

  // Reactions: Bookmark
  const handleBookmark = async (postId: string) => {
    const isBookmarked = bookmarkedPosts[postId] || false;
    const delta = isBookmarked ? -1 : 1;
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !isBookmarked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarks_count: Math.max(0, p.bookmarks_count + delta) } : p))
    );

    try {
      fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, type: "bookmark", delta }),
      }).catch(() => {});
    } catch {}
  };

  // Share Link
  const handleShare = (postId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Toggle Comments Drawer
  const toggleComments = async (postId: string) => {
    const isExpanded = expandedPostComments[postId];
    setExpandedPostComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !commentsMap[postId]) {
      try {
        const res = await fetch(`/api/social/comment?post_id=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch {}
    }
  };

  // Submit Comment
  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId] || "";
    if (!text.trim()) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    const newComment: SocialCommentItem = {
      id: `c-${Date.now()}`,
      post_id: postId,
      author_name: "Bạn",
      author_handle: "user",
      author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    );

    try {
      await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          author_name: newComment.author_name,
          author_handle: newComment.author_handle,
          content: newComment.content,
        }),
      });
    } catch {}
    setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
  };

  // Report Submission
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId) return;

    try {
      await fetch("/api/social/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: reportingPostId,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportingPostId(null);
        setReportSuccess(false);
        setReportDetails("");
      }, 2000);
    } catch {}
  };

  // Check in streak
  const handleDailyCheckIn = () => {
    if (!checkedInToday) {
      setStreakCount((prev) => prev + 1);
      setCheckedInToday(true);
    }
  };

  return (
    <div className="container-page py-4 sm:py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Bar (3 cols) */}
        <nav className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4">
          <div className="rounded-3xl border border-line bg-surface p-4 space-y-1.5 shadow-sm">
            <Link
              href={localePath(locale, "/")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-accent text-white dark:text-[#04101F] font-bold text-sm shadow-sm"
            >
              <Flame className="h-5 w-5" />
              <span>Bảng Tin Xã Hội</span>
            </Link>

            <Link
              href={localePath(locale, "/wiki")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition"
            >
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Bách Khoa Myso Wiki</span>
            </Link>

            <Link
              href={localePath(locale, "/chat")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition justify-between"
            >
              <div className="flex items-center gap-3.5">
                <Lock className="h-5 w-5 text-teal" />
                <span>Chat Mã Hóa (E2EE)</span>
              </div>
              <span className="text-[0.62rem] font-mono bg-teal/20 text-teal px-1.5 py-0.5 rounded font-bold">
                NEW
              </span>
            </Link>

            <Link
              href={localePath(locale, "/notes")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition"
            >
              <Hash className="h-5 w-5 text-amber-500" />
              <span>Ghi Chú Bảo Mật</span>
            </Link>

            <Link
              href={localePath(locale, "/blog")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition"
            >
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Diễn Đàn Thảo Luận</span>
            </Link>

            <Link
              href={localePath(locale, "/arcade")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition"
            >
              <Zap className="h-5 w-5 text-rose-400" />
              <span>Trò Chơi Arcade</span>
            </Link>

            <div className="pt-2 border-t border-line">
              <Link
                href={localePath(locale, "/legal/standards")}
                className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-subtle hover:text-ink text-xs font-mono transition"
              >
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Tiêu chuẩn & Pháp lý CQCN</span>
              </Link>
            </div>
          </div>

          {/* User Profile Quick Card */}
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover border border-line"
              />
              <div className="min-w-0">
                <span className="font-display text-xs font-bold text-ink truncate block">
                  Thành viên Myso
                </span>
                <span className="font-mono text-[0.68rem] text-subtle truncate block">@user</span>
              </div>
            </div>
            <Link
              href={localePath(locale, "/login")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-canvas border border-line px-3 py-2 text-xs font-semibold text-ink hover:border-accent transition"
            >
              Thiết lập hồ sơ cá nhân
            </Link>
          </div>
        </nav>

        {/* Center Main Feed (6 cols) */}
        <main className="lg:col-span-6 space-y-4">
          {/* Top Sticky Filter Tabs */}
          <div className="sticky top-16 z-20 rounded-2xl border border-line bg-surface/95 backdrop-blur p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-xs scrollbar-none">
            {[
              { id: "all", label: "Dành cho bạn 🔥" },
              { id: "ai", label: "Công nghệ & AI" },
              { id: "science", label: "Khoa học" },
              { id: "tech", label: "Lập trình" },
              { id: "startup", label: "Khởi nghiệp" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-accent text-white dark:text-[#04101F] shadow-xs"
                    : "text-muted hover:text-ink hover:bg-canvas"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Post Composer ("Bạn đang nghĩ gì?") */}
          <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                alt="My avatar"
                className="h-10 w-10 rounded-full object-cover border border-line shrink-0"
              />
              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì? Chia sẻ góc nhìn, ý tưởng hoặc kiến thức mới..."
                className="w-full bg-transparent text-sm sm:text-base text-ink placeholder:text-subtle focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Image input expand */}
            {showImageField && (
              <div className="rounded-2xl border border-line bg-canvas p-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-accent" />
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Dán URL hình ảnh (https://...)..."
                  className="flex-1 bg-transparent text-xs text-ink placeholder:text-subtle focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowImageField(false)}
                  className="text-xs text-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Quick Hashtags Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[0.7rem] font-mono text-muted">
              <span className="text-subtle font-semibold">Gợi ý:</span>
              {["#Myso", "#AI", "#KhoaHoc", "#CongNghe", "#KhoiNghiep"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setPostContent((prev) => `${prev} ${tag} `)}
                  className="px-2 py-0.5 rounded-full border border-line bg-canvas hover:border-accent text-accent"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Anti-spam Captcha validation */}
            <AntiSpamCaptcha onVerify={setCaptchaToken} locale={locale} />

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-line">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageField(!showImageField)}
                  className="p-2 rounded-xl text-accent hover:bg-accent/10 transition"
                  title="Thêm ảnh"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostContent((prev) => `${prev} #`)}
                  className="p-2 rounded-xl text-accent hover:bg-accent/10 transition"
                  title="Thêm hashtag"
                >
                  <Hash className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCreatePost}
                disabled={posting || !postContent.trim() || !captchaToken}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2 text-xs sm:text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition disabled:opacity-40 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{posting ? "Đang đăng..." : "Đăng ngay"}</span>
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {posts.map((post) => {
              const isLiked = likedPosts[post.id] || false;
              const isReposted = repostedPosts[post.id] || false;
              const isBookmarked = bookmarkedPosts[post.id] || false;
              const isCommentsExpanded = expandedPostComments[post.id] || false;
              const postComments = commentsMap[post.id] || [];

              return (
                <article
                  key={post.id}
                  className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition hover:border-line/80 space-y-3"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          post.author_avatar ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                        }
                        alt={post.author_name}
                        className="h-10 w-10 rounded-full object-cover border border-line"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-bold text-ink">
                            {post.author_name}
                          </span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                          <span className="font-mono text-xs text-subtle">@{post.author_handle}</span>
                        </div>
                        <span className="font-mono text-[0.65rem] text-muted">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReportingPostId(post.id)}
                      className="p-1.5 rounded-xl text-subtle hover:text-rose-500 hover:bg-canvas transition"
                      title="Báo cáo nội dung vi phạm"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-wrap">
                    {post.content.split(" ").map((word, idx) => {
                      if (word.startsWith("#")) {
                        return (
                          <span key={idx} className="text-accent font-semibold hover:underline cursor-pointer">
                            {word}{" "}
                          </span>
                        );
                      }
                      return word + " ";
                    })}
                  </div>

                  {/* Media Gallery */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-line max-h-96">
                      <img
                        src={post.media_urls[0]}
                        alt="Media attachment"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Action Bar (Like, Comment, Repost, Bookmark, Share) */}
                  <div className="flex items-center justify-between pt-3 border-t border-line text-xs font-mono text-muted">
                    {/* Like */}
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 transition ${
                        isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      <span>{post.likes_count}</span>
                    </button>

                    {/* Comment */}
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="inline-flex items-center gap-1.5 hover:text-accent transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments_count}</span>
                    </button>

                    {/* Repost */}
                    <button
                      type="button"
                      onClick={() => handleRepost(post.id)}
                      className={`inline-flex items-center gap-1.5 transition ${
                        isReposted ? "text-teal font-bold" : "hover:text-teal"
                      }`}
                    >
                      <Repeat2 className="h-4 w-4" />
                      <span>{post.reposts_count}</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      type="button"
                      onClick={() => handleBookmark(post.id)}
                      className={`inline-flex items-center gap-1.5 transition ${
                        isBookmarked ? "text-amber-500 font-bold" : "hover:text-amber-500"
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={() => handleShare(post.id)}
                      className="inline-flex items-center gap-1.5 hover:text-ink transition"
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="h-4 w-4 text-teal" />
                          <span className="text-teal text-[0.7rem]">Đã chép</span>
                        </>
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {isCommentsExpanded && (
                    <div className="pt-3 border-t border-line space-y-3">
                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendComment(post.id);
                          }}
                          placeholder="Viết phản hồi công khai..."
                          className="flex-1 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          disabled={submittingComment[post.id] || !(commentInputs[post.id] || "").trim()}
                          className="p-2 rounded-xl bg-accent text-white dark:text-[#04101F] hover:opacity-90 disabled:opacity-40"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-2 pt-1">
                        {postComments.length === 0 ? (
                          <p className="text-[0.72rem] text-subtle font-mono text-center py-2">
                            Chưa có bình luận. Hãy là người đầu tiên bình luận!
                          </p>
                        ) : (
                          postComments.map((c) => (
                            <div key={c.id} className="rounded-2xl border border-line/60 bg-canvas/40 p-2.5 flex gap-2.5 text-xs">
                              <div className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent text-[0.65rem] font-bold shrink-0">
                                {c.author_name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-ink">{c.author_name}</span>
                                  <span className="text-[0.62rem] font-mono text-subtle">
                                    {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-muted mt-0.5 whitespace-pre-wrap">{c.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>

        {/* Right Sidebar: Trends, Streaks, Compliance (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-5">
          {/* Daily Streak & Gamification Card */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h4 className="font-display text-sm font-bold text-ink">Chuỗi Tương Tác</h4>
              </div>
              <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {streakCount} NGÀY 🔥
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Duy trì chuỗi tương tác mỗi ngày để nhận huy hiệu Tác giả uy tín và mở khóa đặc quyền cộng đồng.
            </p>

            <button
              type="button"
              onClick={handleDailyCheckIn}
              disabled={checkedInToday}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs ${
                checkedInToday
                  ? "bg-teal/20 text-teal border border-teal/40"
                  : "bg-accent text-white dark:text-[#04101F] hover:opacity-90"
              }`}
            >
              {checkedInToday ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Đã điểm danh hôm nay!</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Điểm danh hôm nay (+10 XP)</span>
                </>
              )}
            </button>
          </div>

          {/* Trending Topics / Hashtags */}
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <h4 className="font-display text-sm font-bold text-ink">Xu Hướng Thịnh Hành</h4>
            </div>

            <div className="divide-y divide-line/60">
              {[
                { tag: "#AI_Agents_2026", count: "12.4K thảo luận", domain: "Công nghệ" },
                { tag: "#WebAssembly_Rust", count: "8.7K thảo luận", domain: "Lập trình" },
                { tag: "#BiohackingGiacNgu", count: "6.3K thảo luận", domain: "Khoa học" },
                { tag: "#MysoEcosystem", count: "4.9K thảo luận", domain: "Cộng đồng" },
              ].map((trend, i) => (
                <div key={i} className="py-2.5 first:pt-1 last:pb-0">
                  <span className="text-[0.65rem] font-mono text-subtle block">{trend.domain}</span>
                  <span className="text-xs font-bold text-ink hover:text-accent cursor-pointer transition block">
                    {trend.tag}
                  </span>
                  <span className="text-[0.65rem] font-mono text-muted block mt-0.5">{trend.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Compliance & Authority Commitment Badge */}
          <div className="rounded-3xl border border-line bg-surface/60 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-teal font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Cam kết minh bạch & Pháp luật</span>
            </div>
            <p className="text-[0.7rem] text-muted leading-relaxed">
              Myso bảo vệ dữ liệu người dùng hợp pháp, nghiêm cấm các hành vi lừa đảo và cam kết phối hợp với Cơ quan Chức năng (CQCN) khi có vi phạm.
            </p>
            <div className="flex items-center gap-3 pt-1 font-mono text-[0.68rem]">
              <Link href={localePath(locale, "/legal/standards")} className="text-accent underline font-semibold">
                Tiêu chuẩn cộng đồng
              </Link>
              <span>·</span>
              <Link href={localePath(locale, "/legal/faq")} className="text-accent underline font-semibold">
                FAQ & Kiếm tiền
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500 font-bold">
                <Flag className="h-5 w-5" />
                <h3 className="font-display text-base">Báo Cáo Vi Phạm Nội Dung</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="p-1 rounded-lg text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="rounded-2xl border border-teal/40 bg-teal/10 p-5 text-center text-xs font-mono text-teal space-y-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-teal" />
                <p>Báo cáo của bạn đã được gửi thành công đến Đội ngũ Kiểm duyệt Myso!</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3.5">
                <p className="text-xs text-muted leading-relaxed">
                  Vui lòng chọn lý do báo cáo bài viết để hỗ trợ đội ngũ kiểm duyệt xử lý theo tiêu chuẩn pháp luật:
                </p>

                <div className="space-y-2 text-xs">
                  {[
                    { id: "spam", label: "Spam, quảng cáo lừa đảo hoặc mã độc" },
                    { id: "illegal", label: "Nội dung vi phạm pháp luật / an ninh" },
                    { id: "harassment", label: "Công kích cá nhân, vu khống hoặc xúc phạm" },
                    { id: "misinformation", label: "Thông tin sai lệch chưa được kiểm chứng" },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-line bg-canvas hover:border-accent cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r.id}
                        checked={reportReason === r.id}
                        onChange={() => setReportReason(r.id)}
                        className="text-accent focus:ring-0"
                      />
                      <span className="text-ink font-medium">{r.label}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Mô tả thêm chi tiết (tuỳ chọn)..."
                  className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-ink"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition shadow-sm"
                  >
                    Gửi Báo Cáo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
