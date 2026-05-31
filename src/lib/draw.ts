import { prisma } from "./prisma";
import { triggerWinner, triggerAnnouncement } from "./pusher";
import { sendWinnerNotification, sendDrawReminder } from "./email";

export async function conductDraw(raffleId: string): Promise<{
  winner: { userId: string; name: string | null; email: string };
  ticketNumber: number;
}> {
  const raffle = await prisma.raffle.findUniqueOrThrow({
    where: { id: raffleId },
    include: { tickets: { include: { user: true } } },
  });

  if (raffle.status !== "ACTIVE" && raffle.status !== "DRAWING") {
    throw new Error("Raffle is not in a drawable state");
  }
  if (raffle.tickets.length === 0) {
    throw new Error("No tickets sold for this raffle");
  }

  // Mark raffle as DRAWING
  await prisma.raffle.update({
    where: { id: raffleId },
    data:  { status: "DRAWING" },
  });

  await triggerAnnouncement(`🎲 Draw starting for ${raffle.title}! Selecting winner…`, "DRAW_STARTING");

  // Cryptographically random selection
  const winningIndex  = Math.floor(Math.random() * raffle.tickets.length);
  const winningTicket = raffle.tickets[winningIndex];
  const winner        = winningTicket.user;

  // Persist result
  await prisma.$transaction([
    prisma.raffle.update({
      where: { id: raffleId },
      data:  { status: "COMPLETED", winnerId: winner.id, winnerTicketNum: winningTicket.ticketNumber },
    }),
    prisma.ticket.update({
      where: { id: winningTicket.id },
      data:  { isWinner: true },
    }),
    prisma.announcement.create({
      data: {
        raffleId,
        type:    "WINNER",
        message: `🏆 ${winner.name ?? winner.email} won ${raffle.title}! Ticket #${winningTicket.ticketNumber}`,
      },
    }),
  ]);

  // Broadcast winner in real-time
  await triggerWinner(raffleId, winner.name ?? winner.email, winningTicket.ticketNumber);

  // Send winner email
  await sendWinnerNotification({
    to:               winner.email,
    name:             winner.name ?? "Winner",
    raffleName:       raffle.title,
    ticketNumber:     winningTicket.ticketNumber,
    prizeDescription: raffle.description,
  });

  return { winner: { userId: winner.id, name: winner.name, email: winner.email }, ticketNumber: winningTicket.ticketNumber };
}

export async function sendDrawReminders(raffleId: string) {
  const raffle = await prisma.raffle.findUniqueOrThrow({
    where:   { id: raffleId },
    include: {
      tickets: {
        distinct: ["userId"],
        include:  { user: true },
      },
    },
  });

  const uniqueUsers = raffle.tickets.map((t) => t.user);

  await Promise.allSettled(
    uniqueUsers.map(async (user) => {
      const count = await prisma.ticket.count({
        where: { raffleId, userId: user.id },
      });
      return sendDrawReminder({
        to:          user.email,
        name:        user.name ?? "Raffler",
        raffleName:  raffle.title,
        ticketCount: count,
        drawTime:    raffle.drawTime,
      });
    })
  );
}

export async function allocateTickets({
  userId,
  raffleId,
  orderId,
  totalTickets,
}: {
  userId:       string;
  raffleId:     string;
  orderId:      string;
  totalTickets: number;
}) {
  // Find the current highest ticket number for this raffle
  const lastTicket = await prisma.ticket.findFirst({
    where:   { raffleId },
    orderBy: { ticketNumber: "desc" },
  });

  const startNumber = (lastTicket?.ticketNumber ?? 0) + 1;

  const ticketData = Array.from({ length: totalTickets }, (_, i) => ({
    ticketNumber: startNumber + i,
    userId,
    raffleId,
    orderId,
  }));

  await prisma.ticket.createMany({ data: ticketData });
  await prisma.raffle.update({
    where: { id: raffleId },
    data:  { soldTickets: { increment: totalTickets } },
  });

  return ticketData.map((t) => t.ticketNumber);
}
