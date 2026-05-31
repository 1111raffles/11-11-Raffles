import { getAdminFromCookies } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { Users, Ticket, TrendingUp, Trophy, Plus, Eye, Edit, PlayCircle } from "lucide-react";

async function getStats() {
  const [totalUsers, totalOrders, totalRevenue, activeRaffles, completedRaffles] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amountPaid: true } }),
    prisma.raffle.count({ where: { status: "ACTIVE" } }),
    prisma.raffle.count({ where: { status: "COMPLETED" } }),
  ]);
  return { totalUsers, totalOrders, totalRevenue: totalRevenue._sum.amountPaid ?? 0, activeRaffles, completedRaffles };
}

async function getRaffles() {
  return prisma.raffle.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tickets: true } } },
    take: 20,
  });
}

async function getRecentOrders() {
  return prisma.order.findMany({
    where:   { status: "PAID" },
    orderBy: { createdAt: "desc" },
    take:    10,
    include: { user: { select: { name: true, email: true } }, tickets: { select: { ticketNumber: true }, take: 3 } },
  });
}

export default async function AdminDashboard() {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) redirect("/admin/login");

  const [stats, raffles, recentOrders] = await Promise.all([getStats(), getRaffles(), getRecentOrders()]);

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Admin header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030303]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white">Raffle Rumble</span>
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-400">Admin</span>
          </div>
          <AdminLogout />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <Link
            href="/admin/raffles/new"
            className="flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-gold-400"
          >
            <Plus size={16} />
            New Raffle
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total users",     value: stats.totalUsers,                              icon: <Users      size={18} className="text-blue-400"   /> },
            { label: "Total orders",    value: stats.totalOrders,                             icon: <Ticket     size={18} className="text-green-400"  /> },
            { label: "Revenue",         value: `£${(stats.totalRevenue / 100).toFixed(2)}`,   icon: <TrendingUp size={18} className="text-gold-400"   /> },
            { label: "Active raffles",  value: stats.activeRaffles,                           icon: <Eye        size={18} className="text-purple-400" /> },
            { label: "Completed draws", value: stats.completedRaffles,                        icon: <Trophy     size={18} className="text-orange-400" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#111] p-5">
              <div className="mb-3">{icon}</div>
              <div className="text-2xl font-black text-white num-display">{value}</div>
              <div className="mt-0.5 text-xs text-white/40">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Raffles management */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-white">Raffles</h2>
              <Link href="/admin/raffles" className="text-sm text-gold-400 hover:text-gold-300">View all</Link>
            </div>
            <div className="flex flex-col gap-2">
              {raffles.slice(0, 6).map((raffle) => (
                <div key={raffle.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#111] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{raffle.title}</p>
                    <p className="text-xs text-white/30">
                      {raffle.soldTickets}/{raffle.totalTickets} tickets ·{" "}
                      {new Date(raffle.drawTime).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                    raffle.status === "ACTIVE"    ? "bg-green-500/10 text-green-400" :
                    raffle.status === "DRAWING"   ? "bg-gold-500/10 text-gold-400"   :
                    raffle.status === "COMPLETED" ? "bg-white/5 text-white/30"       :
                    raffle.status === "DRAFT"     ? "bg-blue-500/10 text-blue-400"   :
                                                    "bg-red-500/10 text-red-400"
                  }`}>
                    {raffle.status.toLowerCase()}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Link href={`/admin/raffles/${raffle.id}`} className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white">
                      <Edit size={14} />
                    </Link>
                    {raffle.status === "ACTIVE" && (
                      <Link href={`/admin/raffles/${raffle.id}?draw=1`} className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-gold-400">
                        <PlayCircle size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent orders */}
          <section>
            <h2 className="mb-4 font-bold text-white">Recent Sales</h2>
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#111] px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{order.user.name ?? order.user.email}</p>
                    <p className="text-xs text-white/30">
                      {order.totalTickets} tickets · Ticket{order.tickets[0] ? ` #${order.tickets[0].ticketNumber}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gold-400">£{(order.amountPaid / 100).toFixed(2)}</p>
                    <p className="text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-center text-sm text-white/30 py-8">No orders yet</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
