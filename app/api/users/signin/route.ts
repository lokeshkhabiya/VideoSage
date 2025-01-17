import { signinValidation } from "@/validations/userValidation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const SECRETKEY = process.env.JWT_SECRET!;

interface signinBody {
    username: string,
    password: string,
}
export async function POST(req: NextRequest) {
    try {
        const body: signinBody = await req.json();
        const validatedBody = signinValidation(body);

        const { username, password } = validatedBody;

        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            return NextResponse.json(
                { message: "Invalid username or password!"}, { status: 401 }
            )
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return NextResponse.json(
                { message: "Invalid username or password!"}, { status: 401 }
            )
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
            }, 
            SECRETKEY,
            { expiresIn: "1d"}
        )

        return NextResponse.json(
            { 
                message: "Login Successfull!", 
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    created_at: user.created_at,
                },
                token: token
            }, { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.errors },
                { status: 400 }
            )
        }

        console.error("Error while signing in:", error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { message: "Error while signin"},
            { status: 500 }
        )
    }
}