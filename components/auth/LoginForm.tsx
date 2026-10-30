"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Github, Loader2, Mail, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fieldClass =
  "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent";

export function LoginForm({ locale }: { locale: string }) {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [mode, setMode] = useState<"otp_request" | "otp_verify">("otp_request");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "verified">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const redirectTo = () => `${window.location.origin}/auth/callback?next=/${locale}/admin`;

  // 1. Google OAuth
  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setStatusMsg(error.message);
    }
  }

  // 2. X (Twitter) OAuth
  async function signInWithX() {
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setStatusMsg(error.message);
    }
  }

  // 3. GitHub OAuth
  async function signInWithGithub() {
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setStatusMsg(error.message);
    }
  }

  // 4. Send Email OTP / Magic Link
  async function sendEmailOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setStatusMsg(error.message);
    } else {
      setStatus("sent");
      setMode("otp_verify");
      setStatusMsg("Mã OTP và liên kết đăng nhập đã được gửi tới email của bạn.");
    }
  }

  // 5. Verify OTP Code
  async function verifyOtpCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode.trim(),
      type: "email",
    });

    if (error) {
      setStatus("error");
      setStatusMsg("Mã xác nhận không đúng hoặc đã hết hạn.");
    } else {
      setStatus("verified");
      window.location.href = `/${locale}/admin`;
    }
  }

  return (
    <div className="card p-6 sm:p-8 border border-line bg-surface shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-4 w-4 text-accent" />
        <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
          MYSO SSO & MULTI-AUTH
        </span>
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Đăng nhập vào Myso
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
        Đăng nhập nhanh bằng tài khoản Google, X (Twitter), GitHub hoặc nhận mã OTP bảo mật qua Email.
      </p>

      {/* Social Logins */}
      <div className="mt-6 space-y-2.5">
        {/* Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink transition hover:border-accent disabled:opacity-60 shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Tiếp tục với Google
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* X (Twitter) */}
          <button
            type="button"
            onClick={signInWithX}
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs font-semibold text-ink transition hover:border-accent disabled:opacity-60 shadow-sm"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Tài khoản X
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={signInWithGithub}
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 text-xs font-semibold text-ink transition hover:border-accent disabled:opacity-60 shadow-sm"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </button>
        </div>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-subtle">HOẶC DÙNG EMAIL OTP</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {mode === "otp_request" ? (
        <form onSubmit={sendEmailOtp} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-subtle uppercase tracking-wider">
              Địa chỉ Email của bạn
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              autoComplete="email"
              placeholder="tenban@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60 dark:text-[#04101F] shadow-lg"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Gửi Mã OTP & Link Đăng Nhập
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtpCode} className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-mono text-subtle uppercase tracking-wider">
              Nhập mã OTP 6 số đã gửi tới {email}
            </label>
            <input
              required
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className={`${fieldClass} text-center font-mono text-lg tracking-[0.3em] font-bold`}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-xs sm:text-sm font-semibold text-black transition hover:bg-teal/90 disabled:opacity-60 shadow-lg"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Xác Nhận & Đăng Nhập
          </button>

          <button
            type="button"
            onClick={() => setMode("otp_request")}
            className="w-full text-center text-xs text-muted hover:underline font-mono"
          >
            Gửi lại mã hoặc đổi email khác
          </button>
        </form>
      )}

      {statusMsg && (
        <p className={`mt-4 text-xs font-mono ${status === "error" ? "text-amber-500" : "text-teal"}`}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
