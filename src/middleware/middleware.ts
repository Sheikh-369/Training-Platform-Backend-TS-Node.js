import { NextFunction, Request, Response } from "express";


// log in logic
const isLoggedIn=async (req:Request,res:Response,next:NextFunction)=>{
    const token=req.headers.authorization

    // if someone tries to create institute table without being logged in
    if(!token){
        res.status(401).json({
            message:"Please provide token!"
        })
        return
    }
    //the upcoming code
    
}

export default isLoggedIn