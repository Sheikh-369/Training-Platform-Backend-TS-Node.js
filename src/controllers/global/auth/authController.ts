import { Request, Response } from "express";
import User from "../../../database/models/userModel";
import bcrypt from "bcrypt"

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
        }else{}
    }
}

export default AuthController


git init
git .
git commit -m "Saas"
git branch -M master
git remote add origin https://github.com/Sheikh-369/Teaching-Platform-SaaS-Product.git
git push -u origin master