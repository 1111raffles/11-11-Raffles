import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { allocateTickets } from "@/lib/draw";
import { triggerTicketSold, triggerAnnouncement } from "@/lib/pusher";
import { sendPurchaseConfirmation } from "@/lib/email";
import { PACKAGES, type PackageType } from "@/lib/packages";
import type Stripe from "stripe";

// Note: bodyParser is disabled via req.text() — App Router reads raw body automatically
export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Idempotency — skip if already processed
  const existingOrder = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existingOrder?.status === "PAID") {
    return NextResponse.json({ received: true });
  }

  const items: Array<{ raffleId: string; packageType: PackageType; quantity: number }> =
    JSON.parse(session.metadata?.items ?? "[]");

  if (!items.length) {
    return NextResponse.json({ error: "Missing items metadata" }, { status: 400 });
  }

  // Resolve user — either existing account or guest (create/find by email)
  let userId: string;
  let userEmail: string;
  let userName: string;

  if (session.metadata?.userId) {
    // Authenticated user
    const user = await prisma.user.findUnique({ where: { id: session.metadata.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    userId    = user.id;
    userEmail = user.email;
    userName  = user.name ?? "Raffler";
  } else {
    // Guest — look up or create a user record by email
    const email = session.metadata?.guestEmail ?? session.customer_details?.email ?? "";
    const name  = session.metadata?.guestName  ?? session.customer_details?.name  ?? "Guest";

    if (!email) return NextResponse.json({ error: "No email for guest" }, { status: 400 });

    const guest = await prisma.user.upsert({
      where:  { email },
      update: {},  // Don't overwrite existing account data
      create: { email, name, emailVerified: null },
    });

    userId    = guest.id;
    userEmail = guest.email;
    userName  = guest.name ?? name;
  }

  // Process each item
  for (const item of items) {
    const pkg         = PACKAGES[item.packageType];
    const amountPaid  = pkg.price * item.quantity;

    for (let q = 0; q < item.quantity; q++) {
      const order = await prisma.order.create({
        data: {
          userId,
          raffleId:              item.raffleId,
          packageType:           item.packageType,
          ticketsPurchased:      pkg.tickets,
          ticketsBonus:          pkg.bonus,
          totalTickets:          pkg.total,
          amountPaid:            pkg.price,
          stripeSessionId:       q === 0 ? session.id : undefined,
          stripePaymentIntentId: q === 0 ? (session.payment_intent as string) : undefined,
          status:                "PAID",
        },
      });

      const ticketNumbers = await allocateTickets({
        userId,
        raffleId: item.raffleId,
        orderId:  order.id,
        totalTickets: pkg.total,
      });

      // Send confirmation email for first batch only
      if (q === 0) {
        const raffle = await prisma.raffle.findUnique({ where: { id: item.raffleId } });
        sendPurchaseConfirmation({
          to:            userEmail,
          name:          userName,
          raffleName:    raffle?.title ?? "Raffle",
          ticketNumbers,
          totalPaid:     amountPaid,
          drawTime:      raffle?.drawTime ?? new Date(),
        }).catch(() => {});
      }
    }

    // Broadcast real-time update
    const updated = await prisma.raffle.findUnique({ where: { id: item.raffleId } });
    if (updated) {
      triggerTicketSold(item.raffleId, updated.soldTickets, updated.totalTickets - updated.soldTickets).catch(() => {});
    }
  }

  // Milestone announcement
  const totalBought = items.reduce((s, i) => s + PACKAGES[i.packageType].total * i.quantity, 0);
  triggerAnnouncement(
    `🎟️ ${userName} just bought ${totalBought} ticket${totalBought > 1 ? "s" : ""}!`,
    "GENERAL"
  ).catch(() => {});

  return NextResponse.json({ received: true });
}
