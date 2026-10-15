"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/lib/consent";

export function CookieBanner() {
  const consent = useConsent();
  if (consent !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed inset-x-3 bottom-3 z-[60] animate-rise sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md"
    >
      <div className="rounded-3xl bg-card p-5 shadow-2xl shadow-lagoon/25 ring-1 ring-border">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/25 text-ink">
            <Cookie className="h-5 w-5" />
          </span>
          <div>
            <h2 id="cookie-title" className="font-heading text-lg font-bold text-ink">
              Your privacy matters
            </h2>
            <p id="cookie-desc" className="mt-1 text-sm leading-relaxed text-muted-foreground">
              We use cookies to keep the site working and to load maps from Google. Accept all, or keep to the essentials.{" "}
              <Link href="/privacy" className="font-semibold text-primary underline-offset-4 hover:underline">
                Privacy &amp; cookies
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConsent("declined")}
            className="h-11 rounded-full bg-card text-sm font-semibold text-ink ring-1 ring-input transition-colors hover:bg-muted active:scale-[0.97]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="h-11 rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover active:scale-[0.97]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => setConsent("unknown")} className={className}>
      Cookie settings
    </button>
  );
}
