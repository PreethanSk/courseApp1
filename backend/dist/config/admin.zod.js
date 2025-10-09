import { z } from "zod";
export const adminSignup = z.object({
    username: z.string().min(4).max(15),
    password: z.string().min(4).max(20),
    email: z.email(),
    firstName: z.string()
});
export const adminSignin = z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string()
});
//# sourceMappingURL=admin.zod.js.map