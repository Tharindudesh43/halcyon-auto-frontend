import type { CarListing } from "./types";

export function lkr(n: number) {
  return `Rs ${Math.round(n).toLocaleString("en-US")}`;
}

export function finalPrice(car: Pick<CarListing, "price" | "discount_percent">) {
  const price = Number(car.price);
  const off = car.discount_percent ?? 0;
  return off > 0 ? Math.round((price * (100 - off)) / 100) : price;
}

export function compactLkr(n: number) {
  const short = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  return `Rs ${short}`;
}

export function isNewListing(createdAt: string) {
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
}

export const digitsOnly = (v: string) => v.replace(/\D/g, "");
