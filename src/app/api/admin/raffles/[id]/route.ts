import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title:        z.string().min(3).max(200).optional(),
  description:  z.string().min(10).optional(),
  imageUrl:     z.string().url().or(z.literal("")).optional(),
  totalTickets: z.number().int().min(10).optional(),
  ticketPrice:  z.number().min(0.5).optional(),
  drawTime:     z.string().optional(),
  status:       z.enum(["DRAFT", "ACTIVE", "DRAWING", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const data: Record<string, unknown> = { ...parsed.data };
    if (data.drawTime) data.drawTime = new Date(data.drawTime as string);
    if (data.imageUrl === "") data.imageUrl = null;

    const raffle = await prisma.raffle.update({ where: { id: params.id }, data });
    return NextResponse.json(raffle);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminFromRequest(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    // Only allow deleting drafts or cancelled raffles
    const raffle = await prisma.raffle.findUnique({ where: { id: params.id } });
    if (!raffle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (raffle.status === "ACTIVE" || raffle.status === "DRAWING") {
      return NextResponse.json({ error: "Cannot delete an active raffle. Cancel it first." }, { status: 400 });
    }

    await prisma.raffle.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
