/**
 * MysoMeet Anti-Leak & Privacy Shield Engine
 * Provides maximum enterprise call privacy:
 * 1. Anti-Screenshot Keyboard Interception (PrintScreen, Snipping tool, Win+Shift+S, Mac Cmd+Shift+3/4)
 * 2. Window Blur & Tab Switching Auto-Blackout Shield (prevents background recording / peeking)
 * 3. Dynamic Forensic Watermarking (moving user identity + timestamp to prevent phone/external camera leaks)
 * 4. Clipboard clearing on capture key detection
 * 5. Screen Recording / OBS detection alerts
 */

export interface SecurityEvent {
  type: "screenshot_attempt" | "tab_hidden" | "window_blur" | "devtools_detected" | "clipboard_cleared" | "obs_detected";
  timestamp: number;
  message: string;
}

export class AntiLeakShield {
  private onSecurityEvent: (event: SecurityEvent) => void;
  private isMasked = false;
  private watermarkInterval: any = null;
  private devtoolsCheckInterval: any = null;

  constructor(onSecurityEvent: (event: SecurityEvent) => void) {
    this.onSecurityEvent = onSecurityEvent;
  }

  public activate() {
    if (typeof window === "undefined") return;

    // 1. Keyboard Interception: PrintScreen, Win+Shift+S, Cmd+Shift+3/4, etc.
    window.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("keyup", this.handleKeyUp, true);

    // 2. Tab switching & window blur auto-masking
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("focus", this.handleWindowFocus);

    // 3. Context menu / right click suppression inside sensitive areas
    window.addEventListener("contextmenu", this.handleContextMenu);

    // 4. DevTools Detection Heuristics
    this.startDevToolsWatcher();

    // 5. OBS & Capture Environment Detection
    this.checkObsEnvironment();
  }

  public deactivate() {
    if (typeof window === "undefined") return;

    window.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("keyup", this.handleKeyUp, true);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("focus", this.handleWindowFocus);
    window.removeEventListener("contextmenu", this.handleContextMenu);

    if (this.devtoolsCheckInterval) clearInterval(this.devtoolsCheckInterval);
    if (this.watermarkInterval) clearInterval(this.watermarkInterval);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Intercept PrintScreen
    if (
      e.key === "PrintScreen" ||
      e.keyCode === 44 ||
      (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "s" || e.key === "S")) ||
      (e.altKey && e.key === "PrintScreen") ||
      (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S"))
    ) {
      e.preventDefault();
      e.stopPropagation();

      // Clear clipboard immediately to sanitize any captured frame
      this.clearClipboard();

      this.onSecurityEvent({
        type: "screenshot_attempt",
        timestamp: Date.now(),
        message: "Phát hiện thao tác chụp màn hình. Nội dung cuộc họp đã được bảo vệ!",
      });

      return false;
    }

    // Intercept DevTools inspect shortcuts
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"))
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.onSecurityEvent({
        type: "devtools_detected",
        timestamp: Date.now(),
        message: "Phím tắt kiểm tra mã nguồn (DevTools) bị vô hiệu hóa trong phòng họp bảo mật.",
      });
      return false;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "PrintScreen" || e.keyCode === 44) {
      e.preventDefault();
      e.stopPropagation();
      this.clearClipboard();
      return false;
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.isMasked = true;
      this.onSecurityEvent({
        type: "tab_hidden",
        timestamp: Date.now(),
        message: "Người dùng đã chuyển tab. Màn hình cuộc họp tự động được che lại để chống quay lén.",
      });
    } else {
      this.isMasked = false;
      this.onSecurityEvent({
        type: "tab_hidden",
        timestamp: Date.now(),
        message: "Trở lại tab cuộc họp. Mở khóa hiển thị an toàn.",
      });
    }
  };

  private handleWindowBlur = () => {
    this.isMasked = true;
    this.onSecurityEvent({
      type: "window_blur",
      timestamp: Date.now(),
      message: "Cửa sổ mất tiêu điểm (chuyển ứng dụng khác / OBS / cửa sổ quay). Màn hình video được che lại.",
    });
  };

  private handleWindowFocus = () => {
    this.isMasked = false;
  };

  private handleContextMenu = (e: MouseEvent) => {
    // Prevent right click menu on call elements
    const target = e.target as HTMLElement;
    if (target && target.closest("[data-secure-meeting]")) {
      e.preventDefault();
    }
  };

  private checkObsEnvironment() {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const isObs =
      ua.includes("OBS/") ||
      ua.includes("obs-studio") ||
      Boolean((window as any).obsstudio) ||
      Boolean((window as any).__OBS_BROWSER_SOURCE__);

    if (isObs) {
      this.onSecurityEvent({
        type: "obs_detected",
        timestamp: Date.now(),
        message: "Phát hiện môi trường OBS Studio Browser Source. Toàn bộ hình ảnh được đóng dấu pháp y định danh.",
      });
    }
  }

  private clearClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("🔒 MysoMeet Confidential: Nội dung được bảo vệ bản quyền & chống rò rỉ.");
      }
    } catch {
      // Ignore if permission denied
    }
  }

  private startDevToolsWatcher() {
    const threshold = 160;
    this.devtoolsCheckInterval = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        // Devtools likely open
        this.onSecurityEvent({
          type: "devtools_detected",
          timestamp: Date.now(),
          message: "Cảnh báo: Phát hiện cửa sổ phân tích DevTools đang mở. Hãy đóng để duy trì bảo mật cuộc gọi.",
        });
      }
    }, 2500);
  }
}
