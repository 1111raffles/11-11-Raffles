"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
    >
      <LogOut size={15} />
      Sign Out
    </button>
  );
}
