"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LogIn, User, ShieldAlert, LogOut, ChevronDown, Clock, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { navItems } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { SearchDialog } from "./SearchDialog";

export function SiteHeader({ locale, role }: { locale: Locale; role?: string | null }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, profile, status, isAdmin, logout } = useAuth();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6 xl:gap-8">
            <Logo href={localePath(locale)} />
            <nav className="hidden items-center gap-4 xl:gap-6 lg:flex" aria-label="Main">
              {navItems.map((item) => {
                const href = localePath(locale, item.href);
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      "relative py-1 text-[0.82rem] font-medium transition",
                      active ? "text-ink font-semibold" : "text-muted hover:text-ink"
                    )}
                  >
                    {t(`nav:${item.key}`)}
                    {active ? (
                      <span className="absolute -bottom-[21px] left-0 h-[2px] w-full bg-accent" aria-hidden="true" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("common:search")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-accent/60 hover:text-ink"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} compact />
            </div>

            {/* Dynamic User Profile or Login */}
            {profile ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-xs font-semibold text-ink transition hover:border-accent/60"
                >
                  <div className="h-6 w-6 rounded-lg overflow-hidden border border-line bg-canvas flex items-center justify-center flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[0.65rem] font-bold text-accent">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{profile.full_name}</span>
                  <ChevronDown className="h-3 w-3 text-muted" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-line bg-surface p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                    <div className="border-b border-line px-3 py-2">
                      <p className="text-xs font-bold text-ink truncate">{profile.full_name}</p>
                      <p className="text-[0.7rem] font-mono text-muted">@{profile.username}</p>
                      {status === "profile_incomplete" && (
                        <Link
                          href={localePath(locale, "/onboarding")}
                          onClick={() => setUserMenuOpen(false)}
                          className="mt-1.5 inline-block text-[0.68rem] font-bold text-accent underline"
                        >
                          Chưa hoàn tất hồ sơ · Tiếp tục
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href={localePath(locale, `/u/${profile.username}`)}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink transition hover:bg-canvas"
                      >
                        <User className="h-3.5 w-3.5 text-accent" />
                        <span>Trang cá nhân của tôi</span>
                      </Link>

                      <Link
                        href={localePath(locale, "/settings")}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink transition hover:bg-canvas"
                      >
                        <Clock className="h-3.5 w-3.5 text-teal" />
                        <span>Cài đặt & Quyền riêng tư</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href={localePath(locale, "/admin")}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-canvas"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                          <span>Bảng Quản Trị Hệ Thống</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-line pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-canvas hover:text-red-400"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={localePath(locale, "/login")}
                className="hidden h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 text-xs font-semibold text-ink transition hover:border-accent/60 hover:text-accent sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5 text-accent" />
                <span>Đăng Nhập</span>
              </Link>
            )}

            <MobileNav locale={locale} role={role} />
          </div>
        </div>
      </header>
      <SearchDialog locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
