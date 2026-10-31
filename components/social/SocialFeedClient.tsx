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
  Globe,
  EyeOff,
  Clock,
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
  ChevronUp,
  ChevronDown,
  BookOpen,
  CornerDownRight,
  User,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { AntiSpamCaptcha } from "@/components/security/AntiSpamCaptcha";
import { RichContentRenderer } from "@/components/content/RichContentRenderer";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { MultiImageGallery } from "@/components/media/MultiImageGallery";
import { useAuth } from "@/components/providers/AuthProvider";
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
  visibility?: "public" | "private" | "unlisted";
  post_type?: string;
  status?: string;
  scheduled_at?: string | null;
  community_id?: string;
  flair?: string | null;
  poll_data?: any;
  upvotes_count?: number;
  downvotes_count?: number;
  user_vote?: number;
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
  parent_id?: string | null;
  upvotes_count?: number;
  created_at: string;
}

interface WikiFeedItem {
  id: string;
  slug: string;
  title: string;
  domain: string;
  summary: string;
  views_count: number;
  sources: any[];
  created_at: string;
}

interface TranslationData {
  text: string;
  sourceLang: string;
  provider: string;
}

const COMMUNITIES = [
  { id: "general", name: "Toàn bộ", icon: Flame },
  { id: "tech", name: "Công nghệ & AI", icon: Zap },
  { id: "running", name: "Chạy bộ & Thể thao", icon: Flame },
  { id: "lifestyle", name: "Đời sống", icon: Sparkles },
  { id: "science", name: "Khoa học Tri thức", icon: BookOpen },
  { id: "qa", name: "Hỏi đáp & Trợ giúp", icon: MessageCircle },
];

const FLAIRS = ["Hỏi đáp", "Thảo luận", "Chia sẻ", "Kiến thức", "Tin tức"];

