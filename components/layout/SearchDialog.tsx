"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, CornerDownLeft, Sparkles, Flame, MessageSquare, StickyNote, ShieldCheck, User, Settings } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  description: string;
  href: string;
  icon: any;
  category: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

export function SearchDialog({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<Item[]>(() => {
    return [
      {
        title: "Bảng tin Mạng xã hội",
        description: "Khám phá bài viết, tương tác, like, bình luận và thảo luận đa chiều",
        href: "/",
        icon: Flame,
        category: "Khám phá",
      },
      {
        title: "Bách khoa Myso Wiki",
        description: "Hệ thống tri thức bách khoa mở chuẩn Wikipedia",
        href: "/wiki",
        icon: Sparkles,
        category: "Wiki",
      },
      {
        title: "Phòng Chat mã hóa E2EE",
        description: "Trò chuyện nhóm và tin nhắn trực tiếp bảo mật",
        href: "/chat",
        icon: MessageSquare,
        category: "Giao tiếp",
      },
      {
        title: "Ghi chú nhanh bảo mật",
        description: "Soạn thảo và lưu trữ ghi chú mã hóa",
        href: "/notes",
        icon: StickyNote,
        category: "Công cụ",
      },
      {
        title: "Thiết lập Hồ sơ Onboarding",
        description: "Cập nhật display name, @username, avatar, bio, và chủ đề yêu thích",
        href: "/onboarding",
        icon: User,
        category: "Tài khoản",
      },
      {
        title: "Cài đặt Tài khoản & Quyền riêng tư",
        description: "Tùy chỉnh thông tin cá nhân và cấu hình bảo mật",
        href: "/settings",
        icon: Settings,
        category: "Tài khoản",
      },
      {
        title: "Tiêu chuẩn Cộng đồng & Pháp lý",
        description: "Quy chuẩn nội dung, chống spam và bảo vệ người dùng",
        href: "/legal/standards",
        icon: ShieldCheck,
        category: "Chính sách",
      },
    ];
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return index;
    return index.filter((item) =>
      normalize(`${item.title} ${item.description} ${item.category}`).includes(q)
    );
  }, [query, index]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-16 sm:pt-24 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="h-5 w-5 text-accent" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm trang, wiki, tính năng trên Myso..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted hover:text-ink text-xs"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded-lg border border-line bg-canvas px-2 py-0.5 text-[0.65rem] font-mono text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              Không tìm thấy kết quả phù hợp cho &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-canvas transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink group-hover:text-accent transition truncate">
                          {item.title}
                        </span>
                        <span className="rounded-full bg-elevated px-2 py-0.5 text-[0.6rem] font-mono text-muted">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[0.68rem] text-muted truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <CornerDownLeft className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
