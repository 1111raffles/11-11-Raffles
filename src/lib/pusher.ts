import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new PusherServer({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS:  true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance && typeof window !== "undefined") {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster:   process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS:  true,
      }
    );
  }
  return pusherClientInstance!;
}

// Channel names
export const CHANNELS = {
  ANNOUNCEMENTS: "announcements",
  RAFFLE:        (id: string) => `raffle-${id}`,
  DRAW:          (id: string) => `draw-${id}`,
} as const;

// Event names
export const EVENTS = {
  NEW_ANNOUNCEMENT: "new-announcement",
  TICKET_SOLD:      "ticket-sold",
  DRAW_STARTED:     "draw-started",
  DRAW_COUNTDOWN:   "draw-countdown",
  WINNER_SELECTED:  "winner-selected",
} as const;

export async function triggerAnnouncement(message: string, type: string) {
  await pusherServer.trigger(CHANNELS.ANNOUNCEMENTS, EVENTS.NEW_ANNOUNCEMENT, {
    message,
    type,
    timestamp: new Date().toISOString(),
  });
}

export async function triggerTicketSold(raffleId: string, soldCount: number, remaining: number) {
  await pusherServer.trigger(
    CHANNELS.RAFFLE(raffleId),
    EVENTS.TICKET_SOLD,
    { soldCount, remaining }
  );
}

export async function triggerWinner(raffleId: string, winnerName: string, ticketNumber: number) {
  await pusherServer.trigger(
    CHANNELS.DRAW(raffleId),
    EVENTS.WINNER_SELECTED,
    { winnerName, ticketNumber, timestamp: new Date().toISOString() }
  );
  await triggerAnnouncement(
    `🏆 ${winnerName} just won the raffle! Winning ticket: #${ticketNumber}`,
    "WINNER"
  );
}
