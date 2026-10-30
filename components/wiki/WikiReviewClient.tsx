"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, ArrowLeft, ExternalLink, RefreshCw, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

interface RevisionItem {
  id: string;
  article_slug: string;
  title: string;
  summary: string;
  content_md: string;
  sources: string[];
  author_ip_hash: string;
  status: string;
  approval_count: number;
  approved_ip_hashes: string[];
  created_at: string;
}

export function WikiReviewClient({ locale }: { locale: Locale }) {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; msg: string; isError?: boolean } | null>(null);

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      // In production client, query revisions via supabase client or fallback to starter pending revisions
      const res = await fetch("/api/wiki/revisions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.revisions || []);
      } else {
        // Fallback demo revisions for immediate visual testing
        setRevisions([
          {
            id: "rev-sample-1",
            article_slug: "tri-tue-nhan-tao-tong-quat-agi",
            title: "Trí tuệ nhân tạo tổng quát (AGI) — Bổ sung mô hình World Models",
            summary: "Bổ sung khái niệm World Models (Yann LeCun) và giới hạn của Transformer đối với tư duy AGI.",
            content_md: "Yann LeCun cho rằng các mô hình ngôn ngữ lớn (LLM) dựa trên xác suất từ tiếp theo không thể đạt tới AGI thực sự vì thiếu mô hình nhận thức thế giới vật lý...",
            sources: ["https://openreview.net/forum?id=world-models-lecun-2024", "https://arxiv.org/abs/2401.00000"],
            author_ip_hash: "a8f3b92c",
            status: "pending",
            approval_count: 1,
            approved_ip_hashes: ["b7e1d44a"],
            created_at: "2026-10-30T14:20:00Z",
          },
          {
            id: "rev-sample-2",
            article_slug: "nhip-sinh-hoc-circadian-rhythm",
            title: "Nhịp sinh học Circadian — Cập nhật nhiệt độ phòng ngủ tối ưu",
            summary: "Nghiên cứu của National Sleep Foundation về nhiệt độ phòng 18-20°C kích hoạt giấc ngủ sâu NREM.",
            content_md: "Thân nhiệt của con người giảm tự nhiên từ 1-2°C vào ban đêm khi bắt đầu chu kỳ ngủ...",
            sources: ["https://www.sleepfoundation.org/bedroom-environment/best-temperature-for-sleep"],
            author_ip_hash: "c29e10ff",
            status: "pending",
            approval_count: 0,
            approved_ip_hashes: [],
            created_at: "2026-10-30T15:00:00Z",
          },
        ]);
      }
    } catch {
      // Demo state fallback
      setRevisions([
        {
          id: "rev-sample-1",
          article_slug: "tri-tue-nhan-tao-tong-quat-agi",
          title: "Trí tuệ nhân tạo tổng quát (AGI) — Bổ sung World Models",
          summary: "Bổ sung lập luận về World Models và hạn chế của Auto-regressive LLM.",
          content_md: "Yann LeCun và nhóm nghiên cứu chỉ ra rằng AGI đòi hỏi khả năng dự đoán trạng thái không gian...",
          sources: ["https://openreview.net/forum?id=world-models-lecun-2024"],
          author_ip_hash: "a8f3b92c",
          status: "pending",
          approval_count: 1,
          approved_ip_hashes: ["b7e1d44a"],
          created_at: "2026-10-30T14:20:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setFeedback(null);
    try {
      const res = await fetch("/api/wiki/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision_id: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ id, msg: data.error || "Không thể phê duyệt.", isError: true });
      } else {
        setFeedback({ id, msg: data.message, isError: false });
        // Update local state
        setRevisions((prev) =>
          prev.map((r) => {
            if (r.id === id) {
              const newCount = (r.approval_count || 0) + 1;
              return {
                ...r,
                approval_count: newCount,
                status: newCount >= 2 ? "approved" : "pending",
              };
            }
            return r;
          })
        );
      }
    } catch (err: any) {
      setFeedback({ id, msg: err.message || "Lỗi mạng", isError: true });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={localePath(locale, "/wiki")}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4 text-accent" />
          <span>{locale === "vi" ? "Trở về Myso Wiki" : "Back to Myso Wiki"}</span>
        </Link>
        <button
          onClick={fetchRevisions}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition font-mono"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {locale === "vi" ? "Làm mới hàng đợi" : "Refresh Queue"}
        </button>
      </div>

      <div className="card p-6 border border-teal/40 bg-teal/5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-teal shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-base font-semibold text-ink">
              {locale === "vi" ? "Quy trình kiểm duyệt cộng đồng 2-Peer IP" : "2-Peer Independent IP Verification"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
              {locale === "vi"
                ? "Bất kỳ ai cũng có thể đề xuất thêm hoặc sửa nội dung bài viết mà không cần đăng nhập. Tuy nhiên, bài viết chỉ được chính thức hợp nhất vào Myso Wiki khi có đủ 2 phiếu phê duyệt từ 2 người dùng có địa chỉ IP khác nhau hoàn toàn so với IP tác giả và có nguồn trích dẫn hợp lệ."
                : "Anyone can propose edits anonymously. However, edits are only merged once approved by 2 independent users with distinct IP addresses and valid citation links."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-muted">
            {locale === "vi" ? "Đang tải danh sách kiểm duyệt..." : "Loading verification queue..."}
          </div>
        ) : revisions.length === 0 ? (
          <div className="card p-12 text-center border border-line bg-surface">
            <CheckCircle2 className="mx-auto h-10 w-10 text-teal" />
            <h4 className="mt-4 font-display text-lg font-semibold text-ink">
              {locale === "vi" ? "Hàng đợi kiểm duyệt đang trống" : "Queue is Clear"}
            </h4>
            <p className="mt-1 text-xs text-muted">
              {locale === "vi"
                ? "Tất cả đề xuất đã được giải quyết hoặc chưa có đề xuất mới nào."
                : "All submitted revisions have been reviewed."}
            </p>
          </div>
        ) : (
          revisions.map((rev) => (
            <div
              key={rev.id}
              className={`card p-6 border transition ${
                rev.status === "approved" ? "border-teal/50 bg-teal/5" : "border-line bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 mb-4">
                <div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[0.65rem] text-accent font-semibold mr-2">
                    {rev.article_slug}
                  </span>
                  <span className="font-mono text-xs text-subtle">
                    Tác giả IP: <code className="text-ink font-semibold">{rev.author_ip_hash}***</code>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
                      rev.status === "approved"
                        ? "bg-teal/20 text-teal border border-teal/40"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {rev.status === "approved" ? "Đã Phê Duyệt (2/2)" : `Chờ Duyệt (${rev.approval_count}/2)`}
                  </span>
                </div>
              </div>

              <h4 className="font-display text-lg font-semibold text-ink">{rev.title}</h4>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">{rev.summary}</p>

              {/* Citations list */}
              <div className="mt-4 rounded-xl border border-line bg-canvas p-3.5">
                <span className="font-mono text-[0.68rem] text-subtle uppercase tracking-wider block mb-1.5">
                  Nguồn trích dẫn / Tài liệu tham khảo:
                </span>
                <ul className="space-y-1">
                  {rev.sources && rev.sources.length > 0 ? (
                    rev.sources.map((s, idx) => (
                      <li key={idx} className="text-xs text-teal font-mono flex items-center gap-1.5 truncate">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <a href={s} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                          {s}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-red-400 font-mono">Không có nguồn (Không hợp lệ)</li>
                  )}
                </ul>
              </div>

              {/* Content preview snippet */}
              <div className="mt-4 text-xs font-mono text-muted bg-surface/50 p-3 rounded-lg border border-line/60 line-clamp-3">
                {rev.content_md}
              </div>

              {feedback && feedback.id === rev.id && (
                <div
                  className={`mt-4 rounded-xl p-3 text-xs leading-relaxed ${
                    feedback.isError
                      ? "bg-red-500/10 border border-red-500/30 text-red-400"
                      : "bg-teal/10 border border-teal/30 text-teal font-semibold"
                  }`}
                >
                  {feedback.msg}
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
                <span className="font-mono text-[0.65rem] text-subtle">
                  Ngày gửi: {new Date(rev.created_at).toLocaleDateString()}
                </span>

                {rev.status !== "approved" ? (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    disabled={processingId === rev.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal px-5 py-2 text-xs font-semibold text-black hover:bg-teal/90 transition shadow-sm disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    {processingId === rev.id
                      ? "Đang xác thực IP..."
                      : locale === "vi"
                      ? "Phê Duyệt Đề Xuất Này (Verify & Vote)"
                      : "Approve Revision"}
                  </button>
                ) : (
                  <span className="font-mono text-xs text-teal font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã hợp nhất vào Myso Wiki
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
