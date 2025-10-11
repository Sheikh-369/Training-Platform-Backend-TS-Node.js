import { NextFunction, Request, Response } from "express";
import sequelize from "../../database/connection";
import generateRandomInstituteNumber from "../../services/randomNumberGenerator";
import { IExtendedRequest } from "../../middleware/type";
import User from "../../database/models/userModel";
import categories from "../../services/seed";
import { QueryTypes } from "sequelize";
import UserInstituteRole from "../../database/models/userInstituteRoleModel";
// import { SELECT } from "sequelize/types/query-types";



    //input from user/body
    const createInstitute=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
        const {instituteName,instituteEmail,institutePhoneNumber,instituteAddress}=req.body
        const institutePanNumber=req.body.institutePanNumber || null
        const instituteVatNumber=req.body.instituteVatNumber || null
        //for institue cover page.
        const instituteImage=req.file?req.file.path:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGVkdWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D"

        if(!instituteName || !instituteEmail || !institutePhoneNumber || !instituteAddress){
            res.status(400).json({
                message:"All the fields are mandatory!"
            })
            return
        }
        //the random number generator    
        const instituteNumber=generateRandomInstituteNumber()

        //creating table for institute/registering table for the institute
        await sequelize.query(`CREATE TABLE IF NOT EXISTS institute_${instituteNumber}(
            id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
            instituteName VARCHAR(255) NOT NULL UNIQUE,
            instituteEmail VARCHAR(255) NOT NULL UNIQUE,
            institutePhoneNumber VARCHAR(255) NOT NULL UNIQUE,
            instituteAddress VARCHAR(255) NOT NULL,
            instituteVatNumber VARCHAR(255),
            institutePanNumber VARCHAR(255),
            instituteNumber INT UNIQUE,
            instituteImage VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`)

            //inserting(creating institute) data in the table above
            await sequelize.query(`INSERT INTO institute_${instituteNumber}(
                instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber,instituteNumber,instituteImage
                ) VALUES (?,?,?,?,?,?,?,?)`,{
                    replacements:[instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber,instituteNumber,instituteImage]
                })
