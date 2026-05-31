// SERVER-ONLY — never import this in client components or Zustand stores.
// For pricing constants use @/lib/packages instead.

import Stripe from "stripe";
import { PACKAGES, type PackageType } from "./packages";

export { PACKAGES, type PackageType } from "./packages";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createCheckoutSession({
  items,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  items:      Array<{ raffleId: string; packageType: PackageType; quantity: number }>;
  userId:     string;
  userEmail:  string;
  successUrl: string;
  cancelUrl:  string;
}) {
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

  const session = await stripe.checkout.sessions.create({
    mode:               "payment",
    payment_method_types: ["card"],
    line_items:         lineItems,
    customer_email:     userEmail,
    success_url:        successUrl,
    cancel_url:         cancelUrl,
    metadata: {
      userId,
      items: JSON.stringify(items),
    },
    payment_intent_data: process.env.STRIPE_CONNECTED_ACCOUNT_ID
      ? {
          transfer_data: {
            destination: process.env.STRIPE_CONNECTED_ACCOUNT_ID,
          },
        }
      : undefined,
  });

  return session;
}
