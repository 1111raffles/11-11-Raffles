"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBasket, LogOut, LayoutDashboard, Menu, X, Settings2 } from "lucide-react";
import { useBasket } from "@/store/basket";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: Props) {
  const { data: session } = useSession();
  const { items, openBasket } = useBasket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  async function handleAdminLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh(); // re-renders server components so banner disappears
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      {/* Admin mode banner — only visible when logged in as admin */}
      {isAdmin && (
        <div className="flex items-center justify-between border-b border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-300">Admin mode active</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300 transition hover:bg-violet-500/30"
            >
              <Settings2 size={12} />
              Admin Panel
            </Link>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1 text-xs font-bold text-white/40 transition hover:bg-white/10 hover:text-white/70"
            >
              <LogOut size={12} />
              Log out
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="planet" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#a78bfa"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </radialGradient>
              <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
                <stop offset="50%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9"/>
              </linearGradient>
            </defs>
            <ellipse cx="16" cy="17" rx="14" ry="4.5" fill="none" stroke="url(#ring)" strokeWidth="3" strokeOpacity="0.65"/>
            <circle cx="16" cy="14" r="9" fill="url(#planet)"/>
            <ellipse cx="16" cy="17" rx="14" ry="4.5" fill="none" stroke="url(#ring)" strokeWidth="3" strokeDasharray="22 22" strokeDashoffset="0"/>
            <circle cx="4"  cy="5"  r="1"   fill="#a78bfa" opacity="0.8"/>
            <circle cx="28" cy="8"  r="0.8" fill="#60a5fa" opacity="0.8"/>
            <circle cx="26" cy="26" r="1"   fill="#a78bfa" opacity="0.6"/>
          </svg>
          <span className="flex items-baseline gap-1 text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Planet</span>
            <span className="text-white">Raffle</span>
          </span>
          <span className="rounded bg-gradient-to-r from-violet-600 to-blue-500 px-1.5 py-0.5 text-[10px] font-black text-white">LIVE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/60 md:flex">
          <Link href="/"      className="transition hover:text-white">Raffles</Link>
          <Link href="/faq"   className="transition hover:text-white">FAQ</Link>
          <Link href="/terms" className="transition hover:text-white">T&amp;Cs</Link>
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
              <Link href="/login"  className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
                Sign In
              </Link>
              <Link href="/signup" className="btn-gold rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:opacity-90">
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
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-[10px] font-black text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={openBasket} className="relative flex items-center rounded-lg border border-white/10 bg-white/5 p-2">
            <ShoppingBasket size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-[9px] font-black text-white">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen((o) => !o)} className="rounded-lg border border-white/10 bg-white/5 p-2">
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
              <Link href="/"      onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Raffles</Link>
              <Link href="/faq"   onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">FAQ</Link>
              <Link href="/terms" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">T&amp;Cs</Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg bg-violet-500/20 px-3 py-2 text-center font-bold text-violet-300">
                  ⚙️ Admin Panel
                </Link>
              )}
              {session ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Dashboard</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="rounded-lg px-3 py-2 text-left text-white/50 hover:bg-white/5 hover:text-white">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login"  onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2 text-center font-bold text-white">Get Started</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
