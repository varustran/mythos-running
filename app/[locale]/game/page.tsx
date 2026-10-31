import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Sparkles, MapPin, Compass, Shield, BookOpen, Trophy } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { gameChapters } from "@/lib/game/chapters";
import { GameCanvas } from "@/components/game/GameCanvas";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso: Dấu Chân Cuối Cùng — Trò chơi phiêu lưu chạy bộ",
    en: "Myso: The Last Route — Narrative Running Adventure Game",
    "zh-CN": "Myso：最后的路 — 叙事跑步冒险游戏",
    ja: "Myso：最後のルート — ランニング叙事詩アドベンチャー",
  };
  const descriptions = {
    vi: "Khám phá những cung đường huyền bí chỉ xuất hiện trong màn sương đêm tại Huế. Một tựa game phiêu lưu độc bản từ Myso.",
    en: "Explore mystical phantom routes that emerge only in Hue's midnight mist. An original narrative running game by Myso.",
    "zh-CN": "探索仅在顺化午夜浓雾中显现的幽冥古道。Myso 原创叙事跑步冒险游戏。",
    ja: "真夜中のフエの霧の中にのみ現れる幻の古道を探索せよ。Mysoがお届けするオリジナル・ランニングアドベンチャー。",
  };

  return buildMetadata({
    locale,
    path: "game",
    title: titles[locale as Locale] || titles.en,
    description: descriptions[locale as Locale] || descriptions.en,
    image: "/images/game-hero.jpg",
  });
}

