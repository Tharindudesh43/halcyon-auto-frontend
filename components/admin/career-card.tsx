"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Clock, LoaderCircle, MapPin, Pencil, Power, Trash2, Wallet } from "lucide-react";
import type { CareerOpening } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CareerCard({ job }: { job: CareerOpening }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const expired = !!job.closing_date && job.closing_date < today;
  const live = job.is_open && !expired;

  async function request(kind: "toggle" | "delete", init: RequestInit) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/careers/${job.id}`, { ...init, headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.message === "string" ? data.message : "Something went wrong. Try again.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Can't reach the server. Check your connection.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg hover:shadow-indigo-100">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
            live ? "bg-emerald-100 text-emerald-700" : expired ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
          )}
        >
          {live ? "Live" : expired ? "Expired" : "Closed"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
        {job.department && <span className="rounded-full bg-slate-100 px-2.5 py-1">{job.department}</span>}
        {job.type && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{job.type}</span>}
        {job.location && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Wallet className="h-3 w-3" /> {job.salary}
          </span>
        )}
      </div>

      {job.closing_date && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="h-4 w-4" /> Closes {job.closing_date}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {confirmDelete && (
        <div className="mt-4 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <p className="text-sm font-medium text-rose-900">Delete this opening?</p>
          <p className="mt-0.5 text-xs text-rose-700">This can&apos;t be undone. To hide it instead, use Close.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy === "delete"}
              onClick={async () => {
                const ok = await request("delete", { method: "DELETE" });
                if (!ok) setConfirmDelete(false);
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {busy === "delete" && <LoaderCircle className="h-4 w-4 animate-spin" />} Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Keep
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
        <Link
          href={`/admin/careers/${job.id}/edit`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
        <button
          type="button"
          disabled={busy === "toggle"}
          onClick={() => request("toggle", { method: "PATCH", body: JSON.stringify({ is_open: !job.is_open }) })}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ring-1 transition-colors disabled:opacity-60",
            job.is_open
              ? "bg-slate-900 text-white ring-slate-900 hover:bg-slate-700"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
          )}
        >
          {busy === "toggle" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          {job.is_open ? "Close" : "Re-open"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete((v) => !v)}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-50 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </article>
  );
}
