import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database…");

  // Create a sample active raffle
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 11, 0, 0); // 11:11 PM tomorrow

  await prisma.raffle.upsert({
    where: { id: "seed-raffle-1" },
    update: {},
    create: {
      id:           "seed-raffle-1",
      title:        "Apple MacBook Pro 16\" M4 Max",
      description:
        "Win the ultimate creative powerhouse. The new MacBook Pro 16\" with M4 Max chip — 16-core CPU, 40-core GPU, 128GB unified memory, 2TB SSD, Liquid Retina XDR display. Worth £4,499.",
      imageUrl:     "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80",
      totalTickets: 1000,
      soldTickets:  347,
      ticketPrice:  1.0,
      drawTime:     tomorrow,
      status:       "ACTIVE",
    },
  });

  // Create a few sample announcements
  const announcements = [
    { id: "ann-1", type: "WINNER",    message: "🎉 James T. from London just won a PlayStation 5! Ticket #742" },
    { id: "ann-2", type: "MILESTONE", message: "🔥 500 tickets sold in the last hour — draw closing fast!" },
    { id: "ann-3", type: "WINNER",    message: "🏆 Sarah M. from Manchester won an iPhone 16 Pro! Ticket #231" },
    { id: "ann-4", type: "NEW_RAFFLE",message: "✨ New raffle live: PlayStation 5 Pro — 500 tickets, draw at 11:11 PM" },
  ];

  for (const ann of announcements) {
    await prisma.announcement.upsert({
      where:  { id: ann.id },
      update: {},
      create: ann,
    });
  }

  console.log("✅  Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
