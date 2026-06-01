import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "admin_session_v2";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token  = req.cookies.get(ADMIN_COOKIE)?.value;
    const secret = process.env.ADMIN_JWT_SECRET;

    let valid = false;
    if (token && secret) {
      try {
        const key = new TextEncoder().encode(secret);
        await jwtVerify(token, key);
        valid = true;
      } catch {
        valid = false;
      }
    }

    if (!valid) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      const res = NextResponse.redirect(loginUrl);
      // Clear any stale cookies
      res.cookies.set({ name: ADMIN_COOKIE,    value: "", maxAge: 0, path: "/" });
      res.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/" });
      res.cookies.set({ name: "rr_admin_token", value: "", maxAge: 0, path: "/admin" });
      return res;
    }
  }

  // Pass pathname to layout so it can hide the public navbar on admin routes
  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
