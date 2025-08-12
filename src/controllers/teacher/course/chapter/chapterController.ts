import { Response } from "express";
import { IExtendedRequest } from "../../../../middleware/type";
import sequelize from "../../../../database/connection";
import { QueryTypes } from "sequelize";

const addChapterToCourse = async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber = req.user?.currentInstituteNumber;
    const {chapterName,chapterLevel,courseId} = req.body 
    if(!chapterName || !chapterLevel || !courseId){
        res.status(400).json({
            message : "Please fill all the fields!"
        })
        return
    }
    // checking if course exists or not 
//    const [course] =  await sequelize.query(`SELECT * FROM course_${instituteNumber} WHERE id=?`,{
//         replacements  : [courseId],
//         type : QueryTypes.SELECT
//     })

//     if(!course){
//         return res.status(404).json({
//             message : "No course found with that id."
//         })
//     }

    //checking if the chapter already exists
    // const [courseChapter] =  await sequelize.query(`SELECT * FROM course_chapter_${instituteNumber} WHERE chapterName=? AND courseId=?`,{
    //     replacements : [chapterName,courseId], 
    //     type : QueryTypes.SELECT
    // })
    // if(courseChapter){
    //     return res.status(400).json({
    //         message : "Chapter of that name already exists!"
    //     })
    // }

    // adding chapter data to chapter table 
    await sequelize.query(`INSERT INTO course_chapter_${instituteNumber}(chapterName,chapterLevel,courseId) VALUES(?,?,?)`,{
        replacements : [chapterName,chapterLevel,courseId], 
        type : QueryTypes.INSERT
    })

    res.status(200).json({
        message : "Chapter Added Successfully!"
    })


}

const editChapter=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    // const courseId=req.params.courseId
    const chapterId=req.params.id
    const {chapterName,chapterLevel,courseId} = req.body

    if(!chapterName || !chapterLevel || !courseId){
        return res.status(400).json({
            message : "Please fill all the fields!"
        })
    }

    await sequelize.query(`UPDATE course_chapter_${instituteNumber} SET chapterName=?,chapterLevel=?, courseId=? WHERE id=?`,{
        type:QueryTypes.UPDATE,
        replacements:[chapterName,chapterLevel,courseId,chapterId]
    })
    res.status(200).json({
        message:"Chapter Edited Successfully!"
    })

}

const fetchCourseChapters = async (req:IExtendedRequest,res:Response)=>{
      const courseId = req.params.id 
    const instituteNumber = req.user?.currentInstituteNumber; 
    if(!courseId){
        res.status(400).json({
            message : "Please provide courseId!"
        })
        return
    }

    const data = await sequelize.query(`SELECT * FROM course_chapter_${instituteNumber} WHERE courseId=?`,{
        replacements: [courseId],
        type: QueryTypes.SELECT
    })
    if(data){
        res.status(200).json({
            message : "Chapter fetched Successfully!", 
            data 
        })
    }else{
        res.status(404).json({
            message : "Chapter not found", 
            data : []
        })
    }
}

const deleteChapter=async(req:IExtendedRequest,res:Response)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    const chapterId=req.params.id

    await sequelize.query(`DELETE FROM course_chapter_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[chapterId]
    })
    res.status(200).json({
        message:"Chapter Deleted Successfully!"
    })
}

export {addChapterToCourse,editChapter,fetchCourseChapters,deleteChapter}