// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { verifyJwtToken } from "@/lib/jwt";

export async function PUT(req: NextRequest) {
  try {
    // 1) Parse request body
    const {
      userId,
      username,
      firstName,
      lastName,
      currentPassword,
      newPassword,
    } = await req.json();

    // 2) Basic field validation
    if (!firstName || firstName.length < 2) {
      return NextResponse.json(
        { message: "First name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (!lastName || lastName.length < 2) {
      return NextResponse.json(
        { message: "Last name must be at least 2 characters." },
        { status: 400 }
      );
    }

    // 3) Retrieve JWT from Authorization header
    //    (If you have global middleware, it may already fail before here if missing or invalid.)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Token missing" }, { status: 401 });
    }

    // 4) Verify token
    const payload = await verifyJwtToken(token, process.env.JWT_SECRET!);

    // Ensure the user in the token matches the user being updated
    if (payload?.user_id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized: Token does not match user" },
        { status: 403 }
      );
    }

    // 5) Fetch current user from DB
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 6) If user is changing username, ensure it's unique
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // 7) If newPassword is provided, validate current password
    let updatedPassword = user.password;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password required to change password" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }
      updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    // 8) Update the user
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        username: username ?? user.username,
        first_name: firstName,
        last_name: lastName,
        password: updatedPassword,
      },
    });

    // 9) Return success response (omit sensitive info like password)
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          user_id: updatedUser.user_id,
          username: updatedUser.username,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
