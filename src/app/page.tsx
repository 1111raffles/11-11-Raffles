import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PurchasePackages } from "@/components/PurchasePackages";
import { LiveDraw } from "@/components/LiveDraw";
import { Trophy, Ticket, Clock, Users, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";

async function getActiveRaffles() {
  return prisma.raffle.findMany({
    where:   { status: { in: ["ACTIVE", "DRAWING"] } },
    orderBy: { drawTime: "asc" },
  });
}

async function getRecentWinners() {
  return prisma.announcement.findMany({
    where:   { type: "WINNER" },
    orderBy: { createdAt: "desc" },
    take:    5,
  });
}

export default async function HomePage() {
  const [raffles, winners] = await Promise.all([getActiveRaffles(), getRecentWinners()]);
  const featured = raffles[0] ?? null;
  const others   = raffles.slice(1);

  return (
    <>
      {featured && <LiveDraw raffleId={featured.id} />}

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">

        {/* ── Hero: Featured Raffle ───────────────────────────────────────── */}
        {featured ? (
          <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative overflow-hidden rounded-3xl bg-[#111]">
              {featured.imageUrl ? (
                <Image
                  src={featured.imageUrl}
                  alt={featured.title}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-80 items-center justify-center lg:h-full">
                  <Trophy size={80} className="text-white/10" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Live badge */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-gold-500/30 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                <span className="pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Live Raffle</span>
              </div>

              {/* Tickets sold overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>{featured.soldTickets.toLocaleString()} sold</span>
                  <span>{(featured.totalTickets - featured.soldTickets).toLocaleString()} remaining</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="progress-bar h-full rounded-full"
                    style={{ width: `${(featured.soldTickets / featured.totalTickets) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-center gap-2">
                <Flame size={16} className="text-gold-400" />
                <span className="text-sm font-semibold uppercase tracking-widest text-gold-400">Featured Draw</span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                {featured.title}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-white/50">
                {featured.description}
              </p>

              {/* Stats row */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Ticket price",   value: `£${featured.ticketPrice.toFixed(0)}`,                  icon: <Ticket size={14} /> },
                  { label: "Tickets left",   value: (featured.totalTickets - featured.soldTickets).toLocaleString(), icon: <Users  size={14} /> },
                  { label: "Draw time",      value: "11:11 PM",                                              icon: <Clock  size={14} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="rounded-2xl border border-white/5 bg-[#111] p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-white/40">
                      {icon}
                      <span>{label}</span>
                    </div>
                    <div className="mt-1 text-xl font-black text-white num-display">{value}</div>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">Draw closes in</p>
                <CountdownTimer drawTime={featured.drawTime.toISOString()} />
              </div>

              {/* Purchase */}
              <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/30">Select a package</p>
                <PurchasePackages
                  raffleId={featured.id}
                  raffleName={featured.title}
                  disabled={featured.status !== "ACTIVE"}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <Trophy size={64} className="mb-4 text-white/10" />
            <h1 className="text-3xl font-black text-white">No active raffles</h1>
            <p className="mt-2 text-white/40">Check back soon — new draws are added daily.</p>
          </section>
        )}

        {/* ── Other Active Raffles ────────────────────────────────────────── */}
        {others.length > 0 && (
          <section className="mt-20">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">More Raffles</h2>
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/50">{others.length} live</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((raffle) => (
                <div key={raffle.id} className="card-hover group rounded-2xl border border-white/5 bg-[#111] p-5">
                  {raffle.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={raffle.imageUrl}
                        alt={raffle.title}
                        width={400}
                        height={240}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-white">{raffle.title}</h3>
                  <p className="mt-1 text-sm text-white/40 line-clamp-2">{raffle.description}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/40">{(raffle.totalTickets - raffle.soldTickets).toLocaleString()} left</span>
                    <span className="font-bold text-gold-400">from £{raffle.ticketPrice.toFixed(0)}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="progress-bar h-full rounded-full" style={{ width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Winners ──────────────────────────────────────────────── */}
        {winners.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 text-2xl font-black">Recent Winners</h2>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
              {winners.map((w, i) => (
                <div key={w.id} className={`flex items-center gap-4 px-6 py-4 ${i < winners.length - 1 ? "border-b border-white/5" : ""}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10">
                    <Trophy size={18} className="text-gold-400" />
                  </div>
                  <p className="flex-1 text-sm text-white/70">{w.message}</p>
                  <span className="shrink-0 text-xs text-white/20">
                    {new Date(w.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── How It Works ────────────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-black">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "01", title: "Pick a raffle",   body: "Browse live draws and choose your prize. Every ticket costs just £1.",      icon: "🎯" },
              { step: "02", title: "Buy tickets",      body: "Add packages to your basket. Buy more, get free bonus tickets.",             icon: "🎟️" },
              { step: "03", title: "Watch the draw",  body: "Tune in at 11:11 PM for the live draw. Winner announced in real-time.",      icon: "🏆" },
            ].map(({ step, title, body, icon }) => (
              <div key={step} className="rounded-2xl border border-white/5 bg-[#111] p-6">
                <div className="mb-3 text-3xl">{icon}</div>
                <div className="mb-1 text-xs font-bold text-gold-500">STEP {step}</div>
                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500/10 via-transparent to-transparent border border-gold-500/20 p-10 text-center">
          <h2 className="text-3xl font-black text-white">Ready to win?</h2>
          <p className="mt-2 text-white/50">Join thousands of players. Every ticket is just £1.</p>
          <Link
            href="/signup"
            className="btn-gold mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-base font-bold text-black transition hover:bg-gold-400"
          >
            Create Free Account
            <ChevronRight size={18} />
          </Link>
        </section>

      </div>
    </>
  );
}
