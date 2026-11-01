"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  ArrowRight,
  Plus,
  Settings,
  Users,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  AlertTriangle,
  Zap,
  Camera,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { VIDEO_FILTERS, type VideoFilterType } from "@/lib/media/videoEffects";
import {
  acquireUserMedia,
  enumerateDevices,
  type AvailableDevices,
} from "@/lib/media/deviceManager";

export function MeetLobbyClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [roomIdInput, setRoomIdInput] = useState("");
  const [userName, setUserName] = useState(profile?.full_name || "Thành viên Myso");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<VideoFilterType>("studio");

  // Device enumeration & selection
  const [devices, setDevices] = useState<AvailableDevices>({ cameras: [], microphones: [], speakers: [] });
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [connectingMedia, setConnectingMedia] = useState(false);

  // Security toggles
  const [antiScreenshot, setAntiScreenshot] = useState(true);
  const [tabMasking, setTabMasking] = useState(true);
  const [forensicWatermark, setForensicWatermark] = useState(true);

  // Local media stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Sync user name when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setUserName(profile.full_name);
    }
  }, [profile]);

  // Request & Connect Camera and Mic
  const connectHardware = useCallback(async () => {
    setConnectingMedia(true);
    setCameraError(null);

    try {
      const res = await acquireUserMedia({
        videoDeviceId: selectedCameraId || undefined,
        audioDeviceId: selectedMicId || undefined,
        preferredName: userName,
      });

      setMediaStream(res.stream);
      setIsHardwareConnected(res.hasPhysicalVideo || res.hasPhysicalAudio);

      if (videoRef.current) {
        videoRef.current.srcObject = res.stream;
        videoRef.current.play().catch(() => {});
      }

      if (res.error) {
        setCameraError(res.error);
      }

      // Enumerate devices after permission granted
      const devs = await enumerateDevices();
      setDevices(devs);
      if (devs.cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(devs.cameras[0].deviceId);
      }
      if (devs.microphones.length > 0 && !selectedMicId) {
        setSelectedMicId(devs.microphones[0].deviceId);
      }
    } catch (err: any) {
      console.warn("Connect hardware error:", err);
      setCameraError(err.message || "Vui lòng cho phép quyền truy cập Camera & Micro trên trình duyệt.");
    } finally {
      setConnectingMedia(false);
    }
  }, [selectedCameraId, selectedMicId, userName]);

  // Try auto-connect once on mount
  useEffect(() => {
    connectHardware();
  }, [connectHardware]);

  // Setup Audio Meter
  useEffect(() => {
    if (!mediaStream) return;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animId: number;

    try {
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkMeter = () => {
          if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          }
          animId = requestAnimationFrame(checkMeter);
        };
        checkMeter();
      }
    } catch {
      // Audio meter fallback
    }

    return () => {
      if (audioContext) audioContext.close();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [mediaStream]);

  // Toggle video track
  const toggleVideo = () => {
    if (mediaStream) {
      const vTrack = mediaStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Toggle audio track
  const toggleAudio = () => {
    if (mediaStream) {
      const aTrack = mediaStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleCreateInstantMeeting = () => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const newRoomId = `myso-${randomHex}`;
    router.push(localePath(locale, `/meet/${newRoomId}`));
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;
    const cleanRoom = roomIdInput.trim().replace(/[^a-zA-Z0-9-_]/g, "");
    router.push(localePath(locale, `/meet/${cleanRoom}`));
  };

  const activeFilterPreset = VIDEO_FILTERS.find((f) => f.id === selectedFilter) || VIDEO_FILTERS[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header bar without unwanted subtitle */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-6 border-b border-[#27272A]/80 mb-6">
        <Link href={localePath(locale, "/")} className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tight">MysoMeet</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                PRO PRIVACY
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <ShieldCheck className="h-4 w-4" />
          <span>E2EE Active Shield</span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Video Preview & Device Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-[#27272A] bg-[#121215] shadow-2xl group">
            {/* Video Element */}
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transition-all duration-300"
                style={{
                  filter: activeFilterPreset.cssFilter,
                  transform: "scaleX(-1)",
                }}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-[#121215] text-[#71717A]">
                <div className="h-20 w-20 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400 text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-mono">Camera đang tắt</p>
              </div>
            )}

            {/* If camera is not yet connected or has error: big prominent connect button */}
            {!isHardwareConnected && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                <Camera className="h-10 w-10 text-amber-400 mb-2 animate-bounce" />
                <p className="text-xs text-[#FAFAFA] font-medium mb-3 max-w-xs">
                  {cameraError || "Vui lòng cho phép quyền Camera & Micro để họp trực tuyến"}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={connectHardware}
                    disabled={connectingMedia}
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${connectingMedia ? "animate-spin" : ""}`} />
                    <span>{connectingMedia ? "Đang kết nối..." : "Bật & Cấp Quyền Camera / Mic"}</span>
                  </button>
                  <button
                    onClick={() => setIsHardwareConnected(true)}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-[#FAFAFA] active:scale-95 transition cursor-pointer"
                  >
                    Vào với Đại diện ảo
                  </button>
                </div>
              </div>
            )}

            {/* Overlays: Name & Active filter badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-semibold border border-white/10 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isHardwareConnected ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                {userName}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold backdrop-blur-md">
                Bộ lọc: {activeFilterPreset.name}
              </span>
            </div>

            {/* Audio level meter bar */}
            {isAudioEnabled && (
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10">
                <Mic className="h-3.5 w-3.5 text-emerald-400" />
                <div className="w-16 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick in-video control dock */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-3 rounded-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  isAudioEnabled
                    ? "bg-black/60 text-white hover:bg-black/80 border border-white/10"
                    : "bg-rose-500 text-white border border-rose-400/50 shadow-lg shadow-rose-500/20"
                }`}
                title={isAudioEnabled ? "Tắt Mic" : "Bật Mic"}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3 rounded-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                  isVideoEnabled
                    ? "bg-black/60 text-white hover:bg-black/80 border border-white/10"
                    : "bg-rose-500 text-white border border-rose-400/50 shadow-lg shadow-rose-500/20"
                }`}
                title={isVideoEnabled ? "Tắt Camera" : "Bật Camera"}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Device Selectors (Camera & Mic pickers) */}
          {devices.cameras.length > 0 && (
            <div className="p-3 rounded-2xl border border-[#27272A] bg-[#121215] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>Chọn Camera:</span>
                </label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    connectHardware();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-amber-500"
                >
                  {devices.cameras.map((c) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Chọn Microphone:</span>
                </label>
                <select
                  value={selectedMicId}
                  onChange={(e) => {
                    setSelectedMicId(e.target.value);
                    connectHardware();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-amber-500"
                >
                  {devices.microphones.map((m) => (
                    <option key={m.deviceId} value={m.deviceId}>
                      {m.label || `Microphone ${m.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Visual Effects & Filters Selector */}
          <div className="p-4 rounded-2xl border border-[#27272A] bg-[#121215] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                Hiệu ứng hình ảnh & Bộ lọc Video:
              </span>
              <span className="text-[10px] text-[#A1A1AA] font-mono">Thời gian thực (Zero lag)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {VIDEO_FILTERS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedFilter(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                    selectedFilter === preset.id
                      ? "border-amber-500 bg-amber-500/10 text-[#FAFAFA] shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3F3F46]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{preset.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-400 font-mono">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#71717A] line-clamp-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Join / Create Actions & Security Engine */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Join / Create Card */}
          <div className="p-6 rounded-3xl border border-[#27272A] bg-[#121215] flex flex-col gap-5 shadow-xl">
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-[#FAFAFA]">
                Vào Phòng Họp Ngay
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Cuộc họp được bảo vệ bằng cơ chế chống quay lén và che tab tự động.
              </p>
            </div>

            {/* Display Name input */}
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] mb-1.5 block">
                Tên hiển thị trong phòng họp:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-sm text-[#FAFAFA] focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Instant Meeting Button */}
            <button
              onClick={handleCreateInstantMeeting}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-[length:200%_auto] hover:animate-shimmer active:scale-95 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Tạo Cuộc Họp Mới Ngay Lập Tức</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-[#27272A] flex-1" />
              <span className="text-[11px] font-mono text-[#71717A] uppercase">Hoặc</span>
              <div className="h-px bg-[#27272A] flex-1" />
            </div>

            {/* Join with room code form */}
            <form onSubmit={handleJoinMeeting} className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-[#A1A1AA]">
                Tham gia bằng mã phòng hoặc liên kết:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Ví dụ: myso-abc-123"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-sm text-[#FAFAFA] focus:outline-none focus:border-amber-500 transition font-mono"
                />
                <button
                  type="submit"
                  disabled={!roomIdInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#27272A] hover:bg-amber-500 hover:text-black text-white text-sm font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Vào</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* High-Security Anti-Leak Checklist Card */}
          <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Hệ Thống Bảo Mật Cuộc Gọi Riêng Tư:
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">Active</span>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-[#A1A1AA]">
              {/* Feature 1 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#121215] border border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Chặn chụp ảnh màn hình (PrintScreen / Snipping)</span>
                </div>
                <input
                  type="checkbox"
                  checked={antiScreenshot}
                  onChange={(e) => setAntiScreenshot(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Feature 2 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#121215] border border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Tự động che video khi chuyển tab / mất focus</span>
                </div>
                <input
                  type="checkbox"
                  checked={tabMasking}
                  onChange={(e) => setTabMasking(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Feature 3 */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#121215] border border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Thủy vân kỹ thuật số động (Anti-Phone Camera)</span>
                </div>
                <input
                  type="checkbox"
                  checked={forensicWatermark}
                  onChange={(e) => setForensicWatermark(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <p className="text-[10px] text-[#71717A] leading-relaxed pt-1">
              Khi ở trong phòng họp, thao tác chuyển tab sẽ lập tức kích hoạt màn che đen chống quay lén. Phím tắt chụp ảnh bị vô hiệu hóa và xóa bộ nhớ tạm ngay tức thì.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
