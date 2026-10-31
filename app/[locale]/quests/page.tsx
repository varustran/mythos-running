"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Gift,
  Share2,
  PlayCircle,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Coins,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { localePath, type Locale } from "@/lib/i18n/settings";

interface QuestItem {
  id: string;
  type: string;
  title: string;
  description: string;
  reward: number;
  icon: any;
  actionText: string;
  isCompleted?: boolean;
}

export default function QuestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/quests/status");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.todayQuests)) {
            setCompletedQuests(data.todayQuests.map((q: any) => q.quest_type));
          }
        }
      } catch (err) {
        console.error("Failed to load quests:", err);
      }
    }
    loadStatus();
  }, []);

  const handleClaim = async (questType: string) => {
    if (!user) {
      setNotification({
        type: "error",
        message: "Vui lòng đăng nhập để nhận thưởng nhiệm vụ.",
      });
      return;
    }

    if (questType === "watch_ad") {
      setWatchingAd(true);
      setAdCountdown(5);
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setWatchingAd(false);
            processClaim("watch_ad");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    if (questType === "share_post") {
      navigator.clipboard.writeText(window.location.origin);
      setNotification({
        type: "success",
        message: "Đã sao chép liên kết chia sẻ! Đang nhận thưởng...",
      });
    }

    await processClaim(questType);
  };

  const processClaim = async (questType: string) => {
    setClaiming(questType);
    try {
      const res = await fetch("/api/quests/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quest_type: questType }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: "error", message: data.error || "Nhận thưởng thất bại." });
      } else {
        setCompletedQuests((prev) => [...prev, questType]);
        setNotification({
          type: "success",
          message: `Chúc mừng! Bạn đã nhận thành công +${data.reward} Myso Points.`,
        });
        await refreshProfile();
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Lỗi hệ thống." });
    } finally {
      setClaiming(null);
    }
  };

  const quests: QuestItem[] = [
    {
      id: "daily_checkin",
      type: "daily_checkin",
      title: "Điểm danh hàng ngày",
      description: "Nhận điểm thưởng chuyên cần mỗi ngày khi đăng nhập vào Myso.",
      reward: 50,
      icon: Gift,
      actionText: "Điểm danh ngay",
    },
    {
      id: "share_post",
      type: "share_post",
      title: "Chia sẻ liên kết Myso",
      description: "Sao chép và lan tỏa liên kết mạng lưới tri thức Myso cho bạn bè.",
      reward: 20,
      icon: Share2,
      actionText: "Chia sẻ & Nhận điểm",
    },
    {
      id: "watch_ad",
      type: "watch_ad",
      title: "Xem nội dung tài trợ",
      description: "Hỗ trợ tác giả & nền tảng bằng việc xem thông điệp tài trợ 5 giây.",
      reward: 30,
      icon: PlayCircle,
      actionText: "Xem 5 giây",
    },
    {
      id: "first_post",
      type: "first_post",
      title: "Đóng góp bài viết tri thức",
      description: "Chia sẻ mã nguồn, AI prompts hoặc bài phân tích giá trị cho cộng đồng.",
      reward: 100,
      icon: Award,
      actionText: "Viết bài ngay",
    },
  ];

  return (
    <div className="w-full flex flex-col divide-y divide-[#27272A]/70">
      {/* Header Banner */}
      <div className="p-6 flex flex-col gap-4 bg-gradient-to-b from-[#18181B]/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#FAFAFA] tracking-tight">
                Trung Tâm Nhiệm Vụ
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Hoàn thành nhiệm vụ mỗi ngày để tích lũy Myso Points mở khóa tri thức
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end p-3 rounded-xl bg-[#121215] border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400/80 font-mono uppercase">
              Điểm của bạn
            </span>
            <div className="flex items-center gap-1.5 text-lg font-black text-emerald-400">
              <span>🪙</span>
              <span>{profile?.points_balance || 0} pts</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-[#A1A1AA] hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Quests List */}
      <div className="p-4 sm:p-6 flex flex-col gap-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#71717A] px-1">
          Nhiệm vụ hôm nay
        </h2>

        {quests.map((q) => {
          const isDone = completedQuests.includes(q.type);
          const isCurrentClaiming = claiming === q.type;
          const Icon = q.icon;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? "bg-[#121215]/60 border-[#27272A]/50 opacity-80"
                  : "bg-[#121215] border-[#27272A] hover:border-[#3F3F46]"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    isDone
                      ? "bg-[#18181B] border-[#27272A] text-[#71717A]"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#FAFAFA]">{q.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      +{q.reward} pts
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">{q.description}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                {isDone ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã nhận hôm nay</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(q.type)}
                    disabled={isCurrentClaiming}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isCurrentClaiming ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>{q.actionText}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe-by-Design Economy Guide */}
      <div className="p-6 flex flex-col gap-3 bg-[#121215]/40">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Nguyên tắc kinh tế Safe-by-Design 100%</span>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Myso Points là đơn vị điểm thưởng sinh thái nội bộ dành cho độc giả. Điểm tích lũy có thể dùng để mở khóa các bài viết chuyên sâu, prompt AI và thư viện code được tác giả chia sẻ với tùy chọn Points. Điểm thưởng không thể chuyển nhượng hoặc rút thành tiền mặt dưới mọi hình thức, tuân thủ tuyệt đối quy định pháp lý quốc tế.
        </p>
      </div>

      {/* Sponsored Ad Watch Modal */}
      {watchingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#121215] border border-[#27272A] shadow-2xl flex flex-col gap-4 text-center">
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto w-fit">
              <PlayCircle className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#FAFAFA]">
              Đang xem thông điệp tài trợ Myso Network
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Cảm ơn bạn đã đồng hành cùng cộng đồng tri thức mã nguồn mở Myso.
            </p>
            <div className="text-2xl font-black text-amber-400 font-mono py-2">
              00:0{adCountdown}s
            </div>
            <div className="w-full bg-[#18181B] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000"
                style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
