import { Request, Response } from "express";
import User from "../../../database/models/userModel";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
class AuthController{

    //***********************REGISTER************************** */
    static async registerUser(req:Request,res:Response){
        if(req.body===undefined){
            res.status(400).json({
                message:"No Data Was Sent!"
            })
            return
        }
        const {userName,userEmail,userPassword}=req.body
        if(!userName || !userEmail || !userPassword){
            res.status(400).json({
                message:"All the fields are mendatory!"
            })
            return
        }

        //checking if the email already exists
        const data = await User.findAll({
            where: { userEmail }});
            if (data.length > 0) {  // checks if available
                res.status(409).json({ 
                    message: "Email already registered!" 
                });
                return; 
            }



        await User.create({
            userName:userName,
            userPassword:bcrypt.hashSync(userPassword,10),
            userEmail:userEmail
        })
        res.status(201).json({
            message:"User Registered Successfully!"
        })
    }

    //***********************LOGIN*************************** */
    static async loginUser(req:Request,res:Response){
        if(req.body===undefined){
            res.status(400).json({
                message:"No data was sent!"
            })
            return
        }

        const {userEmail,userPassword}=req.body
        if(!userEmail || !userPassword){
            res.status(400).json({
                message:"Please provide email and password!"
            })
            return
        }

        const data=await User.findAll({
            where:{
                userEmail
            }
        })
        if(data.length===0){
            res.status(404).json({
                message:"Email not registered!"
            })
        }else{
            const isPassword=bcrypt.compareSync(userPassword,data[0].userPassword)
            if(isPassword){
                const token=jwt.sign({id:data[0].id},process.env.JWT_SECRET!,{
                expiresIn:"30d"})
                res.status(200).json({
                    token:token,
                    message:"Login Successful!"
                })                
            }else{
                res.status(404).json({
                    message:"Invalid Email or Password!"
                })
            }
        }
    }
}

export default AuthController