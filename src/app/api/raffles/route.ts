export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const raffles = await prisma.raffle.findMany({
    where:   { status: { in: ["ACTIVE", "DRAWING"] } },
    orderBy: { drawTime: "asc" },
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
    },
  });
  return NextResponse.json(raffles);
}
