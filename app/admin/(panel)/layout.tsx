import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/sidebar";

type Me = { id: number; name: string; email: string };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const token = await getSessionToken();
  if (!token) redirect("/admin/login");

  let user: Me;
  try {
    user = await apiFetch<Me>("/me", { token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/admin/login");
    throw err;
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar name={user.name} email={user.email} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
