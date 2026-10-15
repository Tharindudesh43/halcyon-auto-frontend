"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CircleAlert, ExternalLink, Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import type { ArticleSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArticleAdminCard({ article }: { article: ArticleSummary }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request(kind: "publish" | "delete", init: RequestInit) {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, { ...init, headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.message === "string" ? data.message : "Something went wrong. Try again.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Can't reach the server. Check your connection.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg hover:shadow-indigo-100">
      <div className="relative aspect-[16/9] bg-slate-100">
        {article.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.cover_image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-fuchsia-50 text-indigo-300">
            <BookOpen className="h-8 w-8" />
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow",
            article.is_published ? "bg-emerald-500" : "bg-slate-600"
          )}
        >
          {article.is_published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-indigo-600">{article.category}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">{article.title}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {article.published_at ? `Published ${new Date(article.published_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}` : `Created ${new Date(article.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}`}
        </p>

        {error && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}

        {confirmDelete && (
          <div className="mt-4 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="text-sm font-medium text-rose-900">Delete this article?</p>
            <p className="mt-0.5 text-xs text-rose-700">This can&apos;t be undone. To hide it instead, unpublish it.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button" disabled={busy === "delete"}
                onClick={async () => { if (!(await request("delete", { method: "DELETE" }))) setConfirmDelete(false); }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {busy === "delete" && <LoaderCircle className="h-4 w-4 animate-spin" />} Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">Keep</button>
            </div>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/admin/articles/${article.id}/edit`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            type="button" disabled={busy === "publish"}
            onClick={() => request("publish", { method: "PATCH", body: JSON.stringify({ is_published: !article.is_published }) })}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ring-1 transition-colors disabled:opacity-60",
              article.is_published ? "bg-slate-900 text-white ring-slate-900 hover:bg-slate-700" : "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
            )}
          >
            {busy === "publish" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {article.is_published ? "Unpublish" : "Publish"}
          </button>
          {article.is_published ? (
            <Link href={`/articles/${article.slug}`} target="_blank" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
              <ExternalLink className="h-4 w-4" /> View
            </Link>
          ) : (
            <span />
          )}
          <button type="button" onClick={() => setConfirmDelete((v) => !v)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-50 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
