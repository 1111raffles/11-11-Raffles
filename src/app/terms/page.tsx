import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

const SECTIONS = [
  {
    title: "1. Introduction",
    body: `These Terms and Conditions ("Terms") govern your use of Raffle Rumble ("the Service"), operated by [COMPANY NAME] ("we", "us", "our"), a company registered in England and Wales.

By creating an account and purchasing tickets, you agree to be bound by these Terms. Please read them carefully.`,
  },
  {
    title: "2. Eligibility",
    body: `To enter our raffles, you must:
• Be aged 18 years or older
• Be a legal resident of the United Kingdom
• Have a valid email address
• Not be prohibited from participating in prize promotions under applicable law

By creating an account you confirm that you meet these requirements. We reserve the right to verify eligibility at any time.`,
  },
  {
    title: "3. How to Enter",
    body: `Tickets can be purchased through our website by registered users only. Each ticket purchased constitutes one entry into the specified raffle draw.

Ticket packages:
• 1 ticket: £1.00
• 5 tickets + 2 free (7 total): £5.00
• 10 tickets + 5 free (15 total): £10.00

Free bonus tickets have the same draw entry validity as purchased tickets. Entry is complete only upon successful payment confirmation.`,
  },
  {
    title: "4. Draw Procedure",
    body: `Draws take place at the advertised draw time (typically 11:11 PM UK time). The winner is selected using a cryptographically secure random number generator, operated independently by our automated system.

Each eligible ticket has an equal chance of being selected. The outcome of each draw is final and binding. Results are published on the website and announced in real-time.`,
  },
  {
    title: "5. Prizes",
    body: `Prizes are as described on each individual raffle page. No cash alternative is offered unless stated.

Prize delivery: We will contact the winner within 24 hours via registered email. Prizes are dispatched to UK addresses within 7 business days of confirmation.

If a winner cannot be contacted within 14 days, or fails to provide a valid UK delivery address, we reserve the right to re-draw a new winner.`,
  },
  {
    title: "6. Refund Policy",
    body: `All ticket purchases are final and non-refundable, except in the following circumstances:
• The raffle is cancelled before the draw
• A technical error results in a duplicate charge
• Required by applicable consumer protection law

In the event of cancellation, all tickets purchased for that raffle will be refunded to the original payment method within 5 business days.`,
  },
  {
    title: "7. Payment",
    body: `Payments are processed by Stripe, Inc. — a third-party PCI DSS Level 1 certified payment processor. We do not store your card details.

By providing payment information you authorise us to charge the selected amount. All prices are inclusive of VAT where applicable.

Accepted payment methods: Visa, Mastercard, American Express, Apple Pay, Google Pay.`,
  },
  {
    title: "8. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity occurring under your account.

You must not share your account with others. Each account must be linked to a single individual. We reserve the right to suspend or terminate accounts that we reasonably believe to be fraudulent, or operated in breach of these Terms.`,
  },
  {
    title: "9. Prohibited Conduct",
    body: `You agree not to:
• Use automated means to purchase tickets
• Create multiple accounts to circumvent entry limits
• Provide false information when registering
• Attempt to manipulate or interfere with the draw process
• Use the service if you are located outside the United Kingdom

Violation of these rules will result in immediate account suspension and forfeiture of any ticket entries.`,
  },
  {
    title: "10. Intellectual Property",
    body: `All content on Raffle Rumble, including text, graphics, logos, and software, is owned by or licensed to us and is protected by UK and international intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.`,
  },
  {
    title: "11. Limitation of Liability",
    body: `To the maximum extent permitted by law, we exclude liability for:
• Indirect, consequential, or special damages
• Loss of profit or anticipated savings
• Loss of data or business opportunities
• Any failure caused by events outside our reasonable control

Our total liability to you shall not exceed the amount you paid for tickets in the three months preceding the claim.`,
  },
  {
    title: "12. Data Protection",
    body: `We process your personal data in accordance with our Privacy Policy and the UK GDPR. Your data is used to manage your account, process payments, notify you of draw results, and improve our service.

You have the right to access, correct, or delete your personal data. Contact us at privacy@rafflerumble.com to exercise your rights.`,
  },
  {
    title: "13. Changes to Terms",
    body: `We may update these Terms from time to time. We will notify registered users of material changes via email. Continued use of the service after changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "14. Governing Law",
    body: `These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: "15. Contact",
    body: `For questions about these Terms, contact us at:
[COMPANY NAME]
[Registered Address]
Email: legal@rafflerumble.com`,
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white">Terms &amp; Conditions</h1>
        <p className="mt-3 text-white/40">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose-sm flex flex-col gap-8">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="mb-3 text-lg font-bold text-gold-400">{title}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-white/5 bg-[#111] p-6 text-sm text-white/40">
        <p>These Terms constitute the entire agreement between you and Raffle Rumble regarding your use of the service. If any provision is found unenforceable, the remaining provisions continue in full force.</p>
      </div>
    </div>
  );
}
