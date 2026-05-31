// Pricing constants — safe to import in both client and server code.
// (stripe.ts must remain server-only due to the Stripe SDK init.)

export type PackageType = "SINGLE" | "FIVE_PLUS" | "TEN_PLUS";

export const PACKAGES: Record<
  PackageType,
  { tickets: number; bonus: number; total: number; price: number; label: string; badge?: string }
> = {
  SINGLE:    { tickets: 1,  bonus: 0, total: 1,  price: 100,  label: "1 Ticket"   },
  FIVE_PLUS: { tickets: 5,  bonus: 2, total: 7,  price: 500,  label: "5 Tickets", badge: "+2 FREE" },
  TEN_PLUS:  { tickets: 10, bonus: 5, total: 15, price: 1000, label: "10 Tickets", badge: "+5 FREE" },
};
