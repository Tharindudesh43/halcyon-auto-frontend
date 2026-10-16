import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { Article, ArticleInput, ArticleSummary, Paginated } from "./types";

/** Public — published articles. */
export async function listArticles(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    return await apiFetch<Paginated<ArticleSummary>>(`/articles${qs ? `?${qs}` : ""}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

export async function getArticle(slug: string) {
  return apiFetch<Article>(`/articles/${encodeURIComponent(slug)}`, { revalidate: 300 });
}

export async function adminListArticles() {
  const token = await getSessionToken();
  return apiFetch<ArticleSummary[]>("/admin/articles", { token });
}

export async function adminGetArticle(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<Article>(`/admin/articles/${id}`, { token });
}

export async function createArticle(input: ArticleInput) {
  const token = await getSessionToken();
  return apiFetch<Article>("/articles", { method: "POST", body: input, token });
}

export async function updateArticle(id: number | string, input: Partial<ArticleInput>, partial = false) {
  const token = await getSessionToken();
  return apiFetch<Article>(`/articles/${id}`, { method: partial ? "PATCH" : "PUT", body: input, token });
}

export async function deleteArticle(id: number | string) {
  const token = await getSessionToken();
  return apiFetch<{ message: string }>(`/articles/${id}`, { method: "DELETE", token });
}
