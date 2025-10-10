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
})