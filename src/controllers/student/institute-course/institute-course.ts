import { Request, Response } from "express";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";

const fetchInstitutes=async(req:Request,res:Response)=>{
    const tables=await sequelize.query(`SHOW TABLES LIKE "institute_%"`,{
        type:QueryTypes.SHOWTABLES
    })
    res.status(200).json({
        message:"All Institutes Fetched Successfully!",
        data:tables
    })
    console.log(tables)
}

export {fetchInstitutes}