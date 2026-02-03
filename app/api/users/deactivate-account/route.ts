import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { clearSessionCookie, getAuthUser } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;
    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    // Fetch user by id
    const user = await prisma.user.findUnique({
      where: { user_id: authUser.user_id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Validate password before deactivating account
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 400 }
      );
    }

    // Delete user account
    await prisma.user.delete({
      where: { user_id: authUser.user_id },
    });

    const response = NextResponse.json(
      { message: "Account deactivated successfully" },
      { status: 200 }
    );
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Error deactivating account:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
