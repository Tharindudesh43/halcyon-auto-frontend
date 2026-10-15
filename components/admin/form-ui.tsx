"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, ImagePlus, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const controlCls =
  "w-full rounded-xl border-0 bg-white px-3.5 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60";

export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  className,
  required,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(controlCls, "h-11")}
      />
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  className,
  placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(controlCls, "py-3")}
      />
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Photo upload failed");
  return data.url as string;
}

export function ImageField({
  label,
  hint,
  current,
  fallback,
  file,
  removed,
  onPick,
  onRemove,
  onUndo,
  aspect = "aspect-[16/7]",
  fit = "cover",
}: {
  label: string;
  hint?: string;
  current: string | null;
  fallback?: string;
  file: File | null;
  removed: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  onUndo: () => void;
  aspect?: string;
  fit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const preview = file ? blobUrl : removed ? null : current ?? null;
  const shown = preview ?? (removed || !current ? fallback ?? null : null);
  const usingFallback = !preview && !!shown;
  const hasCustom = !!file || (!!current && !removed);

  function handleFiles(files: FileList | null) {
    const picked = files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) return setError("Please choose an image file (JPG, PNG, WebP).");
    if (picked.size > 5 * 1024 * 1024) return setError("That image is larger than 5 MB.");
    setError(null);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(URL.createObjectURL(picked));
    onPick(picked);
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className={cn("relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200", aspect)}>
        {shown ? (
          <img src={shown} alt="" className={cn("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
        )}
        {usingFallback && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            Default image
          </span>
        )}
        {file && (
          <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white">
            New saved when you click Save
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <ImagePlus className="h-4 w-4" />
          {hasCustom ? "Change image" : "Choose image"}
        </button>
        {hasCustom && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-50 px-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            {fallback ? "Use default" : "Remove"}
          </button>
        )}
        {removed && !file && current && (
          <button
            type="button"
            onClick={onUndo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

type SaveState = { phase: "idle" | "saving" | "saved" | "error"; message?: string };

export function useSettingsSave(group: string) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({ phase: "idle" });

  async function save(build: () => Promise<unknown>) {
    if (state.phase === "saving") return;
    setState({ phase: "saving" });
    try {
      const payload = await build(); // may upload images first
      const res = await fetch(`/api/admin/settings/${group}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
        setState({ phase: "error", message: first ?? data?.message ?? "Could not save. Try again." });
        return;
      }
      setState({ phase: "saved" });
      router.refresh();
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Can't reach the server. Check your connection.",
      });
    }
  }

  return { state, save, reset: () => setState({ phase: "idle" }) };
}

export function SaveBar({ state, label = "Save changes" }: { state: SaveState; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="submit"
        disabled={state.phase === "saving"}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state.phase === "saving" && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {state.phase === "saving" ? "Saving…" : label}
      </button>

      <div aria-live="polite">
        {state.phase === "saved" && (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CircleCheck className="h-4 w-4" /> Saved the website is updated
          </p>
        )}
        {state.phase === "error" && (
          <p role="alert" className="inline-flex items-center gap-2 text-sm font-medium text-rose-600">
            <CircleAlert className="h-4 w-4" /> {state.message}
          </p>
        )}
      </div>
    </div>
  );
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-4 sm:col-span-2", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          checked ? "bg-emerald-500" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  );
}
