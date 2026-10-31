"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Sparkles, MessageSquare, StickyNote, User } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/settings";

interface MobileBottomBarProps {
  locale: Locale;
}

export function MobileBottomBar({ locale }: MobileBottomBarProps) {
  const pathname = usePathname();

  const navs = [
    {
      key: "feed",
      label: "Bảng tin",
      href: "/",
      icon: Flame,
    },
    {
      key: "wiki",
      label: "Wiki",
      href: "/wiki",
      icon: Sparkles,
    },
    {
      key: "chat",
      label: "Chat",
      href: "/chat",
      icon: MessageSquare,
    },
    {
      key: "notes",
      label: "Ghi chú",
      href: "/notes",
      icon: StickyNote,
    },
    {
      key: "profile",
      label: "Tài khoản",
      href: "/login",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-line/80 bg-surface/90 backdrop-blur-xl pb-safe">
      <nav className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navs.map((item) => {
          const path = localePath(locale, item.href);
          const isActive =
            item.href === "/"
              ? pathname === path || pathname === `/${locale}`
              : pathname.startsWith(path);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
                isActive
                  ? "text-accent font-bold"
                  : "text-muted hover:text-ink active:scale-95"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-accent" />
                )}
              </div>
              <span className="text-[0.65rem] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
