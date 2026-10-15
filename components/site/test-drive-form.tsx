"use client";

import { useRef, useState } from "react";
import { CalendarCheck, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TestDriveForm({ carId, carTitle }: { carId: number; carTitle: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const openedAt = useRef(0);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);

    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "test_drive",
          car_listing_id: carId,
          name: data.get("name"),
          phone: data.get("phone"),
          preferred_date: data.get("preferred_date") || null,
          message: data.get("message") || null,
          source_path: window.location.pathname,
          website: data.get("website"),
          elapsed_ms: Date.now() - openedAt.current,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const first = body?.errors ? (Object.values(body.errors)[0] as string[] | undefined)?.[0] : null;
        setMessage(first ?? (res.status === 429 ? "Too many requests. Please try again in a few minutes." : "We couldn't send that. Please try again."));
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setMessage("Can't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm text-ink">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <p>
          <span className="font-semibold">Request received.</span> We&apos;ll call you to confirm a time to see the {carTitle}.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="accent"
        size="lg"
        className="mt-3 w-full"
        onClick={() => {
          openedAt.current = Date.now();
          setOpen(true);
        }}
      >
        <CalendarCheck className="h-5 w-5" /> Book a test drive
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl bg-muted/60 p-4">
      <p className="font-heading text-lg font-bold text-ink">Book a test drive</p>

      <div className="space-y-1.5">
        <Label htmlFor="td-name">Your name</Label>
        <Input id="td-name" name="name" autoComplete="name" required maxLength={120} disabled={status === "sending"} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="td-phone">Phone number</Label>
        <Input id="td-phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} disabled={status === "sending"} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="td-date">Preferred date (optional)</Label>
        <Input id="td-date" name="preferred_date" type="date" min={today} disabled={status === "sending"} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="td-message">Anything we should know? (optional)</Label>
        <textarea
          id="td-message"
          name="message"
          rows={2}
          maxLength={1000}
          disabled={status === "sending"}
          className="flex w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
        />
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && message && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {status === "sending" ? "Sending…" : "Request test drive"}
      </Button>
    </form>
  );
}
