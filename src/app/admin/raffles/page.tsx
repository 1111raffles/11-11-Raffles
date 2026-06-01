import { getAdminFromCookies } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Plus, Edit, PlayCircle } from "lucide-react";

export default async function AdminRafflesPage() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  const raffles = await prisma.raffle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tickets: true } } },
  });

  return (
    <div className="min-h-screen bg-[#030303]">
      <AdminHeader title="All Raffles" backHref="/admin" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex justify-end">
          <Link href="/admin/raffles/new" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90">
            <Plus size={15} /> New Raffle
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs font-bold uppercase tracking-wider text-white/30">
                  <th className="px-5 py-4">Raffle</th>
                  <th className="px-5 py-4">Tickets</th>
                  <th className="px-5 py-4">Revenue</th>
                  <th className="px-5 py-4">Draw</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody>
                {raffles.map((raffle, i) => (
                  <tr key={raffle.id} className={`border-b border-white/5 last:border-0 transition hover:bg-white/[0.02] ${i % 2 === 1 ? "bg-white/[0.01]" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="max-w-xs font-semibold text-white line-clamp-1">{raffle.title}</p>
                    </td>
                    <td className="px-5 py-4 text-white/60">{raffle.soldTickets}/{raffle.totalTickets}</td>
                    <td className="px-5 py-4 font-semibold text-gold-400">
                      £{(raffle.soldTickets * raffle.ticketPrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-white/60">
                      {new Date(raffle.drawTime).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                        raffle.status === "ACTIVE"    ? "bg-green-500/10 text-green-400" :
                        raffle.status === "DRAWING"   ? "bg-gold-500/10  text-gold-400"  :
                        raffle.status === "COMPLETED" ? "bg-white/5      text-white/30"  :
                        raffle.status === "DRAFT"     ? "bg-blue-500/10  text-blue-400"  :
                                                        "bg-red-500/10   text-red-400"
                      }`}>
                        {raffle.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <Link href={`/admin/raffles/${raffle.id}`} className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white">
                          <Edit size={14} />
                        </Link>
                        {(raffle.status === "ACTIVE" || raffle.status === "DRAWING") && (
                          <Link href={`/admin/raffles/${raffle.id}`} className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-gold-400">
                            <PlayCircle size={14} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {raffles.length === 0 && (
                  <tr><td colSpan={6} className="py-16 text-center text-white/30">No raffles yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
