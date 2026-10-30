"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  MessageSquare,
  AlertTriangle,
  Search,
  Flag,
  Trash2,
  Check,
  X,
  Lock,
  Sparkles,
  FileText,
  BadgeCheck,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { inspectContent } from "@/lib/moderation";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  verified: boolean;
  role: string;
  created_at: string;
}

interface PostReport {
  id: string;
  post_id: string;
  reporter_ip: string;
  reason: string;
  details?: string;
  status: string;
  created_at: string;
}

export function AdminManagerClient({
  initialUsers,
  initialReports,
  stats,
  locale,
}: {
  initialUsers: UserProfile[];
  initialReports: PostReport[];
  stats: {
    usersCount: number;
    postsCount: number;
    commentsCount: number;
    reportsCount: number;
  };
  locale: Locale;
}) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [reports, setReports] = useState<PostReport[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "moderation" | "keywords">("users");

  // Admin email confirmation
  const [adminEmailInput, setAdminEmailInput] = useState("chuitv1907@gmail.com");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Keyword tester
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  // Toggle verified badge
  const handleToggleVerified = async (user: UserProfile) => {
    setActionMsg(null);
    const newStatus = !user.verified;

    try {
      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          verify_status: newStatus,
          requester_email: adminEmailInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMsg(`Lỗi: ${data.error}`);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, verified: newStatus } : u))
        );
        setActionMsg(`Đã ${newStatus ? "cấp" : "thu hồi"} Tích xanh cho @${user.username} thành công!`);
      }
    } catch {
      setActionMsg("Lỗi kết nối máy chủ quản trị.");
    }
  };

  const handleTestKeyword = () => {
    const result = inspectContent(testText);
    setTestResult(result);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Admin Identity Badge */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="https://mythos-running.vercel.app/icon.svg"
              alt="Myso Admin"
              className="h-16 w-16 rounded-2xl p-2 bg-black border border-line"
            />
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-white shadow">
              <BadgeCheck className="h-4 w-4" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">Myso Admin Manager</h1>
              <span className="rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
                ROOT ADMIN
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Tài khoản quản trị viên tối cao: <code className="text-ink font-semibold">chuitv1907@gmail.com</code> (@myso)
            </p>
          </div>
        </div>

        {/* Admin Email Verifier Box */}
        <div className="rounded-2xl border border-line bg-canvas p-3 text-xs max-w-xs">
          <span className="text-subtle font-mono block mb-1">Xác thực quyền quản trị viên:</span>
          <input
            type="email"
            value={adminEmailInput}
            onChange={(e) => setAdminEmailInput(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-1.5 font-mono text-ink text-xs focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {actionMsg && (
        <div className="rounded-2xl border border-teal/40 bg-teal/10 p-4 text-xs font-mono text-teal flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng người dùng", value: stats.usersCount, icon: Users, color: "text-accent" },
          { label: "Bài viết mạng xã hội", value: stats.postsCount, icon: Sparkles, color: "text-purple-400" },
          { label: "Bình luận lưu trữ", value: stats.commentsCount, icon: MessageSquare, color: "text-teal" },
          { label: "Hàng đợi báo cáo", value: stats.reportsCount, icon: Flag, color: "text-rose-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5 border border-line bg-surface">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="font-display text-2xl font-bold text-ink">{stat.value}</span>
              </div>
              <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-wider text-subtle">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-line flex items-center gap-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "users" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Quản Lý Người Dùng & Cấp Tích Xanh
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "moderation" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Hàng Đợi Kiểm Duyệt Báo Cáo ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeTab === "keywords" ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Bộ Lọc Từ Khóa Tự Động
        </button>
      </div>

      {/* TAB 1: USERS & VERIFIED BADGES */}
      {activeTab === "users" && (
        <div className="card p-6 border border-line bg-surface space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display text-lg font-bold text-ink">Danh sách thành viên Myso</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm username, email, tên..."
                className="w-full rounded-xl border border-line bg-canvas pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="overflow-x-auto divide-y divide-line">
            {filteredUsers.length === 0 ? (
              <p className="text-center py-8 font-mono text-xs text-muted">
                Không tìm thấy tài khoản phù hợp.
              </p>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatar_url ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={u.username}
                      className="h-10 w-10 rounded-full object-cover border border-line"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-ink">{u.full_name}</span>
                        {u.verified && <CheckCircle2 className="h-4 w-4 text-accent fill-accent text-white" />}
                        <span className="font-mono text-xs text-subtle">@{u.username || "user"}</span>
                      </div>
                      <span className="font-mono text-xs text-muted">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVerified(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                        u.verified
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                          : "bg-accent text-white dark:text-[#04101F] hover:opacity-90"
                      }`}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      <span>{u.verified ? "Thu Hồi Tích Xanh" : "Cấp Tích Xanh"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS & MODERATION */}
      {activeTab === "moderation" && (
        <div className="card p-6 border border-line bg-surface space-y-4">
          <h3 className="font-display text-lg font-bold text-ink">Hàng đợi xử lý vi phạm</h3>
          {reports.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-muted">
              Hiện tại không có bài viết nào bị báo cáo vi phạm. Hệ thống hoạt động an toàn!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-canvas p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 font-mono text-[0.65rem] font-bold text-rose-500">
                        Lý do: {r.reason}
                      </span>
                      <span className="text-[0.68rem] font-mono text-subtle">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-ink font-mono">Mã bài viết: {r.post_id}</p>
                    {r.details && <p className="text-xs text-muted mt-1 italic">"{r.details}"</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReports((prev) => prev.filter((item) => item.id !== r.id))}
                      className="px-3 py-1.5 rounded-xl border border-line bg-surface text-xs font-semibold text-muted hover:text-ink"
                    >
                      Bỏ qua báo cáo
                    </button>
                    <button
                      type="button"
                      onClick={() => setReports((prev) => prev.filter((item) => item.id !== r.id))}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 shadow-xs"
                    >
                      Khóa & Xóa bài vi phạm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KEYWORDS MODERATION ENGINE */}
      {activeTab === "keywords" && (
        <div className="card p-6 border border-line bg-surface space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Bộ lọc từ khóa tự động</h3>
            <p className="text-xs text-muted mt-1">
              Hệ thống tự động chuẩn hóa dấu tiếng Việt và phát hiện các cụm từ lừa đảo, cờ bạc, vũ khí, chất cấm hoặc bạo lực để tự động ngăn chặn đăng bài.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-canvas p-4 space-y-3">
            <span className="font-mono text-xs font-bold text-ink block">Thử nghiệm bộ lọc từ khóa:</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Nhập thử văn bản (ví dụ: 'kèo tài xỉu uy tín' hoặc 'chế tạo bom')..."
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleTestKeyword}
                className="px-4 py-2 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-semibold"
              >
                Kiểm tra
              </button>
            </div>

            {testResult && (
              <div
                className={`rounded-xl p-3 text-xs font-mono ${
                  testResult.isAllowed
                    ? "border border-teal/40 bg-teal/10 text-teal"
                    : "border border-rose-500/40 bg-rose-500/10 text-rose-500"
                }`}
              >
                {testResult.isAllowed ? (
                  <span>Nội dung an toàn, không chứa từ khóa vi phạm tiêu chuẩn cộng đồng.</span>
                ) : (
                  <span>CẢNH BÁO: Phát hiện vi phạm [{testResult.violationCategory}] với từ khóa: "{testResult.flaggedWord}"!</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
