import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { Faq, FaqInput } from "./types";

export async function listFaqs() {
  try {
    return await apiFetch<Faq[]>("/faqs", { revalidate: 300 });
  } catch {
    return [];
  }
}

export async function adminListFaqs() {
  const token = await getSessionToken();
  return apiFetch<Faq[]>("/admin/faqs", { token });
}

export async function createFaq(input: FaqInput) {
  const token = await getSessionToken();
  return apiFetch<Faq>("/faqs", { method: "POST", body: input, token });
}

export async function updateFaq(id: number | string, input: Partial<FaqInput>, partial = false) {
  const token = await getSessionToken();
  return apiFetch<Faq>(`/faqs/${id}`, { method: partial ? "PATCH" : "PUT", body: input, token });
}

export async function deleteFaq(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>(`/faqs/${id}`, { method: "DELETE", token });
}

export async function reorderFaqs(ids: number[]) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>("/faqs/reorder", { method: "POST", body: { ids }, token });
}
