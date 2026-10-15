"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, LoaderCircle, Quote } from "lucide-react";
import { Markdown } from "@/lib/markdown";
import { uploadImage } from "./form-ui";
import { cn } from "@/lib/utils";

type Edit = { text: string; from: number; to: number };
type ToolId = "h2" | "h3" | "bold" | "italic" | "ul" | "ol" | "quote" | "link";

const tools: { id: ToolId; label: string; icon: typeof Bold }[] = [
  { id: "h2", label: "Heading", icon: Heading2 },
  { id: "h3", label: "Sub-heading", icon: Heading3 },
  { id: "bold", label: "Bold", icon: Bold },
  { id: "italic", label: "Italic", icon: Italic },
  { id: "ul", label: "Bulleted list", icon: List },
  { id: "ol", label: "Numbered list", icon: ListOrdered },
  { id: "quote", label: "Quote", icon: Quote },
  { id: "link", label: "Link", icon: Link2 },
];

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function apply({ text, from, to }: Edit) {
    onChange(text);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(from, to);
    });
  }

  function selection() {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    return { start, end, selected: value.slice(start, end) };
  }

  function wrap(before: string, after: string, placeholder: string) {
    const { start, end, selected } = selection();
    const inner = selected || placeholder;
    apply({
      text: value.slice(0, start) + before + inner + after + value.slice(end),
      from: start + before.length,
      to: start + before.length + inner.length,
    });
  }

  function prefixLines(prefix: (i: number) => string) {
    const { start, end } = selection();
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const block = value.slice(lineStart, lineEnd) || "Text";
    const next = block.split("\n").map((l, i) => prefix(i) + l.replace(/^(#{2,3}\s|[-*]\s|>\s?|\d+[.)]\s)/, "")).join("\n");
    apply({ text: value.slice(0, lineStart) + next + value.slice(lineEnd), from: lineStart, to: lineStart + next.length });
  }

  function insertLink() {
    const { start, end, selected } = selection();
    const label = selected || "link text";
    const md = `[${label}](https://)`;
    const urlStart = start + label.length + 3;
    apply({ text: value.slice(0, start) + md + value.slice(end), from: urlStart, to: urlStart + 8 });
  }

  async function insertImage(file: File) {
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("That image is larger than 5 MB.");
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      const { start, end } = selection();
      const md = `\n\n![Describe the picture](${url})\n\n`;
      apply({ text: value.slice(0, start) + md + value.slice(end), from: start + md.length, to: start + md.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  function runTool(id: ToolId) {
    switch (id) {
      case "h2": return prefixLines(() => "## ");
      case "h3": return prefixLines(() => "### ");
      case "bold": return wrap("**", "**", "bold text");
      case "italic": return wrap("*", "*", "italic text");
      case "ul": return prefixLines(() => "- ");
      case "ol": return prefixLines((i) => `${i + 1}. `);
      case "quote": return prefixLines(() => "> ");
      case "link": return insertLink();
    }
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Formatting">
            {tools.map((t) => (
              <button
                key={t.label} type="button" title={t.label} aria-label={t.label}
                disabled={tab === "preview"} onClick={() => runTool(t.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 disabled:opacity-40"
              >
                <t.icon className="h-4 w-4" />
              </button>
            ))}
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImage(f); e.target.value = ""; }}
            />
            <button
              type="button" title="Insert photo" aria-label="Insert photo" disabled={tab === "preview" || uploading}
              onClick={() => fileRef.current?.click()}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-indigo-600 disabled:opacity-40"
            >
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Photo
            </button>
          </div>

          <div className="flex rounded-lg bg-slate-200 p-0.5 text-sm font-medium" role="tablist">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={cn("rounded-md px-3.5 py-1.5 capitalize transition-colors", tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "write" ? (
          <textarea
            ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={18}
            placeholder={"Write your article here.\n\nUse the toolbar for headings, lists, links and photos or type Markdown yourself."}
            className="block w-full resize-y border-0 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        ) : (
          <div className="min-h-[24rem] bg-background px-5 py-4">
            {value.trim() ? <Markdown source={value} /> : <p className="text-sm text-slate-400">Nothing to preview yet.</p>}
          </div>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <p className="text-xs text-slate-500">
        Tip: select some text and click a button to format it. Leave a blank line between paragraphs.
      </p>
    </div>
  );
}
