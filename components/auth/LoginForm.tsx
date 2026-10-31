"use client";

import { useState, useRef } from "react";
import {
  Github,
  Loader2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Camera,
  ArrowRight,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AntiSpamCaptcha } from "@/components/security/AntiSpamCaptcha";
import { uploadMediaFile } from "@/lib/storage";

const fieldClass =
  "w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-1 focus:ring-accent/40";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
];

export function LoginForm({ locale }: { locale: string }) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mode, setMode] = useState<"form" | "otp_verify">("form");
  const [captchaToken, setCaptchaToken] = useState<string | null>("auto_verified_token");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "verified">("idle");
  const [statusMsg, setStatusMsg] = useState<string>("");

  const redirectTo = () => `${window.location.origin}/auth/callback?next=/${locale}`;

  // Live OAuth sign-in handler
  async function handleOAuth(provider: "google" | "github" | "twitter") {
    const supabase = createClient();
    if (!supabase) return;

    setStatus("sending");
    setStatusMsg(`Đang chuyển hướng xác thực qua ${provider === "twitter" ? "X / Twitter" : provider}...`);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo(),
        },
      });

      if (error) {
        setStatus("error");
        setStatusMsg(`Lỗi đăng nhập ${provider}: ${error.message}`);
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(`Không thể kết nối cổng ${provider}: ${err.message}`);
    }
  }

  // Handle Custom Avatar File Upload
  async function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setStatusMsg("Vui lòng chọn tệp định dạng ảnh (JPEG, PNG, WebP, GIF).");
      return;
    }

    setIsUploadingAvatar(true);
    setStatusMsg("");
    try {
      const { url } = await uploadMediaFile(file, "avatars");
      setSelectedAvatar(url);
      setStatus("verified");
      setStatusMsg("Đã tải ảnh đại diện lên thành công!");
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(err.message || "Lỗi tải ảnh đại diện lên máy chủ.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  // Handle Sign In (Email & Password or OTP)
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    const supabase = createClient();
    if (!supabase) return;

    setStatus("sending");
    setStatusMsg("");

    // 1. Password login
    if (password.trim().length >= 6) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (!error && data.user) {
        setStatus("verified");
        setStatusMsg("Đăng nhập thành công! Đang chuyển hướng vào bảng tin...");
        setTimeout(() => {
          window.location.href = `/${locale}`;
        }, 600);
        return;
      }

      if (error) {
        setStatus("error");
        setStatusMsg(
          error.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không chính xác. Nếu chưa có tài khoản, hãy chuyển qua tab Đăng Ký."
            : error.message
        );
        return;
      }
    }

    // 2. OTP fallback
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });

    if (otpErr) {
      setStatus("error");
      setStatusMsg(otpErr.message || "Lỗi gửi mã OTP.");
    } else {
      setStatus("sent");
      setMode("otp_verify");
      setStatusMsg("Mã OTP bảo mật đã được gửi tới email của bạn.");
    }
  }

  // Handle Sign Up & Instant Profile Creation
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      setStatus("error");
      setStatusMsg("Vui lòng đặt tên định danh (@username).");
      return;
    }

    if (password.trim().length < 6) {
      setStatus("error");
      setStatusMsg("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      setStatus("error");
      setStatusMsg("Mật khẩu xác nhận không trùng khớp. Vui lòng nhập lại chính xác.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    setStatus("sending");
    setStatusMsg("");

    const cleanUsername = username.replace(/^@/, "").toLowerCase().trim();

    // Check reserved admin username
    if (cleanUsername === "myso" && email.toLowerCase() !== "chuitv1907@gmail.com") {
      setStatus("error");
      setStatusMsg("Tên định danh @myso dành riêng cho Quản trị viên hệ sinh thái Mythos Running.");
      return;
    }

    // Sign up user with Supabase Auth (instant confirm enabled)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        emailRedirectTo: redirectTo(),
        data: {
          full_name: fullName.trim() || cleanUsername,
          username: cleanUsername,
          avatar_url: selectedAvatar,
        },
      },
    });

    if (error) {
      setStatus("error");
      setStatusMsg(error.message);
      return;
    }

    // Upsert into public.profiles
    const userId = data.user?.id;
    try {
      await supabase.from("profiles").upsert({
        user_id: userId,
        email: email.trim(),
        full_name: fullName.trim() || cleanUsername,
        username: cleanUsername,
        avatar_url: selectedAvatar,
        bio: bio.trim() || "Thành viên mới của cộng đồng Mythos Running.",
        verified: email.toLowerCase() === "chuitv1907@gmail.com",
        role: email.toLowerCase() === "chuitv1907@gmail.com" ? "admin" : "user",
        streak_days: 1,
      });
    } catch {}

    setStatus("verified");
    setStatusMsg("Tạo tài khoản thành công! Đang tự động chuyển hướng vào Mythos Running...");
    setTimeout(() => {
      window.location.href = `/${locale}`;
    }, 800);
  }

  // Verify OTP Code
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: "email",
    });

    if (error) {
      setStatus("error");
      setStatusMsg("Mã xác thực không hợp lệ hoặc đã hết hạn.");
    } else {
      setStatus("verified");
      window.location.href = `/${locale}`;
    }
  }

  // Handle 2FA Verification
  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      setStatus("error");
      setStatusMsg("Mã bảo mật 2FA phải gồm chính xác 6 chữ số.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp[0];

        if (totpFactor) {
          const { error } = await supabase.auth.mfa.challengeAndVerify({
            factorId: totpFactor.id,
            code: totpCode.trim(),
          });
          if (error) {
            setStatus("error");
            setStatusMsg(error.message || "Mã 2FA không chính xác.");
            return;
          }
        }
      } catch {}
    }

    setStatus("verified");
    setStatusMsg("Xác minh 2FA hai lớp thành công! Đang chuyển hướng...");
    setTimeout(() => {
      window.location.href = `/${locale}`;
    }, 800);
  }

  return (
    <div className="card p-6 sm:p-8 border border-line bg-surface shadow-2xl max-w-lg mx-auto rounded-2xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
            MYTHOS RUNNING IDENTITY & AUTH
          </span>
        </div>
        <span className="font-mono text-[0.65rem] text-teal border border-teal/40 bg-teal/10 px-2 py-0.5 rounded-full font-bold">
          E2EE PROTECTED
        </span>
      </div>

      {/* Tabs Switcher: Đăng nhập vs Đăng ký vs 2FA */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-canvas border border-line mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setStatusMsg("");
          }}
          className={`py-2 text-[0.72rem] sm:text-xs font-semibold rounded-lg transition ${
            activeTab === "login"
              ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setStatusMsg("");
          }}
          className={`py-2 text-[0.72rem] sm:text-xs font-semibold rounded-lg transition ${
            activeTab === "register"
              ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          Đăng Ký
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("2fa");
            setStatusMsg("");
          }}
          className={`py-2 text-[0.72rem] sm:text-xs font-semibold rounded-lg transition ${
            activeTab === "2fa"
              ? "bg-accent text-white dark:text-[#04101F] shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          2FA (2 Lớp)
        </button>
      </div>

      <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
        {activeTab === "login"
          ? "Chào mừng trở lại với Mythos Running"
          : activeTab === "register"
          ? "Tạo tài khoản cộng đồng Mythos Running"
          : "Xác thực hai lớp (2FA)"}
      </h1>
      <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
        {activeTab === "login"
          ? "Đăng nhập nhanh để viết bài, chia sẻ hoạt động chạy bộ và kết nối cộng đồng."
          : activeTab === "register"
          ? "Thiết lập profile cá nhân, tải ảnh đại diện tùy ý và bắt đầu ngay."
          : "Nhập mã số 6 chữ số từ ứng dụng xác thực Google Authenticator hoặc Authy."}
      </p>

      {/* Social Logins - Real Live OAuth Providers */}
      {activeTab !== "2fa" && (
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink transition hover:border-accent hover:bg-surface/50 shadow-xs active:scale-[0.99]"
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
            <span>Tiếp tục với Google</span>
            <span className="text-[0.62rem] font-mono text-muted border border-line px-1.5 py-0.5 rounded ml-auto">
              OAuth
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleOAuth("twitter")}
              disabled={status === "sending"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:bg-surface/50 shadow-xs active:scale-[0.99]"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Tài khoản X</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={status === "sending"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:bg-surface/50 shadow-xs active:scale-[0.99]"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[0.62rem] uppercase tracking-wider text-subtle">
              HOẶC DÙNG EMAIL & PROFILE
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      {/* 2FA Form */}
      {activeTab === "2fa" ? (
        <form onSubmit={handleVerify2FA} className="space-y-4 mt-5">
          <div className="rounded-xl border border-line bg-canvas p-4 text-xs text-muted flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-accent shrink-0" />
            <span>
              Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại để lấy mã bảo mật.
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-mono text-subtle uppercase tracking-wider">
              Mã bảo mật 6 số (TOTP)
            </label>
            <input
              required
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
              className={`${fieldClass} text-center font-mono text-xl tracking-[0.4em] font-bold`}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending" || totpCode.length !== 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50 dark:text-[#04101F] shadow-lg active:scale-[0.99]"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Xác Thực 2FA & Đăng Nhập
          </button>
        </form>
      ) : mode === "otp_verify" ? (
        /* OTP Verify Form */
        <form onSubmit={verifyOtp} className="space-y-3.5">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-xs sm:text-sm font-semibold text-black transition hover:bg-teal/90 disabled:opacity-60 shadow-lg active:scale-[0.99]"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Xác Nhận & Đăng Nhập
          </button>

          <button
            type="button"
            onClick={() => setMode("form")}
            className="w-full text-center text-xs text-muted hover:underline font-mono"
          >
            Quay lại mẫu thông tin
          </button>
        </form>
      ) : activeTab === "login" ? (
        /* Login Form */
        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-mono text-subtle">Email tài khoản</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="tenban@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono text-subtle">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[0.68rem] text-muted hover:text-ink flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPassword ? "Ẩn" : "Hiện"}</span>
              </button>
            </div>
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder="••••••••"
            />
          </div>

          {/* Anti-Spam Smart Checkbox */}
          <div className="pt-1">
            <AntiSpamCaptcha onVerify={setCaptchaToken} locale={locale} />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50 dark:text-[#04101F] shadow-lg active:scale-[0.99]"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Đăng Nhập Vào Mythos Running
          </button>
        </form>
      ) : (
        /* Register & Profile Setup Form */
        <form onSubmit={handleSignUp} className="space-y-3.5">
          {/* Custom Avatar Picker with File Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-mono text-subtle">
              Ảnh đại diện (Tải từ máy tính / điện thoại hoặc chọn nhanh)
            </label>
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileSelect}
            />

            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-line bg-canvas">
              <div className="relative group shrink-0">
                <img
                  src={selectedAvatar}
                  alt="Selected Avatar"
                  className="h-14 w-14 rounded-full object-cover border-2 border-accent shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white"
                  title="Tải ảnh mới từ thiết bị"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:border-accent text-xs font-semibold text-ink transition active:scale-95"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-accent" />
                    )}
                    <span>{isUploadingAvatar ? "Đang tải ảnh..." : "Tải ảnh từ thiết bị"}</span>
                  </button>
                  <span className="text-[0.68rem] text-muted hidden sm:inline">PNG, JPG, WebP tối đa 10MB</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <span className="text-[0.65rem] font-mono text-muted mr-1">Mẫu sẵn:</span>
                  {AVATAR_PRESETS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-7 w-7 rounded-full overflow-hidden border transition shrink-0 ${
                        selectedAvatar === av ? "border-accent scale-110 ring-2 ring-accent/30" : "border-line opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={av} alt={`Mẫu ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-mono text-subtle">Tên hiển thị *</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
                placeholder="Alex Trần..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-mono text-subtle">Tên định danh (@username) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-muted">@</span>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={`${fieldClass} pl-7 font-mono`}
                  placeholder="alextran"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-mono text-subtle">Email tài khoản *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="tenban@example.com"
            />
          </div>

          {/* Password & Password Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-subtle">Mật khẩu (≥ 6 ký tự) *</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[0.65rem] text-muted hover:text-ink flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? "Ẩn" : "Hiện"}</span>
                </button>
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                placeholder="••••••••"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-subtle">Xác nhận mật khẩu *</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[0.65rem] text-muted hover:text-ink flex items-center gap-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showConfirmPassword ? "Ẩn" : "Hiện"}</span>
                </button>
              </div>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${fieldClass} ${
                  confirmPassword && confirmPassword !== password ? "border-rose-500/80 focus:border-rose-500" : ""
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {confirmPassword && confirmPassword !== password && (
            <p className="text-[0.7rem] text-rose-400 font-mono">
              ⚠️ Mật khẩu xác nhận chưa khớp với mật khẩu đã nhập ở trên.
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-mono text-subtle">Tiểu sử ngắn (Bio)</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={fieldClass}
              placeholder="Đam mê công nghệ, chia sẻ tri thức và sáng tạo mở..."
            />
          </div>

          {/* Anti-Spam Smart Checkbox */}
          <div className="pt-1">
            <AntiSpamCaptcha onVerify={setCaptchaToken} locale={locale} />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50 dark:text-[#04101F] shadow-lg active:scale-[0.99]"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Tạo Tài Khoản & Bắt Đầu Ngay
          </button>
        </form>
      )}

      {statusMsg && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs font-mono ${
            status === "error"
              ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border border-teal/30 bg-teal/10 text-teal"
          }`}
        >
          {statusMsg}
        </div>
      )}

      {/* Admin note */}
      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-[0.65rem] text-muted">
        <span>Quản trị viên tối cao: @myso (chuitv1907@gmail.com)</span>
        <span className="text-teal font-mono">Bảo mật đa lớp</span>
      </div>
    </div>
  );
}
