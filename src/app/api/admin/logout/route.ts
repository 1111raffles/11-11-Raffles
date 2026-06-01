import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Clear current cookie
  response.cookies.set({ name: "admin_session_v2", value: "", maxAge: 0, path: "/" });
  // Also clear any old cookies
  response.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/" });
  response.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/admin" });
  return response;
}
