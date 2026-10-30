import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { BlogCreateClient } from "@/components/blog/BlogCreateClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "blog/create",
    title: "Viết Bài Mới & Bật Kiếm Tiền — Myso Blog",
    description: "Đăng tải bài viết tự do, tiếp cận hàng nghìn người đọc và tích lũy doanh thu sáng tạo theo lượt xem.",
  });
}

export default async function BlogCreatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="container-page py-12 sm:py-16">
      <BlogCreateClient locale={locale} />
    </div>
  );
}
