import { z } from "zod";
export declare const userSignup: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodEmail;
    firstName: z.ZodString;
}, z.core.$strip>;
export declare const userSignin: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    password: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=user.zod.d.ts.map