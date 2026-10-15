"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { createPortal } from "react-dom";

export function ImageGallery({ images, alt, sold = false }: { images: string[]; alt: string; sold?: boolean }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [lightbox, go]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        No photos yet
      </div>
    );
  }

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current === null || count < 2) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  return (
    <div>
      <div className="group relative overflow-hidden rounded-3xl bg-ink" {...swipe}>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="View photo full screen"
          className="block aspect-[4/3] w-full cursor-zoom-in md:aspect-[16/11]"
        >
          <img
            key={active}
            src={cld(images[active], 1000)}
            srcSet={cldSrcSet(images[active], [640, 1000, 1400])}
            sizes="(min-width: 1024px) 60vw, 100vw"
            alt={`${alt} — photo ${active + 1} of ${count}`}
            className={cn("h-full w-full animate-pop object-cover", sold && "grayscale-[55%]")}
          />
        </button>

        <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Expand className="h-3.5 w-3.5" /> {active + 1} / {count}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition-all hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition-all hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-200 sm:h-20 sm:w-28",
                i === active ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"
              )}
            >
              <img src={cld(img, 220)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

     {lightbox && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photos`}
          className="fixed inset-0 z-[70] flex animate-pop items-center justify-center bg-black/92 p-4"
          onClick={() => setLightbox(false)}
          {...swipe}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={cld(images[active], 1800)}
            alt={`${alt} — photo ${active + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="absolute bottom-5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
                {active + 1} / {count}
              </span>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}