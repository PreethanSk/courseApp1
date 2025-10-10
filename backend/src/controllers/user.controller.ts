import {PrismaClient} from "../generated/prisma/index.js";
import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {userSignup, userSignin, userForgotPassword} from "../config/zod/user.zod.js";
import {USER_JWT} from "../config/config.js";
import {z} from "zod";
import crypto from "crypto"
import {userMiddleware} from "../middleware/user.middleware.js";
import cookieParser from "cookie-parser";
import {sendOtp} from "../config/mail.js";
import {generateOtp} from "../config/config.js";

const userRouter = Router();
const client = new PrismaClient();
const app = express();
const JWT_KEY = USER_JWT || "DEFAULT_KEY"



userRouter.post("/signup", async(req,res) => {
    try{
        const zodParse = userSignup.safeParse(req.body);
        if(!zodParse.success){
            const formattedErrors = z.treeifyError(zodParse.error)
            res.status(400).json({message:"zod error", error: formattedErrors});
            return
        }
        const {username, password, email, firstName} = zodParse.data;

        const checkUser = await client.user.findFirst({where: {username: username}});
        const checkEmail = await client.user.findFirst({where: {email: email}});
        if(checkUser || checkEmail){
            res.status(403).json({message:"user already exists"});
            return
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const create = await client.user.create({data: {username, password: hashPassword, email, firstName}});

        const token = jwt.sign({id: create.id}, JWT_KEY);
        res.cookie("token", token);
        res.json({message: "user created successfully!", userId: create.id});
    }
    catch(error){
        res.status(500).json({message:"server crashed in user signup", error: error})
    }
})

userRouter.post("/signin", async(req,res) => {
    try{
        const zodParse = userSignin.safeParse(req.body);
        if(!zodParse.success){
            const formattedErrors = z.treeifyError(zodParse.error);
            res.status(400).json({message:"zod error", error: formattedErrors});
            return
        }
        const {username, email, password} = zodParse.data;
        const checkUser = await client.user.findFirst({
            where: {
                OR:[{username: username || ""}, {email: email || ""}]
            }})
        if(!checkUser){
            res.status(400).json({message:"this user does not exist"});
            return
        }
        const passwordDecrypt = await bcrypt.compare(password, checkUser.password);
        if(!passwordDecrypt){
            res.status(403).json({message: "invalid password"});
            return
        }
        const token = jwt.sign({id: checkUser.id}, JWT_KEY);
        res.cookie("token", token);
        res.json({message:"successfully signed in!"});
    }
    catch(error){
        res.status(500).json({message:"server crashed in user signin ", error: error})
    }
})

userRouter.post("/logout", async(req,res) => {
    try{
        res.clearCookie("token");
        res.json({message:"logged out successfully"})
    }
    catch(error){
        res.status(500).json({message:"server crashed in userLogout route", error: error})
    }
})

userRouter.post("/forgotPassword", async(req,res) => {
    try{
        const zodParser = userForgotPassword.safeParse(req.body);
        if(!zodParser.success){
            const zodError = z.treeifyError(zodParser.error)
            res.status(403).json({message:"zod error", error: zodError})
            return
        }
        const {username, email} = zodParser.data;
        const checkUser = await client.user.findFirst({where: {
            OR:[{username: username || ""}, {email: email || ""}]
            }})
        if(!checkUser){
            res.status(403).json({message:"this user does not exist"});
            return
        }
        const mailId = checkUser.email;
        if(!mailId){
            res.status(403).json({message:"this user does not have an email"});
            return
        }
        const resetOtp = generateOtp();
        await sendOtp(mailId, resetOtp);

        await client.user.update({where: {id:checkUser.id}, data: {userOtp: resetOtp}})

        const temporaryToken = jwt.sign({id: checkUser.id}, JWT_KEY);
        res.cookie("token", temporaryToken);
        res.json({message:"otp sent successfully"})
    }
    catch(error){
        res.status(500).json({message:"Server crashed in user forgot password endpoint", error: error})
    }
})

userRouter.post("/verifyOtpForgotPassword/:otp",userMiddleware,async(req,res ) => {
    try{
        //@ts-ignore
        const userId = req.userId
        const otp = req.params.otp;
        const zodPassword = z.string().min(4).max(20);
        const zodParse = zodPassword.safeParse(req.body.password);
        if(!zodParse.success){
            const zodError = z.treeifyError(zodParse.error) 
            res.status(403).json({message:"zod error",error: zodError });
            return
        }
        const password = zodParse.data;
        if(!userId){
            res.status(403).json({message:"the middleware hasn't retrieved the userId or you haven't initiated the forgot password"});
            return
        }
        if(!otp){
            res.status(403).json({message:"please enter the otp"});
            return
        }
        const userOtp = await client.user.findFirst({where: {id: userId}, select: {userOtp: true}});
        if(userOtp?.userOtp !== otp){
            res.status(403).json({message:"the otp you've eneterd is invalid"});
            return
        }
        const hashPassword = await bcrypt.hash(password, 5);

        await client.user.update({where: {id: userId}, data:{password: hashPassword}});
        res.status(200).json({message:"password has been updated successfully!"})

    }
    catch(error){
        res.status(403).json({message:"server crash in user verifyOtpForgotPassword endpoint", error: error});
        return
    }
} )



export default userRouter