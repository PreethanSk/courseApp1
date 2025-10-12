import express, {type Request, type Response, type NextFunction} from "express";
import jwt from "jsonwebtoken";
import {USER_JWT} from "../config/config.js";

const app = express();
const JWT_KEY = USER_JWT || "DEFAULT_KEY";

export async function userMiddleware(req: Request, res: Response, next: NextFunction){
    try{
        const token = req.cookies.token;
        if(!token){
            res.status(403).json({message:"token does not exist, or the user is not logged in"});
            return
        }
        const verify = jwt.verify(token, JWT_KEY);
        if(!verify){
            res.status(403).json({message:"invalid token"});
            return
        }
        //@ts-ignore
        req.userId = verify.id;
        next()
    }
    catch(error){
        res.status(500).json({message:"error in userMiddleware", error: error})
    }
}

export async function userTemporaryMiddleware(req: Request, res: Response, next: NextFunction){
    try{
        const token = req.cookies.temporaryToken;
        if(!token){
            res.status(403).json({message:"the token does not exist temporary, generate a new OTP"});
            res.clearCookie("temporarytoken")
            return
        }
        const verify = jwt.verify(token, JWT_KEY);
        if(!verify){
            res.status(403).json({message:"invalid token"});
            return
        }
        //@ts-ignore
        req.userId = verify.id;
        next()
    }
    catch(error){
        res.status(500).json({message:"error in user temporary middleware"})
    }
}