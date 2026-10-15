"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { FormSection, ImageField, TextAreaField, TextField, ToggleField, controlCls } from "./form-ui";
import { MarkdownEditor } from "./markdown-editor";
import { useImage } from "./content-forms";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArticleForm({ mode, article }: { mode: "create" | "edit"; article?: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [category, setCategory] = useState<ArticleCategory>(article?.category ?? ARTICLE_CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [author, setAuthor] = useState(article?.author ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [published, setPublished] = useState(article?.is_published ?? false);
  const cover = useImage(article?.cover_image ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      if (!content.trim()) throw new Error("Write the article text before saving.");
      const cover_image = await cover.resolve();

      const res = await fetch(mode === "create" ? "/api/admin/articles" : `/api/admin/articles/${article!.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || null,
          category,
          excerpt: excerpt.trim() || null,
          content,
          cover_image,
          author: author.trim() || null,
          is_published: published,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
        throw new Error(first ?? data?.message ?? "Could not save this article.");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Can't reach the server. Check your connection.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection title="Article" subtitle="The headline and summary shown in lists and when the article is shared.">
        <TextField className="sm:col-span-2" label="Title" value={title} onChange={setTitle} required placeholder="e.g. 7 checks before you buy a used hybrid" />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as ArticleCategory)} className={cn(controlCls, "h-11")}>
            {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <TextField label="Author (optional)" value={author} onChange={setAuthor} placeholder="e.g. Halcyon Auto team" />
        <div className="sm:col-span-2">
          <TextAreaField
            label="Short summary" value={excerpt} onChange={(v) => setExcerpt(v.slice(0, 300))} rows={2}
            hint={`${excerpt.length}/300 — one or two sentences that make people want to read on.`}
          />
        </div>
        <ImageField label="Cover image" hint="Landscape, at least 1200 px wide, under 5 MB." aspect="aspect-[16/9]" {...cover.field} />
      </FormSection>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Content</h2>
        <p className="mb-4 text-sm text-slate-500">Write about cars, spare parts, maintenance or the wider automobile world.</p>
        <MarkdownEditor value={content} onChange={setContent} />
      </section>

      <FormSection title="Publishing">
        <TextField
          label="Web address (optional)" value={slug} onChange={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          placeholder="made from the title if empty"
          hint={mode === "edit" ? "Changing this changes the article's link." : "Letters, numbers and dashes only."}
        />
        <div />
        <ToggleField
          label={published ? "Published — visible on the website" : "Draft — only you can see it"}
          description="You can switch this any time. The publish date is set the first time it goes live."
          checked={published}
          onChange={setPublished}
        />
      </FormSection>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-rose-600 px-4 py-3 text-sm text-white">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit" disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : mode === "create" ? (published ? "Publish article" : "Save draft") : "Save changes"}
        </button>
        <button
          type="button" disabled={saving} onClick={() => router.push("/admin/articles")}
          className="h-11 rounded-xl bg-white px-5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
