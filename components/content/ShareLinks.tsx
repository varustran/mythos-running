import { Link2, Twitter, Facebook, Linkedin } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/settings";

export function ShareLinks({ url, title, locale }: { url: string; title: string; locale: Locale }) {
  const t = getT(locale, "common");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, icon: Twitter },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: Facebook },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: Linkedin },
  ];

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="mb-3 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
        <Link2 className="h-3.5 w-3.5" />
        {t("share")}
      </p>
      <div className="flex gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-accent/60 hover:text-accent"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
