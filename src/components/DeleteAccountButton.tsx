"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(
      "Are you absolutely sure?\n\nThis will permanently delete your account, all your tickets, and order history.\n\nThis CANNOT be undone."
    )) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      toast.success("Account deleted. Goodbye!");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
    >
      <Trash2 size={14} />
      {loading ? "Deleting…" : "Delete Account"}
    </button>
  );
}
