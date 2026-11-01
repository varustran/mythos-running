"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  Compass,
  Zap,
  Wallet,
  User,
  PlusCircle,
  Settings,
  LogOut,
  LogIn,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Globe,
  Coins,
  CheckCircle2,
  Copy,
  Layers,
  Award,
  Video,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { localePath, type Locale, locales } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface AppShellProps {
  children: React.ReactNode;
  locale: Locale;
}

const NETWORKS = [
  { id: "bnb", name: "BNB Chain", symbol: "BNB", icon: "🟡" },
  { id: "arb", name: "Arbitrum One", symbol: "ETH", icon: "🔵" },
  { id: "polygon", name: "Polygon", symbol: "POL", icon: "🟣" },
  { id: "base", name: "Base", symbol: "ETH", icon: "🔷" },
  { id: "op", name: "Optimism", symbol: "ETH", icon: "🔴" },
];

const TRENDING_TAGS = [
  { tag: "AI", postsCount: "1.4k" },
  { tag: "Fullstack", postsCount: "890" },
  { tag: "Web3", postsCount: "640" },
  { tag: "Solidity", postsCount: "520" },
  { tag: "PromptEngineering", postsCount: "430" },
  { tag: "Research", postsCount: "380" },
];

const TOP_CREATORS = [
  {
    name: "Myso Core",
    handle: "myso",
    avatar: "/favicon.svg",
    badge: "Official",
    reputation: "12.8k",
  },
  {
    name: "Alex Dev",
    handle: "alex_builder",
    avatar: null,
    badge: "Fullstack",
    reputation: "4.9k",
  },
  {
    name: "Prompt Lab",
    handle: "promptmaster",
    avatar: null,
    badge: "AI Creator",
    reputation: "3.2k",
  },
];

