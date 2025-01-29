import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Fetch user by username
    const user = await prisma.user.findUnique({
      where: { username },
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
      where: { username },
    });

    return NextResponse.json(
      { message: "Account deactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deactivating account:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
