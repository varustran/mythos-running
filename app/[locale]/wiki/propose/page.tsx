import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { WikiProposeClient } from "@/components/wiki/WikiProposeClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "wiki/propose",
    title: "Đóng Góp Bách Khoa Mở — Myso Wiki",
    description: "Đóng góp bài viết mới hoặc sửa đổi bài viết có sẵn. Không cần đăng nhập, bắt buộc trích dẫn nguồn, kiểm duyệt 2-Peer.",
  });
}

export default async function WikiProposePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="container-page py-12 sm:py-16">
      <Suspense fallback={<div className="text-center py-10 font-mono text-xs text-muted">Đang tải biểu mẫu...</div>}>
        <WikiProposeClient locale={locale} />
      </Suspense>
    </div>
  );
}
