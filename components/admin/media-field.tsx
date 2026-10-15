"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, RotateCcw } from "lucide-react";
import type { HeroMedia, MediaFocus } from "@/lib/settings-types";
import { cn } from "@/lib/utils";

const FOCUS: { value: MediaFocus; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];
const POSITION: Record<MediaFocus, string> = {
  center: "50% 50%", top: "50% 15%", bottom: "50% 85%", left: "15% 50%", right: "85% 50%",
};

const MB = 1024 * 1024;

export async function uploadMedia(file: File): Promise<{ url: string; type: HeroMedia["type"] }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : null;
    throw new Error(first ?? data?.message ?? "Upload failed");
  }
  return { url: data.url as string, type: data.type === "video" ? "video" : "image" };
}

export function useMedia(initial: HeroMedia | null) {
  const [current, setCurrent] = useState<HeroMedia | null>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [focus, setFocus] = useState<MediaFocus>(initial?.focus ?? "center");

  return {
    field: {
      current, file, removed, focus,
      onPick: (f: File) => { setFile(f); setRemoved(false); },
      onRemove: () => { setFile(null); setRemoved(true); },
      onUndo: () => setRemoved(false),
      onFocus: setFocus,
    },
    async resolve(): Promise<HeroMedia | null> {
      let media: HeroMedia | null = current;
      if (file) {
        const up = await uploadMedia(file);
        media = { type: up.type, url: up.url };
      } else if (removed) {
        media = null;
      }
      if (media) media = { ...media, focus };
      setCurrent(media);
      setFile(null);
      setRemoved(false);
      return media;
    },
  };
}

export function MediaField({
  label,
  hint,
  fallback,
  frame,
  current,
  file,
  removed,
  focus,
  onPick,
  onRemove,
  onUndo,
  onFocus,
}: {
  label: string;
  hint: string;
  fallback: string;
  frame: string;
  current: HeroMedia | null;
  file: File | null;
  removed: boolean;
  focus: MediaFocus;
  onPick: (f: File) => void;
  onRemove: () => void;
  onUndo: () => void;
  onFocus: (f: MediaFocus) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<{ url: string; type: "image" | "video" } | null>(null);

  const shown: { url: string; type: "image" | "video" } | null = file ? blob : removed ? null : current;
  const hasMedia = !!file || (!!current && !removed);

  function choose(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    const isImage = f.type.startsWith("image/");
    if (!isVideo && !isImage) return setError("Choose an image, a GIF or a video (MP4 or WebM).");
    const limit = isVideo ? 40 * MB : f.type === "image/gif" ? 10 * MB : 5 * MB;
    if (f.size > limit) return setError(`That file is ${(f.size / MB).toFixed(1)} MB — the limit for this type is ${limit / MB} MB.`);
    setError(null);
    if (blob) URL.revokeObjectURL(blob.url);
    setBlob({ url: URL.createObjectURL(f), type: isVideo ? "video" : "image" });
    onPick(f);
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      <div className={cn("relative overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200", frame)}>
        {shown ? (
          shown.type === "video" ? (
            <video
              key={shown.url} src={shown.url} autoPlay muted loop playsInline
              style={{ objectPosition: POSITION[focus] }} className="h-full w-full object-cover"
            />
          ) : (
            <img src={shown.url} alt="" style={{ objectPosition: POSITION[focus] }} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-400">
            Not set uses {fallback}
          </div>
        )}
        {shown && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {file ? "New — saved when you click Save" : shown.type === "video" ? "Video" : "Image"}
          </span>
        )}
      </div>

      <input
        ref={inputRef} type="file" className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={(e) => { choose(e.target.files); e.target.value = ""; }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button" onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <ImagePlus className="h-4 w-4" /> {hasMedia ? "Change file" : "Choose file"}
        </button>
        {hasMedia && (
          <button
            type="button" onClick={onRemove}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-50 px-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
        {removed && !file && current && (
          <button
            type="button" onClick={onUndo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Undo
          </button>
        )}
      </div>

      {shown && (
        <div>
          <p className="text-sm font-medium text-slate-700">Keep this part in view</p>
          <p className="text-xs text-slate-500">If the screen is a different shape from the file, the picture is trimmed. Pick the side that matters.</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Focus">
            {FOCUS.map((f) => (
              <button
                key={f.value} type="button" onClick={() => onFocus(f.value)} aria-pressed={focus === f.value}
                className={cn(
                  "h-9 rounded-lg px-3.5 text-sm font-medium transition-colors",
                  focus === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">{hint}</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
