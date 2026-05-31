import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin route protection ────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = req.cookies.get("rr_admin_token")?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Lightweight check — full verification happens in route handlers / page
    // We just confirm the cookie exists and looks like a JWT
    const parts = adminToken.split(".");
    if (parts.length !== 3) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("rr_admin_token");
      return response;
    }
  }

  // ── User-only routes ──────────────────────────────────────────────────────
  const userProtectedPaths = ["/dashboard", "/basket"];
  if (userProtectedPaths.some((p) => pathname.startsWith(p))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/basket/:path*"],
};
