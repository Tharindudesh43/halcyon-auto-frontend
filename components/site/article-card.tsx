import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { ArticleSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export const formatArticleDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";

export function ArticleCard({ article, featured = false }: { article: ArticleSummary; featured?: boolean }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "group flex h-full overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/15 hover:ring-primary/30",
        featured ? "flex-col md:col-span-2 md:flex-row lg:col-span-3" : "flex-col"
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted", featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]")}>
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center bg-gradient-to-br from-primary/15 to-accent/25">
            <BookOpen className="h-10 w-10 text-primary/60" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow">
          {article.category}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "md:justify-center md:p-10")}>
        <p className="text-sm text-muted-foreground">
          {formatArticleDate(article.published_at ?? article.created_at)}
          {article.author && <> · {article.author}</>}
        </p>
        <h3
          className={cn(
            "mt-2 font-heading font-extrabold leading-tight text-ink transition-colors group-hover:text-primary",
            featured ? "text-2xl md:text-4xl" : "line-clamp-2 text-xl"
          )}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className={cn("mt-3 text-muted-foreground", featured ? "text-lg" : "line-clamp-3")}>{article.excerpt}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
