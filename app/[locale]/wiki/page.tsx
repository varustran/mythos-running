import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { WikiSearchClient } from "@/components/wiki/WikiSearchClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Wiki — Bách Khoa Toàn Thư Mở & Kiểm Duyệt Độc Lập",
    en: "Myso Wiki — Open Federated Encyclopedia & Peer Verification",
    "zh-CN": "Myso 百科 — 开放百科全书与独立对等验证",
    ja: "Myso 百科 — オープン百科事典と分散型ピア検証",
  };

  return buildMetadata({
    locale,
    path: "wiki",
    title: titles[locale as Locale] || titles.en,
    description: "Open community encyclopedia federated with Wikipedia, multi-domain knowledge, and 2-peer verified edits without login requirement.",
  });
}

export default async function WikiHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      {/* Editorial Header */}
      <section className="border-b border-line bg-surface/50 py-16 sm:py-20">
        <div className="container-page max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
            <Globe className="h-3.5 w-3.5" />
            FEDERATED OPEN KNOWLEDGE · 2-PEER VERIFICATION
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink">
            Myso Wiki
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            {locale === "vi"
              ? "Bách khoa toàn thư mở đa lĩnh vực: Công nghệ, Thể thao, Y sinh và Đời sống. Kết nối trực tiếp nguồn dữ liệu Wikipedia. Mọi người đều có thể đóng góp và sửa đổi bài viết với cơ chế 2-Peer IP Review minh bạch."
              : "Decentralized multi-domain open encyclopedia federated with Wikipedia. Anyone can contribute and edit entries verified through a strict 2-peer independent IP verification queue."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-subtle">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-teal" />
              Kiểm duyệt tối thiểu 2 IP khác nhau
            </span>
            <span>·</span>
            <span>Bắt buộc nguồn trích dẫn học thuật / báo chí</span>
            <span>·</span>
            <span>Miễn trừ trách nhiệm bách khoa mở</span>
          </div>
        </div>
      </section>

      {/* Main Search & Catalog */}
      <section className="container-page py-12 sm:py-16">
        <WikiSearchClient locale={locale} />
      </section>
    </>
  );
}
