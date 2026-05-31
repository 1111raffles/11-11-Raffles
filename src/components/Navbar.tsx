"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBasket, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useBasket } from "@/store/basket";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();
  const { items, openBasket } = useBasket();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-black tracking-tight">
          <span className="text-gold-400">Raffle</span>
          <span className="text-white">Rumble</span>
          <span className="ml-1 rounded bg-gold-500 px-1.5 py-0.5 text-[10px] font-black text-black">LIVE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/60 md:flex">
          <Link href="/"          className="transition hover:text-white">Raffles</Link>
          <Link href="/faq"       className="transition hover:text-white">FAQ</Link>
          <Link href="/terms"     className="transition hover:text-white">T&amp;Cs</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-gold rounded-lg bg-gold-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-gold-400"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Basket */}
          <button
            onClick={openBasket}
            className="relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition hover:border-gold-500/30 hover:bg-white/10"
          >
            <ShoppingBasket size={16} />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-black text-black">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={openBasket}
            className="relative flex items-center rounded-lg border border-white/10 bg-white/5 p-2"
          >
            <ShoppingBasket size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[9px] font-black text-black">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg border border-white/10 bg-white/5 p-2"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-[#0a0a0a] px-4 py-4 md:hidden"
          >
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <Link href="/"          onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Raffles</Link>
              <Link href="/faq"       onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">FAQ</Link>
              <Link href="/terms"     onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">T&amp;Cs</Link>
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Dashboard</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="rounded-lg px-3 py-2 text-left text-white/50 hover:bg-white/5 hover:text-white">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login"  onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gold-500 px-3 py-2 text-center font-bold text-black">Get Started</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
