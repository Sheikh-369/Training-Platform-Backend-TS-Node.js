import { Request, Response } from "express";
import User from "../../../database/models/userModel";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
class AuthController{
    static async registerUser(req:Request,res:Response){
        if(req.body===undefined){
            res.status(400).json({
                message:"No Data Was Sent!"
            })
            return
        }
        const {userName,email,password}=req.body
        if(!userName || !email || !password){
            res.status(400).json({
                message:"All the fields are mendatory!"
            })
        }

        await User.create({
            userName:userName,
            password:bcrypt.hashSync(password,10),
            email:email
        })
        res.status(201).json({
            message:"User Registered Successfully!"
        })
    }

    static async loginUser(req:Request,res:Response){
        if(req.body===undefined){
            res.status(400).json({
                message:"No data was sent!"
            })
            return
        }

        const {email,password}=req.body
        if(!email || !password){
            res.status(400).json({
                message:"Please provide email and password!"
            })
            return
        }

        const data=await User.findAll({
            where:{
                email
            }
        })
        if(data.length===0){
            res.status(404).json({
                message:"Email not registered!"
            })
        }else{
            const isPassword=bcrypt.compareSync(password,data[0].password)
            if(isPassword){
                const token=jwt.sign({id:data[0].id},"Secret",{
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