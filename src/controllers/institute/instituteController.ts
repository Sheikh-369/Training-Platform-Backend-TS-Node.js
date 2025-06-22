import { Request, Response } from "express";
import sequelize from "../../database/connection";
import generateRandomInstituteNumber from "../../services/randomNumberGenerator";
import { IExtendedRequest } from "../../middleware/type";
import User from "../../database/models/userModel";



    //input from user/body
    const createInstitute=async (req:IExtendedRequest,res:Response)=>{
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
            instituteName VARCHAR(255) NOT NULL,
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

    req.instituteNumber = instituteNumber;

    res.status(200).json({
        message:"Institute Created Successfully!",
        instituteNumber
    })
};        

                
    

export default createInstitute
