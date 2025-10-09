import express, {} from "express";
import jwt from "jsonwebtoken";
import { ADMIN_JWT } from "../config/config.js";
const JWT_KEY = ADMIN_JWT || "DEFAULT_KEY";
export async function adminMiddleware(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(403).json({ message: "no token entered" });
            return;
        }
        const verify = jwt.verify(token, JWT_KEY);
        if (!verify) {
            res.status(403).json({ message: "invalid token" });
            return;
        }
        //@ts-ignore
        req.userId = verify.id;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Server crashed in adminmiddleware", error: error });
    }
}
//# sourceMappingURL=admin.middleware.js.map