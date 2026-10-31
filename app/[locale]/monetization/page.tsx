import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DollarSign, CheckCircle2, ShieldCheck, TrendingUp, Sparkles, HelpCircle, ArrowRight, Wallet } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { EarningsCalculator } from "@/components/monetization/EarningsCalculator";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles: Record<string, string> = {
    vi: "Chính Sách Kiếm Tiền Cho Tác Giả — Myso Creator Rewards",
    en: "Creator Monetization Policy — Myso Creator Rewards",
    "zh-CN": "创作者变现政策 — Myso 激励计划",
    ja: "クリエイター収益化ポリシー — Myso クリエイター報酬",
    fr: "Politique de Rémunération Créateur 85/15 — Myso",
    de: "85/15 Creator-Umsatzbeteiligung — Myso",
  };

  return buildMetadata({
    locale,
    path: "monetization",
    title: titles[locale as Locale] || titles.en,
    description: "Publish articles freely, reach views milestones, and unlock transparent view-based revenue sharing on Myso.",
  });
}

export default async function MonetizationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const steps = [
    {
      step: "01",
      title: "Đăng Bài Viết Chất Lượng",
      desc: "Tạo bài viết chia sẻ kinh nghiệm, kiến thức công nghệ, thể thao, sức khỏe hoặc lối sống trên Myso Blog.",
    },
    {
      step: "02",
      title: "Đạt Ngưỡng Kích Hoạt Tối Thiểu",
      desc: "Chỉ cần xuất bản tối thiểu 5 bài viết hợp lệ và đạt tổng 1.000 lượt xem thực tế từ độc giả trên toàn mạng lưới.",
    },
    {
      step: "03",
      title: "Bật Kiếm Tiền Tự Động",
      desc: "Hệ thống tự động kích hoạt tính năng Creator Rewards. Lượt xem mới được nhân theo tỷ lệ RPM ($2.50 – $7.20/1.000 views).",
    },
    {
      step: "04",
      title: "Nhận Thanh Toán Minh Bạch",
      desc: "Doanh thu tích lũy được đối soát và giải ngân vào ngày 15 hàng tháng qua Chuyển khoản ngân hàng hoặc PayPal/Crypto.",
    },
  ];

  return (
    <>
      {/* Hero Header */}
      <section className="border-b border-line bg-surface/50 py-16 sm:py-20">
        <div className="container-page max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
            <DollarSign className="h-3.5 w-3.5" />
            MYSO PARTNER PROGRAM · VIEW-BASED REWARDS
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink">
            Kiếm Tiền Từ Bài Viết
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            Tại Myso, mọi tri thức và bài viết giá trị đều xứng đáng được đền đáp xứng đáng. Bạn chỉ cần tập trung sáng tạo nội dung, Myso sẽ lo việc phân phối và doanh thu.
          </p>
        </div>
      </section>

      {/* 4-Step Roadmap */}
      <section className="container-page py-16 sm:py-20">
        <div className="mb-12 text-center max-w-xl mx-auto">
          <span className="eyebrow mb-2">HOW IT WORKS</span>
          <h2 className="display-title text-2xl sm:text-4xl">4 Bước Để Nhận Doanh Thu</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="card p-6 border border-line bg-surface flex flex-col justify-between">
              <div>
                <span className="font-mono text-2xl font-bold text-accent">{s.step}</span>
                <h3 className="font-display text-base font-semibold text-ink mt-3">{s.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="border-y border-line bg-surface/40 py-16 sm:py-20">
        <div className="container-page max-w-4xl">
          <div className="mb-8 text-center">
            <span className="eyebrow mb-2">REVENUE ESTIMATOR</span>
            <h2 className="display-title text-2xl sm:text-3xl">Ước Tính Thu Nhập Của Bạn</h2>
          </div>
          <EarningsCalculator locale={locale} />
        </div>
      </section>

      {/* FAQ & Policies */}
      <section className="container-page py-16 sm:py-20 max-w-3xl">
        <div className="mb-10 text-center">
          <span className="eyebrow mb-2">TRANSPARENCY & POLICY</span>
          <h2 className="display-title text-2xl sm:text-3xl">Câu Hỏi Thường Gặp</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Tôi có phải đóng bất kỳ khoản phí nào để tham gia không?",
              a: "Hoàn toàn KHÔNG. Việc đăng ký, viết bài và tham gia chương trình Myso Creator Rewards là miễn phí 100% vĩnh viễn.",
            },
            {
              q: "Lượt xem được tính và chống gian lận như thế nào?",
              a: "Hệ thống lọc IP, user-agent và thời gian đọc thực tế trên trang (tối thiểu 30 giây tương tác) để đảm bảo lượt xem thật từ người dùng, loại bỏ bot tự động.",
            },
            {
              q: "Hạn mức thanh toán tối thiểu là bao nhiêu?",
              a: "Hạn mức rút tiền tối thiểu là $20 (khoảng 500.000 VNĐ). Số dư chưa đủ sẽ được cộng dồn sang chu kỳ tháng kế tiếp.",
            },
            {
              q: "Nội dung như thế nào sẽ bị từ chối kiếm tiền?",
              a: "Các nội dung đạo văn, spam từ khóa, thông tin sai lệch ác ý hoặc vi phạm thuần phong mỹ tục sẽ bị tước quyền tham gia kiếm tiền theo quy chuẩn cộng đồng.",
            },
          ].map((item, idx) => (
            <div key={idx} className="card p-5 border border-line bg-surface">
              <h4 className="font-display text-sm sm:text-base font-semibold text-ink flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-teal shrink-0" />
                {item.q}
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