//creating table to track the number of institute created by a user
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS user_institute (
                id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                userId VARCHAR(255) REFERENCES users(id),
                instituteNumber INT UNIQUE NOT NULL,
                instituteName VARCHAR(255) NOT NULL,
                instituteEmail VARCHAR(255) NOT NULL,
                institutePhoneNumber VARCHAR(255) NOT NULL,
                instituteAddress VARCHAR(255) NOT NULL,
                institutePanNumber VARCHAR(255),
                instituteVatNumber VARCHAR(255),
                instituteImage VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

    //if a user creates more than one institute
    if (req.user) {
        await sequelize.query(`
            INSERT INTO user_institute (
                userId,
                instituteNumber,
                instituteName,
                instituteEmail,
                institutePhoneNumber,
                instituteAddress,
                institutePanNumber,
                instituteVatNumber,
                instituteImage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
            replacements: [
                req.user.id,
                instituteNumber,
                instituteName,
                instituteEmail,
                institutePhoneNumber,
                instituteAddress,
                institutePanNumber,
                instituteVatNumber,
                instituteImage
            ]
            });

        //tracking user's intitute info
        await User.update({
            currentInstituteNumber: instituteNumber,
            role: "institute"
        }, {
            where: {
                id: req.user.id
            }
        });

        //inserting owner's data into role based record of an institute
        await UserInstituteRole.create({
            userId:req.user.id,
            instituteNumber,
            role:"institute",
            instituteName,
            instituteAddress,
            instituteImage
        })
    }
    //passing the same institute number wherever needed
    if(req.user){
              req.user.currentInstituteNumber = instituteNumber
          }
    next()
    
};        

const createTeacherTable = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    // the number for the institute to create tables simultaneously
    const instituteNumber=req.user?.currentInstituteNumber
    await sequelize.query(`CREATE TABLE IF NOT EXISTS teacher_${instituteNumber} (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        teacherName VARCHAR(255) NOT NULL,
        teacherEmail VARCHAR(255) NOT NULL UNIQUE,
        teacherPhoneNumber VARCHAR(255) NOT NULL UNIQUE,
        teacherExpertise VARCHAR(255), 
        teacherJoinDate DATE,
        teacherImage VARCHAR(225), 
        teacherSalary VARCHAR(100),
        teacherAddress VARCHAR(255),
        instituteNumber VARCHAR(10),
        teacherInstituteName VARCHAR(255),
        teacherPassword VARCHAR(225),
        aboutTeacher TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    next();
};

//teacher activities-creating chapter
const createCourseChapterTable=async(req:IExtendedRequest,res:Response,next:NextFunction)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    await sequelize.query(`CREATE TABLE IF NOT EXISTS course_chapter_${instituteNumber}(
        id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        chapterName VARCHAR(200) NOT NULL,
        chapterLevel ENUM('beginner','intermediate','advance') NOT NULL,
        courseId INT REFERENCES course_${instituteNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        next()
}

//teacher activity-2. creating lesson
const createChapterLessonTable=async(req:IExtendedRequest,res:Response,next:NextFunction)=>{
    const instituteNumber=req.user?.currentInstituteNumber
    await sequelize.query(`CREATE TABLE IF NOT EXISTS chapter_lesson_${instituteNumber}(
        id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        lessonName VARCHAR(225) NOT NULL,
        lessonDescription TEXT, 
        lessonVideo VARCHAR(200), 
        lessonThumbnail VARCHAR(200), 
        chapterId INT REFERENCES course_chapter_${instituteNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE, 
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        next()
}

const createStudentTable = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const instituteNumber=req.user?.currentInstituteNumber
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_${instituteNumber} (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        studentName VARCHAR(255) NOT NULL,
        studentPhoneNo VARCHAR(255) NOT NULL UNIQUE,
        studentAddress TEXT, 
        enrolledDate DATE, 
        studentImage VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    )`);
    next();
};

const createCategoryTable = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const instituteNumber = req.user?.currentInstituteNumber;

    await sequelize.query(`CREATE TABLE IF NOT EXISTS category_${instituteNumber} (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        categoryName VARCHAR(255) NOT NULL UNIQUE,
        categoryDescription TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    categories.forEach(async(category)=>{
        await sequelize.query(`INSERT INTO category_${instituteNumber}(
            categoryName,categoryDescription) VALUES(?,?)`,{
                type:QueryTypes.INSERT,
                replacements:[category.categoryName,category.categoryDescription]
            })
    })

    next();
};


const createCourseTable = async (req: IExtendedRequest, res: Response) => {
    const instituteNumber=req.user?.currentInstituteNumber
    await sequelize.query(`CREATE TABLE IF NOT EXISTS course_${instituteNumber} (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        courseName VARCHAR(255) NOT NULL UNIQUE,
        coursePrice VARCHAR(255) NOT NULL,
        courseDuration VARCHAR(100) NOT NULL, 
        courseLevel ENUM('beginner','intermediate','advance') NOT NULL, 
        courseThumbnail VARCHAR(255),
        courseDescription TEXT,
        teacherId INT REFERENCES teacher_${instituteNumber}(id),
        categoryId INT NULL REFERENCES category_${instituteNumber}(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    res.status(200).json({
        message: "Institute Created Successfully!",
        instituteNumber
    });       
};

//fetch institute by institute number
const fetchSingleInstitute = async (req: IExtendedRequest, res: Response) => {
  const instituteNumber = req.user?.currentInstituteNumber;

  if (!instituteNumber) {
    return res.status(400).json({
      message: "Institute number not found on user object",
    });
  }

  const data = await sequelize.query(
    `SELECT * FROM institute_${instituteNumber} WHERE instituteNumber = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [instituteNumber],
    }
  );

  if (!data || data.length === 0) {
    return res.status(404).json({
      message: "Institute does not exist.",
    });
  }

  res.status(200).json({
    message: `Institute_${instituteNumber} fetched successfully.`,
    data,
  });
};
   

export {createInstitute,
    createTeacherTable,
    createCourseChapterTable,
    createChapterLessonTable,
    createCourseTable,
    createCategoryTable,
    createStudentTable,fetchSingleInstitute}
