import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { NoteViewClient } from "@/components/notes/NoteViewClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "notes/view",
    title: "Xem Ghi Chú Bảo Mật — Myso Notes",
    description: "Xem ghi chú bảo mật được chia sẻ qua Myso Notes.",
  });
}

export default async function NoteViewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="container-page py-12 sm:py-16">
      <Suspense fallback={<div className="text-center py-12 font-mono text-xs text-muted">Đang tải ghi chú...</div>}>
        <NoteViewClient locale={locale} />
      </Suspense>
    </div>
  );
}
