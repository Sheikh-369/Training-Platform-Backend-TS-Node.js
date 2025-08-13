import { NextFunction, Request, Response } from "express"


const asyncErrorHandler = (fn:Function)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        fn(req,res,next).catch((err:Error)=>{
            console.log(err, "ERROR")
            return res.status(500).json({
                message : err.message, 
                fullError: {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                }
            })
        })
    }
}
export default asyncErrorHandler