"use client";

import { useState } from "react";
import { PlayCircle, Trophy } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  raffleId:   string;
  raffleName: string;
}

export function DrawPanel({ raffleId, raffleName }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ winnerName: string; ticketNumber: number } | null>(null);

  async function conductDraw() {
    if (!confirm(`Start the live draw for "${raffleName}"? This will select a winner immediately.`)) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/draw", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ raffleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Draw failed");
      setResult({ winnerName: data.winnerName, ticketNumber: data.ticketNumber });
      toast.success("Draw complete! Winner selected.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Draw failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-6 text-center">
        <Trophy size={40} className="mx-auto mb-3 text-gold-400" />
        <h3 className="text-xl font-black text-gold-400">Draw Complete!</h3>
        <p className="mt-2 text-white">Winner: <strong>{result.winnerName}</strong></p>
        <p className="text-sm text-white/60">Ticket #{result.ticketNumber}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-6">
      <h3 className="mb-2 font-bold text-white">Conduct Live Draw</h3>
      <p className="mb-4 text-sm text-white/50">
        This will immediately select a random winner from all eligible tickets and broadcast the result in real-time.
      </p>
      <button
        onClick={conductDraw}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <PlayCircle size={20} />
            Start Draw
          </>
        )}
      </button>
    </div>
  );
}
