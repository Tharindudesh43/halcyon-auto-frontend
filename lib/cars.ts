import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import { CarListing, CarListingInput, Paginated } from "./types";

export const carHref = (car: Pick<CarListing, "id" | "slug">) => `/cars/${car.slug || car.id}`;

const PUBLIC_REVALIDATE = 60; // seconds


export async function listCars(params?: Record<string, string>, opts: { fresh?: boolean } = {}) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<Paginated<CarListing>>(`/listings${qs}`, opts.fresh ? {} : { revalidate: PUBLIC_REVALIDATE });
}

export async function getCar(key: number | string, opts: { fresh?: boolean } = {}) {
  return apiFetch<CarListing>(`/listings/${encodeURIComponent(String(key))}`, opts.fresh ? {} : { revalidate: PUBLIC_REVALIDATE });
}

export async function createCar(input: CarListingInput) {
  const token = await getSessionToken();
  return apiFetch<CarListing>(`/listings`, { method: "POST", body: input, token });
}

export async function updateCar(id: number | string, input: CarListingInput) {
  const token = await getSessionToken();
  return apiFetch<CarListing>(`/listings/${id}`, { method: "PUT", body: input, token });
}

export async function updateCarStatus(id: number | string, status: "pending" | "sold") {
  const token = await getSessionToken();
  return apiFetch<CarListing>(`/listings/${id}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}

export async function deleteCar(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>(`/listings/${id}`, { method: "DELETE", token });
}

export async function listAllCars(params: Record<string, string> = {}) {
  const first = await listCars({ ...params, per_page: "100", page: "1" }, { fresh: true });
  const all = [...first.data];
  for (let page = 2; page <= first.last_page; page++) {
    const next = await listCars({ ...params, per_page: "100", page: String(page) }, { fresh: true });
    all.push(...next.data);
  }
  return all;
}

export async function updateCarDiscount(id: number | string, discount_percent: number | null) {
  const token = await getSessionToken();
  return apiFetch<CarListing>(`/listings/${id}/discount`, {
    method: "PATCH",
    body: { discount_percent },
    token,
  });
}

export async function getBrands() {
  try {
    const { data } = await listCars({ per_page: "100" });
    return [...new Set(data.map((c) => c.brand.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
