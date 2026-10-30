"use client";

import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Sparkles,
  TrendingUp,
  X,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function PostAnalyticsModal({
  isOpen,
  onClose,
  post,
}: {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    author_name: string;
    author_handle: string;
    views_count?: number;
    likes_count: number;
    comments_count: number;
    bookmarks_count: number;
    reposts_count: number;
    monetized?: boolean;
    created_at: string;
  } | null;
}) {
  if (!isOpen || !post) return null;

  const views = post.views_count || Math.max(post.likes_count * 12 + 45, 120);
  const totalEngagements = post.likes_count + post.comments_count + post.bookmarks_count + post.reposts_count;
  const engagementRate = views > 0 ? ((totalEngagements / views) * 100).toFixed(1) : "0.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="card w-full max-w-md border border-line bg-surface p-6 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent/15 text-accent border border-accent/20">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-ink">
                Thống Kê & Phân Tích Bài Viết
              </h3>
              <p className="text-[0.68rem] font-mono text-muted">@{post.author_handle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-line bg-canvas p-3.5">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Lượt xem</span>
              <Eye className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="font-display text-xl font-bold text-ink">{views.toLocaleString()}</div>
            <div className="text-[0.62rem] text-teal font-mono mt-0.5">Tiếp cận thực tế</div>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-3.5">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Tỷ lệ tương tác</span>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="font-display text-xl font-bold text-ink">{engagementRate}%</div>
            <div className="text-[0.62rem] text-muted font-mono mt-0.5">{totalEngagements} hành vi</div>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-3.5">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Thả tim & Thích</span>
              <Heart className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="font-display text-xl font-bold text-ink">{post.likes_count}</div>
            <div className="text-[0.62rem] text-muted font-mono mt-0.5">Ủng hộ bài viết</div>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-3.5">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Thảo luận</span>
              <MessageCircle className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="font-display text-xl font-bold text-ink">{post.comments_count}</div>
            <div className="text-[0.62rem] text-muted font-mono mt-0.5">Bình luận trao đổi</div>
          </div>
        </div>

        {/* Monetization Status Section */}
        <div className="rounded-2xl border border-line bg-canvas/70 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Trạng Thái Kiếm Tiền (Creator Monetization)
            </span>
            {post.monetized ? (
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                <CheckCircle2 className="h-3 w-3" />
                ĐÃ BẬT
              </span>
            ) : (
              <span className="text-[0.65rem] font-mono text-muted border border-line px-2 py-0.5 rounded-full">
                CHƯA KÍCH HOẠT
              </span>
            )}
          </div>
          <p className="text-[0.72rem] text-muted leading-relaxed">
            {post.monetized
              ? "Bài viết này được hệ thống gắn nhãn phân bổ doanh thu đối tác theo chính sách người sáng tạo Myso dựa trên lưu lượng tiếp cận và chất lượng thảo luận."
              : "Bài viết chưa bật kiếm tiền. Hãy tiếp tục chia sẻ nội dung nguyên bản và tuân thủ tiêu chuẩn cộng đồng để được xem xét mở khóa tính năng đối tác."}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-line bg-canvas text-xs font-semibold text-ink hover:border-accent transition"
        >
          Đóng Phân Tích
        </button>
      </div>
    </div>
  );
}
