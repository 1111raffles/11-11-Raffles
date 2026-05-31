"use client";

import { useEffect, useState } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import type { LiveDrawState } from "@/types";

export function LiveDraw({ raffleId }: { raffleId: string }) {
  const [state, setState] = useState<LiveDrawState>({ status: "idle", countdown: 0 });

  useEffect(() => {
    try {
      const pusher  = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.DRAW(raffleId));

      channel.bind(EVENTS.DRAW_STARTED, () => {
        setState({ status: "starting", countdown: 10 });
      });

      channel.bind(EVENTS.DRAW_COUNTDOWN, (data: { count: number }) => {
        setState((s) => ({ ...s, status: "drawing", countdown: data.count }));
      });

      channel.bind(EVENTS.WINNER_SELECTED, (data: { winnerName: string; ticketNumber: number }) => {
        setState({
          status:       "complete",
          countdown:    0,
          winnerName:   data.winnerName,
          winnerTicket: data.ticketNumber,
        });
      });

      return () => { pusher.unsubscribe(CHANNELS.DRAW(raffleId)); };
    } catch {
      // Pusher not configured
    }
  }, [raffleId]);

  if (state.status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <div className="relative mx-4 w-full max-w-md rounded-3xl border border-gold-500/30 bg-[#0d0d0d] p-8 text-center shadow-2xl">
          {state.status === "starting" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10">
                <Loader2 size={32} className="animate-spin text-gold-400" />
              </div>
              <h2 className="text-2xl font-black text-gold-400">Draw Starting</h2>
              <p className="mt-2 text-white/50">Shuffling tickets…</p>
            </motion.div>
          )}

          {state.status === "drawing" && (
            <motion.div
              key={state.countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
            >
              <div className="text-8xl font-black text-gold-400 num-display">{state.countdown}</div>
              <p className="mt-2 text-white/50 text-lg">Selecting winner…</p>
            </motion.div>
          )}

          {state.status === "complete" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <motion.div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold-500/20"
                animate={{ boxShadow: ["0 0 0 0 rgba(245,158,11,0.4)", "0 0 0 30px rgba(245,158,11,0)"] }}
                transition={{ repeat: 3, duration: 1 }}
              >
                <Trophy size={40} className="text-gold-400" />
              </motion.div>
              <h2 className="text-3xl font-black text-gold-400">We have a winner!</h2>
              <p className="mt-3 text-xl font-bold text-white">{state.winnerName}</p>
              <p className="mt-1 text-sm text-white/50">Ticket #{state.winnerTicket}</p>
              <button
                onClick={() => setState({ status: "idle", countdown: 0 })}
                className="mt-6 rounded-xl bg-gold-500 px-8 py-3 font-bold text-black transition hover:bg-gold-400"
              >
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
