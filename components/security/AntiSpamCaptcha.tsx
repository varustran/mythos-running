"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, CheckCircle2, Lock } from "lucide-react";

export function AntiSpamCaptcha({
  onVerify,
  locale = "vi",
}: {
  onVerify: (token: string | null) => void;
  locale?: string;
}) {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(5);
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const generatePuzzle = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    setNum1(a);
    setNum2(b);
    setUserAnswer("");
    setIsVerified(false);
    setError(false);
    onVerify(null);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const handleCheck = (val: string) => {
    setUserAnswer(val);
    const parsed = parseInt(val.trim(), 10);
    if (parsed === num1 + num2) {
      setIsVerified(true);
      setError(false);
      // Generate a client anti-bot verification token
      const token = `myso_sec_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      onVerify(token);
    } else {
      setIsVerified(false);
      if (val.trim().length > 0 && parsed !== num1 + num2) {
        setError(true);
      } else {
        setError(false);
      }
      onVerify(null);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-canvas/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent border border-accent/20">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="font-mono font-semibold text-ink flex items-center gap-1">
            {locale === "vi" ? "Bảo mật chống spam" : "Anti-spam Shield"}
          </span>
          <span className="text-[0.68rem] text-muted">
            {locale === "vi" ? `Tính: ${num1} + ${num2} = ?` : `Solve: ${num1} + ${num2} = ?`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isVerified ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-teal/15 border border-teal/40 px-3 py-1.5 font-mono text-[0.75rem] font-bold text-teal">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{locale === "vi" ? "Đã xác thực" : "Verified Human"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => handleCheck(e.target.value)}
              placeholder="Kết quả"
              className={`w-16 rounded-lg border bg-surface px-2.5 py-1 text-center font-mono text-xs font-bold text-ink focus:outline-none transition ${
                error ? "border-rose-500 text-rose-500" : "border-line focus:border-accent"
              }`}
            />
            <button
              type="button"
              onClick={generatePuzzle}
              className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface transition"
              title="Đổi câu hỏi khác"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
