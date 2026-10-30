"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Plus, Trash2, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

export function WikiProposeClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("import_title") || "";

  const [title, setTitle] = useState(initialTitle);
  const [domain, setDomain] = useState("Công nghệ & AI");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sources, setSources] = useState<string[]>([
    initialTitle ? `https://${locale === "vi" ? "vi" : "en"}.wikipedia.org/wiki/${encodeURIComponent(initialTitle)}` : "",
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addSource = () => {
    setSources((prev) => [...prev, ""]);
  };

  const updateSource = (index: number, val: string) => {
    setSources((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const removeSource = (index: number) => {
    setSources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validSources = sources.filter((s) => s.trim().startsWith("http"));
    if (validSources.length === 0) {
      setErrorMsg("Vui lòng nhập ít nhất 1 đường link nguồn dẫn / tài liệu tham khảo hợp lệ (bắt đầu bằng http hoặc https).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wiki/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          domain,
          summary,
          content_md: content,
          sources: validSources,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Không thể gửi đề xuất.");
      } else {
        router.push(localePath(locale, "/wiki/review"));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href={localePath(locale, "/wiki")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>{locale === "vi" ? "Trở về Myso Wiki" : "Back to Myso Wiki"}</span>
      </Link>

      <div className="card p-8 border border-line bg-surface shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-accent">OPEN CONTRIBUTION</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-ink">
          {locale === "vi" ? "Đóng Góp Bài Viết Hoặc Đề Xuất Sửa Đổi" : "Propose Article or Edit"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Không cần tạo tài khoản hay đăng nhập. Mọi đề xuất có nguồn rõ ràng sẽ được đưa vào hàng đợi kiểm duyệt 2-Peer.
        </p>

        {errorMsg && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Tiêu đề bài viết bách khoa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trí tuệ nhân tạo tổng quát (AGI), VO2 Max, v.v."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Lĩnh vực chủ đề
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
            >
              <option value="Công nghệ & AI">Công nghệ & AI</option>
              <option value="Thể thao & Y sinh">Thể thao & Y sinh</option>
              <option value="Khoa học & Đời sống">Khoa học & Đời sống</option>
              <option value="Công nghệ Web">Công nghệ Web & Phần mềm</option>
              <option value="Triết học & Lịch sử">Triết học & Lịch sử</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Tóm tắt tổng quan ngắn gọn (1-2 câu)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Khái niệm cốt lõi định nghĩa chủ đề này là gì..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Nội dung chi tiết (Định dạng Markdown) *
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bách khoa chi tiết, phân mục, định nghĩa, cơ chế hoạt động..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink font-mono focus:border-accent focus:outline-none transition"
            />
          </div>

          {/* Mandatory Citation / Source Links */}
          <div className="rounded-2xl border border-teal/40 bg-teal/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="font-mono text-xs text-teal font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Nguồn trích dẫn bắt buộc (Ít nhất 1 link hợp lệ) *
              </label>
              <button
                type="button"
                onClick={addSource}
                className="inline-flex items-center gap-1 text-xs font-mono text-teal hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm nguồn
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Để chống tin giả và nội dung vô căn cứ, Myso Wiki yêu cầu mọi đóng góp phải trích dẫn nguồn uy tín (Wikipedia, bài báo học thuật arXiv, PubMed, W3C, v.v.).
            </p>

            <div className="space-y-2.5">
              {sources.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={s}
                    onChange={(e) => updateSource(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-line bg-canvas p-2.5 text-xs font-mono text-ink focus:border-teal focus:outline-none transition"
                  />
                  {sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSource(idx)}
                      className="p-2 text-muted hover:text-red-400 transition"
                      aria-label="Xóa nguồn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Đang gửi đề xuất vào hàng đợi..." : "Gửi Đóng Góp Vào Hàng Đợi Kiểm Duyệt 2-Peer"}
          </button>
        </form>
      </div>
    </div>
  );
}