export function AppShell({ children, locale }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, status, logout } = useAuth();

  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [simulatedAddress, setSimulatedAddress] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  useEffect(() => {
    if (profile?.wallet_address) {
      setSimulatedAddress(profile.wallet_address);
      setIsWalletConnected(true);
    } else {
      const saved = localStorage.getItem("myso_web3_sim_addr");
      if (saved) {
        setSimulatedAddress(saved);
        setIsWalletConnected(true);
      }
    }
  }, [profile]);

  const handleConnectWallet = () => {
    if (isWalletConnected) return;
    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")
    ).join("");
    const newAddr = `0x71C${randomHex}4e89`;
    setSimulatedAddress(newAddr);
    setIsWalletConnected(true);
    localStorage.setItem("myso_web3_sim_addr", newAddr);
  };

  const copyAddress = () => {
    if (!simulatedAddress) return;
    navigator.clipboard.writeText(simulatedAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const profileHref = profile
    ? localePath(locale, `/u/${profile.username}`)
    : localePath(locale, "/login");

  const navItems = [
    {
      key: "feed",
      label: locale === "vi" ? "Bảng tin" : locale === "zh-CN" ? "动态" : locale === "ja" ? "タイムライン" : locale === "fr" ? "Fil d'actualité" : locale === "de" ? "Feed" : "Feed",
      href: localePath(locale, "/"),
      icon: Flame,
    },
    {
      key: "explore",
      label: locale === "vi" ? "Khám phá" : locale === "zh-CN" ? "探索" : locale === "ja" ? "探索" : locale === "fr" ? "Explorer" : locale === "de" ? "Entdecken" : "Explore",
      href: localePath(locale, "/explore"),
      icon: Compass,
    },
    {
      key: "quests",
      label: locale === "vi" ? "Nhiệm vụ" : locale === "zh-CN" ? "任务中心" : locale === "ja" ? "クエスト" : locale === "fr" ? "Missions" : locale === "de" ? "Missionen" : "Quests",
      href: localePath(locale, "/quests"),
      icon: Zap,
      badge: "+50 pts",
    },
    {
      key: "wallet",
      label: locale === "vi" ? "Ví & Thưởng" : locale === "zh-CN" ? "钱包与收益" : locale === "ja" ? "ウォレット" : locale === "fr" ? "Portefeuille" : locale === "de" ? "Wallet" : "Wallet",
      href: localePath(locale, "/wallet"),
      icon: Wallet,
    },
    {
      key: "meet",
      label: "MysoMeet",
      href: localePath(locale, "/meet"),
      icon: Video,
      badge: "Mới 🔒",
    },
    {
      key: "profile",
      label: profile
        ? locale === "vi" ? "Hồ sơ" : locale === "zh-CN" ? "个人主页" : locale === "ja" ? "プロフィール" : "Profile"
        : locale === "vi" ? "Đăng nhập" : "Sign In",
      href: profileHref,
      icon: User,
    },
  ];

  const handleCreatePostClick = () => {
    const feedPath = localePath(locale, "/");
    if (pathname === feedPath || pathname === `/${locale}`) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const composer = document.getElementById("post-composer-area");
      if (composer) {
        composer.focus();
      }
    } else {
      router.push(`${feedPath}?compose=true`);
    }
  };

  if (pathname.includes("/meet")) {
    return <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex justify-center">
      <div className="w-full max-w-[1260px] flex px-2 sm:px-4 md:px-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 240px Navigation Sidebar (Desktop)           */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex w-[240px] shrink-0 sticky top-0 h-screen flex-col justify-between py-6 pr-4 border-r border-[#27272A]/70 select-none">
          {/* Top Brand & Menu */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <Logo href={localePath(locale, "/")} />
              <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Web2.5
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive =
                  item.key === "feed"
                    ? pathname === item.href || pathname === `/${locale}`
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-[#18181B] text-[#FAFAFA] border border-[#27272A] shadow-[0_0_15px_rgba(245,158,11,0.12)]"
                        : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isActive
                            ? "text-amber-400 scale-110"
                            : "text-[#71717A] group-hover:text-[#FAFAFA] group-hover:scale-105"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Button: Tạo bài viết */}
            <button
              onClick={handleCreatePostClick}
              type="button"
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-[length:200%_auto] hover:animate-shimmer active:scale-95 transition-all shadow-lg shadow-amber-500/20 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{locale === "vi" ? "Tạo bài viết" : "New Post"}</span>
            </button>
          </div>

          {/* Bottom Card: User Profile / Guest State */}
          <div className="pt-4 border-t border-[#27272A]/70 flex flex-col gap-3">
            {profile ? (
              <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#121215] border border-[#27272A]">
                <div className="flex items-center justify-between">
                  <Link
                    href={profileHref}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-[#27272A] bg-[#18181B] shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-xs font-bold text-amber-400">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-[#FAFAFA] truncate">
                        {profile.full_name}
                      </span>
                      <span className="text-[11px] text-[#A1A1AA] truncate font-mono">
                        @{profile.username}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1">
                    <Link
                      href={localePath(locale, "/settings")}
                      title="Settings"
                      className="p-1.5 text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => logout()}
                      title="Log out"
                      className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-[#18181B] rounded-lg transition"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Balances bar */}
                <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#18181B] text-[11px] border border-[#27272A]/50">
                  <div className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span>🪙</span>
                    <span>{profile.points_balance || 0} pts</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <span>💰</span>
                    <span>{profile.gold_balance || 0} Gold</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#121215] border border-[#27272A]">
                <div className="text-xs font-medium text-[#A1A1AA]">
                  {locale === "vi" ? "Tham gia cộng đồng Myso" : "Join the Myso Network"}
                </div>
                <Link
                  href={localePath(locale, "/login")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-[#FAFAFA] transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{locale === "vi" ? "Đăng nhập / Đăng ký" : "Sign in / Register"}</span>
                </Link>
              </div>
            )}

            {/* Quick Micro Links */}
            <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1">
              <Link href={localePath(locale, "/legal/standards")} className="hover:text-[#FAFAFA] transition">
                {locale === "vi" ? "Pháp lý" : "Legal"}
              </Link>
              <span>·</span>
              <Link href={localePath(locale, "/legal/faq")} className="hover:text-[#FAFAFA] transition">
                FAQ
              </Link>
              <span>·</span>
              <Link href={localePath(locale, "/privacy")} className="hover:text-[#FAFAFA] transition">
                {locale === "vi" ? "Bảo mật" : "Privacy"}
              </Link>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: 640px Max Width Feed / Content             */}
        {/* ========================================================= */}
        <main className="w-full max-w-[640px] flex-1 min-w-0 border-r border-[#27272A]/70 min-h-screen pb-24 lg:pb-12">
          {children}
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 320px Sticky Context & Multi-chain Wallet   */}
        {/* ========================================================= */}
        <aside className="hidden xl:flex w-[320px] shrink-0 sticky top-0 h-screen flex-col gap-5 py-6 pl-5 overflow-y-auto select-none scrollbar-none">
          {/* Card 1: Multi-chain Wallet Status */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272A] shadow-md flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold tracking-tight text-[#FAFAFA] uppercase">
                  {locale === "vi" ? "Ví Đa Chuỗi Web2.5" : "Web2.5 Multi-chain Wallet"}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                {locale === "vi" ? "An toàn" : "Safe"}
              </span>
            </div>

            {/* Network selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#18181B] border border-[#27272A]/60 text-xs">
              <span className="text-[#A1A1AA] text-[11px]">
                {locale === "vi" ? "Mạng kết nối:" : "Network:"}
              </span>
              <div className="flex items-center gap-1.5 font-medium text-[#FAFAFA]">
                <span>{selectedNetwork.icon}</span>
                <span>{selectedNetwork.name}</span>
              </div>
            </div>

            {/* Wallet Address / Status */}
            {isWalletConnected && simulatedAddress ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181B] border border-[#27272A]/80 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#71717A] uppercase font-mono">
                      {locale === "vi" ? "Địa chỉ ví" : "Address"}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FAFAFA]">
                      {simulatedAddress.slice(0, 6)}...{simulatedAddress.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={copyAddress}
                    type="button"
                    className="p-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] transition"
                  >
                    {copiedAddr ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Balances Display */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#18181B] border border-amber-500/20 flex flex-col">
                    <span className="text-[10px] text-amber-400/80 font-medium">Myso Gold</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {profile?.gold_balance || 0}
                    </span>
                    <span className="text-[9px] text-[#71717A] mt-0.5">1 Gold = 1 USDT</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#18181B] border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] text-emerald-400/80 font-medium">Myso Points</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {profile?.points_balance || 100}
                    </span>
                    <span className="text-[9px] text-[#71717A] mt-0.5">Thưởng miễn phí</span>
                  </div>
                </div>

                <Link
                  href={localePath(locale, "/wallet")}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 transition"
                >
                  <span>{locale === "vi" ? "Quản lý Ví & Nạp Gold" : "Manage Wallet & Top-up"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 text-center">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {locale === "vi"
                    ? "Kết nối ví Web3 để mở khóa bài viết kỹ thuật & nhận doanh thu chia sẻ 85/15."
                    : "Connect Web3 wallet to unlock technical posts and receive 85/15 revenue sharing."}
                </p>
                <button
                  onClick={handleConnectWallet}
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-bold text-[#FAFAFA] transition border border-[#3F3F46] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>{locale === "vi" ? "Kết nối Ví Web3" : "Connect Web3 Wallet"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Top Creators Leaderboard */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-tight text-[#FAFAFA] uppercase">
                  {locale === "vi" ? "Top Tác Giả Tuần" : "Top Creators"}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">85/15 RevShare</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {TOP_CREATORS.map((c, i) => (
                <Link
                  key={c.handle}
                  href={localePath(locale, `/u/${c.handle}`)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#18181B] transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-[#71717A] w-4">{i + 1}</span>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-[#27272A] border border-[#3F3F46] shrink-0 grid place-items-center text-xs font-bold text-amber-400">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#FAFAFA] truncate group-hover:text-amber-400 transition">
                          {c.name}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {c.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71717A] font-mono">@{c.handle}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0">
                    {c.reputation}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Card 3: Trending Tags */}
          <div className="p-4 rounded-2xl bg-[#121215] border border-[#27272A] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold tracking-tight text-[#FAFAFA] uppercase">
                {locale === "vi" ? "Chủ đề nổi bật" : "Trending Topics"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TRENDING_TAGS.map((item) => (
                <Link
                  key={item.tag}
                  href={`${localePath(locale, "/explore")}?tag=${item.tag}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#FAFAFA] transition"
                >
                  <span className="text-amber-400">#</span>
                  <span>{item.tag}</span>
                  <span className="text-[10px] text-[#71717A]">({item.postsCount})</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Card 4: Switchers & Safe-by-Design Legal badge */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272A] flex flex-col gap-3 text-xs text-[#71717A]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#A1A1AA]">
                {locale === "vi" ? "Tùy chọn hiển thị" : "Preferences"}
              </span>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher locale={locale} compact />
              </div>
            </div>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                Safe-by-Design 100%
              </span>
              <span>© {new Date().getFullYear()} Myso</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Action Button (FAB) for Mobile post creation */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <button
          onClick={handleCreatePostClick}
          type="button"
          aria-label="New post"
          className="h-13 w-13 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-xl shadow-amber-500/30 grid place-items-center active:scale-95 transition"
        >
          <PlusCircle className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
