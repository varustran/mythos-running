import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mythos Running — A Digital Ecosystem for Every Runner",
    short_name: "Mythos",
    description: "Global community, rich editorial publishing, performance science, and encrypted runner connections.",
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
