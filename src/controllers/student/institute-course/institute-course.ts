import { Request, Response } from "express";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const fetchInstitutes=async(req:Request,res:Response)=>{
    //logic to get all the institutes
    const tables=await sequelize.query(`SHOW TABLES LIKE "institute_%"`,{
        type:QueryTypes.SHOWTABLES
    })

    let allData=[]//data collection

    //logic for getting all tables 
    for(let table of tables){
        console.log(table)

        //logic to extract institute number
        const instituteNumber=table.split("_")[1]

        //logic to extract name,address,phone,etc from each table
        const [data]=await sequelize.query(`SELECT instituteName,instituteAddress,institutePhoneNumber,instituteImage FROM ${table}`,{
            type:QueryTypes.SELECT
        })
        
        //pushing filtered data in data collection
        allData.push({instituteNumber:instituteNumber,...data})
    }
    res.status(200).json({
        message:"All Institutes Fetched Successfully!",
        data:allData
    })
    console.log(tables)
}

// const instituteCourseListForStudent = async(req:Request,res:Response)=>{
//     const instituteId = req.params.instituteId
//     const datas = await sequelize.query(`
//         SELECT 
//             c.courseName, 
//             c.coursePrice, 
//             c.courseDuration, 
//             c.courseDescription,
//             cat.categoryName,
//             t.teacherName
//         FROM course_${instituteId} AS c
//         LEFT JOIN category_${instituteId} AS cat
//             ON c.categoryId = cat.id
//         LEFT JOIN teacher_${instituteId} AS t
//             ON c.teacherId = t.id`,{
//         type : QueryTypes.SELECT
//     })
//     console.log(datas.length)
//     if(datas.length == 0){
//         res.status(404).json({
//             message : "No courses found of that institute"
//         })
//     }else{

//         res.status(200).json({
//             message : "Courses Fetched Successfully!", 
//             data : datas
//         })
//     }
// }

const instituteCourseListForStudent = async (req: Request, res: Response) => {
    const instituteId = req.params.instituteId;

    const datas = await sequelize.query(`
        SELECT 
            i.instituteName AS instituteName,
            i.instituteImage AS instituteImage,
            c.courseName, 
            c.coursePrice,
            c.courseThumbnail, 
            c.courseDuration, 
            c.courseDescription,
            cat.categoryName,
            t.teacherName
        FROM institute_${instituteId} AS i
        CROSS JOIN course_${instituteId} AS c
        LEFT JOIN category_${instituteId} AS cat
            ON c.categoryId = cat.id
        LEFT JOIN teacher_${instituteId} AS t
            ON c.teacherId = t.id
    `, {
        type: QueryTypes.SELECT
    });

    console.log(datas.length);

    if (datas.length == 0) {
        res.status(404).json({
            message: "No courses found of that institute",
        });
    } else {
        res.status(200).json({
            message: "Courses Fetched Successfully!",
            data: datas
        });
    }
};

const instituteCourseDetailsForStudent = async (req: Request, res: Response) => {
  const { instituteId, courseId } = req.params;

  try {
    const [course] = await sequelize.query(
      `
      SELECT 
        i.instituteName AS instituteName,
        i.instituteImage AS instituteImage,
        c.id AS courseId,
        c.courseName, 
        c.coursePrice,
        c.courseThumbnail, 
        c.courseDuration, 
        c.courseDescription,
        cat.categoryName,
        t.teacherName
      FROM institute_${instituteId} AS i
      CROSS JOIN course_${instituteId} AS c
      LEFT JOIN category_${instituteId} AS cat
        ON c.categoryId = cat.id
      LEFT JOIN teacher_${instituteId} AS t
        ON c.teacherId = t.id
      WHERE c.id = :courseId
      LIMIT 1
      `,
      {
        replacements: { courseId },
        type: QueryTypes.SELECT,
      }
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      message: "Course fetched successfully!",
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {fetchInstitutes,instituteCourseListForStudent,instituteCourseDetailsForStudent}