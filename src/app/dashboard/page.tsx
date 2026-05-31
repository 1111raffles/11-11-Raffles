import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Trophy, Ticket, TrendingUp, Clock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

async function getUserData(userId: string) {
  const [tickets, orders, wins] = await Promise.all([
    prisma.ticket.findMany({
      where:   { userId },
      include: { raffle: { select: { id: true, title: true, drawTime: true, status: true } } },
      orderBy: { createdAt: "desc" },
      take:    50,
    }),
    prisma.order.findMany({
      where:   { userId, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take:    10,
    }),
    prisma.ticket.count({ where: { userId, isWinner: true } }),
  ]);

  return { tickets, orders, wins };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const user   = session.user;
  const { tickets, orders, wins } = await getUserData(userId);

  const totalSpent   = orders.reduce((s, o) => s + o.amountPaid, 0);
  const activeRaffleIds = new Set<string>(
    tickets.filter((t) => t.raffle.status === "ACTIVE").map((t) => t.raffle.id)
  );
  const activeRaffles = activeRaffleIds.size;

  // Group tickets by raffle
  const byRaffle = tickets.reduce<Record<string, typeof tickets>>((acc, t) => {
    if (!acc[t.raffleId]) acc[t.raffleId] = [];
    acc[t.raffleId].push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            Hey, {user.name?.split(" ")[0] ?? "Raffler"} 👋
          </h1>
          <p className="mt-1 text-white/40">Here&apos;s your raffle activity</p>
        </div>
        <Link href="/" className="btn-gold rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-gold-400">
          Browse Raffles
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total tickets",    value: tickets.length,                         icon: <Ticket size={18} className="text-gold-400" /> },
          { label: "Active entries",   value: activeRaffles,                           icon: <TrendingUp size={18} className="text-blue-400" /> },
          { label: "Raffles won",      value: wins,                                    icon: <Trophy size={18} className="text-yellow-400" /> },
          { label: "Total spent",      value: `£${(totalSpent / 100).toFixed(2)}`,    icon: <Clock size={18} className="text-purple-400" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-[#111] p-5">
            <div className="mb-3">{icon}</div>
            <div className="text-2xl font-black text-white num-display">{value}</div>
            <div className="mt-0.5 text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Active raffles */}
      {Object.keys(byRaffle).length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-white">Your Entries</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(byRaffle).map(([raffleId, raffleTickets]) => {
              const raffle     = raffleTickets[0].raffle;
              const isActive   = raffle.status === "ACTIVE";
              const isComplete = raffle.status === "COMPLETED";
              const hasWinner  = raffleTickets.some((t) => t.isWinner);
              const drawTime   = new Date(raffle.drawTime);
              const now        = new Date();
              const msLeft     = drawTime.getTime() - now.getTime();
              const odds       = raffleTickets.length; // relative

              return (
                <div
                  key={raffleId}
                  className={`rounded-2xl border p-5 transition ${
                    hasWinner
                      ? "border-gold-500/40 bg-gold-500/5"
                      : isActive
                      ? "border-white/5 bg-[#111]"
                      : "border-white/5 bg-[#0d0d0d] opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {hasWinner ? (
                          <Trophy size={16} className="text-gold-400" />
                        ) : isActive ? (
                          <Circle size={16} className="text-green-400" />
                        ) : (
                          <CheckCircle2 size={16} className="text-white/20" />
                        )}
                        <h3 className="font-semibold text-white">{raffle.title}</h3>
                      </div>

                      {hasWinner && (
                        <div className="mt-2 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-sm font-bold text-gold-400">
                          🏆 YOU WON THIS RAFFLE!
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {raffleTickets.slice(0, 10).map((t) => (
                          <span
                            key={t.id}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              t.isWinner
                                ? "bg-gold-500 text-black"
                                : "bg-white/5 text-white/60"
                            }`}
                          >
                            #{t.ticketNumber}
                          </span>
                        ))}
                        {raffleTickets.length > 10 && (
                          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/30">
                            +{raffleTickets.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <div className="font-bold text-white">{raffleTickets.length} ticket{raffleTickets.length > 1 ? "s" : ""}</div>
                      {isActive && msLeft > 0 ? (
                        <div className="mt-1 text-xs text-white/40">
                          {drawTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-white/30 capitalize">{raffle.status.toLowerCase()}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-[#111] py-16 text-center">
          <Ticket size={48} className="mb-4 text-white/10" />
          <p className="font-semibold text-white/50">No tickets yet</p>
          <p className="mt-1 text-sm text-white/30">Browse raffles and buy your first ticket for just £1</p>
          <Link href="/" className="mt-6 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gold-400">
            View Live Raffles
          </Link>
        </div>
      )}

      {/* Order history */}
      {orders.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-white">Order History</h2>
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
            {orders.map((order, i) => (
              <div key={order.id} className={`flex items-center justify-between px-5 py-4 text-sm ${i < orders.length - 1 ? "border-b border-white/5" : ""}`}>
                <div>
                  <div className="font-medium text-white">{order.totalTickets} tickets</div>
                  <div className="text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString("en-GB")}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">£{(order.amountPaid / 100).toFixed(2)}</div>
                  <div className="text-xs text-green-400 capitalize">{order.status.toLowerCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
