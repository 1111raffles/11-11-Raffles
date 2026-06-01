// SERVER-ONLY — never import this in client components or Zustand stores.
// For pricing constants use @/lib/packages instead.

import Stripe from "stripe";
import { PACKAGES, type PackageType } from "./packages";

export { PACKAGES, type PackageType } from "./packages";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

type CheckoutParams = {
  items:      Array<{ raffleId: string; packageType: PackageType; quantity: number }>;
  successUrl: string;
  cancelUrl:  string;
} & (
  | { userId: string; userEmail: string; userName: string; guestName?: never; guestEmail?: never }
  | { guestName: string; guestEmail: string; userId?: never; userEmail?: never; userName?: never }
);

export async function createCheckoutSession(params: CheckoutParams) {
  const { items, successUrl, cancelUrl } = params;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const pkg = PACKAGES[item.packageType];
    return {
      quantity: item.quantity,
      price_data: {
        currency:     "gbp",
        unit_amount:  pkg.price,
        product_data: {
          name:     pkg.label + (pkg.badge ? ` (${pkg.badge})` : ""),
          metadata: { raffleId: item.raffleId, packageType: item.packageType },
        },
      },
    };
  });

  const isGuest    = !params.userId;
  const email      = isGuest ? params.guestEmail! : params.userEmail!;
  const name       = isGuest ? params.guestName!  : params.userName!;

  const metadata: Record<string, string> = {
    items:     JSON.stringify(items),
    buyerName: name,
  };
  if (params.userId) {
    metadata.userId = params.userId;
  } else {
    metadata.guestEmail = params.guestEmail!;
    metadata.guestName  = params.guestName!;
  }

  const session = await stripe.checkout.sessions.create({
    mode:               "payment",
    payment_method_types: ["card"],
    line_items:         lineItems,
    customer_email:     email,
    success_url:        successUrl,
    cancel_url:         cancelUrl,
    metadata,
    payment_intent_data: process.env.STRIPE_CONNECTED_ACCOUNT_ID
      ? { transfer_data: { destination: process.env.STRIPE_CONNECTED_ACCOUNT_ID } }
      : undefined,
  });

  return session;
}
