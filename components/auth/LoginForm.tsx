"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Github, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent/70";

export function LoginForm({ locale }: { locale: string }) {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const redirectTo = () => `${window.location.origin}/auth/callback?next=/${locale}/admin`;

  async function signInWithGithub() {
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: redirectTo() },
    });
    if (error) setStatus("error");
  }

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{t("signInTitle")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t("signInDesc")}</p>

      <button
        type="button"
        onClick={signInWithGithub}
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent/60 disabled:opacity-60"
      >
        <Github className="h-4 w-4" /> {t("github")}
      </button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-subtle">{t("or")}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={signInWithEmail} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">{t("email")}</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60 dark:text-[#04101F]"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {t("magicLink")}
        </button>
      </form>

      {status === "sent" ? <p className="mt-4 text-xs text-teal">{t("checkEmail")}</p> : null}
      {status === "error" ? <p className="mt-4 text-xs text-amber-500">{t("error")}</p> : null}
    </div>
  );
}
