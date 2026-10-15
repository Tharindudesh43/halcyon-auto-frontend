"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { ImageUploader, ImageItem } from "./image-uploader";
import type { CarListing } from "@/lib/types";
import { lkr } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  listing?: CarListing;
};

type Phase = "idle" | "uploading" | "saving";

const TRANSMISSIONS = ["Manual", "Automatic"];
const POWER_SOURCES = ["Petrol", "Diesel", "Hybrid", "Electric"];

const controlCls =
  "h-11 w-full rounded-xl border-0 bg-white px-3.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60";

export function CarForm({ mode, listing }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>(
    (listing?.images ?? []).map((url, i) => ({ id: `existing-${i}`, previewUrl: url }))
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<string>(listing?.price ? String(Math.round(Number(listing.price))) : "");
  const [discount, setDiscount] = useState<string>(listing?.discount_percent ? String(listing.discount_percent) : "");

  const [downPayment, setDownPayment] = useState<string>(
    listing?.down_payment && Number(listing.down_payment) > 0 ? String(Math.round(Number(listing.down_payment))) : ""
  );

  const busy = phase !== "idle";
  const priceNum = Number(price);
  const discountNum = Number(discount);
  const discountValid = discount === "" || (Number.isInteger(discountNum) && discountNum >= 0 && discountNum <= 90);
  const preview =
    priceNum > 0 && discountNum > 0 && discountValid
      ? Math.round((priceNum * (100 - discountNum)) / 100)
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!discountValid) {
      setError("Discount must be a whole number between 0 and 90.");
      return;
    }

    const downNum = Number(downPayment);
    if (downPayment !== "" && (!Number.isFinite(downNum) || downNum < 0)) {
      setError("Down payment must be a positive number.");
      return;
    }
    if (downNum > priceNum) {
      setError("Down payment can't be more than the car's price.");
      return;
    }

    const form = new FormData(e.currentTarget);

    // Step 1: upload any newly-picked photos now — not before. Images that
    // were already on the listing (no `file`) are already real URLs.
    setPhase("uploading");
    const finalImageUrls: string[] = [];
    try {
      for (const image of images) {
        if (!image.file) {
          finalImageUrls.push(image.previewUrl);
          continue;
        }
        const body = new FormData();
        body.append("file", image.file);
        const res = await fetch("/api/uploads", { method: "POST", body });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message ?? "Photo upload failed");
        finalImageUrls.push(data.url);
      }
    } catch (err) {
      setPhase("idle");
      setError(err instanceof Error ? err.message : "Photo upload failed");
      return;
    }

    // Step 2: save the listing itself, with the real image URLs.
    setPhase("saving");

    const payload = {
      title: form.get("title"),
      brand: form.get("brand"),
      model: form.get("model"),
      year: Number(form.get("year")),
      price: Number(form.get("price")),
      discount_percent: discountNum > 0 ? discountNum : null,
      down_payment: downNum > 0 ? downNum : null,
      mileage: form.get("mileage") || undefined,
      cc: form.get("cc") || undefined,
      power_source: form.get("power_source") || undefined,
      transmission: form.get("transmission") || undefined,
      location: form.get("location") || undefined,
      whatsapp: form.get("whatsapp") || undefined,
      description: form.get("description") || undefined,
      status: form.get("status") || "pending",
      images: finalImageUrls,
    };

    const url = mode === "create" ? "/api/admin/listings" : `/api/admin/listings/${listing!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const firstFieldError = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
        setError(firstFieldError ?? data?.message ?? "Could not save this listing");
        setPhase("idle");
        return;
      }
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
      setPhase("idle");
      return;
    }

    router.push("/admin/listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Basic details" subtitle="What buyers see first.">
        <Field label="Title" name="title" defaultValue={listing?.title} required className="sm:col-span-2" placeholder="e.g. Toyota Aqua G Grade 2016" />
        <Field label="Brand" name="brand" defaultValue={listing?.brand} required />
        <Field label="Model" name="model" defaultValue={listing?.model} required />
        <Field label="Year" name="year" type="number" defaultValue={listing?.year} required />
        <Field label="Location" name="location" defaultValue={listing?.location ?? ""} placeholder="e.g. Negombo" />
      </Section>

      <Section title="Specs">
        <Field label="Mileage" name="mileage" defaultValue={listing?.mileage ?? ""} placeholder="e.g. 78,000 km" />
        <Field label="Engine (cc)" name="cc" defaultValue={listing?.cc ?? ""} placeholder="e.g. 1500cc" />
        <SelectField label="Power source" name="power_source" options={POWER_SOURCES} defaultValue={listing?.power_source ?? ""} />
        <SelectField label="Transmission" name="transmission" options={TRANSMISSIONS} defaultValue={listing?.transmission ?? ""} />
      </Section>

      <Section title="Price & status">
        <div className="space-y-1.5">
          <label htmlFor="price" className="text-sm font-medium text-slate-700">Price (LKR)</label>
          <input
            id="price" name="price" type="number" min={0} required value={price}
            onChange={(e) => setPrice(e.target.value)} className={controlCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="discount" className="text-sm font-medium text-slate-700">Discount (%)</label>
          <input
            id="discount" name="discount" type="number" min={0} max={90} inputMode="numeric" value={discount}
            onChange={(e) => setDiscount(e.target.value)} placeholder="No discount"
            aria-invalid={!discountValid} className={cn(controlCls, !discountValid && "ring-rose-400")}
          />
        </div>
        {preview && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 sm:col-span-2">
            Buyers will see <span className="font-semibold">{lkr(preview)}</span>{" "}
            <span className="text-amber-700 line-through">{lkr(priceNum)}</span>
          </p>
        )}
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="down_payment" className="text-sm font-medium text-slate-700">Down payment (LKR)</label>
          <input
            id="down_payment" name="down_payment" type="number" min={0} inputMode="numeric" value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)} placeholder="Leave empty to hide"
            className={controlCls}
          />
          <p className="text-xs text-slate-500">
            The amount a buyer pays up-front. It shows on the car card and the car page. Change it any time.
          </p>
        </div>
        <SelectField
          label="Status" name="status" className="sm:col-span-2" allowEmpty={false}
          options={["pending", "sold"]} labels={{ pending: "Available", sold: "Sold" }}
          defaultValue={listing?.status ?? "pending"}
        />
      </Section>

      <Section title="Contact & description">
        <Field label="WhatsApp number" name="whatsapp" defaultValue={listing?.whatsapp ?? ""} placeholder="9477xxxxxxx" className="sm:col-span-2" />
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="description" name="description" rows={5} defaultValue={listing?.description ?? ""}
            className="w-full rounded-xl border-0 bg-white px-3.5 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Section>

      <Section title="Photos" subtitle="The first photo is the cover shown on the website.">
        <div className="sm:col-span-2">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </Section>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-rose-600 px-4 py-3 text-sm text-white">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {phase === "uploading"
            ? "Uploading photos…"
            : phase === "saving"
            ? "Saving…"
            : mode === "create"
            ? "Add car"
            : "Save changes"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => router.push("/admin/listings")}
          className="h-11 rounded-xl bg-white px-5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label, name, type = "text", defaultValue, required, placeholder, className,
}: {
  label: string; name: string; type?: string; defaultValue?: string | number;
  required?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">{label}</label>
      <input
        id={name} name={name} type={type} defaultValue={defaultValue}
        required={required} placeholder={placeholder} className={controlCls}
      />
    </div>
  );
}

function SelectField({
  label, name, options, defaultValue, className, allowEmpty = true, labels,
}: {
  label: string; name: string; options: string[]; defaultValue?: string; className?: string;
  allowEmpty?: boolean; labels?: Record<string, string>;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className={controlCls}>
        {allowEmpty && <option value="">—</option>}
        {options.map((o) => (
          <option key={o} value={o}>{labels?.[o] ?? o}</option>
        ))}
      </select>
    </div>
  );
}
