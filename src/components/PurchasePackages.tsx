"use client";

import { useBasket } from "@/store/basket";
import { PACKAGES, PackageType } from "@/lib/packages";
import { Ticket, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const PACKAGE_META: Record<PackageType, { icon: React.ReactNode; color: string; popular?: boolean }> = {
  SINGLE:    { icon: <Ticket size={20} />,  color: "border-white/10 hover:border-white/20" },
  FIVE_PLUS: { icon: <Zap     size={20} />, color: "border-gold-500/30 hover:border-gold-500/60", popular: true },
  TEN_PLUS:  { icon: <Crown   size={20} />, color: "border-white/10 hover:border-white/20" },
};

interface Props {
  raffleId:   string;
  raffleName: string;
  disabled?:  boolean;
}

export function PurchasePackages({ raffleId, raffleName, disabled }: Props) {
  const { addItem } = useBasket();

  function handleAdd(packageType: PackageType) {
    addItem({ raffleId, raffleName, packageType });
    const pkg = PACKAGES[packageType];
    toast.success(
      `${pkg.total} ticket${pkg.total > 1 ? "s" : ""} added to basket!`,
      { icon: "🎟️" }
    );
  }

  const entries = (["SINGLE", "FIVE_PLUS", "TEN_PLUS"] as PackageType[]).map((type) => ({
    type,
    pkg:  PACKAGES[type],
    meta: PACKAGE_META[type],
  }));

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {entries.map(({ type, pkg, meta }, i) => (
        <motion.button
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => handleAdd(type)}
          disabled={disabled}
          className={`card-hover relative flex flex-col items-center gap-3 rounded-2xl border bg-[#111] p-5 text-center transition-colors ${meta.color} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {meta.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
              Best Value
            </span>
          )}

          <div className={`flex items-center justify-center rounded-xl p-2.5 ${meta.popular ? "bg-gold-500/10 text-gold-400" : "bg-white/5 text-white/60"}`}>
            {meta.icon}
          </div>

          <div>
            <div className="text-2xl font-black text-white">
              £{(pkg.price / 100).toFixed(0)}
            </div>
            <div className="mt-0.5 text-sm text-white/50">{pkg.label}</div>
          </div>

          <div className="flex w-full flex-col gap-1">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-sm">
              <span className="text-white/50">Tickets</span>
              <span className="font-bold text-white">{pkg.tickets}</span>
            </div>
            {pkg.bonus > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-gold-500/10 px-3 py-1.5 text-sm">
                <span className="text-gold-400/70">Free bonus</span>
                <span className="font-bold text-gold-400">+{pkg.bonus}</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-sm">
              <span className="text-white/50">Total</span>
              <span className="font-bold text-white">{pkg.total} 🎟️</span>
            </div>
          </div>

          <div className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${meta.popular ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90" : "bg-white/10 text-white hover:bg-white/15"}`}>
            Add to Basket
          </div>
        </motion.button>
      ))}
    </div>
  );
}
