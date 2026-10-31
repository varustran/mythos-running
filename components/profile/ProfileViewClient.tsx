"use client";

import { useState, useEffect } from "react";
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
  FileText,
  Clock,
  Sparkles,
  Edit3,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { RichContentRenderer } from "@/components/content/RichContentRenderer";

interface UserProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  interests?: string[];
  verified?: boolean;
  streak_days?: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  is_self?: boolean;
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
}

export function ProfileViewClient({
  username,
  locale,
}: {
  username: string;
  locale: Locale;
}) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<ProfilePostItem[]>([]);
  const [activeTab, setActiveTab] = useState<"public" | "private" | "unlisted" | "drafts">("public");
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchProfileAndPosts() {
      setLoading(true);
      try {
        // Fetch Profile
        const profRes = await fetch(`/api/profile/${encodeURIComponent(username)}`);
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData.profile);
        }

        // Fetch Posts for this author
        const postsRes = await fetch(
          `/api/social/posts?author_handle=${encodeURIComponent(username)}&include_drafts=true`
        );
        if (postsRes.ok) {
          const postData = await postsRes.json();
          setPosts(postData.posts || []);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndPosts();
  }, [username]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isOwner = profile?.is_self === true;

  // Filter posts by active tab
  const filteredPosts = posts.filter((p) => {
    if (activeTab === "public") return p.visibility === "public" && p.status === "published";
    if (activeTab === "private") return p.visibility === "private" && isOwner;
    if (activeTab === "unlisted") return p.visibility === "unlisted" && isOwner;
    if (activeTab === "drafts") return (p.status === "draft" || p.status === "scheduled") && isOwner;
    return true;
  });

  if (loading) {
    return (
      <div className="container-page py-16 text-center text-muted">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="mt-4 text-xs font-mono uppercase tracking-wider">Đang tải hồ sơ Myso...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-page py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Không tìm thấy người dùng</h2>
        <p className="mt-2 text-sm text-muted">Tài khoản @{username} không tồn tại hoặc đã đổi tên.</p>
        <Link
          href={localePath(locale, "/")}
          className="mt-6 inline-flex rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white"
        >
          Quay lại Bảng tin Myso
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Cover Header */}
      <div className="relative h-44 sm:h-56 w-full bg-surface border-b border-line overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-accent/15 via-teal/10 to-elevated/40" />
        )}
      </div>

      <div className="container-page max-w-4xl relative">
        {/* Profile Card Info */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
          <div className="flex items-end gap-4">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-canvas bg-surface shadow-xl overflow-hidden grid place-items-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-14 w-14 text-muted" />
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-black text-ink">{profile.full_name}</h1>
                {profile.verified && (
                  <span title="Xác minh chính thức">
                    <ShieldCheck className="h-5 w-5 text-teal fill-teal/20" />
                  </span>
                )}
              </div>
              <p className="text-sm font-mono text-muted">@{profile.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent/60"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-teal" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Đã sao chép link" : "Chia sẻ"}</span>
            </button>

            {!isOwner ? (
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isFollowing
                    ? "border border-line bg-surface text-ink hover:border-red-500/40 hover:text-red-400"
                    : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border border-teal/40 bg-teal/10 px-3 py-1.5 text-xs font-semibold text-teal">
                <Check className="h-3.5 w-3.5" />
                Hồ sơ của bạn
              </span>
            )}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-3 pb-6 border-b border-line">
          {profile.bio && (
            <p className="text-sm sm:text-base text-ink leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-subtle">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              Gia nhập: {new Date(profile.created_at).toLocaleDateString("vi-VN")}
            </span>
            <span>·</span>
            <span>
              <strong className="text-ink font-semibold">{profile.followers_count}</strong> người theo dõi
            </span>
            <span>·</span>
            <span>
              Đang theo dõi <strong className="text-ink font-semibold">{profile.following_count}</strong>
            </span>
            {profile.streak_days ? (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                  <Flame className="h-3.5 w-3.5 fill-amber-500" />
                  Streak: {profile.streak_days} ngày
                </span>
              </>
            ) : null}
          </div>

          {/* Interests tags */}
          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {profile.interests.map((it, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-line bg-surface px-2.5 py-0.5 text-[0.7rem] font-medium text-muted"
                >
                  #{it}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-line mt-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("public")}
            className={`pb-3 px-2 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === "public"
                ? "border-accent text-accent font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span>Bài viết công khai</span>
            <span className="rounded-full bg-surface px-1.5 py-0.2 text-[0.65rem]">
              {posts.filter((p) => p.visibility === "public" && p.status === "published").length}
            </span>
          </button>

          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("unlisted")}
                className={`pb-3 px-2 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === "unlisted"
                    ? "border-accent text-accent font-bold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>Không công khai (Unlisted)</span>
                <span className="rounded-full bg-surface px-1.5 py-0.2 text-[0.65rem]">
                  {posts.filter((p) => p.visibility === "unlisted").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("private")}
                className={`pb-3 px-2 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === "private"
                    ? "border-accent text-accent font-bold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                <span>Riêng tư (Chỉ mình tôi)</span>
                <span className="rounded-full bg-surface px-1.5 py-0.2 text-[0.65rem]">
                  {posts.filter((p) => p.visibility === "private").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("drafts")}
                className={`pb-3 px-2 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === "drafts"
                    ? "border-accent text-accent font-bold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-teal" />
                <span>Bản nháp & Lên lịch</span>
                <span className="rounded-full bg-surface px-1.5 py-0.2 text-[0.65rem]">
                  {posts.filter((p) => p.status === "draft" || p.status === "scheduled").length}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Posts List */}
        <div className="mt-6 space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="card p-12 text-center border border-line bg-surface/30">
              <FileText className="h-10 w-10 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted">
                {activeTab === "public"
                  ? "Chưa có bài viết công khai nào."
                  : activeTab === "private"
                  ? "Không có bài viết riêng tư nào."
                  : activeTab === "unlisted"
                  ? "Không có bài viết không công khai nào."
                  : "Chưa có bản nháp hoặc bài viết chờ lên lịch nào."}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="card p-5 border border-line bg-surface shadow-sm rounded-2xl">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{post.author_name}</span>
                    <span className="text-xs font-mono text-muted">@{post.author_handle}</span>
                    <span className="text-xs text-subtle">·</span>
                    <span className="text-xs font-mono text-subtle">
                      {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Privacy badge */}
                  <div className="flex items-center gap-1.5">
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
                    {post.status === "scheduled" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-purple-400">
                        <Clock className="h-2.5 w-2.5" />
                        Lên lịch: {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString("vi-VN") : "Sắp đăng"}
                      </span>
                    )}
                    {post.status === "draft" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-[0.65rem] font-semibold text-muted">
                        Bản nháp
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <RichContentRenderer content={post.content} />
                </div>

                {/* Media previews if any */}
                {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl overflow-hidden border border-line">
                    {post.media_urls.map((url, i) => (
                      <img key={i} src={url} alt="Post media" className="h-44 w-full object-cover" />
                    ))}
                  </div>
                )}

                {/* Interaction stats */}
                <div className="flex items-center gap-6 pt-3 border-t border-line/60 text-xs text-muted font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" />
                    {post.likes_count}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.comments_count}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {post.reposts_count}
                  </span>
                  {post.views_count ? <span>{post.views_count} lượt xem</span> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