export default async function GameHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const characters = [
    {
      name: "An",
      role: locale === "vi" ? "Người Chạy Trẻ (Nhân vật chính)" : "Young Runner (Protagonist)",
      desc:
        locale === "vi"
          ? "Một runner trẻ tình cờ nhặt được cuốn sổ da dưới chân thành cổ lúc nửa đêm. Đôi chân và lòng kiên định là vũ khí duy nhất của cậu."
          : "A young runner who stumbled upon an ancient leather journal beneath the citadel at midnight. His endurance is his sole weapon.",
    },
    {
      name: "Lão Khắc",
      role: locale === "vi" ? "Người Canh Thành Già" : "The Old Watchman",
      desc:
        locale === "vi"
          ? "Người đã sống cạnh hào thành suốt 70 năm, chứng kiến từng con đường lần lượt tan biến vào hư không mỗi khi con người lãng quên."
          : "Guarding the moat for 70 years, he witnessed routes vanish into oblivion whenever humanity forgot their stories.",
    },
    {
      name: "Mai",
      role: locale === "vi" ? "Runner Dẫn Tốc Bí Ẩn" : "Mysterious Pacer",
      desc:
        locale === "vi"
          ? "Bóng dáng thoắt ẩn thoắt hiện trong sương mờ. Cô chạy với nhịp thở hoàn hảo 178 cadence, dẫn lối qua những con ngõ quên tên."
          : "A phantom gliding through the fog with a clockwork 178 cadence, leading the worthy through forgotten avenues.",
    },
    {
      name: "Người Giữ Đường",
      role: locale === "vi" ? "Kẻ Canh Giữ Sự Bất Biến" : "The Keeper of Paths",
      desc:
        locale === "vi"
          ? "Thực thể huyền bí muốn đóng băng toàn bộ cung đường thành phố để bảo tồn quá khứ, không cho bất kỳ biến đổi nào diễn ra."
          : "The enigmatic guardian determined to freeze all routes into timeless stone, halting all change at any cost.",
    },
  ];

  return (
    <>
      {/* 1. Cinematic Game Hero */}
      <section className="relative overflow-hidden border-b border-line bg-[#030712] py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/game-hero.jpg"
            alt="Myso: The Last Route"
            className="h-full w-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040814] via-[#040814]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040814] via-[#040814]/80 to-transparent" />
        </div>

        <div className="container-page relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1 text-xs font-mono font-medium text-teal backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} />
              MYTHOS ORIGINAL GAME STUDIO
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              {locale === "vi" ? "DẤU CHÂN CUỐI CÙNG" : "THE LAST ROUTE"}
            </h1>
            <p className="mt-2 font-mono text-sm uppercase tracking-widest text-accent">
              MYTHOS: NARRATIVE RUNNING ADVENTURE
            </p>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A7B4C7]">
              {locale === "vi"
                ? "Thành phố Cố Đô ẩn chứa những cung đường không hề có trên bản đồ thông thường. Chúng chỉ xuất hiện lúc nửa đêm trong làn mưa rào. Mỗi con đường mang ký ức của một thế hệ. Và một ai đó đang tìm cách xóa sạch chúng mãi mãi..."
                : "The ancient city conceals routes uncharted by modern cartography. Appearing only in midnight rain, each holds the echoes of past runners. And a shadowy force is working to erase them forever..."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={localePath(locale, "/game/play")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-accent px-6 py-3.5 text-sm font-semibold text-black hover:opacity-95 transition shadow-lg shadow-teal/20"
              >
                <Play className="h-4 w-4 fill-current" />
                {locale === "vi" ? "Chơi Toàn Màn Hình" : "Play Fullscreen Mode"}
              </Link>

              <a
                href="#play-area"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/80 px-6 py-3.5 text-sm font-medium text-ink hover:border-accent transition backdrop-blur"
              >
                <Shield className="h-4 w-4 text-teal" />
                {locale === "vi" ? "Chơi Nhanh Tại Đây" : "Quick Play Below"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Playable Game Interactive Canvas Area */}
      <section id="play-area" className="border-b border-line bg-[#03060E] py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-teal">
              {locale === "vi" ? "TRẢI NGHIỆM CHƠI TRỰC TIẾP" : "INTERACTIVE PLAYABLE EXPERIENCE"}
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white">
              {locale === "vi" ? "Bắt Đầu Hành Trình" : "Embark on The Route"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#77869B]">
              {locale === "vi"
                ? "Dùng bàn phím (Space / Shift / Mũi tên) hoặc nút cảm ứng trên màn hình điện thoại để điều khiển tốc độ và nhảy qua chướng ngại vật."
                : "Use keyboard (Space to jump, Shift to boost) or on-screen touch buttons on mobile."}
            </p>
          </div>

          <GameCanvas locale={locale} />
        </div>
      </section>

      {/* 3. The 8 Story Chapters Roadmap */}
      <section className="container-page py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="eyebrow mb-2">08 CHAPTERS · 4–6 HOURS LORE</span>
            <h2 className="display-title text-3xl sm:text-4xl">
              {locale === "vi" ? "8 Chương Cốt Truyện" : "The Eight Story Chapters"}
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            {locale === "vi"
              ? "Mỗi chương là một khu vực thực tế tại Huế kết hợp cơ chế gameplay nhịp điệu và câu đố không gian độc bản."
              : "Each chapter explores iconic landmarks of Hue woven with rhythmic running puzzles."}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gameChapters.map((ch) => (
            <div
              key={ch.id}
              className="group card card-hover flex flex-col overflow-hidden border border-line bg-surface"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
                <img
                  src={ch.image}
                  alt={ch.title[locale]}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/20 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-canvas/80 px-2.5 py-0.5 font-mono text-[0.62rem] text-teal backdrop-blur border border-teal/30">
                  {ch.targetMeters}m
                </span>
                <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 font-mono text-[0.6rem] text-subtle">
                  <MapPin className="h-3 w-3 text-accent" />
                  {ch.location[locale]}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-semibold text-ink group-hover:text-accent transition">
                  {ch.title[locale]}
                </h3>
                <p className="mt-1 text-xs text-muted line-clamp-2">
                  {ch.subtitle[locale]}
                </p>
                <div className="mt-auto pt-4 border-t border-line/50">
                  <p className="font-mono text-[0.62rem] text-subtle line-clamp-2 italic">
                    "{ch.secretClue[locale]}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Characters of Myso */}
      <section className="border-t border-line bg-surface/30 py-16 sm:py-24">
        <div className="container-page">
          <div className="mb-12 max-w-xl">
            <span className="eyebrow mb-2">CHARACTER ROSTER</span>
            <h2 className="display-title text-3xl sm:text-4xl">
              {locale === "vi" ? "Nhân Vật Trong Trò Chơi" : "Key Characters"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {characters.map((c) => (
              <div key={c.name} className="card p-6 border border-line bg-surface/70">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-elevated text-teal">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{c.name}</h3>
                <p className="font-mono text-[0.68rem] text-accent uppercase tracking-wider mt-0.5">
                  {c.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
