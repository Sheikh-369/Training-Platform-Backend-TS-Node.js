// import { Request, Response } from "express";
// import sequelize from "../../database/connection";
// import generateInstituteRandomNumber from "../../services/genrate-institute-random-number";
// import { QueryTypes } from "sequelize";


// class instituteAdminController {
//     static createInstitute = async (req: Request, res: Response) => {
//         const { instituteName, instituteEmail, institutePhoneNumber, instituteAddress } = req.body
//         const  institutePanNumber  = req.body.institutePanNumber || null
//         const instituteVatNumber  = req.body.instituteVatNumber || null
//         if (!instituteName || !instituteEmail || !institutePhoneNumber || !instituteAddress) {
//             res.status(400).json({
//                 messege: "Please Provide instituteName, instituteEmail, institutePhoneNumber, instituteAddress"
//             })
//             return
//         }
        
//         //generate random number
//         const instituteNumber = generateInstituteRandomNumber()
//         await sequelize.query(`CREATE TABLE IF NOT EXISTS institute_${instituteNumber} (
//             id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
//             instituteName VARCHAR(255) NOT NULL UNIQUE,
//             instituteEmail VARCHAR(255) NOT NULL UNIQUE,
//             institutePhoneNumber VARCHAR(255) NOT NULL UNIQUE,
//             instituteAddress VARCHAR(255) NOT NULL,
//             institutePanNumber VARCHAR(255) UNIQUE,
//             instituteVatNumber VARCHAR(255) UNIQUE,
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//             )`)
//         await sequelize.query(`INSERT INTO institute_${instituteNumber} (
//             instituteName, instituteEmail, institutePhoneNumber, instituteAddress, institutePanNumber, instituteVatNumber
//         ) VALUES (?,?,?,?,?,?)`, {
//             replacements: [instituteName, instituteEmail, institutePhoneNumber, instituteAddress, institutePanNumber, instituteVatNumber]
//         })

//         res.status(200).json({
//             messege: "Institute Created Successfully",
//             instituteNumber: instituteNumber
//         })

//     }
// }

// export default instituteAdminController