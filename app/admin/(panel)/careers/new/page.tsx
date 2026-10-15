import { CareerForm } from "@/components/admin/career-form";
import { PageHeader } from "@/components/admin/page-header";

export default function NewCareerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add job opening" description="It appears on the Careers page as soon as you publish it." />
      <CareerForm mode="create" />
    </div>
  );
}
