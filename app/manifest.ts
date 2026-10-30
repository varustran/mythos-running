import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mythos Running",
    short_name: "Mythos",
    description: "A digital ecosystem for every runner.",
    start_url: "/vi",
    display: "standalone",
    background_color: "#080D16",
    theme_color: "#080D16",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/mark.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
