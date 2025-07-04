import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const createStudent=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber

    const {studentName,studentPhoneNo,studentAddress,enrolledDate}=req.body

    const studentImage=req.file?req.file.path:null

    if(!studentName || !studentPhoneNo || !studentAddress || !enrolledDate){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }

    await sequelize.query(`INSERT INTO student_${instituteNumber}(
        studentName,studentPhoneNo,studentAddress,enrolledDate,studentImage) VALUES(?,?,?,?,?)`,{
            type:QueryTypes.INSERT,
            replacements:[studentName,studentPhoneNo,studentAddress,enrolledDate,studentImage]
        })

        res.status(200).json({
            message:"Student created successfully!",
            instituteNumber
        })
}

const getAllStudents=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    console.log(instituteNumber)
    const students=await sequelize.query(`SELECT * FROM student_${instituteNumber}`,{
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"All students fetched successfully!",
        data:students,
        instituteNumber
    })
}

const getSingleStudent=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const studentId=req.params.id
    const student=await sequelize.query(`SELECT * FROM student_${instituteNumber} WHERE id=?`,{
        replacements:[studentId],
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"Single student fetched successfully!",
        data:student,
        instituteNumber
    })
}

const deleteStudent=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const studentId=req.params.id
    await sequelize.query(`DELETE FROM student_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[studentId]
    })
    res.status(200).json({
        message:"Student Deleted Successfully!",
        instituteNumber
    })
}

const updateStudent=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const id=req.params.id
    const {studentName,studentPhoneNo,studentAddress,enrolledDate}=req.body

    const studentImage=req.file?req.file.path:null

    if(!studentName || !studentPhoneNo || !studentAddress || !enrolledDate){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }

    await sequelize.query(`UPDATE student_${instituteNumber} SET studentName=?,studentPhoneNo=?,studentAddress=?,enrolledDate=?,studentImage=? WHERE id=?`,{
        type:QueryTypes.UPDATE,
        replacements:[studentName,studentPhoneNo,studentAddress,enrolledDate,studentImage,id]
    })
    res.status(200).json({
        message:"Student Updated Successfully!",
        instituteNumber
    })
}

export {createStudent,getAllStudents,getSingleStudent,deleteStudent,updateStudent}