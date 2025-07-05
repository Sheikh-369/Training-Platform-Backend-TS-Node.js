import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import randomPasswordGenerator from "../../../services/randomPasswordGenerator";
import sendMail from "../../../services/sendMail";

const createTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber

    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherSalary}=req.body

    const teacherImage=req.file?req.file.path:null

    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !teacherJoinDate || !teacherSalary){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }
    const data=randomPasswordGenerator(teacherName)

    await sequelize.query(`INSERT INTO teacher_${instituteNumber}(
        teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherImage,teacherSalary,teacherPassword) VALUES(?,?,?,?,?,?,?,?)`,{
            type:QueryTypes.INSERT,
            replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherImage,teacherSalary,data.hashedVersion]
        })

        const mailInformation={
            to:teacherEmail,
            subject:"You are WelCome to our ABC Language Center.",
            html:`
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2E86C1;">Welcome to ABC Language Center, ${teacherName}!</h2>
                <p>We’re excited to have you join our team of passionate educators.</p>
                <p>Here are your login details:</p>
                <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
                    <li><strong>Email:</strong> ${teacherEmail}</li>
                    <li><strong>Password:</strong> ${data.plainVersion}</li>
                </ul>
                <p>You can now log in to your account and start managing your classes.</p>
                <p>If you have any questions or need support, feel free to reach out to our admin team.</p>
                <br />
                <p>Best regards,</p>
                <p><strong>ABC Language Center</strong></p>
                </div>`
        }
        await sendMail(mailInformation)

        res.status(200).json({
            message:"Teacher created successfully!",
            instituteNumber
        })
}

const getAllTeachers=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    console.log(instituteNumber)
    const teachers=await sequelize.query(`SELECT * FROM teacher_${instituteNumber}`,{
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"All teachers fetched successfully!",
        data:teachers
    })
}

const getSingleTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const teacherId=req.params.id
    const teacher=await sequelize.query(`SELECT * FROM teacher_${instituteNumber} WHERE id=?`,{
        replacements:[teacherId],
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"Single teacher fetched successfully!",
        data:teacher
    })
}

const deleteTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const teacherId=req.params.id
    await sequelize.query(`DELETE FROM teacher_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[teacherId]
    })
    res.status(200).json({
        message:"Teacher Deleted Successfully!"
    })
}

const updateTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const id=req.params.id
    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherSalary}=req.body

    const teacherImage=req.file?req.file.path:null

    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !teacherSalary || !teacherJoinDate){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }

    await sequelize.query(`UPDATE teacher_${instituteNumber} SET teacherName=?,teacherEmail=?,teacherPhoneNumber=?,teacherExpertise=?,teacherSalary=?,teacherImage=?,teacherJoinDate=? WHERE id=?`,{
        type:QueryTypes.UPDATE,
        replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherSalary,teacherImage,teacherJoinDate,id]
    })
    res.status(200).json({
        message:"Teacher Updated Successfully!"
    })
}

export {createTeacher,getAllTeachers,getSingleTeacher,deleteTeacher,updateTeacher}