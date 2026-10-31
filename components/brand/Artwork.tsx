import { cn } from "@/lib/utils";

const DEFAULT_IMAGES = [
  "/images/hero-running.jpg",
  "/images/route-kinh-thanh.jpg",
  "/images/route-song-huong.jpg",
  "/images/route-vong-canh.jpg",
  "/images/academy-beginner.jpg",
  "/images/academy-training.jpg",
  "/images/academy-physiology.jpg",
  "/images/academy-hydration.jpg",
  "/images/gear-shoes.jpg",
  "/images/gear-watch.jpg",
  "/images/community-1.jpg",
  "/images/community-2.jpg",
];

export function Artwork({
  seed = 1,
  className,
  label,
  tone = "dark",
  image,
}: {
  seed?: number;
  className?: string;
  label?: string;
  tone?: "dark" | "light";
  image?: string;
}) {
  const selectedImage = image || DEFAULT_IMAGES[(Math.abs(seed) - 1) % DEFAULT_IMAGES.length];

  return (
    <div
      aria-hidden="true"
      className={cn("group/artwork relative overflow-hidden bg-surface", className)}
    >
      {selectedImage ? (
        <>
          <img
            src={selectedImage}
            alt={label || "Myso"}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/30 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-surface to-elevated" />
      )}

      {label ? (
        <span className="absolute bottom-3 left-4 rounded-md bg-canvas/80 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink backdrop-blur shadow-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}
