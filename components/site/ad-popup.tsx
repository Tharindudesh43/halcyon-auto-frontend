"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const KEY = "halcyon_ad_seen";
const GAP_MS = 2 * 60 * 60 * 1000; // show again 2 hours after the last time
const DELAY_MS = 2500;

type Seen = { at: number; stamp: string };

export function AdPopup({
  image,
  link,
  alt,
  version,
}: {
  image: string;
  link: string | null;
  alt: string | null;
  version: number;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stamp = `${image}|${version}`;
    let seen: Seen | null = null;
    try {
      seen = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    } catch {
      seen = null;
    }
    const due = !seen || seen.stamp !== stamp || Date.now() - seen.at >= GAP_MS;
    if (!due) return;

    new window.Image().src = image;

    const timer = window.setTimeout(() => {
      setOpen(true);
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), stamp } satisfies Seen));
      } catch {
      }
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [image, version]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const picture = (
    <img
      src={image}
      alt={alt || "Special offer"}
      className="max-h-[80svh] w-full rounded-3xl bg-card object-contain shadow-2xl"
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Special offer"}
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[80] flex animate-pop items-center justify-center bg-lagoon-deep/75 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute -right-2 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-xl transition-transform hover:scale-110 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="block">
            {picture}
          </a>
        ) : (
          picture
        )}
      </div>
    </div>
  );
}
