"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent/70";

export function ContactForm({ locale }: { locale: string }) {
  const { t } = useTranslation("legal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, locale }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || t("contactError"));
        setStatus("error");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError(t("contactError"));
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">{t("contactName")}</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">{t("contactEmail")}</span>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} autoComplete="email" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">{t("contactMessage")}</span>
        <textarea required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} className={fieldClass} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60 dark:text-[#04101F]"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("send")}
        </button>
        {status === "sent" ? <p className="text-xs text-teal">{t("sent")}</p> : null}
        {status === "error" ? <p className="text-xs text-amber-500">{error}</p> : null}
      </div>
    </form>
  );
}
