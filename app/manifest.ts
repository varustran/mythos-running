import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Myso — Nền Tảng Cộng Đồng & Xuất Bản Tri Thức Hiện Đại",
    short_name: "Myso",
    description: "Cộng đồng kết nối, viết bài đa phương tiện, thảo luận theo chủ đề và bách khoa mở.",
    start_url: "/vi",
    display: "standalone",
    background_color: "#080D16",
    theme_color: "#080D16",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
