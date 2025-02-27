// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtToken } from "@/lib/jwt"; // wherever your helper lives

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // You can also do a manual check:
  if (
    pathname.startsWith("/api/users/signin") ||
    pathname.startsWith("/api/users/signup")
  ) {
    return NextResponse.next();
  }

  // Otherwise, check the token
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }

  try {
    // Verify token
    await verifyJwtToken(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid token", error },
      { status: 401 }
    );
  }
}

// 2) Configure `matcher` to exclude certain paths:
export const config = {
  // Protect all /api routes EXCEPT for /api/users/signin and /api/users/signup
  matcher: [
    "/api/:path*", // match all /api routes
    "!/api/users/signin", // exclude sign-in
    "!/api/users/signup", // exclude sign-up
  ],
};
