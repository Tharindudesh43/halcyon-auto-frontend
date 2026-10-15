import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { adminGetArticle } from "@/lib/articles";
import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let article;
  try {
    article = await adminGetArticle(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit article" description={article.title} />
      <ArticleForm mode="edit" article={article} />
    </div>
  );
}
