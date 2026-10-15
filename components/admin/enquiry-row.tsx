"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CircleCheck, LoaderCircle, MessageCircle, Phone, Trash2, Undo2 } from "lucide-react";
import type { Enquiry } from "@/lib/types";
import { digitsOnly } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE = {
  test_drive: { label: "Test drive", icon: CalendarCheck, tone: "bg-fuchsia-50 text-fuchsia-700" },
  whatsapp: { label: "WhatsApp tap", icon: MessageCircle, tone: "bg-emerald-50 text-emerald-700" },
  call: { label: "Call tap", icon: Phone, tone: "bg-sky-50 text-sky-700" },
} as const;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"handled" | "delete" | null>(null);
  const t = TYPE[enquiry.type];
  const handled = Boolean(enquiry.handled_at);
  const isLead = enquiry.type === "test_drive";
  const phone = digitsOnly(enquiry.phone ?? "");
  const title = enquiry.car?.title ?? enquiry.car_title ?? "Deleted car";

  async function run(kind: "handled" | "delete") {
    setBusy(kind);
    try {
      await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: kind === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: kind === "handled" ? JSON.stringify({ handled: !handled }) : undefined,
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className={cn("rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200", handled && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", t.tone)}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </span>
            <span className="text-xs text-slate-500">{when(enquiry.created_at)}</span>
          </div>
          <p className="mt-2 truncate font-medium text-slate-900">{title}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => run("handled")}
            disabled={busy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            {busy === "handled" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : handled ? <Undo2 className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}
            {handled ? "Reopen" : "Done"}
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => confirm("Delete this enquiry?") && run("delete")}
            disabled={busy !== null}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
          >
            {busy === "delete" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isLead && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
          <p className="text-slate-700">
            <span className="font-semibold">{enquiry.name}</span>
            {enquiry.preferred_date && <span className="text-slate-500"> · wants {enquiry.preferred_date}</span>}
          </p>
          {enquiry.message && <p className="whitespace-pre-line text-slate-600">{enquiry.message}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {enquiry.phone && (
              <a href={`tel:+${phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-sky-50 px-3 font-medium text-sky-700 hover:bg-sky-100">
                <Phone className="h-4 w-4" /> {enquiry.phone}
              </a>
            )}
            {phone && (
              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${enquiry.name ?? ""}, thanks for booking a test drive of the ${title} at Halcyon Auto.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
