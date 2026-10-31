"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  AtSign,
  Camera,
  Image as ImageIcon,
  BookOpen,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadMediaFile } from "@/lib/storage";

const INTEREST_TOPICS = [
  "Công nghệ & AI",
  "Lập trình & Kỹ nghệ phần mềm",
  "Chạy bộ & Điền kinh",
  "Khoa học Thể thao & Dinh dưỡng",
  "Đời sống & Phát triển bản thân",
  "Khám phá Khoa học & Vũ trụ",
  "Khởi nghiệp & Kinh doanh",
  "Sách hay & Triết học",
  "Bách khoa mở & Học thuật",
  "Thiết kế & Nghệ thuật số",
];

const COVER_GRADIENTS = [
  "from-accent/20 via-teal/15 to-elevated/40",
  "from-purple-500/20 via-pink-500/15 to-elevated/40",
  "from-amber-500/20 via-orange-500/15 to-elevated/40",
  "from-emerald-500/20 via-teal-500/15 to-elevated/40",
];

export function OnboardingFlow({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<number>(profile?.onboarding_step || 1);
  const [fullName, setFullName] = useState<string>(profile?.full_name || "");
  const [username, setUsername] = useState<string>(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState<string>(profile?.cover_url || "");
  const [bio, setBio] = useState<string>(profile?.bio || "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile?.interests || []);

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingStep, setSavingStep] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync initial values from profile once loaded
  useEffect(() => {
    if (profile) {
      if (profile.onboarding_completed) {
        // Already completed onboarding, go home
        router.replace(localePath(locale, "/"));
        return;
      }
      if (profile.onboarding_step && profile.onboarding_step > step) {
        setStep(profile.onboarding_step);
      }
      if (!fullName && profile.full_name) setFullName(profile.full_name);
      if (!username && profile.username) setUsername(profile.username);
      if (!avatarUrl && profile.avatar_url) setAvatarUrl(profile.avatar_url);
      if (!coverUrl && profile.cover_url) setCoverUrl(profile.cover_url);
      if (!bio && profile.bio) setBio(profile.bio);
      if (selectedInterests.length === 0 && profile.interests) setSelectedInterests(profile.interests);
    }
  }, [profile, router, locale]);

  // Username validation debounced
  useEffect(() => {
    if (!username.trim() || username.trim().length < 3) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus("available");
          setUsernameMessage("Tên định danh hợp lệ và có thể sử dụng");
        } else {
          setUsernameStatus("unavailable");
          setUsernameMessage(data.reason || "Tên không khả dụng");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Save progress to DB
  const saveProgress = async (nextStep: number, isCompleted = false) => {
    setSavingStep(true);
    try {
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboarding_step: nextStep,
          full_name: fullName.trim() || undefined,
          username: username.trim() || undefined,
          avatar_url: avatarUrl || undefined,
          cover_url: coverUrl || undefined,
          bio: bio.trim() || undefined,
          interests: selectedInterests,
          onboarding_completed: isCompleted,
        }),
      });
      await refreshProfile();
    } catch (err) {
      console.error("Save onboarding progress error:", err);
    } finally {
      setSavingStep(false);
    }
  };

  const handleNext = async () => {
    const nextStep = step + 1;
    await saveProgress(nextStep, false);
    setStep(nextStep);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    await saveProgress(8, true);
    router.replace(localePath(locale, "/"));
  };

  // Avatar Upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const item = await uploadMediaFile(file, "avatars");
      setAvatarUrl(item.url);
    } catch (err: any) {
      alert(`Lỗi tải ảnh đại diện: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cover Upload
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const item = await uploadMediaFile(file, "covers");
      setCoverUrl(item.url);
    } catch (err: any) {
      alert(`Lỗi tải ảnh bìa: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const toggleInterest = (topic: string) => {
    setSelectedInterests((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="container-page py-10 sm:py-16 max-w-2xl min-h-[75vh] flex flex-col justify-center">
      {/* Hidden file inputs */}
      <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarFile} />
      <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverFile} />

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-muted mb-2">
          <span className="font-bold text-accent">BƯỚC {step} / 8</span>
          <span>{Math.round((step / 8) * 100)}% HOÀN TẤT</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface border border-line overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Card */}
      <div className="card p-6 sm:p-10 border border-line bg-surface rounded-3xl shadow-xl space-y-6">
        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-5 text-center py-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal/40 bg-teal/10 text-teal text-xs font-mono font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              CHÀO MỪNG BẠN ĐẾN VỚI MYSO
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-black text-ink tracking-tight">
              Khởi tạo Hồ sơ Cộng đồng của bạn
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-md mx-auto">
              Myso là nền tảng cộng đồng hiện đại dành cho chia sẻ tri thức, viết bài chuẩn WYSIWYG, thảo luận đa chiều và bách khoa mở.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
              <div className="p-3.5 rounded-2xl border border-line bg-canvas space-y-1">
                <span className="text-sm font-bold text-ink">Bảng tin Hiện đại</span>
                <p className="text-xs text-muted">Trải nghiệm thảo luận theo chuỗi mượt mà.</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-line bg-canvas space-y-1">
                <span className="text-sm font-bold text-ink">Soạn thảo Trực quan</span>
                <p className="text-xs text-muted">WYSIWYG TipTap định dạng chữ đậm trực tiếp.</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-line bg-canvas space-y-1">
                <span className="text-sm font-bold text-ink">Bảo mật Tối đa</span>
                <p className="text-xs text-muted">Quyền hiển thị Public, Private, Unlisted chuẩn xác.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DISPLAY NAME */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                TÊN HIỂN THỊ
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Mọi người nên gọi bạn là gì?
            </h2>

            <p className="text-xs sm:text-sm text-muted">
              Tên hiển thị xuất hiện trên bài viết, bình luận và trang cá nhân của bạn. Bạn có thể thay đổi bất cứ lúc nào.
            </p>

            <div className="pt-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A, Alex Morgan..."
                className="w-full rounded-2xl border border-line bg-canvas px-4 py-3.5 text-base font-semibold text-ink placeholder:text-muted focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 3: USERNAME */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AtSign className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                TÊN ĐỊNH DANH DUY NHẤT
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Chọn @username duy nhất của bạn
            </h2>

            <p className="text-xs sm:text-sm text-muted">
              Được dùng để liên kết hồ sơ của bạn: <code className="text-accent">/vi/u/[username]</code> và nhắc tên bạn bằng @.
            </p>

            <div className="relative pt-2">
              <span className="absolute left-4 top-5 text-muted font-mono font-bold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="username"
                className="w-full rounded-2xl border border-line bg-canvas pl-9 pr-10 py-3.5 text-base font-mono font-semibold text-ink placeholder:text-muted focus:outline-none focus:border-accent"
                autoFocus
              />
              <div className="absolute right-4 top-5">
                {usernameStatus === "checking" && <Loader2 className="h-5 w-5 animate-spin text-muted" />}
                {usernameStatus === "available" && <Check className="h-5 w-5 text-teal" />}
                {usernameStatus === "unavailable" && <X className="h-5 w-5 text-rose-500" />}
              </div>
            </div>

            {usernameMessage && (
              <p
                className={`text-xs font-mono ${
                  usernameStatus === "available" ? "text-teal" : "text-rose-400"
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>
        )}

        {/* STEP 4: AVATAR */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Camera className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                ẢNH ĐẠI DIỆN
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Tải lên ảnh đại diện của bạn
            </h2>

            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
              Giúp bạn bè và cộng đồng nhận diện bạn dễ dàng hơn. Bạn có thể bỏ qua bước này nếu muốn.
            </p>

            <div className="pt-4 flex flex-col items-center">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative group h-28 w-28 rounded-full border-2 border-dashed border-line bg-canvas overflow-hidden flex items-center justify-center cursor-pointer hover:border-accent transition shadow-inner"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted group-hover:text-accent transition" />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition">
                  {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : "Đổi ảnh"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-line bg-canvas text-xs font-semibold text-ink hover:border-accent transition"
              >
                <Camera className="h-3.5 w-3.5 text-accent" />
                <span>{uploadingAvatar ? "Đang lưu ảnh..." : "Chọn ảnh từ thiết bị"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: COVER PHOTO */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                ẢNH BÌA TRANG CÁ NHÂN
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Tùy biến không gian trang cá nhân
            </h2>

            <p className="text-xs sm:text-sm text-muted">
              Chọn màu nền phong cách hoặc tải lên ảnh bìa tùy chỉnh của riêng bạn.
            </p>

            <div className="pt-2 space-y-4">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="h-36 w-full rounded-2xl border-2 border-dashed border-line bg-canvas overflow-hidden relative cursor-pointer group flex items-center justify-center hover:border-accent transition"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-muted group-hover:text-accent">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                    <span className="text-xs font-semibold">
                      {uploadingCover ? "Đang tải ảnh lên..." : "Bấm để chọn ảnh bìa từ máy tính"}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Gradient Presets */}
              <div>
                <span className="text-xs font-mono text-subtle block mb-2">Hoặc chọn màu gradient mặc định:</span>
                <div className="grid grid-cols-4 gap-2">
                  {COVER_GRADIENTS.map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverUrl("")}
                      className={`h-12 rounded-xl border border-line bg-gradient-to-r ${grad} hover:scale-105 transition`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: BIO */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                TIỂU SỬ BẢN THÂN
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Hãy viết vài dòng giới thiệu về bạn
            </h2>

            <p className="text-xs sm:text-sm text-muted">
              Chia sẻ sở thích, chuyên môn hoặc những gì bạn quan tâm để kết nối với những người cùng chí hướng.
            </p>

            <div className="pt-2">
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="VD: Yêu thích công nghệ phần mềm, chạy bộ cự ly dài và nghiên cứu hệ thống phân tán..."
                className="w-full rounded-2xl border border-line bg-canvas p-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent leading-relaxed"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 7: INTERESTS */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                SỞ THÍCH & CHỦ ĐỀ
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-ink">
              Bạn quan tâm đến những lĩnh vực nào?
            </h2>

            <p className="text-xs sm:text-sm text-muted">
              Chọn ít nhất 1 chủ đề để Myso cá nhân hóa bảng tin bài viết phù hợp cho bạn.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {INTEREST_TOPICS.map((topic) => {
                const isSelected = selectedInterests.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleInterest(topic)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isSelected
                        ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
                        : "border border-line bg-canvas text-muted hover:border-accent hover:text-ink"
                    }`}
                  >
                    {isSelected && <Check className="inline h-3.5 w-3.5 mr-1" />}
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: COMPLETION */}
        {step === 8 && (
          <div className="space-y-5 text-center py-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal/15 text-teal border border-teal/40 mx-auto shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="font-display text-3xl font-black text-ink tracking-tight">
              Hồ sơ của bạn đã sẵn sàng!
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-md mx-auto">
              Chào mừng bạn đến với cộng đồng Myso. Bạn đã hoàn tất thiết lập hồ sơ và có thể bắt đầu đăng bài, thảo luận và kết nối ngay bây giờ.
            </p>

            <div className="p-4 rounded-2xl border border-line bg-canvas max-w-sm mx-auto flex items-center gap-3 text-left">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-line bg-surface shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-muted" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-display text-sm font-bold text-ink truncate block">
                  {fullName || "Thành viên Myso"}
                </span>
                <span className="font-mono text-xs text-subtle truncate block">
                  @{username || "user"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="pt-6 border-t border-line flex items-center justify-between gap-3">
          {step > 1 && step < 8 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={savingStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-line bg-canvas text-xs font-semibold text-ink hover:border-accent transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {/* Allow skip on optional steps */}
            {[4, 5, 6].includes(step) && (
              <button
                type="button"
                onClick={handleNext}
                disabled={savingStep}
                className="px-3.5 py-2 text-xs font-semibold text-muted hover:text-ink transition"
              >
                Bỏ qua
              </button>
            )}

            {step < 8 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={savingStep || (step === 3 && usernameStatus === "unavailable")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold shadow-md hover:bg-accent/90 transition active:scale-95 disabled:opacity-40"
              >
                {savingStep ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Tiếp tục</span>
                )}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={savingStep}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-white font-bold text-sm shadow-md hover:bg-teal/90 transition active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>Khám phá Bảng tin Myso</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
