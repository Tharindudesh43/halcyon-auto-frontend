"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImageItem = {
  id: string;
  previewUrl: string;
  file?: File;
};

const MAX = 5;

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setError("Please choose image files (JPG, PNG, WebP).");
      return;
    }
    if (images.length + list.length > MAX) {
      setError(`You can add up to ${MAX} photos per car.`);
      return;
    }
    const tooBig = list.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than 5 MB.`);
      return;
    }

    setError(null);
    onChange([
      ...images,
      ...list.map((file) => ({ id: makeId(), previewUrl: URL.createObjectURL(file), file })),
    ]);
  }

  function handleRemove(id: string) {
    const item = images.find((i) => i.id === id);
    if (item?.file) URL.revokeObjectURL(item.previewUrl);
    onChange(images.filter((i) => i.id !== id));
  }

  function makeCover(id: string) {
    const item = images.find((i) => i.id === id);
    if (!item) return;
    onChange([item, ...images.filter((i) => i.id !== id)]);
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, i) => (
            <div
              key={image.id}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200",
                i === 0 && "ring-2 ring-indigo-500"
              )}
            >
              <img src={image.previewUrl} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />

              {i === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Star className="h-3 w-3 fill-current" /> Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(image.id)}
                  className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
                >
                  Make cover
                </button>
              )}

              {!image.file && (
                <span className="absolute bottom-2 left-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white">
                  Saved
                </span>
              )}

              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => handleRemove(image.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-rose-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragging
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
            )}
          >
            <ImagePlus className="h-7 w-7 text-indigo-500" />
            <span className="text-sm font-medium text-slate-700">Click to add photos or drag them here</span>
            <span className="text-xs text-slate-500">
              {images.length} of {MAX} added · up to 5 MB each · uploaded when you save
            </span>
          </button>
        </>
      )}

      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
