export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all ticket holders for this raffle
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const tickets = await prisma.ticket.findMany({
    where:   { raffleId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { ticketNumber: "asc" },
  });

  // Deduplicate by user, include their ticket numbers
  const userMap = new Map<string, { userId: string; name: string; email: string; tickets: number[] }>();
  for (const t of tickets) {
    if (!userMap.has(t.userId)) {
      userMap.set(t.userId, {
        userId:  t.userId,
        name:    t.user.name ?? t.user.email,
        email:   t.user.email,
        tickets: [],
      });
    }
    userMap.get(t.userId)!.tickets.push(t.ticketNumber);
  }

  // Also get currently preselected ticket
  const raffle = await prisma.raffle.findUnique({
    where:  { id: params.id },
    select: { preselectedTicketId: true, preselectedUserId: true },
  });

  return NextResponse.json({
    participants:       Array.from(userMap.values()),
    preselectedTicketId: raffle?.preselectedTicketId ?? null,
    preselectedUserId:   raffle?.preselectedUserId   ?? null,
  });
}

// POST — set the preselected winner
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { userId, ticketNumber } = await req.json();

  if (!userId) {
    // Clear preselection
    await prisma.raffle.update({
      where: { id: params.id },
      data:  { preselectedTicketId: null, preselectedUserId: null },
    });
    return NextResponse.json({ ok: true });
  }

  // Find their first ticket
  const ticket = await prisma.ticket.findFirst({
    where:   { raffleId: params.id, userId },
    orderBy: { ticketNumber: "asc" },
  });

  await prisma.raffle.update({
    where: { id: params.id },
    data:  {
      preselectedTicketId: ticket?.id ?? null,
      preselectedUserId:   userId,
    },
  });

  return NextResponse.json({ ok: true });
}
