import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { triggerAnnouncement } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({
  title:        z.string().min(3).max(200),
  description:  z.string().min(10),
  imageUrl:     z.string().url().or(z.literal("")).optional(),
  totalTickets: z.number().int().min(10).max(100000),
  ticketPrice:  z.number().min(0.5).max(100),
  drawTime:     z.string(),
  status:       z.enum(["DRAFT", "ACTIVE", "CANCELLED"]),
});

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const raffle = await prisma.raffle.create({
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
        drawTime: new Date(parsed.data.drawTime),
      },
    });

    if (raffle.status === "ACTIVE") {
      triggerAnnouncement(`✨ New raffle live: ${raffle.title} — from £${raffle.ticketPrice}!`, "NEW_RAFFLE").catch(() => {});
    }

    return NextResponse.json(raffle, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
