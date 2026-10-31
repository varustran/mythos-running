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
  Coins,
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
  author_id?: string | null;
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
  is_locked?: boolean;
  public_preview?: string | null;
  unlock_price_gold?: number;
  unlock_price_points?: number;
  payload_metadata?: {
    wordsCount: number;
    codeBlocksCount: number;
    linksCount: number;
    attachmentsCount: number;
  };
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
  depth?: number;
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
  const { user, profile, status: authStatus, refreshProfile } = useAuth();

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

  // Dual-Layer Anti-Scam Paywall States
  const [isPaywallLocked, setIsPaywallLocked] = useState(false);
  const [paywallTab, setPaywallTab] = useState<"preview" | "payload">("preview");
  const [publicPreview, setPublicPreview] = useState("");
  const [secretPayload, setSecretPayload] = useState("");
  const [unlockPriceGold, setUnlockPriceGold] = useState(2);
  const [unlockPricePoints, setUnlockPricePoints] = useState(50);

  // Unlocked post secrets cache
  const [unlockedSecrets, setUnlockedSecrets] = useState<Record<string, { secret_content: string; attachments?: any[] }>>({});
  const [unlockingPostId, setUnlockingPostId] = useState<string | null>(null);

  // Quote Selection
  const [selectedQuote, setSelectedQuote] = useState<{ postId: string; text: string } | null>(null);

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
        const ageHoursA = Math.max(0, (Date.now() - new Date(a.created_at).getTime()) / 3600000);
        const ageHoursB = Math.max(0, (Date.now() - new Date(b.created_at).getTime()) / 3600000);
        const recencyScoreA = Math.max(0, 50 - ageHoursA * 2);
        const recencyScoreB = Math.max(0, 50 - ageHoursB * 2);

        const scoreA =
          recencyScoreA +
          calculatePostAffinity(a, userProfile) +
          (a.upvotes_count || 0) * 2 -
          (a.downvotes_count || 0) +
          (a.views_count || 0) * 0.1;
        const scoreB =
          recencyScoreB +
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

    const mainContent = isPaywallLocked ? (publicPreview.trim() || postContent.trim()) : postContent.trim();

    if (!mainContent && uploadedMedia.length === 0) return;

    if (isPaywallLocked && !secretPayload.trim()) {
      setModerationWarning("Vui lòng nhập nội dung bí mật (Secret Payload) cần bảo vệ bằng Paywall.");
      return;
    }

    // Automated Moderation Filter
    const modResult = inspectContent(mainContent);
    if (!modResult.isAllowed) {
      setModerationWarning(modResult.userMessage || "Nội dung vi phạm tiêu chuẩn cộng đồng Myso.");
      return;
    }

    setPosting(true);
    const mediaUrls = uploadedMedia.map((m) => m.url);

    // Active author identity
    const authorName = profile?.full_name || anonIdentity?.displayName || "Thành viên Myso";
    const authorHandle = profile?.username || anonIdentity?.handle || "user";
    const authorAvatar = profile?.avatar_url || (authStatus !== "guest" ? null : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");

    const postStatus = isDraft ? "draft" : isScheduling && scheduledDateTime ? "scheduled" : "published";

    const payload: Record<string, any> = {
      content: mainContent,
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
      is_locked: isPaywallLocked,
      public_preview: isPaywallLocked ? (publicPreview.trim() || mainContent) : null,
      secret_content: isPaywallLocked ? secretPayload.trim() : null,
      unlock_price_gold: isPaywallLocked ? Number(unlockPriceGold) || 0 : 0,
      unlock_price_points: isPaywallLocked ? Number(unlockPricePoints) || 0 : 0,
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
          setPublicPreview("");
          setSecretPayload("");
          setIsPaywallLocked(false);
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

  // Unlock post handler
  const handleUnlockPost = async (postId: string, method: "gold" | "points") => {
    if (!user) {
      alert("Vui lòng đăng nhập để mở khóa nội dung này.");
      return;
    }
    setUnlockingPostId(postId);
    try {
      const res = await fetch(`/api/social/posts/${postId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (res.ok && data.secret_content !== undefined) {
        setUnlockedSecrets((prev) => ({
          ...prev,
          [postId]: {
            secret_content: data.secret_content,
            attachments: data.attachments || [],
          },
        }));
        await refreshProfile();
      } else {
        alert(data.error || "Mở khóa thất bại.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi mở khóa bài viết.");
    } finally {
      setUnlockingPostId(null);
    }
  };

  // Fetch secret if user is author or has already unlocked
  const handleFetchSecret = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}/secret`);
      if (res.ok) {
        const data = await res.json();
        if (data.unlocked && data.secret_content) {
          setUnlockedSecrets((prev) => ({
            ...prev,
            [postId]: {
              secret_content: data.secret_content,
              attachments: data.attachments || [],
            },
          }));
        }
      }
    } catch (err) {}
  };

  // Quote selection
  const handleTextSelection = (postId: string) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 3) {
      setSelectedQuote({ postId, text });
    }
  };

  const applyQuote = (postId: string) => {
    if (!selectedQuote || selectedQuote.postId !== postId) return;
    const quoteText = `> ${selectedQuote.text}\n\n`;
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: `${quoteText}${prev[postId] || ""}`,
    }));
    setSelectedQuote(null);
    setExpandedPostComments((prev) => ({ ...prev, [postId]: true }));
  };

  // Comment Upvote / Downvote
  const handleVoteComment = async (commentId: string, voteType: number) => {
    try {
      const res = await fetch(`/api/social/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_type: voteType }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsMap((prev) => {
          const next = { ...prev };
          for (const pid in next) {
            next[pid] = next[pid].map((c) =>
              c.id === commentId ? { ...c, upvotes_count: data.upvotes_count } : c
            );
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Comment vote error:", err);
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
    <div className="w-full flex flex-col gap-4 p-3 sm:p-5">
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

      {/* Center Main Feed Stream */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, #hashtag, tác giả..."
            className="w-full rounded-2xl border border-[#27272A] bg-[#121215] pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-amber-500/50 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 p-1 rounded-lg text-[#71717A] hover:text-[#FAFAFA]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Feed Navigation Tabs (For You, Following, Latest, Popular, Communities) */}
        <div className="sticky top-0 z-20 rounded-2xl border border-[#27272A] bg-[#121215]/95 backdrop-blur-md p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-sm scrollbar-none">
          {[
            { id: "all", label: "Tất cả 🔥" },
            { id: "following", label: "Đang theo dõi 👥" },
            { id: "latest", label: "Mới nhất ⚡" },
            { id: "popular", label: "Phổ biến 🏆" },
            { id: "communities", label: "Chủ đề 🏛️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                activeTab === tab.id
                  ? "bg-[#27272A] text-amber-400 border border-[#3F3F46] shadow-xs"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]"
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
          <div className="rounded-2xl border border-[#27272A] bg-[#121215] text-[#FAFAFA] p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full border border-[#27272A] bg-[#18181B] overflow-hidden flex items-center justify-center shrink-0 mt-1">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="My avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                {isPaywallLocked ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/30 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Khóa bài viết (Dual-Layer Paywall)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-canvas p-1 border border-line">
                        <button
                          type="button"
                          onClick={() => setPaywallTab("preview")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            paywallTab === "preview"
                              ? "bg-amber-500/20 text-amber-400"
                              : "text-muted hover:text-ink"
                          }`}
                        >
                          1. Xem trước ({publicPreview.length}/150 min)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaywallTab("payload")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            paywallTab === "payload"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "text-muted hover:text-ink"
                          }`}
                        >
                          2. Nội dung bí mật (Payload)
                        </button>
                      </div>
                    </div>

                    {paywallTab === "preview" ? (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] text-muted">
                          Bản xem trước công khai (tối thiểu 150 ký tự): Tóm tắt giải pháp, bằng chứng kết quả hoặc ảnh demo để độc giả tin cậy trước khi mở khóa.
                        </p>
                        <textarea
                          rows={4}
                          value={publicPreview}
                          onChange={(e) => setPublicPreview(e.target.value)}
                          placeholder="Nhập phần xem trước công khai tại đây (>= 150 ký tự)..."
                          className="w-full p-2.5 rounded-xl bg-canvas border border-line text-xs text-ink placeholder:text-muted focus:outline-none focus:border-amber-500/50"
                        />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={publicPreview.length >= 150 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                            {publicPreview.length >= 150 ? "✓ Đủ tiêu chuẩn xem trước" : `Còn thiếu ${150 - publicPreview.length} ký tự`}
                          </span>
                          <span className="text-muted font-mono">{publicPreview.length} / 150</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] text-muted">
                          Nội dung bí mật (Payload): Mã nguồn, AI Prompt, tài liệu mật. Sẽ được lưu trữ tách biệt trong bảng post_secrets và chỉ mở khóa cho người trả phí.
                        </p>
                        <textarea
                          rows={5}
                          value={secretPayload}
                          onChange={(e) => setSecretPayload(e.target.value)}
                          placeholder="Nhập code, prompt, link hoặc lời giải bí mật cần bảo vệ..."
                          className="w-full p-2.5 rounded-xl bg-canvas border border-line font-mono text-xs text-ink placeholder:text-muted focus:outline-none focus:border-emerald-500/50"
                        />
                        <div className="flex items-center gap-3 text-[11px] text-emerald-400 font-mono">
                          <span>{secretPayload.trim().split(/\s+/).filter(Boolean).length} từ</span>
                          <span>·</span>
                          <span>{(secretPayload.match(/```[\s\S]*?```/g) || []).length} khối code</span>
                          <span>·</span>
                          <span>{(secretPayload.match(/https?:\/\/[^\s]+/g) || []).length} liên kết</span>
                        </div>
                      </div>
                    )}

                    {/* Pricing settings */}
                    <div className="pt-2 border-t border-line/70 flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">💰 Giá Myso Gold:</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={unlockPriceGold}
                          onChange={(e) => setUnlockPriceGold(Number(e.target.value))}
                          className="w-16 p-1 rounded-lg bg-canvas border border-line text-xs text-center font-bold text-amber-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-muted">(1 Gold = 1 USDT)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">🪙 Giá Myso Points:</span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={unlockPricePoints}
                          onChange={(e) => setUnlockPricePoints(Number(e.target.value))}
                          className="w-16 p-1 rounded-lg bg-canvas border border-line text-xs text-center font-bold text-emerald-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-muted">(Điểm miễn phí)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <TipTapEditor
                    value={postContent}
                    onChange={setPostContent}
                    locale={locale}
                  />
                )}
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

                <button
                  type="button"
                  onClick={() => setIsPaywallLocked(!isPaywallLocked)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 ${
                    isPaywallLocked
                      ? "border-amber-500 bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/10"
                      : "border-line bg-canvas text-ink hover:border-accent"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isPaywallLocked ? "Paywall: BẬT 🔒" : "Khóa Paywall"}</span>
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
                      className="group p-4 sm:p-5 rounded-2xl border border-[#27272A] bg-[#121215] text-[#FAFAFA] shadow-sm hover:border-amber-500/30 hover:shadow-[0_4px_25px_rgba(245,158,11,0.06)] hover:-translate-y-0.5 transition-all duration-300 space-y-3"
                    >
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Link href={localePath(locale, `/u/${post.author_handle}`)} className="shrink-0">
                            <div className="h-10 w-10 rounded-full border border-[#27272A] bg-[#18181B] overflow-hidden flex items-center justify-center">
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
                                href={localePath(locale, `/u/${post.author_handle}`)}
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
                              <Link href={localePath(locale, `/u/${post.author_handle}`)} className="hover:underline">
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
                      <div
                        className="pt-1 select-text"
                        onMouseUp={() => handleTextSelection(post.id)}
                      >
                        {post.is_locked ? (
                          unlockedSecrets[post.id] || (user && post.author_id === user.id) ? (
                            <div className="space-y-3">
                              {/* Unlocked green badge */}
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                  <CheckCircle2 className="h-4 w-4" />
                                  ĐÃ MỞ KHÓA BẢN QUYỀN CHÍNH THỨC
                                </span>
                                <span className="text-[10px] text-muted font-mono">Myso Safe-by-Design</span>
                              </div>

                              {/* Render secret content */}
                              <div className="p-3.5 rounded-xl bg-[#0D0D10] border border-[#27272A]">
                                <RichContentRenderer
                                  content={unlockedSecrets[post.id]?.secret_content || post.content}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Public Preview */}
                              <div className="text-xs text-ink/90 leading-relaxed">
                                <RichContentRenderer
                                  content={post.public_preview || post.content}
                                />
                              </div>

                              {/* Anti-Scam Verified Metadata Badge */}
                              <div className="p-3.5 rounded-2xl bg-[#121215] border border-emerald-500/30 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                    <ShieldCheck className="h-4 w-4" />
                                    Xác thực máy chủ độc lập (Anti-Scam Verified)
                                  </span>
                                  <span className="text-[10px] font-mono text-muted">Payload Hash OK</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-[#FAFAFA] font-mono bg-[#18181B] p-2 rounded-xl border border-[#27272A]">
                                  <span>📝 {post.payload_metadata?.wordsCount || 0} từ</span>
                                  <span>·</span>
                                  <span>💻 {post.payload_metadata?.codeBlocksCount || 0} khối code</span>
                                  <span>·</span>
                                  <span>📎 {post.payload_metadata?.attachmentsCount || 0} tệp đính kèm</span>
                                </div>

                                {/* Unlock action buttons */}
                                <div className="pt-1 flex items-center gap-2">
                                  <button
                                    onClick={() => handleUnlockPost(post.id, "gold")}
                                    disabled={unlockingPostId === post.id}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-[length:200%_auto] hover:animate-shimmer active:scale-95 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                                  >
                                    <Coins className="h-3.5 w-3.5" />
                                    <span>
                                      {unlockingPostId === post.id
                                        ? "Đang mở khóa..."
                                        : `Mở khóa bằng Gold (${post.unlock_price_gold || 2} Gold)`}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => handleUnlockPost(post.id, "points")}
                                    disabled={unlockingPostId === post.id}
                                    className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Zap className="h-3.5 w-3.5" />
                                    <span>{post.unlock_price_points || 50} pts</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <RichContentRenderer
                            content={isTranslated ? translatedPosts[post.id].text : post.content}
                          />
                        )}
                      </div>

                      {/* Floating Quote Trigger */}
                      {selectedQuote && selectedQuote.postId === post.id && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#18181B] border border-amber-500/40 text-xs text-ink shadow-lg">
                          <span className="text-[11px] text-muted italic truncate max-w-[200px]">
                            &ldquo;{selectedQuote.text}&rdquo;
                          </span>
                          <button
                            type="button"
                            onClick={() => applyQuote(post.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition"
                          >
                            Trích dẫn
                          </button>
                        </div>
                      )}

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

                          {/* Comments List with Recursive 4-Tier Threaded Replies */}
                          <div className="space-y-2.5 pt-2">
                            {currentComments
                              .filter((c) => !c.parent_id)
                              .map((rootC) => {
                                const renderNode = (c: SocialCommentItem, depth: number): React.ReactNode => {
                                  const childReplies = currentComments.filter((item) => item.parent_id === c.id);
                                  return (
                                    <div
                                      key={c.id}
                                      className={`space-y-1.5 text-xs ${
                                        depth > 0 ? "pl-3 sm:pl-4 border-l-2 border-[#27272A] mt-2" : "mt-2"
                                      }`}
                                    >
                                      <div className="p-3 rounded-xl border border-line/60 bg-canvas space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <Link
                                            href={localePath(locale, `/u/${c.author_handle}`)}
                                            className="flex items-center gap-2 hover:underline"
                                          >
                                            <span className="font-bold text-ink hover:text-accent transition">
                                              {c.author_name}
                                            </span>
                                            <span className="font-mono text-[0.65rem] text-muted">
                                              @{c.author_handle}
                                            </span>
                                            {depth > 0 && (
                                              <span className="text-[9px] px-1 py-0.2 rounded bg-[#18181B] text-[#71717A] border border-[#27272A]">
                                                L{depth}
                                              </span>
                                            )}
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => handleTranslateComment(c.id, c.content)}
                                            className="text-[0.65rem] text-muted hover:text-teal"
                                          >
                                            {translatedComments[c.id] ? "Xem bản gốc" : "Dịch"}
                                          </button>
                                        </div>

                                        <p
                                          onMouseUp={() => handleTextSelection(post.id)}
                                          className="text-ink leading-relaxed select-text"
                                        >
                                          {translatedComments[c.id]?.text || c.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-1 text-[0.65rem] text-muted font-mono">
                                          <div className="flex items-center gap-3">
                                            <span>
                                              {new Date(c.created_at).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setReplyingToComment((prev) => ({ ...prev, [post.id]: c.id }));
                                                setCommentInputs((prev) => ({
                                                  ...prev,
                                                  [post.id]: `@${c.author_handle} `,
                                                }));
                                              }}
                                              className="hover:text-accent font-semibold flex items-center gap-1 cursor-pointer"
                                            >
                                              <CornerDownRight className="h-3 w-3" />
                                              Trả lời
                                            </button>
                                          </div>

                                          {/* Comment Upvotes */}
                                          <div className="flex items-center gap-1 bg-[#18181B] px-1.5 py-0.5 rounded-lg border border-[#27272A]">
                                            <button
                                              type="button"
                                              onClick={() => handleVoteComment(c.id, 1)}
                                              className="hover:text-orange-400 p-0.5"
                                              title="Upvote comment"
                                            >
                                              <ChevronUp className="h-3 w-3" />
                                            </button>
                                            <span className="font-bold text-ink px-0.5">
                                              {c.upvotes_count || 0}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleVoteComment(c.id, -1)}
                                              className="hover:text-blue-400 p-0.5"
                                              title="Downvote comment"
                                            >
                                              <ChevronDown className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Recursively render child replies up to 4 levels (depth 0, 1, 2, 3) */}
                                      {childReplies.length > 0 && depth < 3 && (
                                        <div className="space-y-1.5">
                                          {childReplies.map((reply) => renderNode(reply, depth + 1))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                };

                                return renderNode(rootC, 0);
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
