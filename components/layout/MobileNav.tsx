"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, Flame, Sparkles, MessageSquare, StickyNote, ShieldCheck, Gamepad2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { navItems } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n/settings";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav({ locale, role }: { locale: Locale; role?: string | null }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

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
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-tight text-ink">Myso</span>
              <span className="font-mono text-[0.65rem] text-accent border border-accent/40 bg-accent/10 px-2 py-0.5 rounded-full font-bold">
                PLATFORM
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
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
              <span>Ghi Chú Nhanh Tự Hủy</span>
            </Link>

            <Link
              href={localePath(locale, "/blog")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <FileText className="h-5 w-5 text-purple-400" />
              <span>Diễn Đàn & Blog Mở</span>
            </Link>

            <Link
              href={localePath(locale, "/arcade")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold text-ink transition hover:bg-surface active:bg-elevated"
            >
              <Gamepad2 className="h-5 w-5 text-rose-400" />
              <span>Arcade CyberDash</span>
            </Link>

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

          <div className="p-5 border-t border-line bg-surface/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <LanguageSwitcher locale={locale} compact />
              <ThemeSwitcher compact />
            </div>

            <Link
              href={localePath(locale, "/login")}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-bold text-white dark:text-[#04101F] shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng Nhập / Tạo Tài Khoản</span>
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
