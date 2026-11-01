/**
 * MysoMeet Camera & Microphone Device Manager
 * Bulletproof hardware acquisition for desktop, mobile (iOS/Android), and tablet:
 * 1. Tries Full Video + Audio
 * 2. If NotFoundError / DevicesNotFoundError / NotAllowedError occurs, automatically falls back
 *    to Video-only or Audio-only with dedicated notification messages.
 * 3. Falls back to Animated Synthetic MediaStream with user initials if hardware is completely unavailable.
 * 4. Enumerates devices and translates media errors.
 */

export interface AvailableDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

export type MediaAcquisitionMode = "full" | "video_only" | "audio_only" | "synthetic";

export interface MediaAcquireResult {
  stream: MediaStream;
  hasPhysicalVideo: boolean;
  hasPhysicalAudio: boolean;
  mode: MediaAcquisitionMode;
  notice?: string;
  error?: string;
}

/**
 * Translates MediaStream getUserMedia errors into clear, actionable advice
 */
export function parseMediaError(err: any): string {
  if (!err) return "Lỗi không xác định khi truy cập thiết bị.";

  const name = err.name || "";
  const msg = err.message || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || msg.includes("Permission denied")) {
    return "Bạn đã từ chối cấp quyền Camera/Micro. Vui lòng bấm vào biểu tượng Ổ Khóa 🔒 trên thanh địa chỉ URL để cho phép.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError" || msg.includes("not found")) {
    return "Không tìm thấy thiết bị Camera hoặc Microphone trên máy tính này.";
  }

  if (name === "NotReadableError" || name === "TrackStartError" || msg.includes("concurrent")) {
    return "Webcam/Micro đang bị ứng dụng khác chiếm dụng (Zoom, Teams, OBS). Vui lòng tắt các ứng dụng đó rồi thử lại.";
  }

  if (name === "OverconstrainedError") {
    return "Thông số độ phân giải yêu cầu không tương thích với webcam của thiết bị.";
  }

  if (name === "SecurityError") {
    return "Trình duyệt chặn truy cập MediaDevices vì kết nối không an toàn.";
  }

  return `Lỗi thiết bị (${name || "MediaError"}): ${msg || "Không thể khởi động camera/micro"}`;
}

/**
 * Creates an animated synthetic video stream when physical camera is absent or denied
 */
