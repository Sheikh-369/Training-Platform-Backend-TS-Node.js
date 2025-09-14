// import { Response } from "express";
// import { IExtendedRequest } from "../../../middleware/type";
// import sequelize from "../../../database/connection";
// import { QueryTypes } from "sequelize";

// const teacherPersonalInfo = async(req:IExtendedRequest, res:Response) => {
//     const instituteNumber = req.user?.currentInstituteNumber;

//      const teacherInstituteName=await sequelize.query(`SELECT instituteName FROM institute_${instituteNumber} WHERE instituteNumber=?`, {
//         type:QueryTypes.SELECT,
//         replacements: [instituteNumber]
//     })

//     await sequelize.query(`CREATE TABLE IF NOT EXISTS teacher_personal_info_${instituteNumber}(
//         id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
//         teacherName VARCHAR(255) NOT NULL,
//         teacherEmail VARCHAR(255) NOT NULL UNIQUE,
//         teacherPhoneNumber VARCHAR(255) NOT NULL UNIQUE,
//         teacherExpertise VARCHAR(255) NOT NULL,
//         teacherJoinDate DATE NOT NULL,
//         teacherSalary FLOAT NOT NULL,
//         teacherImage VARCHAR(255),
//         teacherAddress VARCHAR(255) NOT NULL,
//         teacherInstituteName VARCHAR(255) NOT NULL,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`)

//     await sequelize.query(`INSERT INTO teacher_personal_info_${instituteNumber}(
//         teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherSalary,teacherImage,teacherAddress,teacherInstituteName
//     ) VALUES (?,?,?,?,?,?,?,?,?)`, {
//         type: QueryTypes.INSERT,
//         replacements: [
//             teacherName,
//             teacherEmail,
//             teacherPhoneNumber,
//             teacherExpertise,
//             teacherJoinDate,
//             teacherSalary,
//             teacherImage,
//             teacherAddress,
//             teacherInstituteName
//         ]
//     })  