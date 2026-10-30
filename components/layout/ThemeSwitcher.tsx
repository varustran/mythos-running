"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const options = [
  { value: "system", icon: Monitor, key: "themeSystem" },
  { value: "dark", icon: Moon, key: "themeDark" },
  { value: "light", icon: Sun, key: "themeLight" },
] as const;

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation("common");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = options.find((option) => option.value === theme) ?? options[0];
  const Icon = !mounted ? Monitor : current.icon;
  const label = !mounted ? t("theme") : t(current.key);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("theme")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted transition hover:border-accent/60 hover:text-ink",
          compact && "w-full justify-between",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {compact ? <span>{label}</span> : <span className="hidden sm:inline">{label}</span>}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift"
        >
          {options.map((option) => {
            const OptionIcon = option.icon;
            const active = mounted && theme === option.value;
            return (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-elevated hover:text-ink",
                )}
              >
                <OptionIcon className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1">{t(option.key)}</span>
                {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </button>
            );
          })}
          <div className="px-3 pb-1 pt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-subtle">
            {mounted ? (resolvedTheme === "dark" ? "dark" : "light") : ""}
          </div>
        </div>
      ) : null}
    </div>
  );
}
