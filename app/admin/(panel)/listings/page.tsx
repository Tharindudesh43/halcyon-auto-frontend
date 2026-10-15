import Link from "next/link";
import { CirclePlus, Search } from "lucide-react";
import { listAllCars } from "@/lib/cars";
import { PageHeader } from "@/components/admin/page-header";
import { ListingCard } from "@/components/admin/listing-card";
import { cn } from "@/lib/utils";

type SearchParams = { filter?: string; q?: string };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "sold", label: "Sold" },
  { key: "discounted", label: "Discounted" },
] as const;

export default async function ListedCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { filter = "all", q = "" } = await searchParams;
  const cars = await listAllCars();

  const counts = {
    all: cars.length,
    available: cars.filter((c) => c.status !== "sold").length,
    sold: cars.filter((c) => c.status === "sold").length,
    discounted: cars.filter((c) => c.status !== "sold" && (c.discount_percent ?? 0) > 0).length,
  };

  const term = q.trim().toLowerCase();
  const visible = cars.filter((c) => {
    if (filter === "available" && c.status === "sold") return false;
    if (filter === "sold" && c.status !== "sold") return false;
    if (filter === "discounted" && (c.status === "sold" || !(c.discount_percent && c.discount_percent > 0))) return false;
    if (term && !`${c.title} ${c.brand} ${c.model}`.toLowerCase().includes(term)) return false;
    return true;
  });

  const href = (key: string) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("filter", key);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/listings${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Listed cars"
        description={`${counts.all} ${counts.all === 1 ? "car" : "cars"} in your catalogue`}
        action={
          <Link
            href="/admin/listings/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
          >
            <CirclePlus className="h-4 w-4" />
            Add car
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={href(f.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              )}
            >
              {f.label}
              <span className={cn("ml-2 text-xs", filter === f.key ? "text-indigo-200" : "text-slate-400")}>
                {counts[f.key]}
              </span>
            </Link>
          ))}
        </div>

        <form method="get" className="relative w-full sm:w-72">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search brand, model or title"
            aria-label="Search listings"
            className="h-10 w-full rounded-xl border-0 bg-white pl-9 pr-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-800">
            {cars.length === 0 ? "No cars listed yet" : "No cars match this view"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {cars.length === 0 ? "Add your first car to see it here." : "Try another filter or search term."}
          </p>
          {cars.length === 0 && (
            <Link
              href="/admin/listings/new"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <CirclePlus className="h-4 w-4" />
              Add car
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((car) => (
            <ListingCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </>
  );
}
