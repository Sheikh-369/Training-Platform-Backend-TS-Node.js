import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const createCourse=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }
    const {courseName,coursePrice,courseDuration,courseDescription,courseLevel,categoryId,teacherId}=req.body

    const courseThumbnail=req.file?req.file.path: null
    
    if(!courseName || !coursePrice || !courseDuration || !courseDescription || !courseLevel){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }
    await sequelize.query(`INSERT INTO course_${instituteNumber}(courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,teacherId,categoryId) VALUES(?,?,?,?,?,?,?,?)`,{
        type:QueryTypes.INSERT,
        replacements:[courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,teacherId || null,categoryId || null]
    })
    
    res.status(200).json({
        message:"Course Created Successfully!",
        instituteNumber
    })
}

const getAllCourses=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber;

    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }

    const courses=await sequelize.query(`SELECT 
     course_${instituteNumber}.*, 
     category_${instituteNumber}.categoryName AS categoryName,
     category_${instituteNumber}.categoryDescription AS categoryDescription,
     teacher_${instituteNumber}.teacherName AS teacherName
   FROM course_${instituteNumber}
   LEFT JOIN category_${instituteNumber} 
     ON course_${instituteNumber}.categoryId = category_${instituteNumber}.id
   LEFT JOIN teacher_${instituteNumber}
     ON course_${instituteNumber}.teacherId = teacher_${instituteNumber}.id`,{
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"All courses fetched successfully!",
        data:courses,
        instituteNumber
    })

}

const getSingleCourse=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber;
    if (!instituteNumber) {
        return res.status(400).json({ message: "Institute number is required in URL." });
    }
    const courseId=req.params.id
    const course=await sequelize.query(`SELECT 
     course_${instituteNumber}.*, 
     category_${instituteNumber}.categoryName AS categoryName,
     category_${instituteNumber}.categoryDescription AS categoryDescription,
     teacher_${instituteNumber}.teacherName AS teacherName
   FROM course_${instituteNumber}
   LEFT JOIN category_${instituteNumber} 
     ON course_${instituteNumber}.categoryId = category_${instituteNumber}.id
   LEFT JOIN teacher_${instituteNumber}
     ON course_${instituteNumber}.teacherId = teacher_${instituteNumber}.id
   WHERE course_${instituteNumber}.id = ?`,{
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
    const {courseName,coursePrice,courseDuration,courseDescription,courseLevel,categoryId,teacherId} = req.body;
    const courseThumbnail = req.file ? req.file.path : null;

    if (!courseName || !coursePrice || !courseDuration || !courseDescription || !courseLevel || !categoryId) {
        res.status(400).json({
            message: "Please fill all the fields!"
        });
        return;
    }

    await sequelize.query(`UPDATE course_${instituteNumber} 
         SET courseName = ?,coursePrice = ?,courseDuration = ?,courseDescription = ?,courseLevel = ?, courseThumbnail = ?,categoryId=?,teacherId=? WHERE id = ?`,{
            type: QueryTypes.UPDATE,
            replacements: [courseName,coursePrice,courseDuration,courseDescription,courseLevel,courseThumbnail,categoryId,teacherId,courseId]
        });

        
    res.status(200).json({
        message: "Course Updated Successfully!",
        instituteNumber
    });
};


export {createCourse,getAllCourses,deleteCourse,getSingleCourse,updateCourse}