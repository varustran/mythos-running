"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function NewsletterForm({ locale = "vi" }: { locale?: string }) {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setState("sending");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setState(response.ok ? "done" : "error");
      if (response.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-start gap-2 text-sm text-teal">
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
        {t("subscribeSuccess")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1 pl-4 focus-within:border-accent/60">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailPlaceholder")}
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-medium text-white transition hover:bg-accent/90 disabled:opacity-60 dark:text-[#04101F]"
        >
          {t("subscribe")}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {state === "error" ? <p className="text-xs text-red-500">{t("errorGeneric")}</p> : null}
    </form>
  );
}
