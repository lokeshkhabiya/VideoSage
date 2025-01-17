import { signupValidation } from "@/validations/userValidation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedBody = signupValidation(body);
        
        const { username, first_name, last_name, password } = validatedBody;

        // check if user exists 
        const existingUser = await prisma.user.findUnique({
            where: { username }
        }) 

        if (existingUser) return NextResponse.json(
            { message: "Username already taken!"}, { status: 400 }
        )

        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user 
        const newUser = await prisma.user.create({
            data: {
                username,
                first_name,
                last_name,
                password: hashedPassword
            }
        })

        return NextResponse.json(
            {
                message: "User Registered Successfully!", 
                user: {
                    user_id: newUser.user_id,
                    username: newUser.username,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    created_at: newUser.created_at,
                }, 
            }, { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.errors },
                { status: 400 }
            )
        }

        console.error("Error while signing up:", error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { message: "Internal Server Error"}, { status: 500 }
        )
    }
}