import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";

const createTeacher=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber

    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,joinedDate,teacherSalary}=req.body

    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !joinedDate || !teacherSalary){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
    }

    await sequelize.query(`INSERT INTO teacher_${instituteNumber}(
        teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,joinedDate,teacherSalary) VALUES(?,?,?,?,?,?)`,{
            replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,joinedDate,teacherSalary]
        })

        res.status(200).json({
            message:"Teacher created successfully!"
        })
}

export {createTeacher}