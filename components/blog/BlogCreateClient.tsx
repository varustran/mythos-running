"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, DollarSign, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

export function BlogCreateClient({ locale }: { locale: Locale }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Công nghệ & AI");
  const [authorName, setAuthorName] = useState("");
  const [coverImage, setCoverImage] = useState("/images/hero-running.jpg");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [enableMonetization, setEnableMonetization] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          domain,
          author_name: authorName,
          cover_image: coverImage,
          excerpt,
          content_md: content,
          enable_monetization: enableMonetization,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Không thể đăng bài viết.");
      } else {
        router.push(localePath(locale, "/blog"));
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
        href={localePath(locale, "/blog")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>{locale === "vi" ? "Trở về Myso Blog" : "Back to Myso Blog"}</span>
      </Link>

      <div className="card p-8 border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            MYSO CREATOR STUDIO
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          {locale === "vi" ? "Đăng Bài Viết & Bật Kiếm Tiền" : "Publish Article & Enable Earnings"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted">
          Chia sẻ tri thức, bài phân tích hoặc câu chuyện của bạn. Lượt xem sẽ được ghi nhận và tích lũy doanh thu tự động.
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
              Tiêu đề bài viết *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Bí quyết tối ưu hiệu năng Next.js 15, Hướng dẫn chạy marathon..."
              className="w-full rounded-xl border border-line bg-canvas p-3.5 text-sm sm:text-base text-ink focus:border-accent focus:outline-none transition"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
                Chủ đề / Lĩnh vực
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
              >
                <option value="Công nghệ & AI">Công nghệ & AI</option>
                <option value="Thể thao & Chạy bộ">Thể thao & Chạy bộ</option>
                <option value="Sức khỏe & Biohacking">Sức khỏe & Biohacking</option>
                <option value="Lối sống & Tự do">Lối sống & Digital Nomad</option>
                <option value="Tài chính & Web3">Tài chính & Web3</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
                Tên tác giả / Bút danh
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Alex Tran, Runner01 (để trống nếu muốn ẩn danh)"
                className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Ảnh bìa bài viết (URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/images/hero-running.jpg hoặc URL ảnh bên ngoài"
                className="flex-1 rounded-xl border border-line bg-canvas p-3 text-xs font-mono text-ink focus:border-accent focus:outline-none transition"
              />
              <div className="h-10 w-14 shrink-0 rounded-lg overflow-hidden border border-line bg-canvas">
                <img src={coverImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Đoạn trích tóm tắt (Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Đoạn mở đầu ngắn gọn kích thích người đọc..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2">
              Nội dung bài viết (Markdown) *
            </label>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung đầy đủ... Hỗ trợ tiêu đề ##, danh sách, khối mã ```..."
              className="w-full rounded-xl border border-line bg-canvas p-4 text-sm text-ink font-mono focus:border-accent focus:outline-none transition leading-relaxed"
            />
          </div>

          {/* Monetization Switch */}
          <div className="rounded-2xl border border-teal/40 bg-teal/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/10 text-teal border border-teal/30">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-ink">Bật tham gia Myso Creator Rewards</p>
                <p className="text-xs text-muted">Lượt xem bài viết sẽ được tự động ghi nhận vào quỹ phân chia doanh thu.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableMonetization}
              onChange={(e) => setEnableMonetization(e.target.checked)}
              className="h-5 w-5 rounded border-line text-teal focus:ring-teal cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Đang xuất bản bài viết..." : "Xuất Bản Bài Viết Ngay"}
          </button>
        </form>
      </div>
    </div>
  );
}
