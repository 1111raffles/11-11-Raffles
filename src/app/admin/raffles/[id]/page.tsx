import { getAdminFromCookies } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { RaffleForm } from "@/components/admin/RaffleForm";
import { DrawPanel } from "@/components/admin/DrawPanel";
import { ArrowLeft } from "lucide-react";

interface Props {
  params:      { id: string };
  searchParams:{ draw?: string };
}

export default async function EditRafflePage({ params, searchParams }: Props) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  const raffle = await prisma.raffle.findUnique({ where: { id: params.id } });
  if (!raffle) notFound();

  const showDraw = searchParams.draw === "1";

  return (
    <div className="min-h-screen bg-[#030303]">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030303]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/raffles" className="text-white/40 hover:text-white"><ArrowLeft size={18} /></Link>
            <span className="font-bold text-white truncate max-w-xs">{raffle.title}</span>
          </div>
          <AdminLogout />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
        {showDraw && raffle.status === "ACTIVE" && (
          <DrawPanel raffleId={raffle.id} raffleName={raffle.title} />
        )}
        <RaffleForm raffle={{
          id:           raffle.id,
          title:        raffle.title,
          description:  raffle.description,
          imageUrl:     raffle.imageUrl ?? "",
          totalTickets: raffle.totalTickets,
          ticketPrice:  raffle.ticketPrice,
          drawTime:     raffle.drawTime.toISOString().slice(0, 16),
          status:       (["DRAFT","ACTIVE","CANCELLED"].includes(raffle.status) ? raffle.status : "DRAFT") as "DRAFT" | "ACTIVE" | "CANCELLED",
        }} />
      </main>
    </div>
  );
}
