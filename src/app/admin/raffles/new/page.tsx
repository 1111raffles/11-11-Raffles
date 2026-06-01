import { getAdminFromCookies } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RaffleForm } from "@/components/admin/RaffleForm";

export default async function NewRafflePage() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#030303]">
      <AdminHeader title="New Raffle" backHref="/admin/raffles" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <RaffleForm />
      </main>
    </div>
  );
}
