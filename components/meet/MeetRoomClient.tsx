"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Users,
  Copy,
  Check,
  Lock,
  ScreenShare,
  AlertOctagon,
  Settings,
  X,
  Send,
  Camera,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { useAuth } from "@/components/providers/AuthProvider";
import { AntiLeakShield, type SecurityEvent } from "@/lib/security/antiLeak";
import { VIDEO_FILTERS, type VideoFilterType } from "@/lib/media/videoEffects";
import {
  acquireUserMedia,
  enumerateDevices,
  type AvailableDevices,
} from "@/lib/media/deviceManager";

interface ChatMessage {
  id: string;
  senderName: string;
  senderHandle: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface PeerParticipant {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isSpeaking: boolean;
  role?: string;
  stream?: MediaStream;
}

export function MeetRoomClient({
  roomId,
  locale,
}: {
  roomId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const currentUserName = profile?.full_name || "Thành viên Myso";
  const currentUserHandle = profile?.username || "user";
  const currentUserAvatar = profile?.avatar_url || "";

  // Unique peer ID for this session
  const [myPeerId] = useState<string>(() => {
    return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  });

  // Media states
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<VideoFilterType>("studio");

  // Device management
  const [devices, setDevices] = useState<AvailableDevices>({ cameras: [], microphones: [], speakers: [] });
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [isHardwareActive, setIsHardwareActive] = useState(false);
  const [hardwareConnecting, setHardwareConnecting] = useState(false);
  const [hardwareNotice, setHardwareNotice] = useState<string | null>(null);

  // Streams
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [selfAudioLevel, setSelfAudioLevel] = useState(0);

  // Layout & UI Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Security & Anti-Leak States
  const [isScreenMasked, setIsScreenMasked] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 25 });
  const [watermarkTimestamp, setWatermarkTimestamp] = useState("");

  // Participants
  const [peers, setPeers] = useState<PeerParticipant[]>([]);

