export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Find valid reset token
    const reset = await prisma.passwordReset.findUnique({ where: { token } });

    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link has expired or is invalid. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and delete the used token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data:  { passwordHash },
      }),
      prisma.passwordReset.delete({ where: { token } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
