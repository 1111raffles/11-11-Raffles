import { getAdminFromCookies } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { RaffleForm } from "@/components/admin/RaffleForm";
import { ArrowLeft } from "lucide-react";

export default async function NewRafflePage() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#030303]">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030303]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/raffles" className="text-white/40 hover:text-white"><ArrowLeft size={18} /></Link>
            <span className="font-bold text-white">New Raffle</span>
          </div>
          <AdminLogout />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <RaffleForm />
      </main>
    </div>
  );
}
