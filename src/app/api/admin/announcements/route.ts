export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { triggerAnnouncement } from "@/lib/pusher";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(3).max(300),
  type:    z.enum(["GENERAL", "MILESTONE", "NEW_RAFFLE", "DRAW_STARTING", "WINNER"]).default("GENERAL"),
});

// GET — list recent announcements
export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  return NextResponse.json(announcements);
}

// POST — create announcement and broadcast live
export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const announcement = await prisma.announcement.create({
      data: { message: parsed.data.message, type: parsed.data.type },
    });

    // Broadcast live to all connected users
    triggerAnnouncement(parsed.data.message, parsed.data.type).catch(() => {});

    return NextResponse.json(announcement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove an announcement
export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
