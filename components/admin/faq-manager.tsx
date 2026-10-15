"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CircleAlert, CirclePlus, Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import type { Faq } from "@/lib/types";
import { TextAreaField, TextField, ToggleField } from "./form-ui";
import { cn } from "@/lib/utils";

const SUGGESTED = ["General", "Buying", "Finance & leasing", "Selling", "After sale"];

type Draft = { question: string; answer: string; category: string; is_published: boolean };

function FaqEditor({
  initial,
  categories,
  submitLabel,
  busy,
  onSave,
  onCancel,
}: {
  initial: Draft;
  categories: string[];
  submitLabel: string;
  busy: boolean;
  onSave: (d: Draft) => void;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(d);
      }}
    >
      <TextField label="Question" value={d.question} onChange={(v) => setD({ ...d, question: v })} required placeholder="e.g. Can I pay in instalments?" />
      <TextAreaField label="Answer" value={d.answer} onChange={(v) => setD({ ...d, answer: v })} rows={4} hint="Plain text. A blank line starts a new paragraph." />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <input
            list="faq-topics" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })}
            placeholder="e.g. Buying"
            className="h-11 w-full rounded-xl border-0 bg-white px-3.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <datalist id="faq-topics">
            {Array.from(new Set([...categories, ...SUGGESTED])).map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <ToggleField
          className="sm:col-span-1"
          label={d.is_published ? "Visible on the website" : "Hidden"}
          checked={d.is_published}
          onChange={(v) => setD({ ...d, is_published: v })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit" disabled={busy || !d.question.trim() || !d.answer.trim()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy} className="h-10 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean) as string[]));

  async function call(key: string, url: string, init: RequestInit) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
        setError(first ?? data?.message ?? "Something went wrong. Try again.");
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

  const payload = (d: Draft) => ({ question: d.question.trim(), answer: d.answer.trim(), category: d.category.trim() || null, is_published: d.is_published });

  async function create(d: Draft) {
    if (await call("new", "/api/admin/faqs", { method: "POST", body: JSON.stringify(payload(d)) })) setAdding(false);
  }
  async function update(id: number, d: Draft) {
    if (await call(`save-${id}`, `/api/admin/faqs/${id}`, { method: "PUT", body: JSON.stringify(payload(d)) })) setEditingId(null);
  }
  function move(index: number, dir: -1 | 1) {
    const ids = faqs.map((f) => f.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    call(`move-${faqs[index].id}`, "/api/admin/faqs/reorder", { method: "POST", body: JSON.stringify({ ids }) });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm text-white">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {adding ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-2 ring-indigo-200">
          <h2 className="mb-4 text-base font-semibold text-slate-900">New question</h2>
          <FaqEditor
            initial={{ question: "", answer: "", category: "", is_published: true }}
            categories={categories} submitLabel="Add question" busy={busy === "new"}
            onSave={create} onCancel={() => setAdding(false)}
          />
        </section>
      ) : (
        <button
          type="button" onClick={() => setAdding(true)}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
        >
          <CirclePlus className="h-4 w-4" /> Add question
        </button>
      )}

      {faqs.length === 0 && !adding ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-slate-800">No questions yet</p>
          <p className="mt-1 text-sm text-slate-500">Add the questions customers ask most often.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((f, i) => (
            <li key={f.id} className={cn("rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200", !f.is_published && "opacity-75")}>
              {editingId === f.id ? (
                <FaqEditor
                  initial={{ question: f.question, answer: f.answer, category: f.category ?? "", is_published: f.is_published }}
                  categories={categories} submitLabel="Save changes" busy={busy === `save-${f.id}`}
                  onSave={(d) => update(f.id, d)} onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1">
                    <button type="button" aria-label="Move up" disabled={i === 0 || !!busy} onClick={() => move(i, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Move down" disabled={i === faqs.length - 1 || !!busy} onClick={() => move(i, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {f.category && <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{f.category}</span>}
                      {!f.is_published && <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Hidden</span>}
                    </div>
                    <h3 className="mt-1 font-semibold text-slate-900">{f.question}</h3>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-500">{f.answer}</p>

                    {deletingId === f.id ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">
                        <span className="text-sm font-medium text-rose-900">Delete this question?</span>
                        <button
                          type="button" disabled={busy === `del-${f.id}`}
                          onClick={async () => { if (!(await call(`del-${f.id}`, `/api/admin/faqs/${f.id}`, { method: "DELETE" }))) setDeletingId(null); }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          {busy === `del-${f.id}` && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />} Delete
                        </button>
                        <button type="button" onClick={() => setDeletingId(null)} className="h-8 rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200">Keep</button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setEditingId(f.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button" disabled={busy === `pub-${f.id}`}
                          onClick={() => call(`pub-${f.id}`, `/api/admin/faqs/${f.id}`, { method: "PATCH", body: JSON.stringify({ is_published: !f.is_published }) })}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {busy === `pub-${f.id}` ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : f.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {f.is_published ? "Hide" : "Show"}
                        </button>
                        <button type="button" onClick={() => setDeletingId(f.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
