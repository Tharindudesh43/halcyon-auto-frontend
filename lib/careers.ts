import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { CareerInput, CareerOpening } from "./types";

export async function listOpenCareers() {
  try {
    return await apiFetch<CareerOpening[]>("/careers", { revalidate: 300 });
  } catch {
    return [];
  }
}

export async function adminListCareers() {
  const token = await getSessionToken();
  return apiFetch<CareerOpening[]>("/admin/careers", { token });
}

export async function adminGetCareer(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<CareerOpening>(`/admin/careers/${id}`, { token });
}

export async function createCareer(input: CareerInput) {
  const token = await getSessionToken();
  return apiFetch<CareerOpening>("/careers", { method: "POST", body: input, token });
}

export async function updateCareer(id: number | string, input: Partial<CareerInput>, partial = false) {
  const token = await getSessionToken();
  return apiFetch<CareerOpening>(`/careers/${id}`, { method: partial ? "PATCH" : "PUT", body: input, token });
}

export async function deleteCareer(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>(`/careers/${id}`, { method: "DELETE", token });
}
