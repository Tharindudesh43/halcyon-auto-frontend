"use client";

export function trackEnquiry(carId: number, type: "whatsapp" | "call") {
  try {
    const payload = JSON.stringify({ type, car_listing_id: carId, source_path: window.location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/enquiries", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
    }
  } catch {
  }
}
