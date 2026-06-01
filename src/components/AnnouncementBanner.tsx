"use client";

import { useEffect, useState } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import type { AnnouncementPublic } from "@/types";

interface BannerItem {
  id:      string;
  message: string;
}

export function AnnouncementBanner() {
  const [messages, setMessages] = useState<BannerItem[]>([]);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // Fetch real announcements from DB only
    fetch("/api/announcements?limit=10")
      .then((r) => r.json())
      .then((data: AnnouncementPublic[]) => {
        if (Array.isArray(data)) {
          setMessages(data.map((a) => ({ id: a.id, message: a.message })));
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));

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
      // Pusher not configured
    }
  }, []);

  // Don't render banner until we've loaded real data
  if (!ready || messages.length === 0) return null;

  const doubled = [...messages, ...messages];

  return (
    <div className="relative z-50 overflow-hidden border-b border-gold-500/20 bg-gold-500/5 py-2">
      <div className="flex items-center">
        <div className="flex shrink-0 items-center gap-2 border-r border-white/10 px-4">
          <span className="pulse-dot" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Live</span>
        </div>
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
