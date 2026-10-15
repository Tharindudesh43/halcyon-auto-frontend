"use client";

import { useState } from "react";
import type { HeroMedia as Media, MediaFocus } from "@/lib/settings-types";
import { useMediaQuery, useMounted } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const POSITION: Record<MediaFocus, string> = {
  center: "50% 50%",
  top: "50% 15%",
  bottom: "50% 85%",
  left: "15% 50%",
  right: "85% 50%",
};
const pos = (m: Media) => POSITION[m.focus ?? "center"];

function stillOf(m: Media, fallback: string) {
  if (m.type === "image") return m.url;
  if (/res\.cloudinary\.com\/.+\/video\/upload\//.test(m.url)) return m.url.replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg");
  return fallback;
}


export function HeroMedia({
  desktop,
  mobile,
  fallback,
}: {
  desktop: Media | null;
  mobile: Media | null;
  fallback: string;
}) {
  const fallbackMedia: Media = { type: "image", url: fallback };
  const forDesktop = desktop ?? mobile ?? fallbackMedia;
  const forMobile = mobile ?? desktop ?? fallbackMedia;

  const mounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const active = isDesktop ? forDesktop : forMobile;
  const showVideo = mounted && active.type === "video" && !reduceMotion;
  const playing = showVideo && playingUrl === active.url;

  return (
    <>
      <picture>
        <source media="(min-width: 768px)" srcSet={stillOf(forDesktop, fallback)} />
        <img
          src={stillOf(forMobile, fallback)}
          alt=""
          fetchPriority="high"
          decoding="async"
          style={{ "--fp-m": pos(forMobile), "--fp-d": pos(forDesktop) } as React.CSSProperties}
          className={cn(
            "absolute inset-0 -z-20 h-full w-full object-cover [object-position:var(--fp-m)] md:[object-position:var(--fp-d)]",
            active.type === "image" && !active.url.toLowerCase().endsWith(".gif") && "animate-hero-zoom"
          )}
        />
      </picture>

      {showVideo && (
        <video
          key={active.url}
          src={active.url}
          poster={stillOf(active, fallback)}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => setPlayingUrl(active.url)}
          style={{ objectPosition: pos(active) }}
          className={cn(
            "absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </>
  );
}
