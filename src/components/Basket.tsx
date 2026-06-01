"use client";

import { useBasket } from "@/store/basket";
import { PACKAGES } from "@/lib/packages";
import { X, Minus, Plus, ShoppingBasket, ArrowRight, Trash2, Mail, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export function Basket() {
  const { items, isOpen, closeBasket, removeItem, updateQty, clearBasket, totalTickets, totalPrice } = useBasket();
  const { data: session } = useSession();
  const router            = useRouter();
  const [loading, setLoading]       = useState(false);
  const [showGuest, setShowGuest]   = useState(false);
  const [guestName, setGuestName]   = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  async function doCheckout(guest?: { name: string; email: string }) {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        items: items.map((i) => ({ raffleId: i.raffleId, packageType: i.packageType, quantity: i.quantity })),
      };
      if (guest) {
        body.guestName  = guest.name;
        body.guestEmail = guest.email;
      }

      const res  = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!session) {
      setShowGuest(true);
      return;
    }
    await doCheckout();
  }

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name  = guestName.trim();
    const email = guestEmail.trim().toLowerCase();
    if (!name || name.length < 2) { toast.error("Enter your display name (min 2 characters)"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address"); return; }
    await doCheckout({ name, email });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBasket}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#0d0d0d] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBasket size={20} className="text-gold-400" />
                <h2 className="text-lg font-bold">Your Basket</h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-2 py-0.5 text-xs font-black text-white">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => { closeBasket(); setShowGuest(false); }}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guest form overlay */}
            <AnimatePresence>
              {showGuest && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 z-10 flex flex-col bg-[#0d0d0d]"
                >
                  {/* Guest header */}
                  <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                    <h2 className="text-lg font-bold text-white">Quick Checkout</h2>
                    <button
                      onClick={() => setShowGuest(false)}
                      className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Sign in option */}
                    <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="mb-1 text-sm font-semibold text-white">Have an account?</p>
                      <p className="mb-3 text-xs text-white/40">Sign in to track all your tickets and entries</p>
                      <Link
                        href="/login"
                        onClick={closeBasket}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <LogIn size={15} />
                        Sign In
                      </Link>
                    </div>

                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-white/30">or continue as guest</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/60">
                          Display Name
                          <span className="ml-1.5 text-xs text-white/30">(shown on your tickets)</span>
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="e.g. John S"
                            maxLength={40}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-500/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/60">
                          Email Address
                          <span className="ml-1.5 text-xs text-white/30">(for ticket confirmation)</span>
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition focus:border-gold-500/50"
                          />
                        </div>
                      </div>

                      {/* Order summary */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <div className="flex justify-between text-sm text-white/50">
                          <span>Total tickets</span>
                          <span className="font-semibold text-white">{totalTickets()} 🎟️</span>
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                          <span className="font-semibold text-white">Total</span>
                          <span className="font-black text-gold-400">£{(totalPrice() / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-4 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Processing…
                          </span>
                        ) : (
                          <>
                            Continue to Payment
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-white/30">
                        Apple Pay · Google Pay · Card accepted
                      </p>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <ShoppingBasket size={48} className="text-white/10" />
                  <div>
                    <p className="font-semibold text-white/50">Your basket is empty</p>
                    <p className="mt-1 text-sm text-white/30">Add tickets to a raffle to get started</p>
                  </div>
                  <button onClick={closeBasket} className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                    Browse Raffles
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => {
                    const pkg = PACKAGES[item.packageType];
                    return (
                      <div key={`${item.raffleId}-${item.packageType}`} className="rounded-2xl border border-white/5 bg-[#111] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white line-clamp-1">{item.raffleName}</p>
                            <p className="mt-0.5 text-xs text-white/40">
                              {pkg.label}{pkg.badge ? ` ${pkg.badge}` : ""} · {pkg.total} tickets
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.raffleId, item.packageType)}
                            className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white/60"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5">
                            <button
                              onClick={() => updateQty(item.raffleId, item.packageType, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-l-lg text-white/50 transition hover:bg-white/5 hover:text-white"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.raffleId, item.packageType, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-r-lg text-white/50 transition hover:bg-white/5 hover:text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-white">£{((pkg.price * item.quantity) / 100).toFixed(2)}</p>
                            <p className="text-xs text-white/30">{pkg.total * item.quantity} tickets</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={clearBasket}
                    className="flex items-center gap-2 self-start rounded-lg px-3 py-1.5 text-xs text-white/30 transition hover:bg-white/5 hover:text-white/50"
                  >
                    <Trash2 size={12} />
                    Clear basket
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 bg-[#0a0a0a] px-6 py-5">
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Total tickets</span>
                    <span className="font-semibold text-white">{totalTickets()} 🎟️</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-black text-gold-400">£{(totalPrice() / 100).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-4 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      Checkout
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-white/30">
                  Apple Pay · Google Pay · Card accepted
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
