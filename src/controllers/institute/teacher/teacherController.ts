import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const createTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber

    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherSalary}=req.body

    const teacherImage=req.file?req.file.path:null

    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !teacherJoinDate || !teacherSalary){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
    }

    await sequelize.query(`INSERT INTO teacher_${instituteNumber}(
        teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherImage,teacherSalary) VALUES(?,?,?,?,?,?,?)`,{
            type:QueryTypes.INSERT,
            replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherImage,teacherSalary]
        })

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

    await sequelize.query(`UPDATE teacher_${instituteNumber} SET teacherName=?,teacherEmail=?,teacherPhoneNumber=?,teacherExpertise=?,teacherSalary=?,teacherImage=?,teacherJoinDate=?`,{
        type:QueryTypes.UPDATE,
        replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherSalary,teacherJoinDate,teacherJoinDate]
    })
    res.status(200).json({
        message:"Teacher Updated Successfully!"
    })
}

export {createTeacher,getAllTeachers,getSingleTeacher,deleteTeacher,updateTeacher}