"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Fuel,
  Gauge,
  LoaderCircle,
  MapPin,
  Pencil,
  Percent,
  Settings2,
  Trash2,
  Undo2,
} from "lucide-react";
import type { CarListing } from "@/lib/types";
import { finalPrice, lkr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { cld } from "@/lib/cloudinary";

const PRESETS = [5, 10, 15, 20, 25];

type Busy = "status" | "discount" | "delete" | null;

export function ListingCard({ car }: { car: CarListing }) {
  const router = useRouter();
  const images = car.images?.filter(Boolean) ?? [];
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [percent, setPercent] = useState<string>(String(car.discount_percent ?? ""));

  const sold = car.status === "sold";
  const off = car.discount_percent ?? 0;
  const original = Number(car.price);
  const current = finalPrice(car);

  async function request(kind: Exclude<Busy, null>, init: RequestInit) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${car.id}`, {
        ...init,
        headers: { "Content-Type": "application/json" },
      });
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

  const toggleSold = () =>
    request("status", { method: "PATCH", body: JSON.stringify({ status: sold ? "pending" : "sold" }) });

  async function saveDiscount(value: number | null) {
    const ok = await request("discount", {
      method: "PATCH",
      body: JSON.stringify({ discount_percent: value }),
    });
    if (ok) setDiscountOpen(false);
  }

  async function remove() {
    const ok = await request("delete", { method: "DELETE" });
    if (!ok) setConfirmDelete(false);
  }

  const typed = Number(percent);
  const validPercent = Number.isInteger(typed) && typed >= 1 && typed <= 90;
  const previewPrice = validPercent ? Math.round((original * (100 - typed)) / 100) : null;

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-xl hover:shadow-indigo-100">
      {/* Photos */}
      <div className="group relative aspect-[4/3] overflow-hidden bg-slate-900">
        {images.length > 0 ? (
          <>
            {/* blurred copy fills any empty space so tall/wide photos still look good */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cld(images[index], 80)}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cld(images[index], 700)}
              alt={`${car.title} — photo ${index + 1}`}
              className={cn(
                "relative h-full w-full object-cover transition duration-500 group-hover:scale-105",
                sold && "grayscale-[60%]"
              )}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-400">
            No photo yet
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold text-white shadow",
              sold ? "bg-slate-700" : "bg-emerald-500"
            )}
          >
            {sold ? "Sold" : "Available"}
          </span>
          {off > 0 && !sold && (
            <span className="rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow">
              −{off}% off
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-800 opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-800 opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{car.title}</h3>
        <p className="text-sm text-slate-500">
          {car.brand} {car.model} · {car.year}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          {car.power_source && <Chip icon={<Fuel className="h-3.5 w-3.5" />}>{car.power_source}</Chip>}
          {car.transmission && <Chip icon={<Settings2 className="h-3.5 w-3.5" />}>{car.transmission}</Chip>}
          {car.mileage && <Chip icon={<Gauge className="h-3.5 w-3.5" />}>{car.mileage}</Chip>}
          {car.location && <Chip icon={<MapPin className="h-3.5 w-3.5" />}>{car.location}</Chip>}
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <p className={cn("text-2xl font-bold", sold ? "text-slate-400" : "text-indigo-600")}>{lkr(current)}</p>
          {off > 0 && (
            <p className="text-sm text-slate-400 line-through">{lkr(original)}</p>
          )}
        </div>

        {Number(car.down_payment) > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            Down payment <span className="font-semibold text-slate-700">{lkr(Number(car.down_payment))}</span>
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        {/* Discount editor */}
        {discountOpen && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="text-sm font-medium text-amber-900">Set discount</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercent(String(p))}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    String(p) === percent
                      ? "bg-amber-500 text-white"
                      : "bg-white text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                  )}
                >
                  {p}%
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={90}
                inputMode="numeric"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                aria-label="Discount percent"
                placeholder="1–90"
                className="h-9 w-20 rounded-lg border border-amber-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm text-amber-900">% off</span>
              {previewPrice && <span className="ml-auto text-sm font-semibold text-amber-900">{lkr(previewPrice)}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!validPercent || busy === "discount"}
                onClick={() => saveDiscount(typed)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {busy === "discount" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Apply
              </button>
              {off > 0 && (
                <button
                  type="button"
                  disabled={busy === "discount"}
                  onClick={() => {
                    setPercent("");
                    saveDiscount(null);
                  }}
                  className="h-9 rounded-lg bg-white px-3 text-sm font-medium text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
              <button
                type="button"
                onClick={() => setDiscountOpen(false)}
                className="h-9 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="mt-4 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="text-sm font-medium text-rose-900">Delete this listing?</p>
            <p className="mt-0.5 text-xs text-rose-700">This can&apos;t be undone.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={remove}
                disabled={busy === "delete"}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {busy === "delete" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={busy === "delete"}
                className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Keep
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href={`/admin/listings/${car.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={toggleSold}
            disabled={busy === "status"}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60",
              sold
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                : "bg-slate-900 text-white hover:bg-slate-700"
            )}
          >
            {busy === "status" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : sold ? (
              <Undo2 className="h-4 w-4" />
            ) : (
              <CircleCheck className="h-4 w-4" />
            )}
            {sold ? "Mark available" : "Mark sold"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDiscountOpen((v) => !v);
              setConfirmDelete(false);
            }}
            disabled={sold}
            title={sold ? "Sold cars can't be discounted" : undefined}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-50 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Percent className="h-4 w-4" />
            {off > 0 ? "Edit discount" : "Discount"}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDelete((v) => !v);
              setDiscountOpen(false);
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1">
      {icon}
      {children}
    </span>
  );
}
