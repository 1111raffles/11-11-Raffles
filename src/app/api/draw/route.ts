export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { conductDraw } from "@/lib/draw";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({ raffleId: z.string() });

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "raffleId required" }, { status: 400 });

    const raffleId = parsed.data.raffleId;

    // Fetch all participant names for the slot machine animation
    const tickets = await prisma.ticket.findMany({
      where:   { raffleId },
      include: { user: { select: { name: true, email: true } } },
      distinct: ["userId"],
    });
    const allNames = tickets.map((t) => t.user.name ?? t.user.email);

    // Broadcast draw starting + all names so slot machine can spin
    await pusherServer.trigger(CHANNELS.DRAW(raffleId), EVENTS.DRAW_STARTED, { allNames });

    // Short delay so clients can show the starting animation
    await new Promise((r) => setTimeout(r, 1000));

    // Conduct the draw
    const { winner, ticketNumber } = await conductDraw(raffleId);

    // Broadcast winner WITH all names so slot machine lands correctly
    await pusherServer.trigger(CHANNELS.DRAW(raffleId), EVENTS.WINNER_SELECTED, {
      winnerName:   winner.name ?? winner.email,
      ticketNumber,
      allNames,
    });

    return NextResponse.json({
      success:     true,
      winnerName:  winner.name ?? winner.email,
      ticketNumber,
    });
  } catch (err: unknown) {
    console.error("Draw error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Draw failed" }, { status: 500 });
  }
}
