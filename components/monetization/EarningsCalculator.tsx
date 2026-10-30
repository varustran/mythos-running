"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Calculator } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

export function EarningsCalculator({ locale }: { locale: Locale }) {
  const [views, setViews] = useState<number>(50000);
  const [rpmRate, setRpmRate] = useState<number>(4.5); // USD per 1000 views
  const [domainLabel, setDomainLabel] = useState<string>("Công nghệ & AI ($4.50 RPM)");

  const monthlyEarningsUsd = (views / 1000) * rpmRate;
  const annualEarningsUsd = monthlyEarningsUsd * 12;
  const monthlyEarningsVnd = monthlyEarningsUsd * 25400;

  const handleDomainChange = (rate: number, label: string) => {
    setRpmRate(rate);
    setDomainLabel(label);
  };

  return (
    <div className="card p-6 sm:p-8 border border-line bg-surface shadow-2xl space-y-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <Calculator className="h-5 w-5 text-accent" />
          <h3 className="font-display text-lg font-bold text-ink">
            {locale === "vi" ? "Máy Tính Ước Tính Doanh Thu Sáng Tạo (RPM)" : "Creator Earnings Simulator (RPM)"}
          </h3>
        </div>
        <span className="font-mono text-xs text-teal font-semibold">Tỷ giá tham chiếu: 25.400 đ/$</span>
      </div>

      {/* Select Domain */}
      <div>
        <label className="block font-mono text-xs text-subtle uppercase tracking-wider mb-2.5">
          Chọn lĩnh vực sáng tạo của bạn:
        </label>
        <div className="grid gap-2 sm:grid-cols-4">
          {[
            { label: "Công nghệ & AI", rate: 4.8 },
            { label: "Thể thao & Chạy bộ", rate: 4.2 },
            { label: "Sức khỏe & Biohacking", rate: 5.5 },
            { label: "Tài chính & Web3", rate: 7.2 },
          ].map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => handleDomainChange(d.rate, `${d.label} ($${d.rate} RPM)`)}
              className={`rounded-xl border p-3 text-xs font-semibold transition text-left ${
                rpmRate === d.rate
                  ? "border-accent bg-accent/10 text-accent shadow-sm"
                  : "border-line bg-canvas text-muted hover:border-line/80 hover:text-ink"
              }`}
            >
              <div>{d.label}</div>
              <div className="font-mono text-[0.68rem] text-subtle mt-0.5">${d.rate.toFixed(2)} / 1.000 view</div>
            </button>
          ))}
        </div>
      </div>

      {/* Views Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-mono text-xs text-subtle uppercase tracking-wider">
            Lượt xem ước tính mỗi tháng:
          </label>
          <span className="font-mono text-lg font-bold text-ink">
            {views.toLocaleString()} lượt xem
          </span>
        </div>
        <input
          type="range"
          min={5000}
          max={500000}
          step={5000}
          value={views}
          onChange={(e) => setViews(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
        <div className="flex justify-between text-[0.65rem] font-mono text-subtle mt-1">
          <span>5.000 views</span>
          <span>100.000 views</span>
          <span>250.000 views</span>
          <span>500.000 views</span>
        </div>
      </div>

      {/* Results Display */}
      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-line/60">
        <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4 text-center">
          <span className="font-mono text-xs text-teal font-semibold">Ước tính mỗi tháng (USD)</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-teal mt-1">
            ${monthlyEarningsUsd.toFixed(2)}
          </div>
          <span className="text-[0.68rem] text-muted font-mono">Dựa trên {domainLabel}</span>
        </div>

        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4 text-center">
          <span className="font-mono text-xs text-accent font-semibold">Quy đổi ước tính (VND)</span>
          <div className="font-mono text-xl sm:text-2xl font-extrabold text-ink mt-1">
            {Math.round(monthlyEarningsVnd).toLocaleString("vi-VN")} đ
          </div>
          <span className="text-[0.68rem] text-muted font-mono">Chuyển khoản trực tiếp</span>
        </div>

        <div className="rounded-2xl border border-line bg-canvas p-4 text-center">
          <span className="font-mono text-xs text-subtle font-semibold">Ước tính mỗi năm (USD)</span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-ink mt-1">
            ${annualEarningsUsd.toFixed(0)}
          </div>
          <span className="text-[0.68rem] text-muted font-mono">12 tháng tích lũy</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href={localePath(locale, "/blog/create")}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Bắt Đầu Đăng Bài & Kích Hoạt Kiếm Tiền Ngay
        </Link>
      </div>
    </div>
  );
}
