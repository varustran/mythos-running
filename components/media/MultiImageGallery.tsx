"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText, Download } from "lucide-react";

interface MultiImageGalleryProps {
  mediaUrls: string[];
}

export function MultiImageGallery({ mediaUrls }: { mediaUrls?: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  // Separate images, videos, and documents
  const images: string[] = [];
  const videos: string[] = [];
  const docs: string[] = [];

  mediaUrls.forEach((url) => {
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) {
      videos.push(url);
    } else if (/\.(pdf|doc|docx|xlsx|pptx|zip|txt|gpx)$/i.test(url)) {
      docs.push(url);
    } else {
      images.push(url);
    }
  });

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomLevel(1);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
      setZoomLevel(1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
      setZoomLevel(1);
    }
  };

  return (
    <div className="space-y-2.5 pt-1">
      {/* Videos */}
      {videos.map((vid, i) => (
        <div key={`vid-${i}`} className="rounded-2xl overflow-hidden border border-line bg-black">
          <video controls playsInline preload="metadata" className="w-full max-h-[460px] object-contain" src={vid} />
        </div>
      ))}

      {/* Documents */}
      {docs.map((doc, i) => (
        <a
          key={`doc-${i}`}
          href={doc}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 p-3 rounded-2xl border border-line bg-canvas hover:border-accent text-xs font-mono text-ink transition shadow-sm"
        >
          <FileText className="h-5 w-5 text-accent" />
          <span className="underline truncate max-w-xs">{doc.split("/").pop()}</span>
          <Download className="h-4 w-4 text-muted ml-auto" />
        </a>
      ))}

      {/* Images with Responsive Dynamic Layout */}
      {images.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-line shadow-sm">
          {images.length === 1 && (
            <div
              className="cursor-pointer max-h-[520px] overflow-hidden bg-surface flex items-center justify-center"
              onClick={() => openLightbox(0)}
            >
              <img
                src={images[0]}
                alt="Post attachment"
                className="w-full h-full object-cover transition hover:scale-[1.01]"
                loading="lazy"
              />
            </div>
          )}

          {images.length === 2 && (
            <div className="grid grid-cols-2 gap-1 bg-surface">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer h-64 overflow-hidden"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {images.length === 3 && (
            <div className="grid grid-cols-3 gap-1 h-72 bg-surface">
              <div
                className="col-span-2 h-full cursor-pointer overflow-hidden"
                onClick={() => openLightbox(0)}
              >
                <img src={images[0]} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
              </div>
              <div className="flex flex-col gap-1 h-full">
                <div
                  className="h-1/2 cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(1)}
                >
                  <img src={images[1]} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
                </div>
                <div
                  className="h-1/2 cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(2)}
                >
                  <img src={images[2]} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
                </div>
              </div>
            </div>
          )}

          {images.length === 4 && (
            <div className="grid grid-cols-2 gap-1 bg-surface">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer h-48 overflow-hidden"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {images.length >= 5 && (
            <div className="grid grid-cols-2 gap-1 bg-surface">
              {images.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer h-48 overflow-hidden"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img} alt="Post attachment" className="w-full h-full object-cover hover:scale-[1.02] transition" loading="lazy" />
                </div>
              ))}
              {/* 4th item with overlay */}
              <div
                className="relative cursor-pointer h-48 overflow-hidden"
                onClick={() => openLightbox(3)}
              >
                <img src={images[3]} alt="Post attachment" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-xs">
                  +{images.length - 3}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in">
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
            <span className="text-xs font-mono">
              {lightboxIndex + 1} / {images.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 2.5))}
                title="Phóng to"
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
                title="Thu nhỏ"
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                title="Đóng (Esc)"
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Active Image */}
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex items-center justify-center">
            <img
              src={images[lightboxIndex]}
              alt="Fullscreen media"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-200"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
