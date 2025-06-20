import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from "../database/models/userModel";
import { IExtendedRequest } from "./type";


// log in logic
const isLoggedIn=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
    const token=req.headers.authorization

    // if someone tries to create institute table without being logged in
    if(!token){
        res.status(401).json({
            message:"Please provide token!"
        })
        return
    }
    jwt.verify(token,"confidential",async(error,success:any)=>{
        // yadi token galat ayo vne
        if(error){
            res.status(403).json({
                message:"Invalid Token!"
            })
        }else{
            // if id doesn't match
            const userData = await User.findByPk(success.id)
           
            if(!userData){
                res.status(403).json({
                    message : "No user with that id, invalid token "
                })
                // if all fine
            }else{
                req.user = userData
                next()//jumps to next step
            }
        }
    })
}

export default isLoggedIn