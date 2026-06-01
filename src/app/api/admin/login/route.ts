export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminToken, adminCookieOptions } from "@/lib/admin-auth";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
    if (!valid) {
      // Constant-time response to prevent timing attacks
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token    = createAdminToken();
    const response = NextResponse.json({ ok: true });
    const opts     = adminCookieOptions(token);

    // Clear any old cookies from previous versions
    response.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/admin" });
    response.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/" });
    // Set new cookie
    response.cookies.set(opts);
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
