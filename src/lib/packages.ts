// Pricing constants — safe to import in both client and server code.
// (stripe.ts must remain server-only due to the Stripe SDK init.)

export type PackageType = "SINGLE" | "FIVE_PLUS" | "TEN_PLUS";

export type Package = {
  tickets: number;
  bonus: number;
  total: number;
  price: number; // in pence
  label: string;
  badge?: string;
};

const STRIPE_MIN_PENCE = 30; // Stripe minimum charge for GBP

const PACKAGE_DEFS: Record<PackageType, Omit<Package, "price">> = {
  SINGLE:    { tickets: 1,  bonus: 0, total: 1,  label: "1 Ticket"    },
  FIVE_PLUS: { tickets: 5,  bonus: 2, total: 7,  label: "5 Tickets",  badge: "+2 FREE" },
  TEN_PLUS:  { tickets: 10, bonus: 5, total: 15, label: "10 Tickets", badge: "+5 FREE" },
};

/** Build packages dynamically from a per-ticket price (in £). */
export function getPackages(ticketPriceGBP: number): Record<PackageType, Package> {
  const result = {} as Record<PackageType, Package>;
  for (const [type, def] of Object.entries(PACKAGE_DEFS) as [PackageType, Omit<Package, "price">][]) {
    const raw = Math.round(def.tickets * ticketPriceGBP * 100);
    result[type] = { ...def, price: Math.max(raw, STRIPE_MIN_PENCE) };
  }
  return result;
}

// Default £1/ticket packages — used as fallback only
export const PACKAGES = getPackages(1.0);
