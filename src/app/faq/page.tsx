"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Metadata } from "next";

const FAQS = [
  {
    category: "Tickets & Pricing",
    items: [
      {
        q: "How much does a ticket cost?",
        a: "Each ticket costs just £1. We also offer bundle packages for better value: buy 5 tickets for £5 and receive 2 extra free (7 total), or buy 10 tickets for £10 and receive 5 extra free (15 total).",
      },
      {
        q: "What are the ticket bundle deals?",
        a: "• Single: 1 ticket for £1\n• Bundle 5: 5 tickets for £5 (+2 FREE = 7 tickets)\n• Bundle 10: 10 tickets for £10 (+5 FREE = 15 tickets)\n\nFree bonus tickets are automatically added to your entry.",
      },
      {
        q: "Can I buy tickets for multiple raffles at once?",
        a: "Yes! Add tickets from different raffles to your basket and pay for everything in a single checkout. Each raffle entry is handled separately.",
      },
      {
        q: "Is there a limit on how many tickets I can buy?",
        a: "You can purchase up to 50 ticket bundles per raffle per account to ensure fairness.",
      },
    ],
  },
  {
    category: "Draws & Winners",
    items: [
      {
        q: "When do draws take place?",
        a: "Draws are scheduled at 11:11 PM (UK time). Each raffle has its own draw time which is displayed on the raffle page. Some special raffles may have different times.",
      },
      {
        q: "How is the winner selected?",
        a: "Winners are selected using a cryptographically secure random number generator, ensuring complete fairness. The draw is conducted live on our platform and broadcast in real-time.",
      },
      {
        q: "How will I know if I've won?",
        a: "You'll be notified immediately via:\n• On-screen announcement during the live draw\n• Email notification to your registered address\n• A winning badge in your dashboard\n\nWe also broadcast all winners in our live announcements banner.",
      },
      {
        q: "What happens if a raffle doesn't sell enough tickets?",
        a: "We guarantee every draw proceeds as scheduled. In the unlikely event a raffle needs to be cancelled, all ticket purchases are fully refunded within 5 business days.",
      },
    ],
  },
  {
    category: "Prizes",
    items: [
      {
        q: "How do I claim my prize?",
        a: "Once a winner is confirmed, our team will contact you within 24 hours via email using the address on your account. Prizes are dispatched within 7 business days to a UK address.",
      },
      {
        q: "Can prizes be delivered outside the UK?",
        a: "Currently Planet Raffle is available to UK residents only. Prizes are shipped to UK addresses only.",
      },
      {
        q: "Can I take a cash alternative?",
        a: "Cash alternatives are not currently offered. The prize shown is the prize awarded.",
      },
    ],
  },
  {
    category: "Payments & Security",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Apple Pay, Google Pay, debit cards, and credit cards (Visa, Mastercard, Amex). All payments are processed securely by Stripe.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We never store your card details. All payments are processed by Stripe, a PCI DSS Level 1 certified payment provider — the highest level of security in the payment industry.",
      },
      {
        q: "Can I get a refund?",
        a: "Tickets are non-refundable once purchased, except in the event of a raffle cancellation. Please review our Terms and Conditions for full details.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "Do I need an account to buy tickets?",
        a: "Yes, you need a free account to purchase tickets. This ensures we can contact you if you win and lets you track your entries in the dashboard.",
      },
      {
        q: "How do I sign up?",
        a: "Click 'Get Started' and create a free account using your email address or sign in with Google or Apple. It takes less than 60 seconds.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Contact us and we'll delete your account and associated data in accordance with GDPR. Note that any active raffle entries will be forfeited.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-white">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="whitespace-pre-line pb-5 text-sm leading-relaxed text-white/50">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white">Frequently Asked Questions</h1>
        <p className="mt-3 text-white/40">Everything you need to know about Planet Raffle.</p>
      </div>

      <div className="flex flex-col gap-6">
        {FAQS.map(({ category, items }) => (
          <section key={category}>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-gold-400">{category}</h2>
            <div className="rounded-2xl border border-white/5 bg-[#111] px-6">
              {items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 text-center">
        <p className="font-semibold text-white">Still have questions?</p>
        <p className="mt-1 text-sm text-white/50">
          Email us at{" "}
          <a href="mailto:support@planetraffle.co.uk" className="text-gold-400 underline">
            support@planetraffle.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}
