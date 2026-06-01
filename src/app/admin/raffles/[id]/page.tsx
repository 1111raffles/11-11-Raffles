import { getAdminFromCookies } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RaffleForm } from "@/components/admin/RaffleForm";
import { DrawPanel } from "@/components/admin/DrawPanel";
import { WinnerPicker } from "@/components/admin/WinnerPicker";

interface Props {
  params:       { id: string };
  searchParams: { draw?: string };
}

export default async function EditRafflePage({ params, searchParams }: Props) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  const raffle = await prisma.raffle.findUnique({ where: { id: params.id } });
  if (!raffle) notFound();

  void searchParams;

  return (
    <div className="min-h-screen bg-[#030303]">
      <AdminHeader title={raffle.title} backHref="/admin/raffles" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
        {raffle.status === "ACTIVE" && (
          <WinnerPicker raffleId={raffle.id} />
        )}
        {(raffle.status === "ACTIVE" || raffle.status === "DRAWING") && (
          <DrawPanel raffleId={raffle.id} raffleName={raffle.title} />
        )}
        <RaffleForm raffle={{
          id:           raffle.id,
          title:        raffle.title,
          description:  raffle.description,
          imageUrl:     raffle.imageUrl ?? "",
          totalTickets: raffle.totalTickets,
          soldTickets:  raffle.soldTickets,
          ticketPrice:  raffle.ticketPrice,
          drawTime:     raffle.drawTime.toISOString().slice(0, 16),
          status:       (["DRAFT","ACTIVE","CANCELLED"].includes(raffle.status) ? raffle.status : "DRAFT") as "DRAFT" | "ACTIVE" | "CANCELLED",
        }} />
      </main>
    </div>
  );
}
