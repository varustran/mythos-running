"use client";

import { useState, useRef, useEffect } from "react";
import {
  Palette,
  Eraser,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Smile,
  Brush,
} from "lucide-react";

const EMOJI_PRESETS = [
  "⚡", "💡", "🧠", "🚀", "🔥", "💎", "🔮", "🎨", "🧬", "🌌", "🛡️", "🏆", "🌟", "🎯", "🤖", "🪐"
];

const COLOR_PALETTE = [
  "#2563EB", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#FFFFFF", // White
  "#0F172A", // Dark Slate
];

export function DoodleEmojiModal({
  isOpen,
  onClose,
  onSelectIcon,
  currentIcon,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconData: string) => void;
  currentIcon?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<"preset" | "draw">("preset");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Transparent or soft background
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSelectIcon(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="card w-full max-w-sm border border-line bg-surface p-5 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-accent" />
            <h3 className="font-display text-sm font-bold text-ink">
              Biểu Tượng & Vẽ Doodle Bài Viết
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-canvas rounded-xl border border-line mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("preset")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "preset" ? "bg-accent text-white dark:text-[#04101F] shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <Smile className="h-3.5 w-3.5" />
            Emoji Có Sẵn
          </button>
          <button
            onClick={() => setActiveTab("draw")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === "draw" ? "bg-accent text-white dark:text-[#04101F] shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            <Brush className="h-3.5 w-3.5" />
            Tự Vẽ Doodle
          </button>
        </div>

        {activeTab === "preset" ? (
          <div>
            <p className="text-xs text-muted mb-3">Chọn biểu tượng chủ đề đại diện cho bài viết của bạn:</p>
            <div className="grid grid-cols-4 gap-2.5">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelectIcon(emoji);
                    onClose();
                  }}
                  className={`h-12 w-full rounded-2xl border text-xl flex items-center justify-center transition hover:scale-110 ${
                    currentIcon === emoji
                      ? "border-accent bg-accent/15 ring-2 ring-accent/30"
                      : "border-line bg-canvas hover:border-accent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted">Vẽ nét doodle độc bản của riêng bạn (tự động tạo biểu tượng PNG):</p>
            
            {/* Canvas Area */}
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={140}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="rounded-2xl border-2 border-dashed border-line bg-canvas/60 cursor-crosshair touch-none shadow-inner"
              />
            </div>

            {/* Color Palette */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedColor(c);
                    setIsEraser(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`h-5 w-5 rounded-full border border-black/20 transition ${
                    selectedColor === c && !isEraser ? "scale-125 ring-2 ring-accent" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-line pt-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEraser(!isEraser)}
                  className={`p-1.5 rounded-lg border transition ${
                    isEraser ? "bg-accent/20 border-accent text-accent" : "border-line text-muted hover:text-ink"
                  }`}
                  title="Cục tẩy"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-1.5 rounded-lg border border-line text-muted hover:text-ink transition"
                  title="Xóa trắng vẽ lại"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveDrawing}
                className="px-3.5 py-1.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-semibold flex items-center gap-1 shadow-sm hover:opacity-90 transition"
              >
                <Check className="h-3.5 w-3.5" />
                Áp Dụng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
