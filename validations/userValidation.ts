import { z } from "zod";

export const signupValidation = (data: object) => {
    const schema = z.object({
        username: z.string().email(),
        first_name: z.string().min(1).max(30),
        last_name: z.string().min(1).max(30),
        password: z.string().min(8).max(30)
    })
    
    return schema.parse(data);
}

export const signinValidation = (data: object) => {
    const schema = z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(8).max(30),
    })

    return schema.parse(data);
}