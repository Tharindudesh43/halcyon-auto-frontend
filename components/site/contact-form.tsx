"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          elapsed_ms: Date.now() - shownAt.current,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const first = body?.errors ? (Object.values(body.errors)[0] as string[] | undefined)?.[0] : null;
        setMessage(first ?? body?.message ?? "We couldn't send that. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      shownAt.current = Date.now();
      setStatus("sent");
    } catch {
      setMessage("Can't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[22rem] animate-pop flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-bold text-ink">Message sent</h2>
        <p className="mt-2 max-w-xs text-muted-foreground">Thanks for reaching out we&apos;ll get back to you soon.</p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-heading text-2xl font-bold text-ink">Send us a message</h2>
        <p className="mt-1 text-sm text-muted-foreground">We usually reply the same day.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="name" required disabled={status === "sending"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={status === "sending"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          disabled={status === "sending"}
          placeholder="Tell us which car you're interested in, or what you'd like to sell."
          className="flex w-full rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-primary/50 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
        />
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && message && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
