import Link from "next/link";
import { CirclePlus, Newspaper } from "lucide-react";
import { adminListArticles } from "@/lib/articles";
import { PageHeader } from "@/components/admin/page-header";
import { ArticleAdminCard } from "@/components/admin/article-admin-card";

export default async function ArticlesAdminPage() {
  const articles = await adminListArticles();
  const live = articles.filter((a) => a.is_published).length;

  return (
    <>
      <PageHeader
        title="Articles"
        description={`${live} published · ${articles.length - live} ${articles.length - live === 1 ? "draft" : "drafts"}`}
        action={
          <Link href="/admin/articles/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90">
            <CirclePlus className="h-4 w-4" /> Write article
          </Link>
        }
      />

      {articles.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Newspaper className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-semibold text-slate-800">No articles yet</p>
          <p className="mt-1 text-sm text-slate-500">Share buying guides, spare-parts advice and car news.</p>
          <Link href="/admin/articles/new" className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            <CirclePlus className="h-4 w-4" /> Write article
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => <ArticleAdminCard key={a.id} article={a} />)}
        </div>
      )}
    </>
  );
}
