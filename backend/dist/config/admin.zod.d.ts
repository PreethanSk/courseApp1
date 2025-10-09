import { z } from "zod";
export declare const adminSignup: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodEmail;
    firstName: z.ZodString;
}, z.core.$strip>;
export declare const adminSignin: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=admin.zod.d.ts.map