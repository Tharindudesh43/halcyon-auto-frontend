import { ArticleForm } from "@/components/admin/article-form";
import { PageHeader } from "@/components/admin/page-header";

export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Write article" description="Save it as a draft, or publish it straight away." />
      <ArticleForm mode="create" />
    </div>
  );
}
