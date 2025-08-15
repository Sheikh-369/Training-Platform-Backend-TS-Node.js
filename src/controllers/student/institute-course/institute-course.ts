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
        const [data]=await sequelize.query(`SELECT instituteName,instituteAddress,institutePhoneNumber FROM ${table}`,{
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

export {fetchInstitutes}