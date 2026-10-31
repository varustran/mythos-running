"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LogIn, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { navItems } from "@/lib/site";
import { localePath, type Locale } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { SearchDialog } from "./SearchDialog";

export function SiteHeader({ locale, role }: { locale: Locale; role?: string | null }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

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
            <Link
              href={localePath(locale, "/login")}
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 text-xs font-semibold text-ink transition hover:border-accent/60 hover:text-accent md:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5 text-accent" />
              <span>Đăng Nhập</span>
            </Link>
            <MobileNav locale={locale} role={role} />
          </div>
        </div>
      </header>
      <SearchDialog locale={locale} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
