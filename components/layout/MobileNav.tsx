"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, ShieldCheck } from "lucide-react";
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink lg:hidden"
        aria-label={t("common:menu")}
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-canvas lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <span className="font-display text-sm font-semibold">Mythos Running</span>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line"
              aria-label={t("common:close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 py-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={localePath(locale, item.href)}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-lg font-medium text-ink transition hover:bg-elevated"
              >
                {t(`nav:${item.key}`)}
              </Link>
            ))}
            <Link
              href={localePath(locale, "/about")}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-lg font-medium text-ink transition hover:bg-elevated"
            >
              {t("nav:about")}
            </Link>
            <Link
              href={localePath(locale, "/contact")}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-lg font-medium text-ink transition hover:bg-elevated"
            >
              {t("nav:contact")}
            </Link>
          </nav>
          <div className="mx-5 space-y-3 border-t border-line pt-5">
            <LanguageSwitcher locale={locale} compact />
            <ThemeSwitcher compact />
            <Link
              href={localePath(locale, role ? "/admin" : "/login")}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white dark:text-[#04101F]"
            >
              {role ? <ShieldCheck className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {role ? t("nav:admin") : t("nav:login")}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
