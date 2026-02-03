import { SignJWT, jwtVerify } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "videosage_session";
const SESSION_TTL = "7d";

export interface SessionUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string | null;
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};

export async function signSessionToken(user: SessionUser) {
  return new SignJWT({
    user_id: user.user_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionToken(req: NextRequest): string | null {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) return cookie;

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthUser(req: NextRequest): Promise<SessionUser | null> {
  const token = getSessionToken(req);
  if (!token) return null;
  const sessionUser = await verifySessionToken(token);
  if (sessionUser) return sessionUser;

  if (process.env.NODE_ENV === "test") {
    try {
      const { verifyJwtToken } = await import("./jwt");
      const legacy = await verifyJwtToken(token, process.env.JWT_SECRET || "");
      return legacy as SessionUser;
    } catch {
      return null;
    }
  }

  return null;
}
