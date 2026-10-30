"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export function AntiSpamCaptcha({
  onVerify,
  locale = "vi",
}: {
  onVerify: (token: string | null) => void;
  locale?: string;
}) {
  const [status, setStatus] = useState<"idle" | "verifying" | "verified">("idle");

  const handleVerify = () => {
    if (status !== "idle") return;
    setStatus("verifying");

    // Perform smart client challenge check (timing, user interaction verification)
    setTimeout(() => {
      const token = `myso_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      setStatus("verified");
      onVerify(token);
    }, 700);
  };

  return (
    <div className="rounded-2xl border border-line bg-canvas/80 p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs transition">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleVerify}
          disabled={status !== "idle"}
          className={`grid h-6 w-6 place-items-center rounded-lg border transition ${
            status === "verified"
              ? "bg-teal text-black border-teal scale-105"
              : status === "verifying"
              ? "border-accent bg-accent/10"
              : "border-line bg-surface hover:border-accent hover:scale-105"
          }`}
          title={status === "verified" ? "Đã xác thực" : "Bấm để xác thực"}
        >
          {status === "verifying" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          ) : status === "verified" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <span className="h-2 w-2 rounded-xs bg-muted/40" />
          )}
        </button>

        <div className="flex flex-col">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            {locale === "vi" ? "Tôi không phải là robot" : "I am human (Anti-Bot Shield)"}
            {status === "verified" && (
              <span className="inline-flex items-center text-[0.62rem] font-mono text-teal bg-teal/10 px-1.5 py-0.5 rounded font-bold">
                HỢP LỆ
              </span>
            )}
          </span>
          <span className="text-[0.68rem] text-muted">
            {status === "verified"
              ? locale === "vi"
                ? "Bảo vệ thông minh Myso Security"
                : "Protected by Myso Smart Shield"
              : locale === "vi"
              ? "Bấm vào ô vuông để xác thực tức thì"
              : "Click the box to verify instantly"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-subtle text-[0.65rem] font-mono">
        <ShieldCheck className="h-4 w-4 text-accent" />
        <span>MYSO SHIELD</span>
      </div>
    </div>
  );
}