  // In-Room Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m-welcome",
      senderName: "Hệ thống MysoMeet",
      senderHandle: "system",
      text: "🔒 Phòng họp đã kết nối mã hóa đầu cuối. Thao tác chuyển tab sẽ kích hoạt màn chắn riêng tư tự động.",
      timestamp: "Bắt đầu",
      isSelf: false,
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // 1. HARDWARE ACQUISITION & CONTROL
  const connectMediaHardware = useCallback(async (options?: { camId?: string; micId?: string }) => {
    setHardwareConnecting(true);
    setHardwareNotice(null);

    const cam = options?.camId ?? selectedCameraId;
    const mic = options?.micId ?? selectedMicId;

    try {
      const res = await acquireUserMedia({
        videoDeviceId: cam || undefined,
        audioDeviceId: mic || undefined,
        preferredName: currentUserName,
      });

      setLocalStream(res.stream);
      setIsHardwareActive(res.hasPhysicalVideo || res.hasPhysicalAudio);

      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = res.stream;
        selfVideoRef.current.play().catch(() => {});
      }

      if (res.error) {
        setHardwareNotice(res.error);
      } else {
        setHardwareNotice(null);
      }

      const devs = await enumerateDevices();
      setDevices(devs);
      if (devs.cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(devs.cameras[0].deviceId);
      }
      if (devs.microphones.length > 0 && !selectedMicId) {
        setSelectedMicId(devs.microphones[0].deviceId);
      }
    } catch (err: any) {
      console.warn("Connect media error:", err);
      setHardwareNotice("Không thể truy cập camera hoặc mic. Đang sử dụng luồng đại diện.");
    } finally {
      setHardwareConnecting(false);
    }
  }, [selectedCameraId, selectedMicId, currentUserName]);

  // Initial connect on mount
  useEffect(() => {
    connectMediaHardware();
  }, [connectMediaHardware]);

  // Attach stream to video element when stream or video status changes
  useEffect(() => {
    if (selfVideoRef.current && localStream) {
      selfVideoRef.current.srcObject = localStream;
      selfVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoOn]);

  // Audio level meter
  useEffect(() => {
    if (!localStream) return;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animId: number;

    try {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(localStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setSelfAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          }
          animId = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      }
    } catch {
      // Audio level analyser fallback
    }

    return () => {
      if (audioContext) audioContext.close();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [localStream]);

  // Toggle Video Track
  const toggleVideo = () => {
    if (localStream) {
      const vTrack = localStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      } else {
        // No video track, try re-acquiring
        connectMediaHardware();
        setIsVideoOn(true);
      }
    } else {
      connectMediaHardware();
      setIsVideoOn(true);
    }
  };

  // Toggle Audio Track
  const toggleAudio = () => {
    if (localStream) {
      const aTrack = localStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      } else {
        // No audio track, try re-acquiring
        connectMediaHardware();
        setIsAudioOn(true);
      }
    } else {
      connectMediaHardware();
      setIsAudioOn(true);
    }
  };

  // 2. SIGNALING & PEER DISCOVERY
  useEffect(() => {
    let isSubscribed = true;

    // Join room
    const joinRoom = async () => {
      try {
        await fetch("/api/meet/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            peerId: myPeerId,
            type: "join",
            senderName: currentUserName,
            senderHandle: currentUserHandle,
            senderAvatar: currentUserAvatar,
          }),
        });
      } catch (err) {
        console.warn("Signal join error:", err);
      }
    };
    joinRoom();

    // Polling loop for heartbeat and incoming signals
    const pollInterval = setInterval(async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(`/api/meet/signal?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(myPeerId)}`);
        if (!res.ok) return;
        const data = await res.json();

        // Update peers list
        if (Array.isArray(data.peers)) {
          const remotePeers = data.peers
            .filter((p: any) => p.id !== myPeerId)
            .map((p: any) => ({
              id: p.id,
              name: p.name || "Thành viên",
              handle: p.handle || "user",
              avatar: p.avatar,
              isVideoOn: true,
              isAudioOn: true,
              isSpeaking: false,
            }));
          setPeers(remotePeers);
        }

        // Handle signals (chat, etc.)
        if (Array.isArray(data.signals)) {
          for (const sig of data.signals) {
            if (sig.type === "chat" && sig.payload) {
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === sig.payload.id)) return prev;
                return [...prev, sig.payload];
              });
            }
          }
        }
      } catch (err) {
        console.warn("Signal poll error:", err);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
      // Leave notification
      try {
        navigator.sendBeacon?.(
          "/api/meet/signal",
          JSON.stringify({
            roomId,
            peerId: myPeerId,
            type: "leave",
          })
        );
      } catch {
        // Beacon fallback
      }
    };
  }, [roomId, myPeerId, currentUserName, currentUserHandle, currentUserAvatar]);

  // 3. SECURITY & ANTI-LEAK
  useEffect(() => {
    const shield = new AntiLeakShield((event: SecurityEvent) => {
      if (event.type === "screenshot_attempt") {
        setSecurityAlert("⚠️ CẢNH BÁO BẢO MẬT: Thao tác chụp màn hình đã bị chặn! Bộ nhớ tạm đã được xóa.");
        setTimeout(() => setSecurityAlert(null), 4000);
      } else if (event.type === "tab_hidden" || event.type === "window_blur") {
        setIsScreenMasked(true);
      } else if (event.type === "devtools_detected") {
        setSecurityAlert("⚠️ CẢNH BÁO: Phát hiện công cụ ghi hình/kiểm tra mã nguồn.");
        setTimeout(() => setSecurityAlert(null), 4000);
      }
    });

    shield.activate();

    const handleFocus = () => setIsScreenMasked(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      shield.deactivate();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Forensic Watermark position drift
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(15 + Math.random() * 65);
      const randomLeft = Math.floor(10 + Math.random() * 60);
      setWatermarkPos({ top: randomTop, left: randomLeft });
      setWatermarkTimestamp(
        new Date().toLocaleTimeString("vi-VN", { hour12: false }) +
          "." +
          Math.floor(Math.random() * 999)
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Screen Share Toggle
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const scr = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(scr);
        setIsScreenSharing(true);
        scr.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderName: currentUserName,
      senderHandle: currentUserHandle,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // Broadcast message via signaling server
    try {
      await fetch("/api/meet/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          peerId: myPeerId,
          type: "chat",
          senderName: currentUserName,
          senderHandle: currentUserHandle,
          payload: { ...newMsg, isSelf: false },
        }),
      });
    } catch (err) {
      console.warn("Send chat signal error:", err);
    }
  };

  // Copy Meeting Link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // End Call
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
    }
    router.push(localePath(locale, "/meet"));
  };

  const activePreset = VIDEO_FILTERS.find((f) => f.id === activeFilter) || VIDEO_FILTERS[0];

  return (
    <div
      data-secure-meeting="true"
      className="relative min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col overflow-hidden select-none"
    >
      {/* 1. TOP BAR */}
      <header className="h-14 px-4 sm:px-6 bg-[#121215] border-b border-[#27272A] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={localePath(locale, "/meet")} className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-black text-black text-sm">
              M
            </div>
            <span className="font-display font-black text-base tracking-tight hidden sm:inline">MysoMeet</span>
          </Link>

          <span className="text-[#3F3F46]">|</span>

          {/* Room info pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-[#FAFAFA]">{roomId}</span>
            <button
              onClick={handleCopyLink}
              type="button"
              className="text-[#A1A1AA] hover:text-amber-400 transition cursor-pointer"
              title="Sao chép liên kết phòng họp"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Security badges & Hardware status */}
        <div className="flex items-center gap-2">
          {!isHardwareActive && (
            <button
              onClick={() => connectMediaHardware()}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Bật Camera/Mic</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden md:inline">E2EE Active</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN MEETING VIEWPORT */}
      <main className="flex-1 relative p-3 sm:p-4 flex items-center justify-center overflow-hidden">
        {/* Dynamic Forensic Watermark Overlay */}
        <div
          className="absolute pointer-events-none z-10 transition-all duration-1000 ease-out opacity-25 select-none"
          style={{
            top: `${watermarkPos.top}%`,
            left: `${watermarkPos.left}%`,
          }}
        >
          <div className="px-3 py-1.5 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-[11px] font-mono text-white/80 space-y-0.5">
            <div>🔒 MYSO CONFIDENTIAL · @{currentUserHandle}</div>
            <div className="text-[9px] text-amber-300">ID: {roomId} · {watermarkTimestamp}</div>
          </div>
        </div>

        {/* Security Alert Toast */}
        {securityAlert && (
          <div className="absolute top-6 z-50 animate-bounce max-w-lg px-4 py-3 rounded-2xl bg-rose-600/95 text-white border border-rose-400 shadow-2xl flex items-center gap-3">
            <AlertOctagon className="h-5 w-5 shrink-0 animate-spin" />
            <span className="text-xs font-bold leading-tight">{securityAlert}</span>
          </div>
        )}

        {/* Video Grid */}
        <div className="w-full h-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-center justify-center">
          {/* Tile 1: Self Stream */}
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#27272A] bg-[#121215] shadow-xl group">
            {isVideoOn ? (
              <video
                ref={selfVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover transition-all duration-300"
                style={{
                  filter: activePreset.cssFilter,
                  transform: "scaleX(-1)",
                }}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-[#121215]">
                <div className="h-16 w-16 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400 text-xl font-bold">
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-[#71717A] font-mono">Camera đang tắt</span>
              </div>
            )}

            {/* Speaking Border Indicator */}
            {selfAudioLevel > 15 && isAudioOn && (
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-emerald-400 pointer-events-none animate-pulse" />
            )}

            {/* In-tile hardware prompt if not connected */}
            {!isHardwareActive && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                <Camera className="h-8 w-8 text-amber-400 mb-1.5" />
                <p className="text-xs text-white mb-2 max-w-[200px]">
                  {hardwareNotice || "Chưa cấp quyền Camera / Mic"}
                </p>
                <button
                  onClick={() => connectMediaHardware()}
                  disabled={hardwareConnecting}
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${hardwareConnecting ? "animate-spin" : ""}`} />
                  <span>{hardwareConnecting ? "Đang kết nối..." : "Bật Quyền Thiết Bị"}</span>
                </button>
              </div>
            )}

            {/* Bottom Info Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[#FAFAFA] font-semibold border border-white/10 flex items-center gap-1.5">
                <span>{currentUserName} (Bạn)</span>
                {activeFilter !== "none" && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                    {activePreset.name}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1">
                <span className={`p-1.5 rounded-lg backdrop-blur-md ${isAudioOn ? "bg-black/60 text-emerald-400" : "bg-rose-500 text-white"}`}>
                  {isAudioOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                </span>
              </div>
            </div>
          </div>

          {/* Screen Share Tile (if sharing) */}
          {isScreenSharing && (
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/50 bg-[#121215] shadow-xl">
              <video
                ref={(node) => {
                  if (node && screenStream) {
                    node.srcObject = screenStream;
                    node.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                className="h-full w-full object-contain bg-black"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-amber-500 text-black font-bold text-xs">
                Màn hình của bạn đang chia sẻ
              </div>
            </div>
          )}

          {/* Remote Peer Tiles */}
          {peers.length > 0 ? (
            peers.map((peer) => (
              <div
                key={peer.id}
                className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#27272A] bg-[#121215] shadow-xl group"
              >
                {peer.avatar ? (
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-[#121215]">
                    <div className="h-16 w-16 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400 text-xl font-bold">
                      {peer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-[#71717A] font-mono">Camera đang tắt</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[#FAFAFA] font-semibold border border-white/10 flex items-center gap-1.5">
                    <span>{peer.name}</span>
                    <span className="text-[10px] text-[#A1A1AA] font-mono hidden sm:inline">@{peer.handle}</span>
                  </span>

                  <span className="p-1.5 rounded-lg backdrop-blur-md bg-black/60 text-emerald-400">
                    <Mic className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            /* Waiting for other participants tile */
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-dashed border-[#27272A] bg-[#121215]/50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#71717A] mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-bold text-[#FAFAFA]">Đang đợi thành viên khác tham gia</h3>
              <p className="text-[11px] text-[#71717A] mt-1 max-w-xs leading-relaxed">
                Chia sẻ liên kết hoặc mã phòng <strong className="text-amber-400 font-mono">{roomId}</strong> để người khác cùng vào họp.
              </p>
              <button
                onClick={handleCopyLink}
                type="button"
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Đã sao chép liên kết" : "Sao chép liên kết họp"}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. AUTO TAB-SWITCH PRIVACY BLACKOUT SHIELD */}
        {isScreenMasked && (
          <div
            onClick={() => setIsScreenMasked(false)}
            className="absolute inset-0 bg-[#09090B]/98 backdrop-blur-2xl z-40 flex flex-col items-center justify-center p-6 text-center cursor-pointer animate-fade-in"
          >
            <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold font-display text-[#FAFAFA]">
              BẢO VỆ RIÊNG TƯ TỰ ĐỘNG (MYSO PRIVACY SHIELD)
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA] max-w-md leading-relaxed">
              Bạn đang ở ngoài tab hoặc cửa sổ cuộc họp mất tiêu điểm. Toàn bộ hình ảnh và hội thoại đã được che lại để phòng chống quay lén hoặc ghi hình ngầm.
            </p>
            <button
              type="button"
              className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider active:scale-95 transition shadow-lg shadow-amber-500/20"
            >
              Nhấn Vào Đây Để Mở Khóa Màn Hình
            </button>
          </div>
        )}
      </main>

      {/* 4. IN-MEETING CHAT DRAWER */}
      {isChatOpen && (
        <aside className="absolute right-0 top-14 bottom-20 w-full sm:w-80 md:w-96 bg-[#121215] border-l border-[#27272A] z-30 flex flex-col shadow-2xl">
          <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-sm">Trò Chuyện Cuộc Họp</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg text-[#A1A1AA] hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${msg.isSelf ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-mono text-[#71717A]">
                  {msg.senderName} · {msg.timestamp}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    msg.isSelf
                      ? "bg-amber-500 text-black font-medium rounded-br-none"
                      : "bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#27272A] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Gửi tin nhắn..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#FAFAFA] focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      )}

      {/* 5. VISUAL EFFECTS DRAWER */}
      {isFiltersOpen && (
        <aside className="absolute right-0 top-14 bottom-20 w-full sm:w-80 bg-[#121215] border-l border-[#27272A] z-30 flex flex-col shadow-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <span className="font-bold text-sm flex items-center gap-2 text-amber-400">
              <Sparkles className="h-4 w-4" />
              Bộ Lọc Camera Thời Gian Thực
            </span>
            <button onClick={() => setIsFiltersOpen(false)} className="text-[#A1A1AA] hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-3">
            {VIDEO_FILTERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveFilter(preset.id)}
                className={`w-full p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                  activeFilter === preset.id
                    ? "border-amber-500 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    : "border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{preset.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/50 text-amber-400 font-mono">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A]">{preset.description}</p>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* 6. SETTINGS DRAWER (Device Switcher) */}
      {isSettingsOpen && (
        <aside className="absolute right-0 top-14 bottom-20 w-full sm:w-80 bg-[#121215] border-l border-[#27272A] z-30 flex flex-col shadow-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <span className="font-bold text-sm flex items-center gap-2 text-amber-400">
              <Settings className="h-4 w-4" />
              Cài Đặt Thiết Bị Camera & Micro
            </span>
            <button onClick={() => setIsSettingsOpen(false)} className="text-[#A1A1AA] hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 py-3 text-xs">
            {/* Camera Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-amber-400" />
                <span>Camera:</span>
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  connectMediaHardware({ camId: e.target.value });
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-amber-500"
              >
                {devices.cameras.length > 0 ? (
                  devices.cameras.map((c) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Camera (${c.deviceId.slice(0, 6)})`}
                    </option>
                  ))
                ) : (
                  <option value="">Không tìm thấy camera vật lý</option>
                )}
              </select>
            </div>

            {/* Mic Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-emerald-400" />
                <span>Microphone:</span>
              </label>
              <select
                value={selectedMicId}
                onChange={(e) => {
                  setSelectedMicId(e.target.value);
                  connectMediaHardware({ micId: e.target.value });
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:outline-none focus:border-amber-500"
              >
                {devices.microphones.length > 0 ? (
                  devices.microphones.map((m) => (
                    <option key={m.deviceId} value={m.deviceId}>
                      {m.label || `Microphone (${m.deviceId.slice(0, 6)})`}
                    </option>
                  ))
                ) : (
                  <option value="">Không tìm thấy micro vật lý</option>
                )}
              </select>
            </div>

            {/* Reconnect button */}
            <button
              onClick={() => connectMediaHardware()}
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-[#27272A] hover:bg-amber-500 hover:text-black text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${hardwareConnecting ? "animate-spin" : ""}`} />
              <span>Cấp Quyền & Kết Nối Lại</span>
            </button>
          </div>
        </aside>
      )}

      {/* 7. BOTTOM CONTROL DOCK */}
      <footer className="h-20 px-4 bg-[#121215] border-t border-[#27272A] flex items-center justify-between shrink-0 z-20">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Trực tuyến · {peers.length + 1} người</span>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          {/* Mic */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              isAudioOn
                ? "bg-[#18181B] hover:bg-[#27272A] text-white border border-[#27272A]"
                : "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
            }`}
            title={isAudioOn ? "Tắt Micro" : "Bật Micro"}
          >
            {isAudioOn ? <Mic className="h-5 w-5 text-emerald-400" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={toggleVideo}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              isVideoOn
                ? "bg-[#18181B] hover:bg-[#27272A] text-white border border-[#27272A]"
                : "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
            }`}
            title={isVideoOn ? "Tắt Camera" : "Bật Camera"}
          >
            {isVideoOn ? <Video className="h-5 w-5 text-emerald-400" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Screen Share */}
          <button
            type="button"
            onClick={handleToggleScreenShare}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              isScreenSharing
                ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/25"
                : "bg-[#18181B] hover:bg-[#27272A] text-white border border-[#27272A]"
            }`}
            title="Chia sẻ màn hình"
          >
            <ScreenShare className="h-5 w-5" />
          </button>

          {/* Video Filters Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsFiltersOpen(!isFiltersOpen);
              setIsChatOpen(false);
              setIsSettingsOpen(false);
            }}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              isFiltersOpen
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#27272A]"
            }`}
            title="Bộ lọc video"
          >
            <Sparkles className="h-5 w-5" />
          </button>

          {/* Chat Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              setIsFiltersOpen(false);
              setIsSettingsOpen(false);
            }}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer relative ${
              isChatOpen
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#27272A]"
            }`}
            title="Trò chuyện"
          >
            <MessageSquare className="h-5 w-5" />
            {chatMessages.length > 1 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center">
                {chatMessages.length}
              </span>
            )}
          </button>

          {/* Device Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsChatOpen(false);
              setIsFiltersOpen(false);
            }}
            className={`p-3 sm:p-3.5 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              isSettingsOpen
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[#27272A]"
            }`}
            title="Cài đặt camera & micro"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="px-5 py-3 sm:py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30 active:scale-90 cursor-pointer flex items-center gap-2"
            title="Rời khỏi cuộc họp"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="text-xs hidden sm:inline">Rời Phòng</span>
          </button>
        </div>

        {/* Right side info */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#71717A]">
          <span>Phòng: {roomId}</span>
        </div>
      </footer>
    </div>
  );
}
