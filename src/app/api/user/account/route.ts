export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccountDeletedEmail } from "@/lib/email";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Delete everything in order (tickets depend on orders, orders depend on user)
    await prisma.$transaction([
      prisma.ticket.deleteMany({ where: { userId } }),
      prisma.order.deleteMany({ where: { userId } }),
      prisma.passwordReset.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Send goodbye email (fire and forget)
    sendAccountDeletedEmail({ to: user.email, name: user.name ?? "there" }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
