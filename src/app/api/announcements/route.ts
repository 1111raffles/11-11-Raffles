import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "10"), 50);

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take:    limit,
    select: {
      id:        true,
      type:      true,
      message:   true,
      raffleId:  true,
      createdAt: true,
    },
  });

  return NextResponse.json(announcements);
}
