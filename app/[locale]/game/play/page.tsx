import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Volume2, Shield } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { GameCanvas } from "@/components/game/GameCanvas";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Chơi Ngay — Mythos: Dấu Chân Cuối Cùng",
    en: "Play Now — Mythos: The Last Route",
    "zh-CN": "立即畅玩 — Mythos：最后的路",
    ja: "今すぐプレイ — Mythos：最後のルート",
  };

  return buildMetadata({
    locale,
    path: "game/play",
    title: titles[locale as Locale] || titles.en,
    description: "Narrative Running Adventure Game in Hue, Vietnam. Play online now.",
  });
}

export default async function GamePlayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="min-h-screen bg-[#02050C] text-white flex flex-col justify-between">
      {/* Top Theater Header */}
      <header className="border-b border-white/10 bg-[#040814]/90 backdrop-blur px-4 py-3 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Link
          href={localePath(locale, "/game")}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4 text-teal" />
          <span>{locale === "vi" ? "Trở Về Tổng Quan Game" : "Back to Game Hub"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-0.5 text-[0.68rem] font-mono font-semibold text-teal">
            <Sparkles className="h-3 w-3" />
            MYTHOS ARCADE · WEB EDITION
          </span>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 max-w-6xl w-full mx-auto">
        <div className="w-full">
          <GameCanvas locale={locale} />
        </div>
      </main>

      {/* Bottom Mini Bar */}
      <footer className="border-t border-white/10 bg-[#03060E] px-4 py-2.5 sm:px-8 text-center text-xs text-white/50 font-mono">
        Mythos Running © 2026 · Hue, Vietnam · Designed with Web Audio & HTML5 Canvas
      </footer>
    </div>
  );
}
