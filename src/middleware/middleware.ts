import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from "../database/models/userModel";
import { IExtendedRequest } from "./type";

export enum Role{
    SuperAdmin="super-admin",
    Institute = 'institute', 
    Teacher = "teacher",
    Student="student"
}

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
    jwt.verify(token,"Secret",async(error,success:any)=>{
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

const accessTo=(...roles:Role[])=>{ 
        return (req:IExtendedRequest,res:Response,next:NextFunction)=>{
            const userRole = req.user?.role as Role
           if(!roles.includes(userRole)){
                res.status(403).json({
                    message : `As a ${userRole ?? "guest"}, you do not have access to this action.`
                })
                return
            }
            next()
        }
    }

export {isLoggedIn,accessTo}
