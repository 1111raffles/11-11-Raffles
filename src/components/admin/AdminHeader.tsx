"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Settings2 } from "lucide-react";
import { AdminLogout } from "./AdminLogout";

interface Props {
  title?:    string;
  backHref?: string;
  backLabel?: string;
}

export function AdminHeader({ title, backHref, backLabel }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030303]/90 backdrop-blur-xl">
      {/* Mode switcher bar */}
      <div className="flex items-center justify-between border-b border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <Settings2 size={12} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">Admin Panel</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <Globe size={12} />
          View Live Site
        </Link>
      </div>

      {/* Main header row */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="text-white/40 transition hover:text-white">
              <ArrowLeft size={18} />
            </Link>
          )}
          {title && <span className="truncate max-w-xs font-bold text-white">{title}</span>}
          {!title && (
            <span className="font-bold text-white">
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Planet</span>
              {" "}Raffle
            </span>
          )}
        </div>
        <AdminLogout />
      </div>
    </header>
  );
}
