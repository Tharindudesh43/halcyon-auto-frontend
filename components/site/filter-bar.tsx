"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterValues = {
  q?: string;
  brand?: string;
  transmission?: string;
  power_source?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
};

const fieldCls =
  "h-12 w-full rounded-2xl border-0 bg-muted/60 px-4 text-sm font-medium text-ink transition-colors placeholder:text-muted-foreground hover:bg-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring";

export function FilterBar({
  values,
  brands,
  activeCount,
}: {
  values: FilterValues;
  brands: string[];
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const autoSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

  return (
    <form
      method="get"
      action="/cars"
      className="rounded-[1.75rem] bg-card p-3 shadow-sm ring-1 ring-border md:p-4"
    >
      <div className="flex gap-2">
        <label className="relative block flex-1">
          <span className="sr-only">Search cars</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <input
            name="q"
            defaultValue={values.q}
            placeholder="Search by name, brand or model"
            className={cn(fieldCls, "pl-12")}
          />
        </label>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="filter-panel"
          className="relative inline-flex h-12 items-center gap-2 rounded-2xl bg-muted/60 px-4 text-sm font-semibold text-ink transition-colors hover:bg-muted md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <button
          type="submit"
          className="hidden h-12 items-center rounded-2xl bg-accent px-7 text-sm font-bold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] md:inline-flex"
        >
          Search
        </button>
      </div>

      <div
        id="filter-panel"
        className={cn(
          "mt-3 grid-cols-2 gap-3 md:grid md:grid-cols-6",
          open ? "grid" : "hidden"
        )}
      >
        <select name="brand" aria-label="Brand" defaultValue={values.brand ?? ""} onChange={autoSubmit} className={fieldCls}>
          <option value="">Any brand</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select name="power_source" aria-label="Fuel" defaultValue={values.power_source ?? ""} onChange={autoSubmit} className={fieldCls}>
          <option value="">Any fuel</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Electric">Electric</option>
        </select>
        <select name="transmission" aria-label="Transmission" defaultValue={values.transmission ?? ""} onChange={autoSubmit} className={fieldCls}>
          <option value="">Any gearbox</option>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>
        <input name="min_price" type="number" inputMode="numeric" min={0} aria-label="Minimum price" placeholder="Min price (Rs)" defaultValue={values.min_price} className={fieldCls} />
        <input name="max_price" type="number" inputMode="numeric" min={0} aria-label="Maximum price" placeholder="Max price (Rs)" defaultValue={values.max_price} className={fieldCls} />
        <select name="sort" aria-label="Sort" defaultValue={values.sort ?? "latest"} onChange={autoSubmit} className={fieldCls}>
          <option value="latest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>

        <div className="col-span-2 flex gap-2 md:hidden">
          <button
            type="submit"
            className="h-12 flex-1 rounded-2xl bg-accent text-sm font-bold text-accent-foreground active:scale-[0.98]"
          >
            Show results
          </button>
          {activeCount > 0 && (
            <Link href="/cars" className="inline-flex h-12 items-center rounded-2xl px-4 text-sm font-semibold text-muted-foreground hover:bg-muted">
              Clear
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
