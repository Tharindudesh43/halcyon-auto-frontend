import type { ReactNode } from "react";

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/))/i;
const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    const k = `${key}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={k} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={k} className="rounded-md bg-muted px-1.5 py-0.5 text-[0.9em] text-ink">{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link && SAFE_URL.test(link[2])) {
      const external = /^https?:/i.test(link[2]);
      return (
        <a
          key={k}
          href={link[2]}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let n = 0;

  const flushPara = () => {
    if (para.length) {
      const k = `p${n++}`;
      out.push(<p key={k} className="my-5 text-lg leading-8 text-foreground/85">{inline(para.join(" "), k)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (!list) return;
    const k = `l${n++}`;
    const Tag = list.ordered ? "ol" : "ul";
    out.push(
      <Tag key={k} className={`my-5 space-y-2 pl-6 text-lg leading-8 text-foreground/85 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-primary`}>
        {list.items.map((item, i) => <li key={i} className="pl-1">{inline(item, `${k}-${i}`)}</li>)}
      </Tag>
    );
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) { flush(); continue; }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flush();
      const k = `h${n++}`;
      out.push(
        heading[1].length === 2
          ? <h2 key={k} className="mb-2 mt-12 font-heading text-3xl font-extrabold leading-tight text-ink">{inline(heading[2], k)}</h2>
          : <h3 key={k} className="mb-1 mt-9 font-heading text-2xl font-bold leading-snug text-ink">{inline(heading[2], k)}</h3>
      );
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) { flush(); out.push(<hr key={`r${n++}`} className="my-10 border-border" />); continue; }

    const image = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
    if (image) {
      flush();
      out.push(
        <figure key={`f${n++}`} className="my-8">
          <img src={image[2]} alt={image[1]} loading="lazy" className="w-full rounded-3xl object-cover" />
          {image[1] && <figcaption className="mt-3 text-center text-sm text-muted-foreground">{image[1]}</figcaption>}
        </figure>
      );
      continue;
    }

    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flush();
      const k = `q${n++}`;
      out.push(
        <blockquote key={k} className="my-8 rounded-r-2xl border-l-4 border-accent bg-accent/10 px-6 py-4 text-xl font-medium leading-8 text-ink">
          {inline(quote[1], k)}
        </blockquote>
      );
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }

    flushList();
    para.push(trimmed);
  }
  flush();

  return <div>{out}</div>;
}

export function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
