import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";
import { Response } from "express";
import User from "../../../database/models/userModel";
import { KhaltiPayment } from "./paymentIntegration";

// upload.fields([{ name: 'avatar1', maxCount: 1 }, {name:'avatar2', maxCount:1},{name:'avatar3', maxCount : 1}]

//


enum PaymentMethod{
    COD = "cod", 
    ESEWA = "esewa", 
    KHALTI = "khalti"
}


const createStudentCourseOrder = async(req:IExtendedRequest,res:Response)=>{
    const userId = req.user?.id 
    console.log(userId,"UserID")
    const notChangedUserId = req.user?.id.split("_").join("-")
    const userData = await User.findByPk(notChangedUserId)
    
    const {whatsapp_no, remarks,paymentMethod, amount} = req.body 
    
    const orderDetailsData:{
        courseId : string , 
        instituteId : string
    }[] = req.body.orderDetails

    if(orderDetailsData.length === 0 ){
        res.status(400).json({
            message : "Please Send The Course You Want To Purchase!"
        })
        return
    }

    if(!whatsapp_no || !remarks){
        res.status(400).json({
            message : "Please provide whatsapp_no, remarks"
        })
        return
    }

    //studetn order
   await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_${userId}(
            id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
            email VARCHAR(25) NOT NULL,
            whatsapp_no VARCHAR(26) NOT NULL, 
            remarks TEXT, 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    // student order-details 
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_details_${userId}(
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
            courseId VARCHAR(36) , 
            instituteId VARCHAR(36), 
            orderId VARCHAR(36) REFERENCES student_order_${userId}, 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)

    //student payment-method    
    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_payment_${userId}(
         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
            paymentMethod ENUM('esewa','khalti','cod'), 
            paymentStatus ENUM('paid','pending','unpaid'),
            totalAmount VARCHAR(10) NOT NULL,
            orderId VARCHAR(36) REFERENCES student_order_${userId}, 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        
        // insert query for student-order
        console.log(userData,"userData")

       const data =  await sequelize.query(`INSERT INTO student_order_${userId}(whatsapp_no,remarks,email) VALUES(?,?,?)`,{
            type  : QueryTypes.INSERT, 
            replacements : [whatsapp_no,remarks,userData?.userEmail]
        })

        console.log(data)
        //insert query for every order
        for(let orderDetail of orderDetailsData){
            await sequelize.query(`INSERT INTO student_order_details_${userId}(courseId,instituteId, orderId) VALUES(?,?,?)`,{
                type : QueryTypes.INSERT, 
                replacements : [orderDetail.courseId,orderDetail.instituteId, 12323]
            })
        }

        //logic for payment integration
        if(paymentMethod === PaymentMethod.ESEWA){

            // esewa integration function call here 
        }else if(paymentMethod === PaymentMethod.KHALTI){
            // khalti integration function call here 
         const response = await KhaltiPayment({
            amount : amount, 
            return_url : "http://localhost:3000/", 
            website_url : "http://localhost:3000/", 
            purchase_order_id : orderDetailsData[0].courseId, 
            purchase_order_name : "Order_" + orderDetailsData[0].courseId
         })
         if(response.status === 200){
             res.status(200).json({
                 message : "Takethis", 
                 data : response.data
                })
            }else{
                res.status(200).json({
                    message : "Something went wrong, try again !!"
                })
            }


        }else if(paymentMethod === PaymentMethod.COD){
            // khalti integration function call here
        }else{
            // stripe 
        }



}


export {createStudentCourseOrder}