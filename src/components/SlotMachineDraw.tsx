"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface DrawEvent {
  winnerName:   string;
  ticketNumber: number;
  allNames:     string[];
}

interface SlotState {
  phase:        "idle" | "starting" | "spinning" | "winner";
  displayName:  string;
  winnerName:   string;
  winnerTicket: number;
}

export function SlotMachineDraw({ raffleId }: { raffleId: string }) {
  const [state, setState] = useState<SlotState>({
    phase: "idle", displayName: "", winnerName: "", winnerTicket: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSpin = useCallback((allNames: string[], winnerName: string, winnerTicket: number) => {
    if (allNames.length === 0) return;
    if (intervalRef.current) clearTimeout(intervalRef.current);

    setState({ phase: "starting", displayName: "", winnerName, winnerTicket });

    let idx         = 0;
    let speed       = 60;
    let totalFrames = 0;
    const maxFrames = 60;

    function tick() {
      totalFrames++;
      idx = (idx + 1) % allNames.length;

      setState((s) => ({ ...s, phase: "spinning", displayName: allNames[idx] }));

      if (totalFrames >= maxFrames) {
        speed += 40;
      }

      if (totalFrames >= maxFrames + 8) {
        if (intervalRef.current) clearTimeout(intervalRef.current);
        setState({ phase: "winner", displayName: winnerName, winnerName, winnerTicket });
        return;
      }

      intervalRef.current = setTimeout(tick, speed);
    }

    setTimeout(() => {
      setState((s) => ({ ...s, phase: "spinning" }));
      intervalRef.current = setTimeout(tick, speed);
    }, 800);
  }, []);

  useEffect(() => {
    try {
      const pusher  = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.DRAW(raffleId));

      channel.bind(EVENTS.DRAW_STARTED, (data: { allNames: string[] }) => {
        setState({ phase: "starting", displayName: "", winnerName: "", winnerTicket: 0 });
        void data;
      });

      channel.bind(EVENTS.WINNER_SELECTED, (data: DrawEvent) => {
        startSpin(data.allNames ?? [data.winnerName], data.winnerName, data.ticketNumber);
      });

      return () => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
        pusher.unsubscribe(CHANNELS.DRAW(raffleId));
      };
    } catch {
      // Pusher not configured — draw animation disabled
    }
  }, [raffleId, startSpin]);

  if (state.phase === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
      >
        <div className="w-full max-w-lg px-4 text-center">

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-sm font-bold uppercase tracking-widest text-gold-400"
          >
            🎰 Live Draw
          </motion.p>

          <div className="relative overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-[#0d0d0d] p-2 shadow-2xl shadow-gold-500/10">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#0d0d0d] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2">
              <div className="mx-4 h-px bg-gold-500/60" />
            </div>

            <div className="flex h-48 items-center justify-center">
              <AnimatePresence mode="wait">
                {state.phase === "starting" && (
                  <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-xl">
                    Shuffling tickets…
                  </motion.div>
                )}
                {state.phase === "spinning" && (
                  <motion.div
                    key={state.displayName}
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0,   opacity: 1 }}
                    exit={{    y:  40, opacity: 0 }}
                    transition={{ duration: 0.08 }}
                    className="text-3xl font-black text-white"
                  >
                    {state.displayName}
                  </motion.div>
                )}
                {state.phase === "winner" && (
                  <motion.div
                    key="winner"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ delay: 0.3, duration: 0.5 }}>
                      <Trophy size={40} className="text-gold-400" />
                    </motion.div>
                    <span className="text-4xl font-black text-gold-400">{state.winnerName}</span>
                    <span className="text-sm text-white/40">Ticket #{state.winnerTicket}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {state.phase === "winner" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <p className="text-2xl font-black text-white">🎉 Congratulations!</p>
              <p className="mt-2 text-white/50">The winner has been notified by email.</p>
              <button
                onClick={() => setState({ phase: "idle", displayName: "", winnerName: "", winnerTicket: 0 })}
                className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-3 font-bold text-white transition hover:opacity-90"
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
