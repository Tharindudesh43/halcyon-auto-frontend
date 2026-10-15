import Link from "next/link";
import { Briefcase, CirclePlus } from "lucide-react";
import { adminListCareers } from "@/lib/careers";
import { PageHeader } from "@/components/admin/page-header";
import { CareerCard } from "@/components/admin/career-card";

export default async function CareersAdminPage() {
  const jobs = await adminListCareers();
  const today = new Date().toISOString().slice(0, 10);
  const live = jobs.filter((j) => j.is_open && !(j.closing_date && j.closing_date < today)).length;

  return (
    <>
      <PageHeader
        title="Careers"
        description={`${live} live ${live === 1 ? "opening" : "openings"} · ${jobs.length} in total`}
        action={
          <Link
            href="/admin/careers/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-opacity hover:opacity-90"
          >
            <CirclePlus className="h-4 w-4" /> Add opening
          </Link>
        }
      />

      {jobs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-semibold text-slate-800">No job openings yet</p>
          <p className="mt-1 text-sm text-slate-500">Add one and it appears on the Careers page straight away.</p>
          <Link
            href="/admin/careers/new"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <CirclePlus className="h-4 w-4" /> Add opening
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <CareerCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}
