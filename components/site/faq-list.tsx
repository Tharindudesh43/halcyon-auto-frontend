"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import type { Faq } from "@/lib/types";
import { FaqItem } from "./faq-item";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean) as string[]))],
    [faqs]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
    );
  }, [faqs, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-md">
          <span className="sr-only">Search questions</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="h-12 w-full rounded-full border border-input bg-card pl-12 pr-4 text-base text-ink transition-colors placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </label>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
                  category === c ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-card text-ink ring-1 ring-border hover:bg-muted"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3" aria-live="polite">
        {shown.length === 0 ? (
          <div className="animate-pop rounded-3xl border-2 border-dashed border-border bg-card px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-6 w-6 text-muted-foreground" />
            </span>
            <h2 className="mt-4 font-heading text-xl font-bold text-ink">No questions match</h2>
            <p className="mt-1 text-muted-foreground">Try different words or just ask us.</p>
            <Link href="/contact" className={`${buttonVariants({ variant: "accent" })} mt-6`}>Ask us a question</Link>
          </div>
        ) : (
          shown.map((f) => <FaqItem key={f.id} question={f.question} answer={f.answer} />)
        )}
      </div>
    </div>
  );
}
