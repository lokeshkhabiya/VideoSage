// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAuthUser, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1) Parse request body
    const {
      email,
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

    // 2) Fetch current user from DB
    const user = await prisma.user.findUnique({
      where: { user_id: authUser.user_id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 3) If user is changing email, ensure it's unique
    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { message: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // 4) If user is changing username, ensure it's unique
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

    // 5) If newPassword is provided, validate current password
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

    // 6) Update the user
    const updatedUser = await prisma.user.update({
      where: { user_id: authUser.user_id },
      data: {
        email: email ?? user.email,
        username: username ?? user.username,
        first_name: firstName,
        last_name: lastName,
        password: updatedPassword,
      },
    });

    // 9) Return success response (omit sensitive info like password)
    const response = NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          user_id: updatedUser.user_id,
          email: updatedUser.email,
          username: updatedUser.username,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
        },
      },
      { status: 200 }
    );
    const newToken = await signSessionToken({
      user_id: updatedUser.user_id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      username: updatedUser.username,
    });
    setSessionCookie(response, newToken);
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
