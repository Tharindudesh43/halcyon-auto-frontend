import { notFound } from "next/navigation";
import { getCar } from "@/lib/cars";
import { ApiError } from "@/lib/api";
import { CarForm } from "@/components/admin/car-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing;
  try {
    listing = await getCar(id, { fresh: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit car" description={listing.title} />
      <CarForm mode="edit" listing={listing} />
    </div>
  );
}
