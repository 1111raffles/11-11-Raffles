import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET       = process.env.ADMIN_JWT_SECRET!;
const COOKIE_NAME  = "rr_admin_token";
const COOKIE_MAX   = 60 * 60 * 8; // 8 hours

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const validUsername = process.env.ADMIN_USERNAME;
  const passwordHash  = process.env.ADMIN_PASSWORD_HASH;

  if (!validUsername || !passwordHash) return false;
  if (username !== validUsername)      return false;

  // Constant-time comparison to prevent timing attacks
  const inputHash    = sha256(password);
  const expectedHash = Buffer.from(passwordHash, "hex");
  const actualHash   = Buffer.from(inputHash,    "hex");
  if (expectedHash.length !== actualHash.length) return false;
  return crypto.timingSafeEqual(expectedHash, actualHash);
}

export function createAdminToken(): string {
  return jwt.sign({ admin: true, iat: Math.floor(Date.now() / 1000) }, SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, SECRET) as { admin: boolean };
    return payload.admin === true;
  } catch {
    return false;
  }
}

export async function getAdminFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function getAdminFromRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function adminCookieOptions(token: string) {
  return {
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge:   COOKIE_MAX,
    path:     "/admin",
  };
}
