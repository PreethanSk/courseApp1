import {z} from "zod";

export const userSignup = z.object({
    username: z.string().min(3).max(15),
    password: z.string().min(4).max(20),
    email: z.email(),
    firstName: z.string()
})

export const userSignin= z.object({
    username: z.string().optional(),
    email: z.email().optional(),
    password: z.string()
})

export const userForgotPassword = z.object({
    username: z.string().optional(),
    email: z.email().optional()
}).refine((data) => data.username || data.email, {
    message: "Either username or email must be provided"
})

export const updateUser = z.object({
    firstName: z.string().max(15).optional(),
    bio: z.string().max(10).optional(),
    avatar_url: z.string().optional()
})