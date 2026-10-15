import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, X } from "lucide-react";
import { getBrands, listCars } from "@/lib/cars";
import { CarCard } from "@/components/car-card";
import { FilterBar, type FilterValues } from "@/components/site/filter-bar";
import { buttonVariants } from "@/components/ui/button";
import { lkr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cars for sale",
  description: "Browse every car on Halcyon Auto. Filter by brand, fuel, gearbox and budget.",
};

type SearchParams = FilterValues & { page?: string };

const FILTER_KEYS = ["q", "brand", "power_source", "transmission", "min_price", "max_price"] as const;

export default async function CarsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const query: Record<string, string> = {};
  for (const key of [...FILTER_KEYS, "sort", "page"] as const) {
    if (params[key]) query[key] = params[key] as string;
  }

  const [listings, brands] = await Promise.all([listCars(query), getBrands()]);

  const hrefWith = (overrides: Record<string, string | null>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...query, ...overrides })) if (v) qs.set(k, v);
    const s = qs.toString();
    return `/cars${s ? `?${s}` : ""}`;
  };

  const chipLabel: Record<string, (v: string) => string> = {
    q: (v) => `“${v}”`,
    brand: (v) => v,
    power_source: (v) => v,
    transmission: (v) => v,
    min_price: (v) => `From ${lkr(Number(v))}`,
    max_price: (v) => `Up to ${lkr(Number(v))}`,
  };
  const chips = FILTER_KEYS.filter((k) => params[k]).map((k) => ({
    key: k,
    label: chipLabel[k](params[k] as string),
  }));

  const { current_page: current, last_page: last } = listings;
  const pages = Array.from({ length: last }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === last || Math.abs(p - current) <= 1
  );

  return (
    <div className="container-page page-top pb-8">
      <header className="mb-8 animate-rise">
        <h1 className="font-heading text-4xl font-extrabold text-ink md:text-5xl">Cars for sale</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {listings.total} {listings.total === 1 ? "car" : "cars"}
          {chips.length > 0 ? " match your search" : " ready to go"}
        </p>
      </header>

      <FilterBar key={JSON.stringify(query)} values={params} brands={brands} activeCount={chips.length} />

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={hrefWith({ [chip.key]: null, page: null })}
              aria-label={`Remove filter ${chip.label}`}
              className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1.5 pl-3.5 pr-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {chip.label}
              <X className="h-3.5 w-3.5" />
            </Link>
          ))}
          <Link href="/cars" className="px-2 text-sm font-semibold text-muted-foreground hover:text-ink">
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-8">
        {listings.data.length === 0 ? (
          <div className="animate-pop rounded-3xl border-2 border-dashed border-border bg-card px-6 py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-ink">No cars match those filters</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Try removing a filter or widening your budget. Can&apos;t find what you need? Tell us and we&apos;ll look for it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/cars" className={buttonVariants({ variant: "default" })}>Clear filters</Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Ask us to find one</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.data.map((car, i) => (
                <div key={car.id} className="reveal">
                  <CarCard car={car} priority={i < 3} />
                </div>
              ))}
            </div>

            {last > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                <Link
                  href={hrefWith({ page: String(Math.max(1, current - 1)) })}
                  aria-label="Previous page"
                  aria-disabled={current === 1}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-card ring-1 ring-border transition-colors hover:bg-muted",
                    current === 1 && "pointer-events-none opacity-40"
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>

                {pages.map((p, i) => (
                  <span key={p} className="flex items-center gap-2">
                    {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
                    <Link
                      href={hrefWith({ page: String(p) })}
                      aria-current={p === current ? "page" : undefined}
                      className={cn(
                        "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors",
                        p === current ? "bg-primary text-white" : "bg-card text-ink ring-1 ring-border hover:bg-muted"
                      )}
                    >
                      {p}
                    </Link>
                  </span>
                ))}

                <Link
                  href={hrefWith({ page: String(Math.min(last, current + 1)) })}
                  aria-label="Next page"
                  aria-disabled={current === last}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-card ring-1 ring-border transition-colors hover:bg-muted",
                    current === last && "pointer-events-none opacity-40"
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
