import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import type { PackageType } from "@/lib/packages";
import { z } from "zod";

const itemSchema = z.object({
  raffleId:    z.string(),
  packageType: z.enum(["SINGLE", "FIVE_PLUS", "TEN_PLUS"]),
  quantity:    z.number().int().min(1).max(50),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body   = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const userId    = (session.user as { id: string }).id;
    const userEmail = session.user.email!;
    const origin    = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    const stripeSession = await createCheckoutSession({
      items:      parsed.data.items,
      userId,
      userEmail,
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${origin}/?cancelled=1`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
