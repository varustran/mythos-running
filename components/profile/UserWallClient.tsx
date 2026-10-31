"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Share2,
  Check,
  ShieldCheck,
  Flame,
  Lock,
  EyeOff,
  Clock,
  Sparkles,
  Edit3,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ExternalLink,
  Users,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  PlusCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { RichContentRenderer } from "@/components/content/RichContentRenderer";

interface UserProfileData {
  id: string;
  user_id?: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  interests?: string[];
  skills?: string[];
  topics?: string[];
  verified?: boolean;
  streak_days?: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  wiki_count: number;
  communities_count: number;
  created_at: string;
  role: string;
  is_self?: boolean;
  is_following?: boolean;
}

interface ProfilePostItem {
  id: string;
  content: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string | null;
  media_urls?: string[];
  visibility: "public" | "private" | "unlisted";
  status: "published" | "draft" | "scheduled";
  scheduled_at?: string | null;
  likes_count: number;
  reposts_count: number;
  comments_count: number;
  views_count?: number;
  created_at: string;
  category?: string;
}

interface ProfileCommentItem {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_handle: string;
  likes_count?: number;
}

type ProfileTab = "posts" | "replies" | "media" | "wiki" | "communities" | "about";

export function UserWallClient({
  username,
  locale,
}: {
  username: string;
  locale: Locale;
}) {
  const { user, profile: authProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<ProfilePostItem[]>([]);
  const [comments, setComments] = useState<ProfileCommentItem[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [postFilter, setPostFilter] = useState<"all" | "public" | "private" | "unlisted" | "draft">("all");

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfileAndData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Profile info and real stats
      const profRes = await fetch(`/api/profile/${encodeURIComponent(username)}`);
      if (!profRes.ok) {
        if (profRes.status === 404) {
          setErrorMsg("Không tìm thấy người dùng này trên hệ thống.");
        } else {
          setErrorMsg("Có lỗi khi tải dữ liệu người dùng.");
        }
        setLoading(false);
        return;
      }

      const profData = await profRes.json();
      const p = profData.profile;
      setProfile(p);
      setIsFollowing(Boolean(p.is_following));
      setFollowersCount(p.followers_count || 0);

      // 2. Fetch Posts for this author
      const postsRes = await fetch(
        `/api/social/posts?author_handle=${encodeURIComponent(username)}&include_drafts=true`
      );
      if (postsRes.ok) {
        const postData = await postsRes.json();
        setPosts(postData.posts || []);
      }

      // 3. Fetch Comments / Replies for this author
      const commRes = await fetch(
        `/api/social/comments?author_handle=${encodeURIComponent(username)}`
      );
      if (commRes.ok) {
        const commData = await commRes.json();
        setComments(commData.comments || []);
      }
    } catch (err: any) {
      console.error("UserWall fetch error:", err);
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfileAndData();
  }, [fetchProfileAndData]);

  // Real follow / unfollow toggle
  const handleFollowToggle = async () => {
    if (!user) {
      window.location.href = localePath(locale, "/login");
      return;
    }

    if (profile?.is_self) return;

    setFollowLoading(true);
    try {
      const res = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_handle: username }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.is_following);
        setFollowersCount(data.followers_count);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}${localePath(locale, `/u/${username}`)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="container-page py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-3 text-xs font-mono text-muted">Đang tải hồ sơ @{username}...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="container-page py-16 text-center max-w-md mx-auto">
        <div className="card p-8 border border-line bg-surface rounded-3xl space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-ink">{errorMsg || "Không tìm thấy hồ sơ"}</h2>
          <p className="text-xs text-muted">
            Tài khoản @{username} có thể chưa được tạo hoặc đã đổi tên người dùng.
          </p>
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  // Filter posts depending on tab and owner status
  const visiblePosts = posts.filter((post) => {
    if (!profile.is_self) {
      return post.visibility === "public" && post.status === "published";
    }
    if (postFilter === "all") return true;
    if (postFilter === "public") return post.visibility === "public" && post.status === "published";
    if (postFilter === "private") return post.visibility === "private" && post.status === "published";
    if (postFilter === "unlisted") return post.visibility === "unlisted" && post.status === "published";
    if (postFilter === "draft") return post.status === "draft";
    return true;
  });

  // Extract all media uploads across posts
  const allMedia: { url: string; postId: string }[] = [];
  posts.forEach((p) => {
    if (p.media_urls && Array.isArray(p.media_urls)) {
      p.media_urls.forEach((url) => {
        allMedia.push({ url, postId: p.id });
      });
    }
  });

  const memberSince = new Date(profile.created_at).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-64 w-full overflow-hidden bg-gradient-to-r from-accent/25 via-teal/15 to-surface border-b border-line">
        {profile.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-elevated to-surface/80" />
        )}
      </div>

      <div className="container-page max-w-5xl -mt-16 sm:-mt-20">
        {/* Profile Card Header */}
        <div className="relative rounded-3xl border border-line bg-surface/90 p-5 sm:p-7 shadow-xl backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Avatar & Main Identity */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative -mt-12 sm:-mt-16 h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border-4 border-surface bg-canvas shadow-xl">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent/15 text-accent text-3xl font-display font-black">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="pt-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl sm:text-2xl font-black text-ink tracking-tight truncate">
                    {profile.full_name}
                  </h1>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[0.68rem] font-bold text-teal border border-teal/30">
                      <ShieldCheck className="h-3 w-3" />
                      Xác minh
                    </span>
                  )}
                  {profile.role === "admin" && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.68rem] font-bold text-accent border border-accent/30 uppercase tracking-wider">
                      Quản trị viên
                    </span>
                  )}
                </div>

                <p className="font-mono text-xs sm:text-sm text-muted mt-0.5">
                  @{profile.username}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    Tham gia {memberSince}
                  </span>
                  {profile.streak_days ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                      <Flame className="h-3.5 w-3.5" />
                      {profile.streak_days} ngày hoạt động liên tục
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions: Follow / Edit / Share */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={handleShareProfile}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent active:scale-95"
                title="Chia sẻ hồ sơ"
              >
                {copiedLink ? (
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

              {profile.is_self ? (
                <Link
                  href={localePath(locale, "/settings")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-4 text-xs font-bold text-white dark:text-[#04101F] shadow-sm transition hover:bg-accent/90 active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Chỉnh sửa hồ sơ</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold transition shadow-sm active:scale-95 ${
                    isFollowing
                      ? "border border-line bg-canvas text-muted hover:border-red-400 hover:text-red-400"
                      : "bg-accent text-white dark:text-[#04101F] hover:bg-accent/90"
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-teal" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Theo dõi</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio text */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-line/60">
              <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Statistics Bar */}
          <div className="mt-5 grid grid-cols-5 gap-2 border-t border-line/60 pt-4 text-center">
            <div className="rounded-2xl bg-canvas/70 p-2 sm:p-3">
              <p className="text-base sm:text-xl font-black text-ink font-mono">{posts.length}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted font-medium mt-0.5">Bài viết</p>
            </div>

            <div className="rounded-2xl bg-canvas/70 p-2 sm:p-3">
              <p className="text-base sm:text-xl font-black text-teal font-mono">{followersCount}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted font-medium mt-0.5">Người theo dõi</p>
            </div>

            <div className="rounded-2xl bg-canvas/70 p-2 sm:p-3">
              <p className="text-base sm:text-xl font-black text-ink font-mono">{profile.following_count}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted font-medium mt-0.5">Đang theo dõi</p>
            </div>

            <div className="rounded-2xl bg-canvas/70 p-2 sm:p-3">
              <p className="text-base sm:text-xl font-black text-purple-400 font-mono">{profile.wiki_count}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted font-medium mt-0.5">Đóng góp Wiki</p>
            </div>

            <div className="rounded-2xl bg-canvas/70 p-2 sm:p-3">
              <p className="text-base sm:text-xl font-black text-accent font-mono">{profile.communities_count}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted font-medium mt-0.5">Cộng đồng</p>
            </div>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-b border-line pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "posts"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Bài viết ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("replies")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "replies"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Bình luận & Phản hồi ({comments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "media"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Ảnh & Video ({allMedia.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wiki")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "wiki"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Bách khoa Wiki ({profile.wiki_count})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("communities")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "communities"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Cộng đồng ({profile.communities_count})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "about"
                ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Giới thiệu chi tiết</span>
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="mt-6">
          {/* TAB 1: POSTS */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {/* Owner Sub-filter Controls */}
              {profile.is_self && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[0.68rem] font-bold text-muted uppercase tracking-wider pl-1">
                    Bộ lọc của bạn:
                  </span>
                  {(
                    [
                      { key: "all", label: "Tất cả" },
                      { key: "public", label: "Công khai" },
                      { key: "private", label: "Chỉ mình tôi (Private)" },
                      { key: "unlisted", label: "Không công khai (Unlisted)" },
                      { key: "draft", label: "Bản nháp" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setPostFilter(f.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        postFilter === f.key
                          ? "bg-elevated text-ink font-bold border border-line shadow-xs"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {visiblePosts.length === 0 ? (
                <div className="card p-12 text-center border border-line bg-surface rounded-3xl">
                  <Flame className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-3 text-sm font-semibold text-ink">Chưa có bài viết nào</p>
                  <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                    {profile.is_self
                      ? "Bạn chưa có bài viết nào trong mục này. Hãy chia sẻ suy nghĩ đầu tiên của bạn!"
                      : `@${profile.username} chưa đăng bài viết công khai nào.`}
                  </p>
                  {profile.is_self && (
                    <Link
                      href={localePath(locale, "/")}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Đăng bài ngay
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {visiblePosts.map((post) => (
                    <article
                      key={post.id}
                      className="card p-5 sm:p-6 border border-line bg-surface rounded-3xl shadow-sm transition hover:border-accent/40 space-y-4"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-line bg-canvas flex-shrink-0">
                            {post.author_avatar ? (
                              <img
                                src={post.author_avatar}
                                alt={post.author_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-accent/15 text-accent font-bold text-sm">
                                {post.author_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-ink">
                              {post.author_name}
                            </p>
                            <p className="text-[0.68rem] font-mono text-muted">
                              @{post.author_handle} ·{" "}
                              {new Date(post.created_at).toLocaleDateString("vi-VN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Privacy / Status Badges */}
                        <div className="flex items-center gap-1.5">
                          {post.visibility === "private" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-red-400">
                              <Lock className="h-2.5 w-2.5" />
                              Riêng tư
                            </span>
                          )}
                          {post.visibility === "unlisted" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[0.65rem] font-bold text-amber-500">
                              <EyeOff className="h-2.5 w-2.5" />
                              Không công khai
                            </span>
                          )}
                          {post.status === "draft" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted/15 border border-muted/30 px-2 py-0.5 text-[0.65rem] font-bold text-muted">
                              <Clock className="h-2.5 w-2.5" />
                              Bản nháp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-xs sm:text-sm text-ink leading-relaxed">
                        <RichContentRenderer content={post.content} />
                      </div>

                      {/* Media preview */}
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div
                          className={`grid gap-2 rounded-2xl overflow-hidden ${
                            post.media_urls.length === 1
                              ? "grid-cols-1"
                              : post.media_urls.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                          }`}
                        >
                          {post.media_urls.map((url, i) => (
                            <div
                              key={i}
                              className="relative aspect-video max-h-72 overflow-hidden rounded-xl border border-line bg-canvas"
                            >
                              <img
                                src={url}
                                alt={`Media ${i + 1}`}
                                className="h-full w-full object-cover transition hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Post footer stats */}
                      <div className="flex items-center gap-6 border-t border-line/60 pt-3 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5 hover:text-accent">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{post.likes_count}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 hover:text-teal">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{post.comments_count}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 hover:text-ink">
                          <Repeat2 className="h-3.5 w-3.5" />
                          <span>{post.reposts_count}</span>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPLIES */}
          {activeTab === "replies" && (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="card p-12 text-center border border-line bg-surface rounded-3xl">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-3 text-sm font-semibold text-ink">Chưa có bình luận nào</p>
                  <p className="mt-1 text-xs text-muted">
                    @{profile.username} chưa đăng bình luận hoặc thảo luận nào.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="card p-4 sm:p-5 border border-line bg-surface rounded-2xl space-y-2 hover:border-accent/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink">
                          Đã bình luận trên một bài viết
                        </span>
                        <span className="text-[0.68rem] font-mono text-muted">
                          {new Date(comm.created_at).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-ink leading-relaxed">
                        {comm.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === "media" && (
            <div>
              {allMedia.length === 0 ? (
                <div className="card p-12 text-center border border-line bg-surface rounded-3xl">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted/50" />
                  <p className="mt-3 text-sm font-semibold text-ink">Chưa có tệp đa phương tiện</p>
                  <p className="mt-1 text-xs text-muted">
                    @{profile.username} chưa tải lên ảnh hoặc video nào.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allMedia.map((m, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas shadow-xs"
                    >
                      <img
                        src={m.url}
                        alt={`Media item ${i + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WIKI */}
          {activeTab === "wiki" && (
            <div className="space-y-4">
              <div className="card p-6 border border-line bg-surface rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Đóng góp Bách Khoa Myso Wiki</h3>
                      <p className="text-xs text-muted">
                        Các bài viết, đề xuất chỉnh sửa tri thức mở đã được phê duyệt.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={localePath(locale, "/wiki")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    <span>Khám phá Wiki</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {profile.wiki_count === 0 ? (
                  <p className="text-xs text-muted pt-2 border-t border-line/60">
                    Chưa có bài viết Wiki nào được xuất bản bởi thành viên này.
                  </p>
                ) : (
                  <div className="rounded-2xl border border-line bg-canvas p-4 text-xs font-medium text-ink">
                    Thành viên @{profile.username} đã hoàn thành{" "}
                    <span className="font-bold text-accent">{profile.wiki_count}</span> đóng góp
                    và hiệu đính bài viết Wiki trên Myso.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMMUNITIES */}
          {activeTab === "communities" && (
            <div className="space-y-4">
              <div className="card p-6 border border-line bg-surface rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-ink">Cộng đồng & Chủ đề tham gia</h3>
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.interests.map((interest, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-line bg-canvas hover:border-accent/40 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="text-xs font-bold text-ink">{interest}</span>
                        </div>
                        <span className="text-[0.65rem] font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                          Thành viên
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    Chưa có thông tin cộng đồng tham gia.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="card p-6 sm:p-8 border border-line bg-surface rounded-3xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-ink mb-2">Giới thiệu bản thân</h3>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
                    {profile.bio || "Người dùng chưa cập nhật phần giới thiệu bản thân."}
                  </p>
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="border-t border-line/60 pt-5">
                    <h3 className="text-sm font-bold text-ink mb-2.5">Kỹ năng & Chuyên môn</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-xl border border-line bg-canvas px-3 py-1 text-xs font-semibold text-ink"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics / Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="border-t border-line/60 pt-5">
                    <h3 className="text-sm font-bold text-ink mb-2.5">Chủ đề quan tâm</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((item, i) => (
                        <span
                          key={i}
                          className="rounded-xl border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
                        >
                          #{item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Activity Info */}
                <div className="border-t border-line/60 pt-5 space-y-2 text-xs text-muted">
                  <div className="flex items-center justify-between">
                    <span>Trạng thái tài khoản:</span>
                    <span className="font-bold text-teal">Hoạt động bình thường</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vai trò hệ thống:</span>
                    <span className="font-mono uppercase font-bold text-ink">
                      {profile.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ngày khởi tạo:</span>
                    <span className="font-mono text-ink">
                      {new Date(profile.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
