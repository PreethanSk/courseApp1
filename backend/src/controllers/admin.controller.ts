import {PrismaClient} from "../../dist/generated/prisma/index.js";
import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {z} from "zod";
import {ADMIN_JWT} from "../config/config.js";
import {adminSignup, adminSignin, adminForgotPassword} from "../config/zod/admin.zod.js";
import {adminMiddleware} from "../middleware/admin.middleware.js";
import {generateOtp} from "../config/config.js";
import {sendOtp} from "../config/mail.js";

const app = express();
const AdminRouter = Router();
const client = new PrismaClient();
const JWT_KEY = ADMIN_JWT || "DEFAULT_KEY";

AdminRouter.post("/signup", async(req,res) => {
    try{
        const zodParse = adminSignup.safeParse(req.body);
        if(!zodParse.success){
            const zodError = z.treeifyError(zodParse.error)
            res.status(403).json({message:"zod error", error: zodError});
            return
        }
        const {username,password,email,firstName} = zodParse.data;
        const userCheck = await client.admin.findFirst({where: {
            OR: [{username: username || ""}, {email: email || ""}]}});
        if(userCheck){
            res.status(403).json({message:"user already exists"})
        }
        const passwordEncrypt = await bcrypt.hash(password, 5);
        const create = await client.admin.create({data: {username, password: passwordEncrypt, email, firstName}});
        const token = jwt.sign({id: create.id}, JWT_KEY);
        res.cookie("token", token);
        res.json({message:"user created successfully"});
    }
    catch(error){
        res.status(500).json({message:"Server crashed in admin router", error: error})
    }
})

AdminRouter.post("/signin", async(req,res) => {
    try{
        const zodParse = adminSignin.safeParse(req.body);
        if(!zodParse.success){
            const zodError = z.treeifyError(zodParse.error)
            res.status(403).json({message:"zod error", error: zodError});
            return
        }
        const {username, email, password} = zodParse.data;

        const userCheck = await client.admin.findFirst({
            where: {
                OR:[{username: username || ""}, {email: email || ""}]}});
        if(!userCheck){
            res.status(403).json({message:"user doesnt exist"})
            return
        }

        const passwordDecrypt = await bcrypt.compare(password, userCheck.password);
        if(!passwordDecrypt){
            res.status(403).json({message:"invalid password"});
            return
        }
        const token = jwt.sign({id: userCheck.id}, JWT_KEY);
        res.cookie("token", token);
        res.json({message:"signed in successfully!"})

    }
    catch(error){
        res.status(500).json({message:"server crashed in user signin endpoint",error: error})
    }
})

AdminRouter.post("/signout",adminMiddleware,async(req,res) => {
    try{
      res.clearCookie("token");
      res.status(200).json({message:"logged out successfully"})

    }
    catch(error){
        res.status(500).json({message:"Server crashed in admin signout endpoint", error: error})
    }
});

AdminRouter.post("/forgotPassword", async(req,res) => {
    try{
      const zodParse = adminForgotPassword.safeParse(req.body);
      if(!zodParse.success){
          const zodError = z.treeifyError(zodParse.error);
          res.status(403).json({message:"zod error", error: zodError});
          return
      }

      const {username, email} = zodParse.data
      const whereCondition = [];
      if(username) whereCondition.push({username: username});
      if(email) whereCondition.push({email: email});

      const userData = await client.admin.findFirst({where: {OR: whereCondition}});
      if(!userData){
          res.status(403).json({message:"this user does not exist"});
          return
      }
      const mailId = userData.email;
      const resetOtp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
       await sendOtp(mailId, resetOtp);

       await client.admin.update({where: {id: userData.id}, data: {AdminOtp: resetOtp, otpExpiresAt: expiresAt}});

      const temporaryToken = jwt.sign({id: userData.id}, JWT_KEY, {expiresIn: "10m"});
      res.cookie("temporaryToken", temporaryToken);
      res.json({message:`otp generated and sent to the ${mailId} successfully!`});


    }
    catch(error){
        res.status(500).json({message:"server crashed in admin forgot password endpoint"})
    }
})


export default AdminRouter;