/**
 * MysoMeet Real-time Video Effects & Filters
 * Supports Canvas Processing for Virtual Background Blur,
 * Studio Lighting, Cyberpunk, Noir, and High-Security Silhouette Privacy Mode.
 */

export type VideoFilterType =
  | "none"
  | "studio"
  | "blur"
  | "cyber"
  | "noir"
  | "beauty"
  | "silhouette";

export interface FilterPreset {
  id: VideoFilterType;
  name: string;
  description: string;
  cssFilter: string;
  badge: string;
}

export const VIDEO_FILTERS: FilterPreset[] = [
  {
    id: "none",
    name: "Tự nhiên",
    description: "Camera nguyên bản không qua xử lý",
    cssFilter: "none",
    badge: "Gốc",
  },
  {
    id: "studio",
    name: "Studio Pro",
    description: "Tăng cường ánh sáng ấm và độ tương phản khuôn mặt",
    cssFilter: "brightness(1.08) contrast(1.06) saturate(1.12)",
    badge: "Hot",
  },
  {
    id: "blur",
    name: "Xóa phông mềm",
    description: "Làm mờ hậu cảnh, làm nổi bật chân dung",
    cssFilter: "contrast(1.04) brightness(1.02)",
    badge: "AI",
  },
  {
    id: "beauty",
    name: "Làm mịn da",
    description: "Bộ lọc làm mềm mịn da mặt tự nhiên",
    cssFilter: "brightness(1.05) contrast(0.98) saturate(1.08)",
    badge: "Mịn",
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    description: "Tông màu neon Web3 công nghệ tương lai",
    cssFilter: "hue-rotate(185deg) contrast(1.2) saturate(1.3)",
    badge: "Web3",
  },
  {
    id: "noir",
    name: "Classic Noir",
    description: "Đen trắng sắc nét phong cách điện ảnh tối giản",
    cssFilter: "grayscale(100%) contrast(1.25) brightness(0.95)",
    badge: "Film",
  },
  {
    id: "silhouette",
    name: "Ẩn danh VIP",
    description: "Chế độ bảo mật tối cao che giấu toàn bộ khuôn mặt",
    cssFilter: "brightness(0.08) contrast(2.5) invert(1)",
    badge: "Bảo mật",
  },
];
