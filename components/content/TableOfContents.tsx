import Link from "next/link";
import { List } from "lucide-react";
import type { TocItem } from "@/lib/markdown";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/settings";

export function TableOfContents({ items, locale }: { items: TocItem[]; locale: Locale }) {
  const t = getT(locale, "common");
  if (items.length < 2) return null;
  return (
    <nav aria-label={t("tableOfContents")} className="rounded-xl border border-line bg-surface p-5">
      <p className="mb-3 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
        <List className="h-3.5 w-3.5" />
        {t("tableOfContents")}
      </p>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <Link href={`#${item.id}`} className="block text-[0.82rem] leading-snug text-muted transition hover:text-accent">
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
