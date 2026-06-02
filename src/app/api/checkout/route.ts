export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { PackageType } from "@/lib/packages";
import { z } from "zod";

const itemSchema = z.object({
  raffleId:    z.string(),
  packageType: z.enum(["SINGLE", "FIVE_PLUS", "TEN_PLUS"]),
  quantity:    z.number().int().min(1).max(50),
});

const bodySchema = z.object({
  items:      z.array(itemSchema).min(1).max(20),
  guestName:  z.string().min(2).max(40).optional(),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch ticket prices for all raffles in the basket
    const raffleIds = Array.from(new Set(parsed.data.items.map((i) => i.raffleId)));
    const raffles   = await prisma.raffle.findMany({
      where: { id: { in: raffleIds } },
      select: { id: true, ticketPrice: true },
    });
    const priceMap = Object.fromEntries(raffles.map((r) => [r.id, r.ticketPrice]));

    const session = await getServerSession(authOptions);
    const origin  = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    const items = parsed.data.items as Array<{ raffleId: string; packageType: PackageType; quantity: number }>;

    // Authenticated user
    if (session?.user) {
      const userId    = (session.user as { id: string }).id;
      const userEmail = session.user.email!;
      const userName  = session.user.name ?? "Raffler";

      const stripeSession = await createCheckoutSession({
        items,
        priceMap,
        userId,
        userEmail,
        userName,
        successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl:  `${origin}/?cancelled=1`,
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    // Guest checkout
    const { guestName, guestEmail } = parsed.data;
    if (!guestName || !guestEmail) {
      return NextResponse.json({ error: "Please enter your name and email to continue" }, { status: 400 });
    }

    const stripeSession = await createCheckoutSession({
      items,
      priceMap,
      guestName,
      guestEmail,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${origin}/?cancelled=1`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
