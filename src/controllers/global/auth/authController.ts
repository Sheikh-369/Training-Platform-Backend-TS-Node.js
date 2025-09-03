import { Request, Response } from "express";
import User from "../../../database/models/userModel";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import generateOTP from "../../../services/generateOTP";
import sendMail from "../../../services/sendMail";
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
                    data:{
                        token:token,
                        userName: data[0].userName,
                    },
                    message:"Login Successful!"
                })                
            }else{
                res.status(404).json({
                    message:"Invalid Email or Password!"
                })
            }
        }
    }

    static async forgotPassword(req:Request,res:Response){
    const {userEmail}=req.body

    //validation
    if(!userEmail){
        res.status(400).json({
            message:"Please provide Email!"
        })
        return
    }

    //checking if email exists
    const user=await User.findOne({where:{userEmail}})
    if(!user){
        res.status(400).json({
            message:"The Email is not registered!"
        })
        return
    }

    const OTP=generateOTP()
    await sendMail({
        to:userEmail,
        subject:"Password Reset Request",
        html:`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">🔐 Password Reset Request</h2>
      <p>Hi ${user.userName || "User"},</p>
      <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the process:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="font-size: 28px; font-weight: bold; color: #2d3748; padding: 10px 20px; background: #f7fafc; border: 1px dashed #ccc; border-radius: 5px;">
          ${OTP}
        </span>
      </div>
      <p><strong>Note:</strong> This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support.</p>
      <p style="margin-top: 30px;">Thanks,<br>The 90's Restaurant and Bar</p>
    </div>`
    })

    user.OTP=OTP.toString()
    user.OTPGeneratedTime=new Date().toLocaleString()
    user.OTPExpiry=new Date(Date.now() + 600_000).toLocaleString()
    await user.save()

    res.status(200).json({
        message:"An OTP is sent to the Email if Registered!"
    })

}

}

export default AuthController