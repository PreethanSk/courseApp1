import * as crypto from "crypto";
import rateLimit from "express-rate-limit";

export const USER_JWT = process.env.USER_JWT
export const ADMIN_JWT = process.env.ADMIN_JWT

export function generateOtp(length: number = 6){
    const buffer = crypto.randomBytes(length);
    const otp= buffer.readUIntBE(0, length) % 1000000;
    return otp.toString().padStart(length, '0')
}

export const forgotLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {message:"too many requests, try again"}
})