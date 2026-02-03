import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionToken, verifySessionToken } from "@/lib/auth";

const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/users/signin",
  "/api/users/signup",
  "/api/health",
];

export const config = {
  matcher: ["/api/:path*"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = getSessionToken(request);
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: missing session" },
      { status: 401 }
    );
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json(
      { message: "Unauthorized: invalid session" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
