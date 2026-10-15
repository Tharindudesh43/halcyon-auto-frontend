import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { Enquiry, EnquirySummary, Paginated } from "./types";

export async function adminListEnquiries(params: Record<string, string> = {}) {
  const token = await getSessionToken();
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Paginated<Enquiry>>(`/admin/enquiries${qs ? `?${qs}` : ""}`, { token });
}

export async function adminEnquirySummary(days = 30) {
  const token = await getSessionToken();
  return apiFetch<EnquirySummary>(`/admin/enquiries/summary?days=${days}`, { token });
}

export async function setEnquiryHandled(id: number | string, handled: boolean) {
  const token = await getSessionToken();
  return apiFetch<Enquiry>(`/enquiries/${id}`, { method: "PATCH", body: { handled }, token });
}

export async function deleteEnquiry(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>(`/enquiries/${id}`, { method: "DELETE", token });
}
