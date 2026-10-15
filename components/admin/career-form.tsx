"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { FormSection, TextAreaField, TextField, ToggleField, controlCls } from "./form-ui";
import { CAREER_TYPES, type CareerOpening } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CareerForm({ mode, job }: { mode: "create" | "edit"; job?: CareerOpening }) {
  const router = useRouter();
  const [v, setV] = useState({
    title: job?.title ?? "",
    department: job?.department ?? "",
    location: job?.location ?? "",
    type: job?.type ?? "",
    salary: job?.salary ?? "",
    closing_date: job?.closing_date ?? "",
    description: job?.description ?? "",
    requirements: job?.requirements ?? "",
  });
  const [isOpen, setIsOpen] = useState(job?.is_open ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof v) => (value: string) => setV((p) => ({ ...p, [key]: value }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const clean = (s: string) => s.trim() || null;
    const payload = {
      title: v.title.trim(),
      department: clean(v.department),
      location: clean(v.location),
      type: v.type || null,
      salary: clean(v.salary),
      closing_date: v.closing_date || null,
      description: clean(v.description),
      requirements: clean(v.requirements),
      is_open: isOpen,
    };

    try {
      const res = await fetch(mode === "create" ? "/api/admin/careers" : `/api/admin/careers/${job!.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
        setError(first ?? data?.message ?? "Could not save this opening.");
        setSaving(false);
        return;
      }
      router.push("/admin/careers");
      router.refresh();
    } catch {
      setError("Can't reach the server. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection title="The role">
        <TextField className="sm:col-span-2" label="Job title" value={v.title} onChange={set("title")} required placeholder="e.g. Sales Executive" />
        <TextField label="Department" value={v.department} onChange={set("department")} placeholder="e.g. Sales" />
        <TextField label="Location" value={v.location} onChange={set("location")} placeholder="e.g. Kurunagala" />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Employment type</span>
          <select value={v.type} onChange={(e) => set("type")(e.target.value)} className={cn(controlCls, "h-11")}>
            <option value="">—</option>
            {CAREER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <TextField label="Salary (optional)" value={v.salary} onChange={set("salary")} placeholder="Rs 120,000 – 150,000" />
      </FormSection>

      <FormSection title="Details" subtitle="Shown when a visitor opens the role on the Careers page.">
        <TextAreaField
          className="sm:col-span-2"
          label="Description"
          value={v.description}
          onChange={set("description")}
          rows={7}
          hint="Leave a blank line between paragraphs."
        />
        <TextAreaField
          className="sm:col-span-2"
          label="Requirements"
          value={v.requirements}
          onChange={set("requirements")}
          rows={6}
          hint="One requirement per line. Each line becomes a bullet point."
          placeholder={"2+ years in car sales\nGood communication in Sinhala and English"}
        />
      </FormSection>

      <FormSection title="Visibility">
        <TextField
          label="Closing date (optional)"
          type="date"
          value={v.closing_date}
          onChange={set("closing_date")}
          hint="The role disappears from the website after this day."
        />
        <div />
        <ToggleField
          label={isOpen ? "Open — visible on the website" : "Closed - hidden from the website"}
          description="Close a role when you've hired someone. You can re-open it later."
          checked={isOpen}
          onChange={setIsOpen}
        />
      </FormSection>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-rose-600 px-4 py-3 text-sm text-white">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : mode === "create" ? "Publish opening" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => router.push("/admin/careers")}
          className="h-11 rounded-xl bg-white px-5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
