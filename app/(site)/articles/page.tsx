import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Newspaper, Search } from "lucide-react";
import { listArticles } from "@/lib/articles";
import { ARTICLE_CATEGORIES } from "@/lib/types";
import { ArticleCard } from "@/components/site/article-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Articles",
  description: "Guides and news about cars, spare parts and the automobile world in Sri Lanka.",
};

type SearchParams = { category?: string; q?: string; page?: string };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { category, q, page } = await searchParams;

  const params: Record<string, string> = { per_page: "9" };
  if (category) params.category = category;
  if (q) params.q = q;
  if (page) params.page = page;
  const result = await listArticles(params);
  const articles = result?.data ?? [];

  const href = (over: Record<string, string | null>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ category: category ?? null, q: q ?? null, page: page ?? null, ...over })) if (v) qs.set(k, v);
    const s = qs.toString();
    return `/articles${s ? `?${s}` : ""}`;
  };

  const unfiltered = !category && !q && (!page || page === "1");
  const current = result?.current_page ?? 1;
  const last = result?.last_page ?? 1;

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        <h1 className="font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">Guides &amp; articles</h1>
        <p className="mt-5 text-xl text-muted-foreground">
          Buying advice, maintenance tips, spare-parts know-how and news from the automobile world.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Article topics" className="flex flex-wrap gap-2">
          {[{ label: "All", value: null }, ...ARTICLE_CATEGORIES.map((c) => ({ label: c, value: c as string | null }))].map((c) => {
            const active = (category ?? null) === c.value;
            return (
              <Link
                key={c.label}
                href={href({ category: c.value, page: null })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
                  active ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-card text-ink ring-1 ring-border hover:bg-muted"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        <form action="/articles" method="get" className="relative w-full lg:max-w-xs">
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search articles"
            aria-label="Search articles"
            className="h-12 w-full rounded-full border border-input bg-card pl-12 pr-4 text-base text-ink placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </form>
      </div>

      <div className="mt-10">
        {articles.length === 0 ? (
          <div className="animate-pop rounded-3xl border-2 border-dashed border-border bg-card px-6 py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Newspaper className="h-7 w-7 text-muted-foreground" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-ink">
              {category || q ? "No articles match" : "Articles are coming soon"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              {category || q ? "Try another topic or search term." : "Check back soon for guides and news."}
            </p>
            {(category || q) && (
              <Link href="/articles" className="mt-6 inline-block font-semibold text-primary hover:underline">Show all articles</Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <div key={a.id} className={cn("reveal", unfiltered && i === 0 && articles.length >= 3 && "md:col-span-2 lg:col-span-3")}>
                  <ArticleCard article={a} featured={unfiltered && i === 0 && articles.length >= 3} />
                </div>
              ))}
            </div>

            {last > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
                <Link
                  href={href({ page: String(Math.max(1, current - 1)) })}
                  aria-label="Previous page"
                  aria-disabled={current === 1}
                  className={cn("flex h-11 w-11 items-center justify-center rounded-full bg-card ring-1 ring-border hover:bg-muted", current === 1 && "pointer-events-none opacity-40")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <span className="text-sm font-semibold text-muted-foreground">Page {current} of {last}</span>
                <Link
                  href={href({ page: String(Math.min(last, current + 1)) })}
                  aria-label="Next page"
                  aria-disabled={current === last}
                  className={cn("flex h-11 w-11 items-center justify-center rounded-full bg-card ring-1 ring-border hover:bg-muted", current === last && "pointer-events-none opacity-40")}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
