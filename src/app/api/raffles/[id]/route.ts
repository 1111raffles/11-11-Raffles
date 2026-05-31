import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const raffle = await prisma.raffle.findUnique({
    where:  { id: params.id },
    select: {
      id:           true,
      title:        true,
      description:  true,
      imageUrl:     true,
      totalTickets: true,
      soldTickets:  true,
      ticketPrice:  true,
      drawTime:     true,
      status:       true,
      winnerId:     true,
      winnerTicketNum: true,
    },
  });

  if (!raffle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(raffle);
}
