import { Fuel, Search, Tag, Car } from "lucide-react";

const BUDGETS = [
  { value: "2000000", label: "Up to Rs 2M" },
  { value: "4000000", label: "Up to Rs 4M" },
  { value: "6000000", label: "Up to Rs 6M" },
  { value: "8000000", label: "Up to Rs 8M" },
  { value: "12000000", label: "Up to Rs 12M" },
  { value: "20000000", label: "Up to Rs 20M" },
];

const selectCls =
  "h-14 w-full appearance-none rounded-2xl border-0 bg-muted/60 pl-11 pr-4 text-sm font-semibold text-ink transition-colors hover:bg-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring";

export function HeroSearch({ brands }: { brands: string[] }) {
  return (
    <form
      action="/cars"
      method="get"
      aria-label="Find a car"
      className="grid gap-3 rounded-[2rem] bg-card p-4 shadow-2xl shadow-lagoon/20 ring-1 ring-border sm:grid-cols-2 md:p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <label className="relative block">
        <span className="sr-only">Brand</span>
        <Car className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <select name="brand" defaultValue="" className={selectCls}>
          <option value="">Any brand</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <label className="relative block">
        <span className="sr-only">Fuel type</span>
        <Fuel className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <select name="power_source" defaultValue="" className={selectCls}>
          <option value="">Any fuel</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Electric">Electric</option>
        </select>
      </label>

      <label className="relative block">
        <span className="sr-only">Budget</span>
        <Tag className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <select name="max_price" defaultValue="" className={selectCls}>
          <option value="">Any budget</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-8 text-base font-bold text-accent-foreground transition-all duration-200 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/40 active:scale-[0.98] sm:col-span-2 lg:col-span-1"
      >
        <Search className="h-5 w-5" />
        Search cars
      </button>
    </form>
  );
}
