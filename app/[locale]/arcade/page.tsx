import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gamepad2, Play, Sparkles, Award, ArrowRight, Zap, Shield } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { CyberDashGame } from "@/components/arcade/CyberDashGame";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Arcade — Phòng Trò Chơi Trình Duyệt & Phiêu Lưu",
    en: "Myso Arcade — Browser Game Studio & Adventures",
    "zh-CN": "Myso 街机 — 浏览器游戏工作室与冒险",
    ja: "Myso アーケード — ブラウザゲームスタジオ＆アドベンチャー",
  };

  return buildMetadata({
    locale,
    path: "arcade",
    title: titles[locale as Locale] || titles.en,
    description: "Explore Myso browser game studio: Mythos Running narrative adventure, Cyber Dash neon arcade, and continuous game releases.",
  });
}

export default async function ArcadeHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      {/* Hero Header */}
      <section className="border-b border-line bg-[#03060E] py-16 sm:py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/game-hero.jpg"
            alt="Myso Arcade"
            className="h-full w-full object-cover opacity-20 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060E] via-[#03060E]/80 to-transparent" />
        </div>

        <div className="container-page relative z-10 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
            <Gamepad2 className="h-3.5 w-3.5" />
            MYSO ORIGINAL GAME STUDIO · WEB ARCADE
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Myso Arcade
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            Kho trò chơi trực tuyến độc quyền được phát triển độc bản cho Myso: Từ game phiêu lưu tường thuật cốt truyện sâu sắc đến các tựa game tốc độ phản xạ 60fps.
          </p>
        </div>
      </section>

      {/* 1. Quick Play Game 1: Cyber Dash */}
      <section className="container-page py-12 sm:py-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="eyebrow mb-1">FAST-PACED ARCADE</span>
            <h2 className="display-title text-2xl sm:text-3xl">Chơi Nhanh: Myso Cyber Dash</h2>
          </div>
          <span className="font-mono text-xs text-teal font-semibold">60 FPS · HTML5 Canvas</span>
        </div>

        <div className="max-w-3xl mx-auto">
          <CyberDashGame locale={locale} />
        </div>
      </section>

      {/* 2. Featured Game 2: Mythos: The Last Route */}
      <section className="border-t border-line bg-surface/30 py-16 sm:py-20">
        <div className="container-page">
          <div className="card overflow-hidden border border-teal/30 bg-[#040916] text-white p-8 sm:p-12 shadow-2xl relative">
            <div className="max-w-xl relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 font-mono text-xs text-teal font-semibold">
                <Sparkles className="h-3 w-3" />
                NARRATIVE ADVENTURE · 8 CHAPTERS
              </span>
              <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-white">
                Mythos: Dấu Chân Cuối Cùng
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#A7B4C7] leading-relaxed">
                Tựa game phiêu lưu tường thuật độc bản 8 chương. Đồng hành cùng runner An giải mã bí mật những con đường cổ kính trong màn sương đêm, thu thập mảnh ký ức và khám phá 3 nhánh kết thúc vận mệnh.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={localePath(locale, "/game/play")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-accent px-6 py-3.5 text-sm font-semibold text-black hover:opacity-95 transition shadow-lg shadow-teal/20"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Chơi Toàn Màn Hình
                </Link>

                <Link
                  href={localePath(locale, "/game")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white hover:border-teal transition backdrop-blur"
                >
                  Khám Phá Cốt Truyện & Nhân Vật <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 lg:absolute lg:right-8 lg:top-1/2 lg:-translate-y-1/2 w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <img
                src="/images/game-chapter-1.jpg"
                alt="The Last Route"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
