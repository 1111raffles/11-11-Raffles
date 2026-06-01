export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user  = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: true });
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Create new reset token (valid for 1 hour)
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const origin   = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      to:       user.email,
      name:     user.name ?? "there",
      resetUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
