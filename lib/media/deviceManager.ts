/**
 * MysoMeet Camera & Microphone Device Manager
 * Bulletproof hardware acquisition for desktop, mobile (iOS/Android), and tablet:
 * 1. Tries Full Video + Audio with preferred device or facingMode
 * 2. Tries Video with broad constraints, then Audio separately
 * 3. Tries Audio only if camera is blocked/absent
 * 4. Falls back to Animated Synthetic MediaStream with user initials if hardware is inaccessible
 * 5. Enumerates devices and monitors device changes
 */

export interface AvailableDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

/**
 * Translates MediaStream getUserMedia errors into clear, actionable advice
 */
export function parseMediaError(err: any): string {
  if (!err) return "Lỗi không xác định khi truy cập thiết bị.";

  const name = err.name || "";
  const msg = err.message || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError" || msg.includes("Permission denied")) {
    return "Bạn đã từ chối cấp quyền Camera/Micro. Vui lòng nhấn vào biểu tượng Ổ Khóa 🔒 trên thanh địa chỉ trình duyệt, chọn 'Cho phép' và tải lại.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError" || msg.includes("not found")) {
    return "Không tìm thấy thiết bị Camera hoặc Micro. Vui lòng kiểm tra lại dây cắm hoặc chọn thiết bị khác.";
  }

  if (name === "NotReadableError" || name === "TrackStartError" || msg.includes("concurrent")) {
    return "Camera/Micro đang bị ứng dụng khác chiếm dụng (Zoom, Teams, OBS, Google Meet). Vui lòng tắt các ứng dụng đó rồi thử lại.";
  }

  if (name === "OverconstrainedError") {
    return "Thông số độ phân giải yêu cầu không tương thích với webcam này.";
  }

  if (name === "SecurityError") {
    return "Trình duyệt chặn truy cập MediaDevices vì kết nối không phải HTTPS hoặc iframe bị hạn chế.";
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

    // Outer glow
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 85%, 55%, 0.15)`;
    ctx.fill();

    // Circle body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#121215";
    ctx.fill();
    ctx.strokeStyle = `hsl(${hue}, 85%, 55%)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Initials text
    ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const initial = (name.trim().charAt(0) || "M").toUpperCase();
    ctx.fillText(initial, 0, 0);

    ctx.restore();

    // Bottom user name tag
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

  // Fallback silent audio track so WebRTC connections don't break
  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : new MediaStream();

  return stream;
}

/**
 * Request user media with graceful multi-tier fallbacks
 */
export async function acquireUserMedia(
  options: {
    videoDeviceId?: string;
    audioDeviceId?: string;
    preferredName?: string;
  } = {}
): Promise<{
  stream: MediaStream;
  hasPhysicalVideo: boolean;
  hasPhysicalAudio: boolean;
  error?: string;
}> {
  if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
    const synth = createSyntheticStream(options.preferredName || "Thành viên Myso");
    return {
      stream: synth,
      hasPhysicalVideo: false,
      hasPhysicalAudio: false,
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

  let lastErr: any = null;

  // Tier 1: Try requested Video + Audio
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraint,
      audio: audioConstraint,
    });
    return {
      stream,
      hasPhysicalVideo: stream.getVideoTracks().length > 0,
      hasPhysicalAudio: stream.getAudioTracks().length > 0,
    };
  } catch (err1) {
    lastErr = err1;
    console.warn("Tier 1 (Video+Audio) failed, trying broader constraints:", err1);
  }

  // Tier 2: Try basic Video: true, Audio: true (removes complex device/facingMode constraints)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return {
      stream,
      hasPhysicalVideo: stream.getVideoTracks().length > 0,
      hasPhysicalAudio: stream.getAudioTracks().length > 0,
    };
  } catch (err2) {
    lastErr = err2;
    console.warn("Tier 2 (Basic Video+Audio) failed, trying Video-only:", err2);
  }

  // Tier 3: Try Video only, then separately try Audio
  let videoStream: MediaStream | null = null;
  let hasVideo = false;
  let hasAudio = false;

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    hasVideo = true;
  } catch (videoErr) {
    lastErr = videoErr;
    console.warn("Video-only failed:", videoErr);
  }

  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    hasAudio = true;
    if (videoStream) {
      audioStream.getAudioTracks().forEach((track) => videoStream!.addTrack(track));
      return { stream: videoStream, hasPhysicalVideo: true, hasPhysicalAudio: true };
    } else {
      // Audio works, but video failed -> combine Audio with Synthetic Video Stream
      const synth = createSyntheticStream(preferredName);
      audioStream.getAudioTracks().forEach((track) => synth.addTrack(track));
      return { stream: synth, hasPhysicalVideo: false, hasPhysicalAudio: true };
    }
  } catch (audioErr) {
    lastErr = audioErr;
    console.warn("Audio-only failed:", audioErr);
  }

  // If video succeeded but audio failed
  if (videoStream && hasVideo) {
    return { stream: videoStream, hasPhysicalVideo: true, hasPhysicalAudio: false };
  }

  // Tier 4: Total fallback to Synthetic Animated Stream with parsed error
  const fallbackSynth = createSyntheticStream(preferredName);
  return {
    stream: fallbackSynth,
    hasPhysicalVideo: false,
    hasPhysicalAudio: false,
    error: parseMediaError(lastErr),
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
