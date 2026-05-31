import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/admin" });
  return response;
}
