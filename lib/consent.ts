"use client";

import { useSyncExternalStore } from "react";

export type Consent = "accepted" | "declined" | "unknown" | "loading";

const KEY = "halcyon_cookie_consent";
const EVENT = "halcyon:consent";

function read(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

export function setConsent(value: "accepted" | "declined" | "unknown") {
  try {
    if (value === "unknown") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
  }
  document.cookie =
    value === "unknown"
      ? "cookie_consent=; Max-Age=0; Path=/; SameSite=Lax"
      : `cookie_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, read, () => "loading");
}
