import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, MessageCircle, Share2 } from "lucide-react";
import { getArticle, listArticles } from "@/lib/articles";
import { ApiError } from "@/lib/api";
import { Markdown, readingMinutes } from "@/lib/markdown";
import { ArticleCard, formatArticleDate } from "@/components/site/article-card";
import { SectionHeading } from "@/components/site/section-heading";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await getArticle(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await getArticle(slug);
    return {
      title: a.title,
      description: a.excerpt ?? undefined,
      openGraph: { title: a.title, description: a.excerpt ?? undefined, type: "article", images: a.cover_image ? [a.cover_image] : undefined },
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await load(slug);

  const related = (await listArticles({ category: article.category, per_page: "4" }))?.data
    .filter((a) => a.id !== article.id)
    .slice(0, 3) ?? [];

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/articles/${article.slug}`;
  const minutes = readingMinutes(article.content);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
    image: article.cover_image ?? undefined,
  }).replace(/</g, "\\u003c");

  return (
    <article className="container-page page-top pb-8">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/articles" className="font-medium hover:text-primary">Articles</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/articles?category=${encodeURIComponent(article.category)}`} className="font-medium hover:text-primary">{article.category}</Link>
        </nav>

        <header className="animate-rise">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] text-ink md:text-6xl">{article.title}</h1>
          {article.excerpt && <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{article.excerpt}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{formatArticleDate(article.published_at ?? article.created_at)}</span>
            {article.author && <span>By {article.author}</span>}
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {minutes} min read</span>
          </p>
        </header>
      </div>

      {article.cover_image && (
        <div className="mx-auto mt-10 max-w-5xl animate-rise rise-1">
          <img src={article.cover_image} alt="" className="aspect-[16/9] w-full rounded-[2rem] object-cover shadow-xl shadow-primary/10" />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl">
        <Markdown source={article.content} />

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink"><Share2 className="h-4 w-4" /> Share</span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-full bg-card px-4 text-sm font-semibold text-ink ring-1 ring-border transition-colors hover:bg-muted"
          >
            Facebook
          </a>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-lagoon to-primary p-7 text-white md:p-9">
          <h2 className="font-heading text-2xl font-extrabold">Looking for your next car?</h2>
          <p className="mt-1 text-white/80">See what&apos;s on the lot, then work out your monthly payment.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/cars" className={buttonVariants({ variant: "accent" })}>Browse cars <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/finance" className={buttonVariants({ variant: "glass" })}>Finance calculator</Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-20">
          <SectionHeading title="Keep reading" action={{ href: `/articles?category=${encodeURIComponent(article.category)}`, label: `More ${article.category.toLowerCase()}` }} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </article>
  );
}
