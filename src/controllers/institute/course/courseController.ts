import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const createCourse=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const {courseName,coursePrice,courseDuration,courseDescription,courseLevel,categoryId}=req.body
    const courseThumbnail=req.file?req.file.path: null
    if(!courseName || !coursePrice || !courseDuration || !courseDescription || !courseLevel || !categoryId){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }
    await sequelize.query(`INSERT INTO course_${instituteNumber}(courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,categoryId) VALUES(?,?,?,?,?,?,?)`,{
        type:QueryTypes.INSERT,
        replacements:[courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,categoryId]
    })
    res.status(200).json({
        message:"Course Created Successfully!",
        instituteNumber
    })
}

const getAllCourses=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const courses=await sequelize.query(`SELECT * FROM course_${instituteNumber}`,{
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"All courses fetched successfully!",
        data:courses,
        instituteNumber
    })

}

const getSingleCourse=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const courseId=req.params.id
    const course=await sequelize.query(`SELECT * FROM course_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.SELECT,
        replacements:[courseId]
    })
    res.status(200).json({
        message:"Single Course Fetched Successfully!",
        data:course,
        instituteNumber
    })
}

const deleteCourse=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const courseId=req.params.id
    await sequelize.query(`DELETE FROM course_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[courseId]
    })
    res.status(200).json({
        message:"Course Deleted Successfully!",
        instituteNumber
    })
}

const updateCourse = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber = req.user?.currentInstituteNumber;
    const courseId = req.params.id;
    const {courseName,coursePrice,courseDuration,courseDescription,courseLevel,categoryId} = req.body;
    const courseThumbnail = req.file ? req.file.path : null;

    if (!courseName || !coursePrice || !courseDuration || !courseDescription || !courseLevel || !categoryId) {
        res.status(400).json({
            message: "Please fill all the fields!"
        });
        return;
    }

    await sequelize.query(`UPDATE course_${instituteNumber} 
         SET courseName = ?,coursePrice = ?,courseDuration = ?,courseDescription = ?,courseLevel = ?, courseThumbnail = ?,categoryId=? WHERE id = ?`,{
            type: QueryTypes.UPDATE,
            replacements: [courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,categoryId,courseId]
        });

    res.status(200).json({
        message: "Course Updated Successfully!",
        instituteNumber
    });
};


export {createCourse,getAllCourses,deleteCourse,getSingleCourse,updateCourse}