export function SocialFeedClient({
  initialPosts = [],
  locale,
}: {
  initialPosts?: SocialPostItem[];
  locale: Locale;
}) {
  const { user, profile, status: authStatus } = useAuth();

  const [posts, setPosts] = useState<SocialPostItem[]>(initialPosts);
  const [wikiArticles, setWikiArticles] = useState<WikiFeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all", "following", "latest", "popular", "communities", "wiki"
  const [searchQuery, setSearchQuery] = useState("");

  // Composer States
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [selectedCommunity, setSelectedCommunity] = useState("general");
  const [selectedFlair, setSelectedFlair] = useState<string | null>(null);

  // Scheduling states
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  // Media
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

  // Anonymous identity fallback
  const [anonIdentity, setAnonIdentity] = useState<AnonymousIdentity | null>(null);

  // Analytics modal state
  const [analyticsPost, setAnalyticsPost] = useState<SocialPostItem | null>(null);

  // Translations cache
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, TranslationData>>({});
  const [translatingPostId, setTranslatingPostId] = useState<string | null>(null);
  const [translatedComments, setTranslatedComments] = useState<Record<string, TranslationData>>({});
  const [translatingCommentId, setTranslatingCommentId] = useState<string | null>(null);

  // Interactions
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [repostedPosts, setRepostedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Threaded comments
  const [expandedPostComments, setExpandedPostComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, SocialCommentItem[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingToComment, setReplyingToComment] = useState<Record<string, string | null>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Report modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Initialize identity
  useEffect(() => {
    const ident = getOrCreateAnonymousIdentity();
    setAnonIdentity(ident);
  }, []);

  // Fetch Feed
  useEffect(() => {
    async function loadFeed() {
      try {
        if (activeTab === "wiki") {
          const res = await fetch("/api/wiki/search?q=");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.articles)) {
              setWikiArticles(data.articles);
            }
          }
          return;
        }

        let url = `/api/social/posts?feed=${activeTab}`;
        if (activeTab === "communities" && selectedCommunity !== "general") {
          url += `&community_id=${selectedCommunity}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.posts)) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.error("Load feed error:", err);
      }
    }
    loadFeed();
  }, [activeTab, selectedCommunity]);

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
          p.category.toLowerCase().includes(q) ||
          (p.flair && p.flair.toLowerCase().includes(q))
      );
    }

    // AI personalization for "Dành cho bạn 🔥"
    if (activeTab === "all" && !searchQuery.trim()) {
      const userProfile = getUserInterestProfile();
      result.sort((a, b) => {
        const scoreA =
          calculatePostAffinity(a, userProfile) +
          (a.upvotes_count || 0) * 2 -
          (a.downvotes_count || 0) +
          (a.views_count || 0) * 0.1;
        const scoreB =
          calculatePostAffinity(b, userProfile) +
          (b.upvotes_count || 0) * 2 -
          (b.downvotes_count || 0) +
          (b.views_count || 0) * 0.1;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [posts, activeTab, searchQuery]);

  // File Upload
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
      e.target.value = "";
    }
  };

  const removeUploadedMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Post Creation (Draft, Scheduled, or Published)
  const handleCreatePost = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setModerationWarning(null);

    if (!postContent.trim() && uploadedMedia.length === 0) return;

    // Automated Moderation Filter
    const modResult = inspectContent(postContent);
    if (!modResult.isAllowed) {
      setModerationWarning(modResult.userMessage || "Nội dung vi phạm tiêu chuẩn cộng đồng Myso.");
      return;
    }

    setPosting(true);
    const mediaUrls = uploadedMedia.map((m) => m.url);

    // Active author identity
    const authorName = profile?.full_name || anonIdentity?.displayName || "Thành viên Myso";
    const authorHandle = profile?.username || anonIdentity?.handle || "user";
    const authorAvatar = profile?.avatar_url || (authStatus === "authenticated" ? null : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");

    const postStatus = isDraft ? "draft" : isScheduling && scheduledDateTime ? "scheduled" : "published";

    const payload = {
      content: postContent.trim(),
      author_name: authorName,
      author_handle: authorHandle,
      author_avatar: authorAvatar,
      media_urls: mediaUrls,
      category: selectedCommunity,
      visibility: postVisibility,
      post_type: mediaUrls.length > 1 ? "multi-image" : mediaUrls.length === 1 ? "image" : "text",
      status: postStatus,
      scheduled_at: postStatus === "scheduled" ? new Date(scheduledDateTime).toISOString() : null,
      community_id: selectedCommunity,
      flair: selectedFlair,
      custom_icon: selectedIcon,
    };

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          if (data.post.status === "published" && data.post.visibility === "public") {
            setPosts((prev) => [data.post, ...prev]);
          }
          setPostContent("");
          setUploadedMedia([]);
          setSelectedIcon(null);
          setSelectedFlair(null);
          setIsScheduling(false);
          setScheduledDateTime("");
          try {
            localStorage.removeItem("myso_active_composer_draft");
          } catch {}

          if (isDraft) {
            alert("Bản nháp đã được lưu an toàn vào hồ sơ của bạn!");
          } else if (postStatus === "scheduled") {
            alert(`Bài viết đã được lên lịch thành công cho ngày ${new Date(scheduledDateTime).toLocaleString("vi-VN")}!`);
          }
        }
      } else {
        const errData = await res.json();
        setModerationWarning(errData.error || "Không thể đăng bài. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setPosting(false);
    }
  };

  // Reddit-style Upvote & Downvote handler
  const handleVote = async (postId: string, voteType: number) => {
    const currentVote = userVotes[postId] || 0;
    const newVote = currentVote === voteType ? 0 : voteType;

    setUserVotes((prev) => ({ ...prev, [postId]: newVote }));

    // Optimistic post count update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const oldUp = p.upvotes_count || p.likes_count || 0;
          const oldDown = p.downvotes_count || 0;
          let diffUp = 0;
          let diffDown = 0;

          if (currentVote === 1) diffUp -= 1;
          if (currentVote === -1) diffDown -= 1;
          if (newVote === 1) diffUp += 1;
          if (newVote === -1) diffDown += 1;

          return {
            ...p,
            upvotes_count: Math.max(0, oldUp + diffUp),
            downvotes_count: Math.max(0, oldDown + diffDown),
            likes_count: Math.max(0, oldUp + diffUp),
          };
        }
        return p;
      })
    );

    try {
      const handle = profile?.username || anonIdentity?.handle || "guest";
      const res = await fetch("/api/social/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, vote_type: newVote, voter_handle: handle }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  upvotes_count: data.upvotes,
                  downvotes_count: data.downvotes,
                  likes_count: data.upvotes,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  // Traditional Like toggle
  const handleLike = (postId: string) => {
    handleVote(postId, 1);
  };

  const handleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleRepost = (postId: string) => {
    setRepostedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, reposts_count: p.reposts_count + (repostedPosts[postId] ? -1 : 1) }
          : p
      )
    );
  };

  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}${localePath(locale, `/p/${postId}`)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Comments & Threaded Replies
  const toggleComments = async (postId: string) => {
    const isExpanded = !expandedPostComments[postId];
    setExpandedPostComments((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded && !commentsMap[postId]) {
      try {
        const res = await fetch(`/api/social/comments?post_id=${postId}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch (err) {
        console.error("Load comments error:", err);
      }
    }
  };

  const handleAddComment = async (postId: string, parentId: string | null = null) => {
    const inputVal = commentInputs[postId]?.trim();
    if (!inputVal) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    const authorName = profile?.full_name || anonIdentity?.displayName || "Thành viên Myso";
    const authorHandle = profile?.username || anonIdentity?.handle || "user";
    const authorAvatar = profile?.avatar_url || null;

    try {
      const res = await fetch("/api/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          content: inputVal,
          author_name: authorName,
          author_handle: authorHandle,
          author_avatar: authorAvatar,
          parent_id: parentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setCommentsMap((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), data.comment],
          }));
          setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
          setReplyingToComment((prev) => ({ ...prev, [postId]: null }));
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
          );
        }
      }
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Translations for posts
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
          setTranslatedPosts((prev) => ({
            ...prev,
            [postId]: {
              text: data.translatedText,
              sourceLang: data.sourceLang || "auto",
              provider: data.provider || "AI Engine",
            },
          }));
        }
      }
    } catch (err) {
      console.error("Post translation error:", err);
    } finally {
      setTranslatingPostId(null);
    }
  };

  // Translation for comments
  const handleTranslateComment = async (commentId: string, text: string) => {
    if (translatedComments[commentId]) {
      setTranslatedComments((prev) => {
        const copy = { ...prev };
        delete copy[commentId];
        return copy;
      });
      return;
    }

    setTranslatingCommentId(commentId);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: locale }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setTranslatedComments((prev) => ({
            ...prev,
            [commentId]: {
              text: data.translatedText,
              sourceLang: data.sourceLang || "auto",
              provider: data.provider || "AI Engine",
            },
          }));
        }
      }
    } catch (err) {
      console.error("Comment translation error:", err);
    } finally {
      setTranslatingCommentId(null);
    }
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      en: "Tiếng Anh",
      ja: "Tiếng Nhật",
      zh: "Tiếng Trung",
      "zh-cn": "Tiếng Trung",
      vi: "Tiếng Việt",
    };
    return names[code.toLowerCase()] || code.toUpperCase();
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
        accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip,.txt"
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
              <span>Ghi Chú Myso Notes</span>
            </Link>

            <Link
              href={localePath(locale, "/blog")}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted hover:text-ink hover:bg-canvas text-sm font-semibold transition"
            >
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Diễn Đàn Thảo Luận</span>
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

          {/* Quick Profile Widget */}
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full border border-line bg-canvas overflow-hidden flex items-center justify-center shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-display text-xs font-bold text-ink truncate block">
                  {profile?.full_name || anonIdentity?.displayName || "Thành viên Myso"}
                </span>
                <span className="font-mono text-[0.68rem] text-subtle truncate block">
                  @{profile?.username || anonIdentity?.handle || "user"}
                </span>
              </div>
            </div>
            {profile ? (
              <Link
                href={localePath(locale, `/profile/${profile.username}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-canvas border border-line px-3 py-2 text-xs font-semibold text-ink hover:border-accent transition"
              >
                Xem hồ sơ & Quản lý bài viết
              </Link>
            ) : (
              <Link
                href={localePath(locale, "/login")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-canvas border border-line px-3 py-2 text-xs font-semibold text-ink hover:border-accent transition"
              >
                Tạo tài khoản / Đăng nhập
              </Link>
            )}
          </div>
        </nav>

        {/* Center Main Feed (Mobile: 12 cols, iPad: 7 cols, Desktop: 6 cols) */}
        <main className="col-span-1 md:col-span-7 xl:col-span-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, #hashtag, cộng đồng hoặc tác giả..."
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

          {/* Feed Navigation Tabs (For You, Following, Latest, Popular, Communities, Wiki) */}
          <div className="sticky top-16 z-20 rounded-2xl border border-line bg-surface/95 backdrop-blur-md p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-xs scrollbar-none">
            {[
              { id: "all", label: "Dành cho bạn 🔥" },
              { id: "following", label: "Đang theo dõi 👥" },
              { id: "latest", label: "Mới nhất ⚡" },
              { id: "popular", label: "Phổ biến 🏆" },
              { id: "communities", label: "Cộng đồng 🏛️" },
              { id: "wiki", label: "Bách khoa Wiki 📚" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  activeTab === tab.id
                    ? "bg-accent text-white dark:text-[#04101F] shadow-xs"
                    : "text-muted hover:text-ink hover:bg-canvas"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-community filter if in Communities tab */}
          {activeTab === "communities" && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {COMMUNITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommunity(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition ${
                    selectedCommunity === c.id
                      ? "border-accent bg-accent/15 text-accent font-bold"
                      : "border-line bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* WYSIWYG TipTap Post Composer (Priority 0) */}
          <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full border border-line bg-canvas overflow-hidden flex items-center justify-center shrink-0 mt-1">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="My avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {/* Real WYSIWYG TipTap Editor */}
                <TipTapEditor
                  value={postContent}
                  onChange={setPostContent}
                  locale={locale}
                />
              </div>
            </div>

            {/* Uploaded Media Previews */}
            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 rounded-2xl border border-line bg-canvas">
                {uploadedMedia.map((media, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-line bg-surface">
                    {media.type.startsWith("image/") ? (
                      <img src={media.url} alt={media.name} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="h-28 w-full p-2 flex flex-col items-center justify-center text-center">
                        <FileText className="h-6 w-6 text-accent mb-1" />
                        <span className="text-[0.68rem] text-ink font-mono truncate max-w-full px-1">
                          {media.name}
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

            {/* Uploading progress indicator */}
            {isUploadingMedia && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-accent/30 bg-accent/10 text-xs text-ink font-mono">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>{uploadProgressMsg || "Đang tải tệp lên Supabase..."}</span>
              </div>
            )}

            {moderationWarning && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{moderationWarning}</span>
              </div>
            )}

            {/* Composer Meta: Privacy, Community, Flair, Scheduling */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {/* Privacy Selector */}
              <div className="flex items-center gap-1 rounded-xl border border-line bg-canvas p-1">
                <button
                  type="button"
                  onClick={() => setPostVisibility("public")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    postVisibility === "public"
                      ? "bg-accent/20 text-accent font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                  title="Mọi người đều có thể xem bài viết này"
                >
                  <Globe className="h-3 w-3" />
                  <span>Công khai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostVisibility("unlisted")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    postVisibility === "unlisted"
                      ? "bg-teal/20 text-teal font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                  title="Chỉ người có link trực tiếp mới xem được"
                >
                  <EyeOff className="h-3 w-3" />
                  <span>Unlisted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostVisibility("private")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    postVisibility === "private"
                      ? "bg-amber-500/20 text-amber-400 font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                  title="Chỉ mình tôi được xem bài viết này"
                >
                  <Lock className="h-3 w-3" />
                  <span>Riêng tư</span>
                </button>
              </div>

              {/* Community Selector */}
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="rounded-xl border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
              >
                <option value="general">🏛️ Cộng đồng Chung</option>
                <option value="tech">⚡ Công nghệ & AI</option>
                <option value="running">🏃 Chạy bộ & Thể thao</option>
                <option value="lifestyle">🌿 Đời sống & Phát triển</option>
                <option value="science">🔬 Khoa học & Tri thức</option>
                <option value="qa">❓ Hỏi đáp & Trợ giúp</option>
              </select>

              {/* Flair Tag Selector */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {FLAIRS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedFlair(selectedFlair === f ? null : f)}
                    className={`px-2 py-0.5 rounded-lg border text-[0.7rem] font-medium transition ${
                      selectedFlair === f
                        ? "border-accent bg-accent/20 text-accent font-bold"
                        : "border-line bg-canvas text-subtle hover:text-ink"
                    }`}
                  >
                    #{f}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduling Date/Time Picker */}
            {isScheduling && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-xs">
                <Clock className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="font-semibold text-purple-300">Lên lịch đăng:</span>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className="text-muted hover:text-ink ml-auto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Anti-spam Checkbox */}
            <AntiSpamCaptcha onVerify={setCaptchaToken} locale={locale} />

            {/* Action Bar: Media upload, Schedule, Save Draft, Publish */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-canvas hover:border-accent text-xs font-semibold text-ink transition active:scale-95"
                >
                  <ImageIcon className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">Ảnh / Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-canvas hover:border-accent text-xs font-semibold text-ink transition active:scale-95"
                >
                  <Paperclip className="h-4 w-4 text-teal" />
                  <span className="hidden sm:inline">Tệp đính kèm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScheduling(!isScheduling)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 ${
                    isScheduling
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border-line bg-canvas text-ink hover:border-accent"
                  }`}
                >
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="hidden sm:inline">Lên lịch</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCreatePost(e, true)}
                  disabled={posting || !postContent.trim()}
                  className="px-3.5 py-1.5 rounded-xl border border-line bg-canvas hover:bg-surface text-xs font-semibold text-ink transition disabled:opacity-40"
                >
                  Lưu nháp
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCreatePost(e, false)}
                  disabled={posting || (!postContent.trim() && uploadedMedia.length === 0)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold shadow-md hover:bg-accent/90 transition disabled:opacity-40 active:scale-95"
                >
                  {posting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{isScheduling ? "Xác nhận lên lịch" : "Xuất bản"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wiki Tab Dedicated View */}
          {activeTab === "wiki" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-surface/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal" />
                  <span className="font-display font-bold text-sm text-ink">Bách khoa Tri thức Myso Wiki</span>
                </div>
                <Link
                  href={localePath(locale, "/wiki")}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  Xem toàn bộ bách khoa &rarr;
                </Link>
              </div>

              {wikiArticles.map((art) => (
                <div key={art.id} className="card p-5 border border-line bg-surface rounded-2xl shadow-sm hover:border-accent/50 transition">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md border border-teal/40 bg-teal/10 px-2 py-0.5 text-[0.65rem] font-mono text-teal uppercase font-semibold">
                      {art.domain}
                    </span>
                    <span className="text-xs font-mono text-subtle">{art.views_count} lượt đọc</span>
                  </div>
                  <Link href={localePath(locale, `/wiki/${art.slug}`)}>
                    <h3 className="font-display text-lg font-bold text-ink hover:text-accent transition">
                      {art.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-line text-xs font-mono text-subtle">
                    <span className="inline-flex items-center gap-1 text-teal font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Kiểm duyệt 2-Peer IP Review
                    </span>
                    <Link
                      href={localePath(locale, `/wiki/${art.slug}`)}
                      className="font-bold text-accent hover:underline"
                    >
                      Đọc bài viết đầy đủ &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Social Feed Posts Stream */
            <div className="space-y-4">
              {displayedPosts.length === 0 ? (
                <div className="card p-12 text-center border border-line bg-surface/30 rounded-2xl">
                  <Flame className="h-10 w-10 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted">
                    {searchQuery ? "Không tìm thấy bài viết phù hợp với từ khóa." : "Chưa có bài viết nào trong mục này."}
                  </p>
                </div>
              ) : (
                displayedPosts.map((post) => {
                  const isUpvoted = (userVotes[post.id] || 0) === 1;
                  const isDownvoted = (userVotes[post.id] || 0) === -1;
                  const isLiked = isUpvoted || likedPosts[post.id];
                  const isBookmarked = bookmarkedPosts[post.id];
                  const isReposted = repostedPosts[post.id];
                  const isCommentsOpen = expandedPostComments[post.id];
                  const currentComments = commentsMap[post.id] || [];
                  const isTranslated = !!translatedPosts[post.id];
                  const isTranslating = translatingPostId === post.id;
                  const netScore = (post.upvotes_count || post.likes_count || 0) - (post.downvotes_count || 0);

                  return (
                    <article
                      key={post.id}
                      className="card p-4 sm:p-5 border border-line bg-surface shadow-xs hover:border-line/90 rounded-2xl transition space-y-3"
                    >
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Link href={localePath(locale, `/profile/${post.author_handle}`)} className="shrink-0">
                            <div className="h-10 w-10 rounded-full border border-line bg-canvas overflow-hidden flex items-center justify-center">
                              {post.author_avatar ? (
                                <img src={post.author_avatar} alt={post.author_name} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-5 w-5 text-muted" />
                              )}
                            </div>
                          </Link>

                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={localePath(locale, `/profile/${post.author_handle}`)}
                                className="font-display text-xs sm:text-sm font-bold text-ink hover:text-accent transition truncate"
                              >
                                {post.author_name}
                              </Link>
                              {post.author_handle === "myso" && (
                                <span title="Quản trị viên Myso">
                                  <ShieldCheck className="h-3.5 w-3.5 text-teal fill-teal/20" />
                                </span>
                              )}
                              {post.flair && (
                                <span className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.2 text-[0.65rem] font-bold text-accent">
                                  #{post.flair}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[0.7rem] font-mono text-subtle">
                              <Link href={localePath(locale, `/profile/${post.author_handle}`)} className="hover:underline">
                                @{post.author_handle}
                              </Link>
                              <span>·</span>
                              <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Actions: Translation, Privacy, Report */}
                        <div className="flex items-center gap-1.5">
                          {/* Privacy Indicator */}
                          {post.visibility === "private" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-400">
                              <Lock className="h-2.5 w-2.5" />
                              Riêng tư
                            </span>
                          )}
                          {post.visibility === "unlisted" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-teal/30 bg-teal/10 px-2 py-0.5 text-[0.65rem] font-semibold text-teal">
                              <EyeOff className="h-2.5 w-2.5" />
                              Unlisted
                            </span>
                          )}

                          {/* Translate button */}
                          <button
                            type="button"
                            onClick={() => handleTranslatePost(post.id, post.content)}
                            disabled={isTranslating}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[0.7rem] font-semibold transition ${
                              isTranslated
                                ? "border-teal/50 bg-teal/15 text-teal font-bold"
                                : "border-line bg-canvas text-muted hover:border-accent/60 hover:text-ink"
                            }`}
                          >
                            <Languages className="h-3 w-3" />
                            <span>{isTranslating ? "Đang dịch..." : isTranslated ? "Xem bản gốc" : "Dịch"}</span>
                          </button>

                          {/* Report */}
                          <button
                            type="button"
                            onClick={() => setReportingPostId(post.id)}
                            className="p-1 rounded-lg text-muted hover:text-rose-500 transition"
                            title="Báo cáo vi phạm"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="pt-1">
                        <RichContentRenderer
                          content={isTranslated ? translatedPosts[post.id].text : post.content}
                        />
                      </div>

                      {/* Translation Provider Badge */}
                      {isTranslated && (
                        <div className="flex items-center gap-1.5 text-[0.65rem] font-mono text-teal bg-teal/10 border border-teal/20 px-2.5 py-1 rounded-lg">
                          <span>Dịch từ {getLanguageName(translatedPosts[post.id].sourceLang)}</span>
                        </div>
                      )}

                      {/* Multi-Image / Media Gallery */}
                      <MultiImageGallery mediaUrls={post.media_urls} />

                      {/* Social & Reddit-inspired Interaction Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-line text-xs font-mono text-muted">
                        {/* Upvote & Downvote Score Cluster */}
                        <div className="flex items-center gap-1 rounded-xl border border-line bg-canvas p-1">
                          <button
                            type="button"
                            onClick={() => handleVote(post.id, 1)}
                            className={`p-1 rounded-lg transition ${
                              isUpvoted ? "bg-orange-500/20 text-orange-500 font-bold" : "hover:text-orange-500"
                            }`}
                            title="Tán thành (Upvote)"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className={`px-1 text-xs font-bold ${netScore > 0 ? "text-orange-500" : netScore < 0 ? "text-blue-500" : "text-muted"}`}>
                            {netScore}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVote(post.id, -1)}
                            className={`p-1 rounded-lg transition ${
                              isDownvoted ? "bg-blue-500/20 text-blue-500 font-bold" : "hover:text-blue-500"
                            }`}
                            title="Phản đối (Downvote)"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Comment Drawer Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleComments(post.id)}
                          className="inline-flex items-center gap-1.5 hover:text-teal transition"
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
                            isBookmarked ? "text-amber-500" : "hover:text-amber-500"
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                        </button>

                        {/* Share link */}
                        <button
                          type="button"
                          onClick={() => handleSharePost(post.id)}
                          className="inline-flex items-center gap-1 hover:text-accent transition"
                        >
                          {copiedId === post.id ? <Check className="h-3.5 w-3.5 text-teal" /> : <Share2 className="h-3.5 w-3.5" />}
                        </button>

                        {/* Analytics Trigger */}
                        <button
                          type="button"
                          onClick={() => setAnalyticsPost(post)}
                          className="inline-flex items-center gap-1 hover:text-accent transition"
                          title="Phân tích chỉ số bài viết"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{post.views_count || 1}</span>
                        </button>
                      </div>

                      {/* Threaded Comments Section */}
                      {isCommentsOpen && (
                        <div className="pt-3 border-t border-line space-y-3">
                          {/* Main Comment Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddComment(post.id, replyingToComment[post.id] || null);
                                }
                              }}
                              placeholder={
                                replyingToComment[post.id]
                                  ? "Viết phản hồi chuỗi thảo luận..."
                                  : "Viết bình luận cho bài viết này..."
                              }
                              className="flex-1 rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-accent"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id, replyingToComment[post.id] || null)}
                              disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                              className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white hover:bg-accent/90 disabled:opacity-40"
                            >
                              {submittingComment[post.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Gửi"}
                            </button>
                          </div>

                          {/* Comments List with Nested Threaded Replies */}
                          <div className="space-y-2.5 pt-2">
                            {currentComments
                              .filter((c) => !c.parent_id)
                              .map((rootC) => {
                                const replies = currentComments.filter((c) => c.parent_id === rootC.id);
                                return (
                                  <div key={rootC.id} className="space-y-2">
                                    {/* Root comment card */}
                                    <div className="p-3 rounded-xl border border-line/60 bg-canvas space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-ink">{rootC.author_name}</span>
                                          <span className="font-mono text-[0.65rem] text-muted">@{rootC.author_handle}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleTranslateComment(rootC.id, rootC.content)}
                                          className="text-[0.65rem] text-muted hover:text-teal"
                                        >
                                          {translatedComments[rootC.id] ? "Xem bản gốc" : "Dịch"}
                                        </button>
                                      </div>

                                      <p className="text-ink leading-relaxed">
                                        {translatedComments[rootC.id]?.text || rootC.content}
                                      </p>

                                      <div className="flex items-center gap-3 pt-1 text-[0.65rem] text-muted font-mono">
                                        <span>{new Date(rootC.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setReplyingToComment((prev) => ({ ...prev, [post.id]: rootC.id }));
                                            setCommentInputs((prev) => ({ ...prev, [post.id]: `@${rootC.author_handle} ` }));
                                          }}
                                          className="hover:text-accent font-semibold flex items-center gap-1"
                                        >
                                          <CornerDownRight className="h-3 w-3" />
                                          Trả lời
                                        </button>
                                      </div>
                                    </div>

                                    {/* Nested Replies */}
                                    {replies.length > 0 && (
                                      <div className="pl-6 space-y-2 border-l-2 border-line/60 ml-3">
                                        {replies.map((rep) => (
                                          <div key={rep.id} className="p-2.5 rounded-xl border border-line/50 bg-canvas/80 space-y-1 text-xs">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-ink">{rep.author_name}</span>
                                              <span className="font-mono text-[0.65rem] text-muted">@{rep.author_handle}</span>
                                            </div>
                                            <p className="text-ink leading-relaxed">{rep.content}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar: Trending Topics & About Myso */}
        <aside className="hidden md:block md:col-span-5 xl:col-span-3 sticky top-20 space-y-4">
          {/* Trending Communities */}
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-sm text-ink flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Cộng đồng nổi bật</span>
            </h3>

            <div className="space-y-2">
              {COMMUNITIES.slice(1).map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => {
                    setActiveTab("communities");
                    setSelectedCommunity(comm.id);
                  }}
                  className="flex w-full items-center justify-between p-2.5 rounded-xl border border-line bg-canvas hover:border-accent text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <comm.icon className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-ink">{comm.name}</span>
                  </div>
                  <span className="text-[0.65rem] font-mono text-muted">Xem</span>
                </button>
              ))}
            </div>
          </div>

          {/* About Myso Statement */}
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 text-ink font-bold font-display">
              <ShieldCheck className="h-4 w-4 text-teal" />
              <span>Nền Tảng Cộng Đồng Myso</span>
            </div>
            <p className="text-muted leading-relaxed">
              Myso là nền tảng cộng đồng hiện đại, kết hợp khả năng viết bài chuẩn WYSIWYG, thảo luận đa chiều, kiểm duyệt độc lập và bách khoa mở.
            </p>
            <div className="pt-2 border-t border-line text-[0.7rem] font-mono text-subtle flex flex-wrap gap-x-3 gap-y-1">
              <Link href={localePath(locale, "/legal/standards")} className="hover:text-ink">
                Tiêu chuẩn
              </Link>
              <Link href={localePath(locale, "/privacy")} className="hover:text-ink">
                Bảo mật
              </Link>
              <Link href={localePath(locale, "/terms")} className="hover:text-ink">
                Điều khoản
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Analytics Modal */}
      {analyticsPost && (
        <PostAnalyticsModal
          post={analyticsPost}
          isOpen={!!analyticsPost}
          onClose={() => setAnalyticsPost(null)}
        />
      )}
    </div>
  );
}
