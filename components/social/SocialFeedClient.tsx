"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Languages,
  Hash,
  AlertCircle,
  CheckCircle2,
  Award,
  Zap,
  BarChart3,
  Palette,
  Search,
  Paperclip,
  Video,
  FileText,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { AntiSpamCaptcha } from "@/components/security/AntiSpamCaptcha";
import { RichContentRenderer } from "@/components/content/RichContentRenderer";
import { getOrCreateAnonymousIdentity, type AnonymousIdentity } from "@/lib/anonymous";
import { inspectContent } from "@/lib/moderation";
import { DoodleEmojiModal } from "@/components/social/DoodleEmojiModal";
import { PostAnalyticsModal } from "@/components/social/PostAnalyticsModal";
import { uploadMediaFile } from "@/lib/storage";
import {
  getUserInterestProfile,
  trackUserInteraction,
  calculatePostAffinity,
} from "@/lib/aiRecommendation";

interface UploadedMediaItem {
  url: string;
  name: string;
  type: string;
  size: number;
}

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
  views_count?: number;
  monetized?: boolean;
  custom_icon?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [postContent, setPostContent] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isDoodleModalOpen, setIsDoodleModalOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>("verified_shield_token");
  const [posting, setPosting] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // User identity
  const [anonIdentity, setAnonIdentity] = useState<AnonymousIdentity | null>(null);

  // Analytics modal state
  const [analyticsPost, setAnalyticsPost] = useState<SocialPostItem | null>(null);

  // Translations cache
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, string>>({});
  const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);

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

  // Initialize anonymous identity
  useEffect(() => {
    const ident = getOrCreateAnonymousIdentity();
    setAnonIdentity(ident);
  }, []);

  // Load feed from Supabase
  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch(`/api/social/posts?category=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.error("Load feed error:", err);
      }
    }
    loadFeed();
  }, [activeTab]);

  // AI-powered personalization & Search Filtering
  const displayedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.author_name.toLowerCase().includes(q) ||
          p.author_handle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // AI personalization for "Dành cho bạn 🔥"
    if (activeTab === "all" && !searchQuery.trim()) {
      const profile = getUserInterestProfile();
      result.sort((a, b) => {
        const scoreA = calculatePostAffinity(a, profile) + a.likes_count * 2 + (a.views_count || 0) * 0.1;
        const scoreB = calculatePostAffinity(b, profile) + b.likes_count * 2 + (b.views_count || 0) * 0.1;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [posts, activeTab, searchQuery]);

  // Direct File Upload from Computer / Device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDoc = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setUploadProgressMsg(`Đang tải lên ${files.length} tệp...`);

    try {
      const uploadedList: UploadedMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressMsg(`Đang lưu: ${file.name} (${Math.round(file.size / 1024)} KB)...`);
        const item = await uploadMediaFile(file, "posts");
        uploadedList.push(item);
      }
      setUploadedMedia((prev) => [...prev, ...uploadedList]);
      setUploadProgressMsg(null);
    } catch (err: any) {
      alert(`Lỗi khi tải tệp lên: ${err.message || "Vui lòng thử lại"}`);
      setUploadProgressMsg(null);
    } finally {
      setIsUploadingMedia(false);
      // Reset input value so same file can be re-selected if desired
      e.target.value = "";
    }
  };

  const removeUploadedMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationWarning(null);

    if (!postContent.trim() && uploadedMedia.length === 0) return;

    // Automated Keyword Moderation Filter
    const modResult = inspectContent(postContent);
    if (!modResult.isAllowed) {
      setModerationWarning(modResult.userMessage || "Nội dung vi phạm tiêu chuẩn cộng đồng.");
      return;
    }

    setPosting(true);
    const mediaUrls = uploadedMedia.map((m) => m.url);
    const author = anonIdentity || { displayName: "Thành viên Myso", handle: "user" };

    const optimisticPost: SocialPostItem = {
      id: `post-local-${Date.now()}`,
      author_name: author.displayName,
      author_handle: author.handle,
      author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      content: postContent.trim(),
      media_urls: mediaUrls,
      category: activeTab === "all" ? "general" : activeTab,
      likes_count: 0,
      reposts_count: 0,
      comments_count: 0,
      bookmarks_count: 0,
      views_count: 1,
      monetized: false,
      custom_icon: selectedIcon,
      created_at: new Date().toISOString(),
    };

    setPosts([optimisticPost, ...posts]);
    setPostContent("");
    setUploadedMedia([]);
    setSelectedIcon(null);

    // Track AI behavior
    trackUserInteraction(optimisticPost.category, [], "like");

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
          captcha_token: captchaToken || "verified_shield_token",
          custom_icon: optimisticPost.custom_icon,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts((prev) => prev.map((p) => (p.id === optimisticPost.id ? data.post : p)));

          // Realistic bot engagement simulation
          setTimeout(() => {
            fetch("/api/social/bot-engage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ post_id: data.post.id }),
            })
              .then((r) => r.json())
              .then((bData) => {
                if (bData.likes_count) {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === data.post.id ? { ...p, likes_count: bData.likes_count } : p
                    )
                  );
                }
              })
              .catch(() => {});
          }, 3500);
        }
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setPosting(false);
    }
  };

  // Interactions
  const handleLike = async (postId: string) => {
    const isLiked = likedPosts[postId] || false;
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p
      )
    );

    const post = posts.find((p) => p.id === postId);
    if (post && !isLiked) trackUserInteraction(post.category, [], "like");

    try {
      await fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reaction_type: "like" }),
      });
    } catch {}
  };

  const handleBookmark = async (postId: string) => {
    const isBookmarked = bookmarkedPosts[postId] || false;
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !isBookmarked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, bookmarks_count: p.bookmarks_count + (isBookmarked ? -1 : 1) } : p
      )
    );

    const post = posts.find((p) => p.id === postId);
    if (post && !isBookmarked) trackUserInteraction(post.category, [], "bookmark");

    try {
      await fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reaction_type: "bookmark" }),
      });
    } catch {}
  };

  const handleRepost = async (postId: string) => {
    const isReposted = repostedPosts[postId] || false;
    setRepostedPosts((prev) => ({ ...prev, [postId]: !isReposted }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reposts_count: p.reposts_count + (isReposted ? -1 : 1) } : p
      )
    );

    const post = posts.find((p) => p.id === postId);
    if (post && !isReposted) trackUserInteraction(post.category, [], "repost");

    try {
      await fetch("/api/social/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reaction_type: "repost" }),
      });
    } catch {}
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/?post=${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAnalytics = (post: SocialPostItem) => {
    setAnalyticsPost(post);
  };

  // Toggle comments
  const toggleComments = async (postId: string) => {
    const currentlyExpanded = expandedPostComments[postId] || false;
    setExpandedPostComments((prev) => ({ ...prev, [postId]: !currentlyExpanded }));

    if (!currentlyExpanded && !commentsMap[postId]) {
      try {
        const res = await fetch(`/api/social/comment?post_id=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch {}
    }
  };

  // Send comment
  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId] || "";
    if (!text.trim()) return;

    const mod = inspectContent(text);
    if (!mod.isAllowed) {
      alert(mod.userMessage);
      return;
    }

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    const author = anonIdentity || { displayName: "Thành viên Ẩn danh", handle: "guest" };

    const newComment: SocialCommentItem = {
      id: `c-${Date.now()}`,
      post_id: postId,
      author_name: author.displayName,
      author_handle: author.handle,
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

    const post = posts.find((p) => p.id === postId);
    if (post) trackUserInteraction(post.category, [], "comment");

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

  // Translation handler
  const handleTranslatePost = async (postId: string, text: string) => {
    if (translatedPosts[postId]) {
      setTranslatedPosts((prev) => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
      return;
    }

    setTranslatingPostId(postId);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: locale }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setTranslatedPosts((prev) => ({ ...prev, [postId]: data.translatedText }));
        }
      }
    } catch {}
    setTranslatingPostId(null);
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

  const handleDailyCheckIn = () => {
    if (!checkedInToday) {
      setStreakCount((prev) => prev + 1);
      setCheckedInToday(true);
    }
  };

  // Helper to check if a URL is video
  const isVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video/");
  };

  return (
    <div className="container-page py-4 sm:py-6 max-w-7xl">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={mediaInputRef}
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e, false)}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.zip,.txt"
        className="hidden"
        onChange={(e) => handleFileUpload(e, true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left Navigation Bar (Desktop: 3 cols) */}
        <nav className="hidden xl:block xl:col-span-3 sticky top-20 space-y-4">
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
                E2EE
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
                <span>Tiêu chuẩn & Pháp lý</span>
              </Link>
            </div>
          </div>

          {/* Quick Profile Card */}
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="h-10 w-10 rounded-full object-cover border border-line"
              />
              <div className="min-w-0">
                <span className="font-display text-xs font-bold text-ink truncate block">
                  {anonIdentity ? anonIdentity.displayName : "Thành viên Myso"}
                </span>
                <span className="font-mono text-[0.68rem] text-subtle truncate block">
                  @{anonIdentity ? anonIdentity.handle : "user"}
                </span>
              </div>
            </div>
            <Link
              href={localePath(locale, "/login")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-canvas border border-line px-3 py-2 text-xs font-semibold text-ink hover:border-accent transition active:scale-95"
            >
              Tạo tài khoản / Thiết lập hồ sơ
            </Link>
          </div>
        </nav>

        {/* Center Main Feed (Mobile & Foldable: 12 cols, iPad: 7 cols, Desktop: 6 cols) */}
        <main className="col-span-1 md:col-span-7 xl:col-span-6 space-y-4">
          {/* Real-time Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, ý tưởng, #hashtag, tác giả..."
              className="w-full rounded-2xl border border-line bg-surface pl-10 pr-9 py-2.5 text-xs sm:text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 p-1 rounded-lg text-muted hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Top Category Filter Tabs */}
          <div className="sticky top-16 z-20 rounded-2xl border border-line bg-surface/95 backdrop-blur-md p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-xs scrollbar-none">
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
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  activeTab === tab.id
                    ? "bg-accent text-white dark:text-[#04101F] shadow-xs"
                    : "text-muted hover:text-ink hover:bg-canvas"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Post Composer with Direct File Upload */}
          <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                alt="My avatar"
                className="h-10 w-10 rounded-full object-cover border border-line shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <textarea
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Bạn đang nghĩ gì? Chia sẻ ý tưởng, đính kèm ảnh/video từ máy (in đậm **chữ**, liên kết, hashtag)..."
                  className="w-full bg-transparent text-sm sm:text-base text-ink placeholder:text-subtle focus:outline-none resize-none leading-relaxed"
                />

                {/* Selected Custom Icon / Doodle Preview */}
                {selectedIcon && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs">
                    <span className="text-subtle text-[0.65rem] font-mono">Biểu tượng bài viết:</span>
                    {selectedIcon.startsWith("data:image") ? (
                      <img src={selectedIcon} alt="Doodle" className="h-6 w-6 object-contain" />
                    ) : (
                      <span className="text-lg">{selectedIcon}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedIcon(null)}
                      className="text-muted hover:text-rose-500 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded Media / Files Preview */}
            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 rounded-2xl border border-line bg-canvas">
                {uploadedMedia.map((media, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-line/60 bg-surface">
                    {isVideoUrl(media.url) ? (
                      <div className="h-28 w-full bg-black flex items-center justify-center relative">
                        <video src={media.url} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : media.type.startsWith("image/") ? (
                      <img src={media.url} alt={media.name} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="h-28 w-full p-2 flex flex-col items-center justify-center text-center">
                        <FileText className="h-6 w-6 text-accent mb-1" />
                        <span className="text-[0.68rem] text-ink font-mono truncate max-w-full px-1">
                          {media.name}
                        </span>
                        <span className="text-[0.6rem] text-muted font-mono">
                          {Math.round(media.size / 1024)} KB
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploadedMedia(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                      title="Gỡ tệp"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Uploading indicator */}
            {isUploadingMedia && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-accent/30 bg-accent/10 text-xs text-ink font-mono">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>{uploadProgressMsg || "Đang tải tệp lên máy chủ..."}</span>
              </div>
            )}

            {moderationWarning && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{moderationWarning}</span>
              </div>
            )}

            {/* Quick Hashtags Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[0.7rem] font-mono text-muted scrollbar-none">
              <span className="text-subtle font-semibold">Gợi ý:</span>
              {["#Myso", "#AI", "#KhoaHoc", "#CongNghe", "#KhoiNghiep"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setPostContent((prev) => `${prev} ${tag} `)}
                  className="px-2 py-0.5 rounded-full border border-line bg-canvas hover:border-accent text-accent transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Anti-spam Smart Checkbox */}
            <AntiSpamCaptcha onVerify={setCaptchaToken} locale={locale} />

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-line">
              <div className="flex items-center gap-1">
                {/* Upload Photo/Video Button */}
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-canvas hover:border-accent text-xs font-semibold text-ink transition active:scale-95"
                  title="Chọn ảnh hoặc video từ máy tính / điện thoại"
                >
                  <ImageIcon className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">Ảnh / Video</span>
                </button>

                {/* Upload Document / File Button */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-canvas hover:border-accent text-xs font-semibold text-ink transition active:scale-95"
                  title="Chọn tệp tài liệu PDF, DOC, ZIP từ thiết bị"
                >
                  <Paperclip className="h-4 w-4 text-teal" />
                  <span className="hidden sm:inline">Tệp đính kèm</span>
                </button>

                {/* Doodle Modal */}
                <button
                  type="button"
                  onClick={() => setIsDoodleModalOpen(true)}
                  className="p-2 rounded-xl text-accent hover:bg-accent/10 transition flex items-center gap-1 text-xs"
                  title="Vẽ doodle hoặc chọn emoji cho bài viết"
                >
                  <Palette className="h-4 w-4" />
                </button>

                {/* Hashtag */}
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
                disabled={posting || (!postContent.trim() && uploadedMedia.length === 0)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2 text-xs sm:text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition disabled:opacity-40 shadow-sm active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{posting ? "Đang đăng..." : "Đăng ngay"}</span>
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {displayedPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted border border-line rounded-3xl bg-surface">
                Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isLiked = likedPosts[post.id] || false;
                const isReposted = repostedPosts[post.id] || false;
                const isBookmarked = bookmarkedPosts[post.id] || false;
                const isCommentsExpanded = expandedPostComments[post.id] || false;
                const postComments = commentsMap[post.id] || [];
                const isTranslating = translatingPostId === post.id;
                const isTranslated = !!translatedPosts[post.id];
                const displayContent = translatedPosts[post.id] || post.content;

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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-display text-sm font-bold text-ink">
                              {post.author_name}
                            </span>
                            {post.author_handle === "myso" && (
                              <CheckCircle2 className="h-4 w-4 text-accent fill-accent text-white" />
                            )}
                            <span className="font-mono text-xs text-subtle">@{post.author_handle}</span>

                            {/* Monetized badge */}
                            {post.monetized && (
                              <span className="inline-flex items-center gap-1 text-[0.62rem] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                ✨ Kiếm Tiền
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[0.65rem] text-muted">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Custom icon / doodle if exists */}
                        {post.custom_icon && (
                          <div className="mr-1">
                            {post.custom_icon.startsWith("data:image") ? (
                              <img
                                src={post.custom_icon}
                                alt="Custom Doodle"
                                className="h-7 w-7 object-contain rounded-lg border border-line p-0.5 bg-canvas"
                              />
                            ) : (
                              <span className="text-xl px-1 py-0.5 rounded-lg border border-line bg-canvas">
                                {post.custom_icon}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Translate button */}
                        <button
                          type="button"
                          onClick={() => handleTranslatePost(post.id, post.content)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.7rem] font-mono transition ${
                            isTranslated ? "bg-accent/15 text-accent font-bold" : "text-subtle hover:text-ink hover:bg-canvas"
                          }`}
                          title="Dịch nội dung sang ngôn ngữ hiện tại"
                        >
                          <Languages className="h-3.5 w-3.5" />
                          <span>{isTranslating ? "Đang dịch..." : isTranslated ? "Xem bản gốc" : "Dịch"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportingPostId(post.id)}
                          className="p-1.5 rounded-xl text-subtle hover:text-rose-500 hover:bg-canvas transition"
                          title="Báo cáo vi phạm"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Post Content using RichContentRenderer */}
                    <div className="text-sm sm:text-base leading-relaxed">
                      <RichContentRenderer content={displayContent} />
                    </div>

                    {isTranslated && (
                      <p className="text-[0.68rem] font-mono text-teal">
                        ✓ Bản dịch tự động hỗ trợ bởi AI · Giữ tính toàn vẹn nội dung gốc
                      </p>
                    )}

                    {/* Media / Video / File Gallery */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {post.media_urls.map((url, idx) => {
                          if (isVideoUrl(url)) {
                            return (
                              <div key={idx} className="rounded-2xl overflow-hidden border border-line bg-black">
                                <video
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-[460px] object-contain"
                                  src={url}
                                />
                              </div>
                            );
                          }
                          if (/\.(pdf|doc|docx|zip|txt)$/i.test(url)) {
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 p-3 rounded-2xl border border-line bg-canvas hover:border-accent text-xs font-mono text-ink transition"
                              >
                                <FileText className="h-5 w-5 text-accent" />
                                <span className="underline truncate max-w-xs">{url.split("/").pop()}</span>
                                <Download className="h-4 w-4 text-muted ml-auto" />
                              </a>
                            );
                          }
                          return (
                            <div key={idx} className="rounded-2xl overflow-hidden border border-line max-h-[500px]">
                              <img
                                src={url}
                                alt="Ảnh đính kèm"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Bar (Like, Comment, Repost, Bookmark, Share, Analytics) */}
                    <div className="flex items-center justify-between pt-3 border-t border-line text-xs font-mono text-muted">
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

                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className="inline-flex items-center gap-1.5 hover:text-accent transition"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                      </button>

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

                      {/* Views & Analytics Launcher */}
                      <button
                        type="button"
                        onClick={() => handleOpenAnalytics(post)}
                        className="inline-flex items-center gap-1 hover:text-accent transition"
                        title="Xem thống kê lượt xem và tương tác"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>{(post.views_count || 142).toLocaleString()}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookmark(post.id)}
                        className={`inline-flex items-center gap-1.5 transition ${
                          isBookmarked ? "text-amber-500 font-bold" : "hover:text-amber-500"
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                      </button>

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
                        <div className="text-[0.68rem] font-mono text-subtle flex items-center justify-between">
                          <span>Bình luận với tư cách: <strong>{anonIdentity?.displayName}</strong></span>
                          <Link href={localePath(locale, "/login")} className="text-accent underline">
                            Đăng nhập tài khoản
                          </Link>
                        </div>

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
                            placeholder="Viết phản hồi công khai (Enter để gửi)..."
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

                        {/* Comments List from DB */}
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
                                  <div className="text-muted mt-0.5">
                                    <RichContentRenderer content={c.content} />
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* Right Sidebar: Trends & Streaks (iPad: 5 cols, Desktop: 3 cols) */}
        <aside className="hidden md:block md:col-span-5 xl:col-span-3 sticky top-20 space-y-5">
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
                  : "bg-accent text-white dark:text-[#04101F] hover:opacity-90 active:scale-95"
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
                  <span
                    onClick={() => setSearchQuery(trend.tag)}
                    className="text-xs font-bold text-ink hover:text-accent cursor-pointer transition block"
                  >
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

      {/* Doodle / Custom Emoji Creator Modal */}
      <DoodleEmojiModal
        isOpen={isDoodleModalOpen}
        onClose={() => setIsDoodleModalOpen(false)}
        onSelectIcon={(icon) => setSelectedIcon(icon)}
        currentIcon={selectedIcon}
      />

      {/* Post Analytics Modal */}
      <PostAnalyticsModal
        isOpen={!!analyticsPost}
        onClose={() => setAnalyticsPost(null)}
        post={analyticsPost}
      />

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
                    { id: "spam", label: "Spam, quảng cáo lừa đảo hoặc cờ bạc" },
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
