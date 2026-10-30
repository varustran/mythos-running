import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { WikiReviewClient } from "@/components/wiki/WikiReviewClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "wiki/review",
    title: "Hàng Đợi Kiểm Duyệt 2-Peer — Myso Wiki",
    description: "Cơ chế kiểm duyệt bách khoa mở độc lập: Đòi hỏi 2 người dùng khác IP phê duyệt trước khi đưa vào hệ thống chính thức.",
  });
}

export default async function WikiReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="eyebrow mb-2">DECENTRALIZED MODERATION</span>
        <h1 className="display-title text-3xl sm:text-4xl">Hàng Đợi Kiểm Duyệt 2-Peer</h1>
        <p className="mt-3 text-sm text-muted">
          Đóng góp từ cộng đồng đòi hỏi tối thiểu 2 lượt phê duyệt từ 2 địa chỉ IP độc lập và nguồn tài liệu tham khảo minh bạch.
        </p>
      </div>

      <WikiReviewClient locale={locale} />
    </div>
  );
}
