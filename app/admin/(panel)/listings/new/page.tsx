import { CarForm } from "@/components/admin/car-form";
import { PageHeader } from "@/components/admin/page-header";

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add car" description="Fill in the details and add photos. You can edit everything later." />
      <CarForm mode="create" />
    </div>
  );
}
