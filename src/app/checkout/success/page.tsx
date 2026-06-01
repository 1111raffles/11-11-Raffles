"use client";

import { useEffect } from "react";
import { useBasket } from "@/store/basket";
import { CheckCircle2, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutSuccessPage() {
  const { clearBasket } = useBasket();

  useEffect(() => {
    clearBasket();
  }, [clearBasket]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10"
        >
          <CheckCircle2 size={40} className="text-green-400" />
        </motion.div>

        <h1 className="text-3xl font-black text-white">You&apos;re in the draw! 🎉</h1>
        <p className="mt-3 text-white/50">
          Your tickets have been confirmed. We&apos;ve sent you a confirmation email with your ticket numbers.
        </p>

        <div className="mt-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-5 text-left">
          <p className="mb-2 text-sm font-bold text-gold-400">What&apos;s next?</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>• Check your email for ticket confirmation</li>
            <li>• Tune in at 11:11 PM for the live draw</li>
            <li>• Watch the announcements banner for results</li>
            <li>• Winners are notified immediately by email</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LayoutDashboard size={16} />
            View My Tickets
          </Link>
          <Link
            href="/"
            className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Browse More Raffles
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
