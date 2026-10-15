import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { adminGetCareer } from "@/lib/careers";
import { CareerForm } from "@/components/admin/career-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let job;
  try {
    job = await adminGetCareer(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit job opening" description={job.title} />
      <CareerForm mode="edit" job={job} />
    </div>
  );
}