export function createSyntheticStream(name: string): MediaStream {
  if (typeof document === "undefined") {
    return new MediaStream();
  }

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new MediaStream();
  }

  let hue = 35;
  let pulse = 0;
  let isRunning = true;

  const draw = () => {
    if (!isRunning) return;

    // Dark sleek gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#09090B");
    grad.addColorStop(1, "#18181B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Dynamic pulsating avatar circle
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    const radius = 64 + Math.sin(pulse) * 4;
    pulse += 0.04;

    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 85%, 55%, 0.15)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#121215";
    ctx.fill();
    ctx.strokeStyle = `hsl(${hue}, 85%, 55%)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = (name.trim().charAt(0) || "M").toUpperCase();
    ctx.fillText(initial, 0, 0);

    ctx.restore();

    // Bottom name tag
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(16, canvas.height - 44, 200, 28);
    ctx.fillStyle = "#FAFAFA";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(name.slice(0, 22), 26, canvas.height - 25);

    hue = (hue + 0.2) % 360;
    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);

  return (canvas as any).captureStream ? (canvas as any).captureStream(30) : new MediaStream();
}

/**
 * Request user media with graceful multi-tier fallbacks:
 * 1. Tries Full Video + Audio
 * 2. If NotFoundError / DevicesNotFoundError / NotAllowedError occurs, automatically falls back
 *    to Video-only or Audio-only with dedicated notification messages.
 * 3. Falls back to Animated Synthetic MediaStream with user initials if hardware is completely unavailable.
 */
export async function acquireUserMedia(
  options: {
    videoDeviceId?: string;
    audioDeviceId?: string;
    preferredName?: string;
  } = {}
): Promise<MediaAcquireResult> {
  if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
    const synth = createSyntheticStream(options.preferredName || "Thành viên Myso");
    return {
      stream: synth,
      hasPhysicalVideo: false,
      hasPhysicalAudio: false,
      mode: "synthetic",
      error: "Trình duyệt không hỗ trợ MediaDevices API hoặc đang chạy ngoài môi trường HTTPS an toàn.",
    };
  }

  const { videoDeviceId, audioDeviceId, preferredName = "Thành viên Myso" } = options;

  const videoConstraint: MediaTrackConstraints | boolean = videoDeviceId
    ? { deviceId: { exact: videoDeviceId } }
    : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" };

  const audioConstraint: MediaTrackConstraints | boolean = audioDeviceId
    ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true }
    : { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

  // Step 1: Try full requested Video + Audio
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraint,
      audio: audioConstraint,
    });
    return {
      stream,
      hasPhysicalVideo: stream.getVideoTracks().length > 0,
      hasPhysicalAudio: stream.getAudioTracks().length > 0,
      mode: "full",
    };
  } catch (err1: any) {
    console.warn("[MediaManager] Full Video+Audio request failed:", err1);
  }

  // Step 2: Try basic Video: true, Audio: true (removes facingMode / deviceId constraints)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return {
      stream,
      hasPhysicalVideo: stream.getVideoTracks().length > 0,
      hasPhysicalAudio: stream.getAudioTracks().length > 0,
      mode: "full",
    };
  } catch (err2: any) {
    console.warn("[MediaManager] Basic Video+Audio request failed:", err2);
  }

  // Step 3: Tách luồng riêng biệt - Thử Video riêng, Audio riêng
  let videoStream: MediaStream | null = null;
  let audioStream: MediaStream | null = null;
  let videoNotice = "";
  let audioNotice = "";

  // Thử xin Video riêng
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (vErr: any) {
    console.warn("[MediaManager] Video-only request failed:", vErr);
    videoNotice = parseMediaError(vErr);
  }

  // Thử xin Audio riêng
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (aErr: any) {
    console.warn("[MediaManager] Audio-only request failed:", aErr);
    audioNotice = parseMediaError(aErr);
  }

  // Kịch bản A: Cả 2 đều thành công khi xin riêng
  if (videoStream && audioStream) {
    audioStream.getAudioTracks().forEach((track) => videoStream!.addTrack(track));
    return {
      stream: videoStream,
      hasPhysicalVideo: true,
      hasPhysicalAudio: true,
      mode: "full",
    };
  }

  // Kịch bản B: Chỉ có Video (Không có Micro rời trên PC)
  if (videoStream && !audioStream) {
    return {
      stream: videoStream,
      hasPhysicalVideo: true,
      hasPhysicalAudio: false,
      mode: "video_only",
      notice: "Không tìm thấy Micro rời. Đã tự động kích hoạt chế độ Video (Không mic).",
    };
  }

  // Kịch bản C: Chỉ có Micro (Không có Webcam rời trên PC)
  if (!videoStream && audioStream) {
    const synthVideo = createSyntheticStream(preferredName);
    audioStream.getAudioTracks().forEach((track) => synthVideo.addTrack(track));
    return {
      stream: synthVideo,
      hasPhysicalVideo: false,
      hasPhysicalAudio: true,
      mode: "audio_only",
      notice: "Không tìm thấy Webcam. Đã tự động kết nối Micro và đại diện ảo.",
    };
  }

  // Kịch bản D: Cả 2 đều không có hoặc bị từ chối -> Fallback sang Đại diện ảo
  const fallbackSynth = createSyntheticStream(preferredName);
  return {
    stream: fallbackSynth,
    hasPhysicalVideo: false,
    hasPhysicalAudio: false,
    mode: "synthetic",
    error: videoNotice || audioNotice || "Không tìm thấy thiết bị hoặc quyền bị chặn.",
  };
}

/**
 * Enumerate connected physical devices
 */
export async function enumerateDevices(): Promise<AvailableDevices> {
  if (typeof window === "undefined" || !navigator?.mediaDevices?.enumerateDevices) {
    return { cameras: [], microphones: [], speakers: [] };
  }

  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devs.filter((d) => d.kind === "videoinput"),
      microphones: devs.filter((d) => d.kind === "audioinput"),
      speakers: devs.filter((d) => d.kind === "audiooutput"),
    };
  } catch (err) {
    console.warn("enumerateDevices error:", err);
    return { cameras: [], microphones: [], speakers: [] };
  }
}
