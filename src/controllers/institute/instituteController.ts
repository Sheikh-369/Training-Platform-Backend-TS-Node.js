import { Request, Response } from "express";
import sequelize from "../../database/connection";
import generateRandomInstituteNumber from "../../services/randomNumberGenerator";




    const createInstitute=async (req:Request,res:Response)=>{
        const {instituteName,instituteEmail,institutePhoneNumber,instituteAddress}=req.body
        const institutePanNumber=req.body.institutePanNumber || null
        const instituteVatNumber=req.body.instituteVatNumber || null
        if(!instituteName || !instituteEmail || !institutePhoneNumber || !instituteAddress){
            res.status(400).json({
                message:"All the fields are mendatory!"
            })
            return
        }    
        const instituteNumber=generateRandomInstituteNumber()
        await sequelize.query(`CREATE TABLE IF NOT EXISTS institute_${instituteNumber}(
            id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
            instituteName VARCHAR(255) NOT NULL,
            instituteEmail VARCHAR(255) NOT NULL UNIQUE,
            institutePhoneNumber VARCHAR(255) NOT NULL UNIQUE,
            instituteAddress VARCHAR(255) NOT NULL,
            instituteVatNumber VARCHAR(255),
            institutePanNumber VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`)

            await sequelize.query(`INSERT INTO institute_${instituteNumber}(
                instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber
                ) VALUES (?,?,?,?,?,?)`,{
                    replacements:[instituteName,instituteEmail,institutePhoneNumber,instituteAddress,institutePanNumber,instituteVatNumber]
                })
                res.status(200).json({
                    message:"Institute Created Successfully!"
                })
    }


export default createInstitute
