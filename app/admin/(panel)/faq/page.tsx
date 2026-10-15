import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { adminListFaqs } from "@/lib/faqs";
import { PageHeader } from "@/components/admin/page-header";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function FaqAdminPage() {
  const faqs = await adminListFaqs();
  const live = faqs.filter((f) => f.is_published).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="FAQ"
        description={`${live} visible · ${faqs.length} in total. Use the arrows to change the order.`}
        action={
          <Link href="/faq" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
            View page <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />
      <FaqManager faqs={faqs} />
    </div>
  );
}
