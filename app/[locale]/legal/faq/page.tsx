import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HelpCircle, ArrowLeft, DollarSign, Shield, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "legal/faq",
    title: "Câu Hỏi Thường Gặp & Chính Sách Nền Tảng (FAQ) — Myso",
    description: "Giải đáp toàn bộ thắc mắc về mạng xã hội Myso, chính sách kiếm tiền của tác giả, mã hóa trò chuyện và tiêu chuẩn kiểm duyệt.",
  });
}

export default async function LegalFaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const faqs = [
    {
      q: "Myso là gì và khác gì so với các mạng xã hội truyền thống?",
      a: "Myso là mạng lưới mở kết hợp giữa mạng xã hội tương tác thời gian thực (như X, TikTok), bách khoa tri thức mở có kiểm chứng (như Wikipedia), công cụ tiện ích bảo mật (Myso Notes) và kênh trò chuyện mã hóa đầu cuối. Người dùng có toàn quyền sở hữu nội dung và phát triển thương hiệu cá nhân.",
    },
    {
      q: "Tính năng kiếm tiền (Creator Monetization) hiện tại đang ở trạng thái nào?",
      a: "Tính năng kiếm tiền hiện tại đang trong giai đoạn hoàn thiện tài liệu, cổng kết nối đối tác quảng cáo và cơ chế thanh toán tự động minh bạch (Tạm thời chưa mở cổng rút tiền). Trong giai đoạn này, các bài viết của bạn sẽ được ghi nhận lượt xem thực và điểm tín nhiệm tác giả (Author Reputation Score) để được ưu tiên kích hoạt và phân bổ doanh thu ngay khi tính năng chính thức đi vào vận hành.",
    },
    {
      q: "Làm thế nào để đạt điều kiện tham gia Quỹ Tác Giả Myso?",
      a: "Bạn cần có tối thiểu 3 bài viết chia sẻ chất lượng được cộng đồng upvote, tài khoản hoạt động trên 14 ngày và không vi phạm Tiêu chuẩn cộng đồng Myso.",
    },
    {
      q: "Tính năng trò chuyện mã hóa (Myso Chat) hoạt động như thế nào?",
      a: "Tin nhắn trong Myso Chat được mã hóa trực tiếp trên thiết bị người gửi và chỉ được giải mã trên thiết bị người nhận (E2EE). Máy chủ không lưu trữ bản rõ tin nhắn của bạn.",
    },
    {
      q: "Chính sách của Myso đối với các hành vi vi phạm pháp luật?",
      a: "Myso nghiêm cấm triệt để việc lợi dụng nền tảng vào các mục đích lừa đảo, phạm pháp, phát tán mã độc hay xâm phạm an ninh trật tự. Myso cam kết phối hợp chặt chẽ với Cơ quan Chức năng có thẩm quyền (CQCN) khi có yêu cầu hợp pháp để xử lý các vi phạm.",
    },
    {
      q: "Làm sao để tôi báo cáo một bài viết hoặc tài khoản vi phạm?",
      a: "Bạn chỉ cần nhấn vào biểu tượng lá cờ (Báo cáo vi phạm) ở góc mỗi bài viết hoặc bình luận, chọn lý do phù hợp. Đội ngũ kiểm duyệt Myso sẽ thẩm định và xử lý trong vòng 24 giờ.",
    },
  ];

  return (
    <article className="container-page py-12 sm:py-16 max-w-4xl">
      <Link
        href={localePath(locale, "/")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition mb-8"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>Về trang chủ Myso</span>
      </Link>

      <div className="border-b border-line pb-8 mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent font-semibold flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            TRUNG TÂM TRỢ GIÚP & GIẢI ĐÁP
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink">
          Câu Hỏi Thường Gặp (FAQ)
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
          Tổng hợp giải đáp về cơ chế hoạt động, định hướng lộ trình tính năng kiếm tiền, bảo mật dữ liệu và văn hóa cộng đồng Myso.
        </p>
      </div>

      {/* Monetization Status Notice Callout */}
      <div className="rounded-2xl border border-teal/40 bg-teal/5 p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/15 text-teal shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-ink">
              Thông Báo Lộ Trình Kiếm Tiền (Creator Rewards Roadmap)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
              Tính năng chia sẻ doanh thu quảng cáo và thưởng bài viết hiện đang trong quá trình chuẩn bị tài liệu và tích hợp đối tác thanh toán quốc tế. Mọi đóng góp nội dung của bạn hiện tại đều được bảo lưu chỉ số và điểm tín nhiệm để quy đổi khi cổng thanh toán mở.
            </p>
          </div>
        </div>
        <Link
          href={localePath(locale, "/monetization")}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition whitespace-nowrap shadow-sm"
        >
          <span>Xem Tài Liệu RPM</span>
        </Link>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-2xl border border-line bg-surface p-6 transition hover:border-accent/40 shadow-xs"
          >
            <h3 className="font-display text-base font-bold text-ink flex items-center gap-2.5">
              <span className="text-accent font-mono text-sm">#{index + 1}</span>
              {faq.q}
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed pl-7 border-l-2 border-line">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
