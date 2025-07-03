import { NextFunction, Request, Response } from "express";
import sequelize from "../../database/connection";
import generateRandomInstituteNumber from "../../services/randomNumberGenerator";
import { IExtendedRequest } from "../../middleware/type";
import User from "../../database/models/userModel";



    //input from user/body
    const createInstitute=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
        const {instituteName,instituteEmail,institutePhoneNumber,instituteAddress}=req.body
        const institutePanNumber=req.body.institutePanNumber || null
        const instituteVatNumber=req.body.instituteVatNumber || null
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
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`)

            //inserting(creating institute) data in the table above
            await sequelize.query(`INSERT INTO institute_${instituteNumber}(
                instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber
                ) VALUES (?,?,?,?,?,?)`,{
                    replacements:[instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber]
                })
//creating table to track the number of institute created by a user
        await sequelize.query(`CREATE TABLE IF NOT EXISTS user_institute (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(255) REFERENCES user(id),
        instituteNumber INT UNIQUE
    )`);
    //if a user creates more than one institute
    if (req.user) {
        await sequelize.query(`INSERT INTO user_institute (
            userId, instituteNumber
        ) VALUES (?, ?)`, {
            replacements: [req.user.id, instituteNumber]
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
    }
    if(req.user){
              req.user.currentInstituteNumber = instituteNumber//passing the same number
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    next();
};

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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    res.status(200).json({
        message: "Institute Created Successfully!",
        instituteNumber
    });       
};

    

export {createInstitute,createTeacherTable,createCourseTable,createStudentTable}
