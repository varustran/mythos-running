import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Myso — Không Gian Cho Mọi Ý Tưởng",
    short_name: "Myso",
    description: "Mạng xã hội mở, bách khoa tri thức số, phòng chat mã hóa và nền tảng sáng tạo nội dung đa lĩnh vực.",
    start_url: "/vi",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/mark.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
