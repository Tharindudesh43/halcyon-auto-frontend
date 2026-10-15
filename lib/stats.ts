import type { CarListing } from "./types";
import { finalPrice } from "./format";

export type Slice = { label: string; count: number };

function tally(values: (string | null | undefined)[], limit = 6): Slice[] {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = (v ?? "").trim() || "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function buildStats(cars: CarListing[]) {
  const sold = cars.filter((c) => c.status === "sold");
  const available = cars.filter((c) => c.status !== "sold");
  const discounted = available.filter((c) => (c.discount_percent ?? 0) > 0);

  const sum = (list: CarListing[]) => list.reduce((t, c) => t + finalPrice(c), 0);

  const now = new Date();
  const months: Slice[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = cars.filter((c) => {
      const created = new Date(c.created_at);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    months.push({ label: d.toLocaleString("en-US", { month: "short" }), count });
  }

  return {
    total: cars.length,
    sold: sold.length,
    available: available.length,
    discounted: discounted.length,
    inventoryValue: sum(available),
    soldValue: sum(sold),
    averagePrice: cars.length ? Math.round(sum(cars) / cars.length) : 0,
    sellThrough: cars.length ? Math.round((sold.length / cars.length) * 100) : 0,
    byBrand: tally(cars.map((c) => c.brand)),
    byFuel: tally(cars.map((c) => c.power_source), 4),
    byMonth: months,
    recent: cars.slice(0, 5),
  };
}
