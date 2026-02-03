import { z } from "zod";

export const signupValidation = (data: object) => {
    const schema = z.object({
        email: z.string().email().optional(),
        username: z.string().email().optional(),
        first_name: z.string().min(1).max(30),
        last_name: z.string().min(1).max(30),
        password: z.string().min(8).max(30)
    }).refine((val) => val.email || val.username, {
        message: "Email is required",
        path: ["email"]
    })
    
    return schema.parse(data);
}

export const signinValidation = (data: object) => {
    const schema = z.object({
        email: z.string().email().optional(),
        username: z.string().email().optional(),
        password: z.string().min(8).max(30),
    }).refine((val) => val.email || val.username, {
        message: "Email is required",
        path: ["email"]
    })

    return schema.parse(data);
}
