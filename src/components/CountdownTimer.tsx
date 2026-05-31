"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  hours:   number;
  minutes: number;
  seconds: number;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ drawTime }: { drawTime: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired,  setExpired]  = useState(false);

  useEffect(() => {
    function calculate() {
      const diff = new Date(drawTime).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        hours:   Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [drawTime]);

  if (!timeLeft) {
    return (
      <div className="flex gap-3">
        {["HH", "MM", "SS"].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <div className="skeleton h-16 w-20 rounded-xl" />
            <span className="mt-1 text-xs text-white/30">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-6 py-3">
        <span className="pulse-dot" />
        <span className="text-lg font-bold text-gold-400">Draw in progress…</span>
      </div>
    );
  }

  const segments = [
    { value: timeLeft.hours,   label: "HRS"  },
    { value: timeLeft.minutes, label: "MINS" },
    { value: timeLeft.seconds, label: "SECS" },
  ];

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <div className="flex items-end gap-3">
      {segments.map(({ value, label }, i) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className={`relative flex h-16 w-20 items-center justify-center rounded-xl border text-3xl font-black num-display transition-colors ${
              isUrgent
                ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                : "border-white/10 bg-white/5 text-white"
            }`}
          >
            {pad(value)}
            {/* Divider line for flip effect */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/30" />
          </div>
          <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
            {label}
          </span>
          {i < segments.length - 1 && (
            <span className="absolute mt-4 text-2xl font-black text-white/20 select-none">
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
