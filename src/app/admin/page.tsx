import { getAdminFromCookies } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Users, Ticket, TrendingUp, Trophy, Plus, Eye, Edit, PlayCircle, Megaphone } from "lucide-react";

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
      <AdminHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/announcements"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Megaphone size={16} />
              Announcements
            </Link>
            <Link
              href="/admin/raffles/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              <Plus size={16} />
              New Raffle
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Users",    value: stats.totalUsers,                              icon: <Users      size={18} className="text-blue-400"   /> },
            { label: "Total Orders",   value: stats.totalOrders,                             icon: <Ticket     size={18} className="text-gold-400"   /> },
            { label: "Revenue",        value: `£${(stats.totalRevenue / 100).toFixed(2)}`,   icon: <TrendingUp size={18} className="text-green-400"  /> },
            { label: "Active Raffles", value: stats.activeRaffles,                           icon: <Eye        size={18} className="text-gold-400"   /> },
            { label: "Completed",      value: stats.completedRaffles,                        icon: <Trophy     size={18} className="text-purple-400" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#111] p-5">
              <div className="mb-3">{icon}</div>
              <div className="text-2xl font-black text-white num-display">{value}</div>
              <div className="mt-0.5 text-xs text-white/40">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Raffles */}
          <div className="rounded-2xl border border-white/5 bg-[#111]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="font-bold text-white">Raffles</h2>
              <Link href="/admin/raffles" className="text-xs text-white/40 hover:text-white">View all →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {raffles.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.title}</p>
                    <p className="text-xs text-white/30">{r.soldTickets}/{r.totalTickets} tickets</p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "ACTIVE"    ? "bg-green-500/10 text-green-400" :
                      r.status === "DRAWING"   ? "bg-gold-500/10  text-gold-400"  :
                      r.status === "COMPLETED" ? "bg-white/5      text-white/30"  :
                      r.status === "DRAFT"     ? "bg-blue-500/10  text-blue-400"  :
                                                 "bg-red-500/10   text-red-400"
                    }`}>
                      {r.status.toLowerCase()}
                    </span>
                    <Link href={`/admin/raffles/${r.id}`} className="rounded p-1 text-white/30 hover:text-white">
                      <Edit size={13} />
                    </Link>
                    {(r.status === "ACTIVE" || r.status === "DRAWING") && (
                      <Link href={`/admin/raffles/${r.id}`} className="rounded p-1 text-white/30 hover:text-gold-400">
                        <PlayCircle size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {raffles.length === 0 && (
                <p className="py-8 text-center text-sm text-white/30">No raffles yet</p>
              )}
            </div>
          </div>

          {/* Recent orders */}
          <div className="rounded-2xl border border-white/5 bg-[#111]">
            <div className="border-b border-white/5 px-5 py-4">
              <h2 className="font-bold text-white">Recent Sales</h2>
            </div>
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{order.user.name ?? order.user.email}</p>
                    <p className="text-xs text-white/30">
                      {order.totalTickets} tickets · #{order.tickets.map((t) => t.ticketNumber).join(", #")}
                    </p>
                  </div>
                  <span className="font-bold text-gold-400">£{(order.amountPaid / 100).toFixed(2)}</span>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="py-8 text-center text-sm text-white/30">No sales yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
