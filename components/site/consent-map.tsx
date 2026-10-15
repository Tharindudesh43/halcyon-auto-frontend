"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { setConsent, useConsent } from "@/lib/consent";


export function ConsentMap({ src, title }: { src: string; title: string }) {
  const consent = useConsent();
  const [loadOnce, setLoadOnce] = useState(false);

  if (consent === "accepted" || loadOnce) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_30%_20%,var(--color-muted),transparent_60%)] p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/25 text-ink">
        <MapPin className="h-6 w-6" />
      </span>
      <div>
        <p className="font-heading text-lg font-bold text-ink">Map</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Maps are provided by Google and may set cookies.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setLoadOnce(true)}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Load map
        </button>
        <button
          type="button"
          onClick={() => setConsent("accepted")}
          className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-border transition-colors hover:bg-muted"
        >
          Accept cookies
        </button>
      </div>
    </div>
  );
}
