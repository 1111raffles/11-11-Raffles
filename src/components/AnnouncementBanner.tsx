"use client";

import { useEffect, useState } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import type { AnnouncementPublic } from "@/types";

interface BannerItem {
  id:      string;
  message: string;
}

export function AnnouncementBanner() {
  const [messages, setMessages] = useState<BannerItem[]>([
    { id: "a1", message: "🎉 James T. from London just won a PlayStation 5! Ticket #742" },
    { id: "a2", message: "🔥 New raffle live: MacBook Pro 16\" M4 — 1,000 tickets from £1" },
    { id: "a3", message: "🏆 Sarah M. from Manchester won an iPhone 16 Pro! Ticket #231" },
    { id: "a4", message: "✨ Draw tonight at 11:11 PM — buy your tickets now!" },
    { id: "a5", message: "💰 500 tickets sold in the last hour — hurry!" },
  ]);

  useEffect(() => {
    // Fetch initial announcements
    fetch("/api/announcements?limit=8")
      .then((r) => r.json())
      .then((data: AnnouncementPublic[]) => {
        if (data?.length) {
          setMessages(data.map((a) => ({ id: a.id, message: a.message })));
        }
      })
      .catch(() => {});

    // Subscribe to real-time announcements
    try {
      const pusher  = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.ANNOUNCEMENTS);

      channel.bind(EVENTS.NEW_ANNOUNCEMENT, (data: { message: string }) => {
        setMessages((prev) => [
          { id: Date.now().toString(), message: data.message },
          ...prev.slice(0, 9),
        ]);
      });

      return () => { pusher.unsubscribe(CHANNELS.ANNOUNCEMENTS); };
    } catch {
      // Pusher not configured — live updates unavailable
    }
  }, []);

  const doubled = [...messages, ...messages]; // Seamless loop

  return (
    <div className="relative z-50 overflow-hidden border-b border-gold-500/20 bg-gold-500/5 py-2">
      <div className="flex items-center">
        {/* Live badge */}
        <div className="flex shrink-0 items-center gap-2 border-r border-white/10 px-4">
          <span className="pulse-dot" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Live</span>
        </div>

        {/* Ticker */}
        <div className="ticker-wrap flex-1">
          <div className="ticker-track">
            {doubled.map((msg, i) => (
              <span key={`${msg.id}-${i}`} className="mx-8 text-sm text-white/70">
                {msg.message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
