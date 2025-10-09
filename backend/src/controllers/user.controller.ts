import {PrismaClient} from "../generated/prisma/index.js";
import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {userSignup, userSignin} from "../config/user.zod.js";
import {USER_JWT} from "../config/config.js";
import {z} from "zod";

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
        res.status(500).json({message:"server crashed in user signin middleware", error: error})
    }
})



export default userRouter