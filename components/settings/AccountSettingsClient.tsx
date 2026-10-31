"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  Image as ImageIcon,
  Check,
  Loader2,
  Save,
  ArrowLeft,
  Shield,
  LogOut,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadMediaFile } from "@/lib/storage";

const TOPIC_OPTIONS = [
  "Công nghệ & AI",
  "Lập trình & Kỹ nghệ",
  "Thiết kế & Nghệ thuật",
  "Khởi nghiệp & Kinh doanh",
  "Sách hay & Triết học",
  "Đời sống & Phát triển",
  "Chạy bộ & Điền kinh",
  "Khoa học Thể thao",
  "Bách khoa mở Myso",
];

export function AccountSettingsClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { user, profile, refreshProfile, logout, status } = useAuth();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setCoverUrl(profile.cover_url || "");
      if (profile.skills) {
        setSkillsText(profile.skills.join(", "));
      }
      if (profile.interests) {
        setSelectedInterests(profile.interests);
      }
    }
  }, [profile]);

  if (status === "guest") {
    return (
      <div className="container-page py-16 text-center max-w-md mx-auto">
        <div className="card p-8 border border-line bg-surface rounded-3xl space-y-4">
          <Lock className="mx-auto h-8 w-8 text-amber-500" />
          <h2 className="text-lg font-bold text-ink">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-muted">
            Vui lòng đăng nhập vào tài khoản Myso để tùy chỉnh cài đặt và thông tin cá nhân.
          </p>
          <Link
            href={localePath(locale, "/login")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await uploadMediaFile(file);
      if (res.url) {
        setAvatarUrl(res.url);
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await uploadMediaFile(file);
      if (res.url) {
        setCoverUrl(res.url);
      }
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setUploadingCover(false);
    }
  };

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccessMsg(false);

    try {
      const parsedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/profile/${encodeURIComponent(profile.username)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          bio,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          skills: parsedSkills,
          interests: selectedInterests,
        }),
      });

      if (res.ok) {
        await refreshProfile();
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-10">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={profile ? localePath(locale, `/u/${profile.username}`) : localePath(locale, "/")}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent font-semibold mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại trang cá nhân</span>
          </Link>
          <h1 className="font-display text-2xl font-black text-ink tracking-tight">
            Cài đặt Tài khoản & Hồ sơ
          </h1>
        </div>

        {profile && (
          <Link
            href={localePath(locale, `/u/${profile.username}`)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-ink hover:border-accent"
          >
            <span>Xem Profile Wall</span>
            <ExternalLink className="h-3.5 w-3.5 text-accent" />
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cover & Avatar Card */}
        <div className="card p-6 border border-line bg-surface rounded-3xl shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-ink">Hình ảnh đại diện & Ảnh bìa</h2>

          {/* Cover photo preview */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">Ảnh bìa (Cover)</label>
            <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-line bg-canvas">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/10 text-xs font-mono text-muted">
                  Chưa có ảnh bìa
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-xl bg-canvas/90 px-3 py-1.5 text-xs font-bold text-ink border border-line shadow-md hover:bg-surface"
              >
                {uploadingCover ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                )}
                <span>Thay ảnh bìa</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 pt-2">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-line bg-canvas shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/15 text-accent font-black text-2xl">
                  {fullName ? fullName.charAt(0).toUpperCase() : "M"}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-bold text-ink hover:border-accent hover:text-accent shadow-xs"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-accent" />
                )}
                <span>Tải ảnh đại diện</span>
              </button>
              <p className="text-[0.68rem] text-muted mt-1">
                Khuyến nghị ảnh vuông tỉ lệ 1:1, dung lượng dưới 5MB.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Identity & Bio Card */}
        <div className="card p-6 border border-line bg-surface rounded-3xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-ink">Thông tin hiển thị</h2>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Tên hiển thị (Display Name)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-accent"
              placeholder="Nhập tên hiển thị của bạn..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Tên người dùng (Username)
            </label>
            <input
              type="text"
              disabled
              value={profile ? `@${profile.username}` : ""}
              className="w-full rounded-xl border border-line bg-elevated/40 px-4 py-2.5 text-xs font-mono text-muted cursor-not-allowed"
            />
            <p className="text-[0.68rem] text-muted mt-1">
              Tên người dùng dùng để định danh URL hồ sơ và nhắc tên trong thảo luận.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Giới thiệu bản thân (Bio)
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-accent resize-none"
              placeholder="Giới thiệu đôi nét về bản thân, sở thích hoặc định hướng..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">
              Kỹ năng & Chuyên môn (ngăn cách bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs text-ink outline-none focus:border-accent"
              placeholder="Ví dụ: Fullstack Developer, Product Design, Viết lách"
            />
          </div>
        </div>

        {/* Interests & Topics Card */}
        <div className="card p-6 border border-line bg-surface rounded-3xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-ink">Chủ đề & Cộng đồng quan tâm</h2>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((topic) => {
              const active = selectedInterests.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleInterest(topic)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-accent text-white dark:text-[#04101F] shadow-sm font-bold"
                      : "border border-line bg-canvas text-muted hover:text-ink hover:border-accent/40"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {successMsg ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal">
              <Check className="h-4 w-4" />
              <span>Đã lưu thông tin cài đặt thành công!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold text-white dark:text-[#04101F] shadow-md hover:bg-accent/90 transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>

      {/* Account Security / Logout section */}
      <div className="mt-12 pt-8 border-t border-line/60 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-ink">Đăng xuất tài khoản</p>
          <p className="text-[0.68rem] text-muted">
            Kết thúc phiên làm việc trên trình duyệt này.
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
