"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LogIn,
  Flame,
  Sparkles,
  MessageSquare,
  StickyNote,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { localePath, type Locale } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav({ locale, role }: { locale: Locale; role?: string | null }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { profile, status, isAdmin, logout } = useAuth();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink lg:hidden"
        aria-label="Menu"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-canvas/98 backdrop-blur-2xl lg:hidden flex flex-col">
          {/* Top header */}
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-tight text-ink">Myso</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User badge if authenticated */}
          {profile && (
            <div className="border-b border-line bg-surface/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl overflow-hidden border border-line bg-canvas flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-accent/15 text-accent font-bold text-base">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{profile.full_name}</p>
                  <p className="text-xs font-mono text-muted truncate">@{profile.username}</p>
                </div>
                <Link
                  href={localePath(locale, `/u/${profile.username}`)}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-accent"
                >
                  Hồ sơ
                </Link>
              </div>

              {status === "profile_incomplete" && (
                <Link
                  href={localePath(locale, "/onboarding")}
                  onClick={() => setOpen(false)}
                  className="mt-2.5 flex items-center justify-between rounded-xl bg-accent/10 border border-accent/30 p-2 text-xs font-bold text-accent"
                >
                  <span>Chưa hoàn tất hồ sơ · Tiếp tục</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
            <Link
              href={localePath(locale, "/")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <Flame className="h-5 w-5 text-accent" />
              <span>Bảng Tin Mạng Xã Hội</span>
            </Link>

            <Link
              href={localePath(locale, "/wiki")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Bách Khoa Myso Wiki</span>
            </Link>

            <Link
              href={localePath(locale, "/chat")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <MessageSquare className="h-5 w-5 text-teal" />
              <span>Phòng Chat Mã Hóa (E2EE)</span>
            </Link>

            <Link
              href={localePath(locale, "/notes")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <StickyNote className="h-5 w-5 text-amber-500" />
              <span>Ghi Chú Nhanh Bảo Mật</span>
            </Link>

            {profile && (
              <>
                <Link
                  href={localePath(locale, `/u/${profile.username}`)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
                >
                  <User className="h-5 w-5 text-accent" />
                  <span>Trang Cá Nhân Của Tôi</span>
                </Link>

                <Link
                  href={localePath(locale, "/settings")}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
                >
                  <Settings className="h-5 w-5 text-teal" />
                  <span>Cài Đặt & Quyền Riêng Tư</span>
                </Link>

                {isAdmin && (
                  <Link
                    href={localePath(locale, "/admin")}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-red-400 transition hover:bg-surface active:bg-elevated"
                  >
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    <span>Bảng Quản Trị Hệ Thống</span>
                  </Link>
                )}
              </>
            )}

            <div className="pt-3 border-t border-line/60">
              <Link
                href={localePath(locale, "/legal/standards")}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-mono text-muted hover:text-ink"
              >
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Tiêu chuẩn Cộng đồng & Pháp lý</span>
              </Link>
            </div>
          </nav>

          {/* Footer Controls */}
          <div className="p-5 border-t border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <LanguageSwitcher locale={locale} compact />
              <ThemeSwitcher compact />
            </div>

            {profile ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-5 py-3 text-xs font-bold text-muted hover:text-red-400 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            ) : (
              <Link
                href={localePath(locale, "/login")}
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold text-white dark:text-[#04101F] shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng Nhập / Tạo Tài Khoản</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
