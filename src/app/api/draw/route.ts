import { NextRequest, NextResponse } from "next/server";
import { conductDraw } from "@/lib/draw";
import { getAdminFromRequest } from "@/lib/admin-auth";
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

    const { winner, ticketNumber } = await conductDraw(parsed.data.raffleId);

    return NextResponse.json({
      success:      true,
      winnerName:   winner.name ?? winner.email,
      ticketNumber,
    });
  } catch (err: unknown) {
    console.error("Draw error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Draw failed" }, { status: 500 });
  }
}
