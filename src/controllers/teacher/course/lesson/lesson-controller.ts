import { Response } from "express";
import { IExtendedRequest } from "../../../../middleware/type";
import sequelize from "../../../../database/connection";
import { QueryTypes } from "sequelize";

const createChapterLesson = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber
    const {lessonName, lessonDescription,chapterId} = req.body 

    //dealing with taking files in different fields
    interface MulterFiles {
    lessonThumbnail?: Express.Multer.File[];
    lessonVideo?: Express.Multer.File[];
    }

    // Then inside handler:
    const files = req.files as MulterFiles;

    const lessonThumbnail = files.lessonThumbnail?.[0]?.path || null;
    const lessonVideo = files.lessonVideo?.[0]?.path || null;


    if(!lessonName || !lessonDescription || !chapterId){
        res.status(400).json({
            message : "Please fill all the fields!"
        })
        return
    }
    await sequelize.query(`INSERT INTO chapter_lesson_${instituteNumber}(lessonName,lessonDescription,lessonVideo,lessonThumbnail,chapterId) VALUES(?,?,?,?,?)`,{
        type : QueryTypes.INSERT, 
        replacements : [lessonName,lessonDescription,lessonVideo,lessonThumbnail,chapterId]
    })
    res.status(200).json({
        message : "Lesson Added To Chapter"
    })
}

const editChapterLesson = async(req:IExtendedRequest,res:Response)=>{
    const lessonId=req.params.id
    const instituteNumber = req.user?.currentInstituteNumber
    const {lessonName, lessonDescription,chapterId} = req.body

    //dealing with taking files in different fields
    interface MulterFiles {
    lessonThumbnail?: Express.Multer.File[];
    lessonVideo?: Express.Multer.File[];
    }

    // Then inside handler:
    const files = req.files as MulterFiles;

    const lessonThumbnail = files.lessonThumbnail?.[0]?.path || null;
    const lessonVideo = files.lessonVideo?.[0]?.path || null;
     
    if(!lessonName || !lessonDescription || !chapterId){
        res.status(400).json({
            message : "Please fill all the fields!"
        })
        return
    }
    await sequelize.query(`UPDATE chapter_lesson_${instituteNumber} SET lessonName=?,lessonDescription=?,lessonVideo=?,lessonThumbnail=?,chapterId=? WHERE id=?`,{
        type : QueryTypes.UPDATE, 
        replacements : [lessonName,lessonDescription,lessonVideo,lessonThumbnail,chapterId,lessonId]
    })
    res.status(200).json({
        message : "Lesson Edited Successfully!"
    })

}
const fetchChapterLesson = async(req:IExtendedRequest,res:Response)=>{
    const lessonId = req.params.id 
    const instituteNumber = req.user?.currentInstituteNumber
    if(!lessonId){
        res.status(400).json({
            message : "Please Provide ChapterId!"
        })
        return
    }
      const data =   await sequelize.query(`SELECT * FROM chapter_lesson_${instituteNumber} WHERE id=?`,{
    type : QueryTypes.SELECT, 
    replacements : [lessonId]
    })
    res.status(200).json({
        message : "Lessons Fetched Successfully!", 
        data
    })
}

const deleteLesson=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const LessonId=req.params.id

    await sequelize.query(`DELETE FROM chapter_lesson_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[LessonId]
    })
    res.status(200).json({
        message:"Lesson Deleted Successfully!"
    })
}

export {createChapterLesson,editChapterLesson,fetchChapterLesson,deleteLesson}