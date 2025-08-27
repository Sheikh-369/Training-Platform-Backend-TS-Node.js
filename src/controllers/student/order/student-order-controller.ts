import { QueryTypes } from "sequelize";
import sequelize from "../../../database/connection";
import { IExtendedRequest } from "../../../middleware/type";
import { Response } from "express";
import User from "../../../database/models/userModel";
import axios from "axios";
import generateSha256Hash from "../../../services/generateSha256Hash";
import base64 from 'base-64'

enum PaymentMethod{
    COD = "cod", 
    ESEWA = "esewa", 
    KHALTI = "khalti"
}

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
}

interface KhaltiLookupResponse{
    status:string
}


const createStudentCourseOrder = async(req:IExtendedRequest,res:Response)=>{
    const userId = req.user?.id 
    console.log(userId,"UserID")
    
    const notChangedUserId = req.user?.id.split("_").join("-")
    const userData = await User.findByPk(notChangedUserId)
    
    const {whatsapp_no, remarks,paymentMethod, totalAmount} = req.body 
    
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
            paymentStatus ENUM('paid','pending','unpaid') DEFAULT('unpaid'),
            totalAmount VARCHAR(10) NOT NULL,
            orderId VARCHAR(36) REFERENCES student_order_${userId},
            pidx VARCHAR(100),
            transaction_uuid VARCHAR(150), 
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE(orderId)
        )`)
        
        // insert query for student-order
        console.log(userData,"userData")

       const data =  await sequelize.query(`INSERT INTO student_order_${userId}(whatsapp_no,remarks,email) VALUES(?,?,?)`,{
            type  : QueryTypes.INSERT, 
            replacements : [whatsapp_no,remarks,userData?.userEmail]
        })
        console.log(data)

        //extracting the orderId
        const [orderRow]: any = await sequelize.query(
            `SELECT id FROM student_order_${userId} WHERE whatsapp_no = ? AND remarks = ? ORDER BY createdAt DESC LIMIT 1`,
            {
            type: QueryTypes.SELECT,
            replacements: [whatsapp_no, remarks],
            }
        );
        const orderId = orderRow.id;

        //insert query for every order
        for(let orderDetail of orderDetailsData){
            await sequelize.query(`INSERT INTO student_order_details_${userId}(courseId,instituteId, orderId) VALUES(?,?,?)`,{
                type : QueryTypes.INSERT, 
                replacements : [orderDetail.courseId,orderDetail.instituteId,orderId]
            })
        }

        //logic for payment integration
        let pidx=null;
        if(paymentMethod === PaymentMethod.ESEWA){
        // esewa integration function call here
        const{amount} = req.body
            const paymentData = {
                 tax_amount : 0,
                 product_service_charge : 0,
                 product_delivery_charge : 0 ,
                 product_code : process.env.ESEWA_PRODUCT_CODE,
                 amount : amount,
                 total_amount : amount,
                 transaction_uuid : userId + "_" + orderDetailsData[0].courseId,
                 success_url : "http://localhost:7900/", 
                 failure_url  : "http://localhost:7900/failure", 
                 signed_field_names : "total_amount,transaction_uuid,product_code"
            }
            
            const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`
            console.log(data,"This is data")

            const esewaSecretKey = process.env.ESEWA_SECRET_KEY
            
            const signature = generateSha256Hash(data,esewaSecretKey as string)
            console.log(signature, esewaSecretKey,"This is signature")
            console.log(paymentData,"PaymentData")

           const response = await axios.post("https://rc-epay.esewa.com.np/api/epay/main/v2/form",{
            ...paymentData, signature
           },{
                headers : {
                    "Content-Type" : "application/x-www-form-urlencoded"
                }
            })
            console.log(response.request.res.responseUrl,"This is response")

            if(response.status === 200){
                    await sequelize.query(`INSERT INTO student_payment_${userId}(paymentMethod,paymentStatus,totalAmount,orderId,transaction_uuid) VALUES(?,?,?,?)`,{
            type : QueryTypes.INSERT, 
            replacements : [paymentMethod,"pending",totalAmount,orderId,paymentData.transaction_uuid]
        })

                res.status(200).json({
                    message : "Payment Initiated", 
                    data : response.request.res.responseUrl
                })
            }
            
        }else if(paymentMethod === PaymentMethod.KHALTI){
        // khalti integration logic 
         const data = {
          return_url : "http://localhost:7900/", 
          website_url : "http://localhost:7900/", 
          amount : totalAmount * 100, 
          purchase_order_id : orderId, 
          purchase_order_name : "order_" + orderId
        }
       const response =  await axios.post<KhaltiInitiateResponse>("https://a.khalti.com/api/v2/epayment/initiate/",data,{
          headers : {
            Authorization : "Key d6b8b250e2024fb5b258a9beee2fa6c6"
          }
        })
        if(response.status === 200){
            pidx=response.data.pidx
            
            //stopping from double or more payment
            const [alreadyPaid]= await sequelize.query(
                `SELECT * FROM student_payment_${userId} WHERE orderId = ? AND paymentMethod =?`,{
                    type: QueryTypes.SELECT,
                    replacements: [orderId, paymentMethod],
                });

                if (alreadyPaid) {
                    res.status(409).json({
                        message: "Payment already initiated for this order.",
                    });
                    return
                }
            // Insert payment record for all payment methods 
            await sequelize.query(
            `INSERT INTO student_payment_${userId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx) VALUES (?, ?, ?, ?, ?)`,
            {
            type: QueryTypes.INSERT,
            replacements: [
                paymentMethod,
                "pending", // initial payment status
                totalAmount,
                orderId,
                pidx,
            ],
            })

            return res.status(200).json({
            message : "Takethis", 
            data : response.data
            })
        }else{
            return res.status(200).json({
            message : "Something went wrong, try again !!"
            })   
        }
        }else if(paymentMethod === PaymentMethod.COD){
            // COD function call here
            pidx=null

            //stopping from double or more payment
            const [alreadyPaid]= await sequelize.query(
                `SELECT * FROM student_payment_${userId} WHERE orderId = ? AND paymentMethod =?`,{
                    type: QueryTypes.SELECT,
                    replacements: [orderId, paymentMethod],
                });

                if (alreadyPaid) {
                    res.status(409).json({
                        message: "Payment already initiated for this order.",
                    });
                    return
                }

            // Insert payment record for all payment methods
            await sequelize.query(
            `INSERT INTO student_payment_${userId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx) VALUES (?, ?, ?, ?, ?)`,
            {
            type: QueryTypes.INSERT,
            replacements: [
                paymentMethod,
                "pending", // initial payment status
                totalAmount,
                orderId,
                pidx,
            ],
            })

            return res.status(200).json({
            message : "Order Made Successfully!", 
            })
        }else{
            // stripe 
        }        
}

const khaltiPaymentVerification = async(req:IExtendedRequest,res:Response)=>{
    const {pidx} = req.body 
    const userId = req.user?.id 

    if(!pidx){
        res.status(400).json({
            message : "Please provide pidx"
        })
    }
    const response = await axios.post<KhaltiLookupResponse>(
        "https://dev.khalti.com/api/v2/epayment/lookup/",
        {pidx},
        {
    headers:{
        Authorization : "Key d6b8b250e2024fb5b258a9beee2fa6c6"
    }})

    const data = response.data 
    if(data.status ==="Completed"){
        await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE pidx=?`,{
            type : QueryTypes.UPDATE, 
            replacements : ['paid',pidx]
        })
        res.status(200).json({
            message : "Payment verified successfully"
        })
    }else{
        res.status(500).json({
            message : "Payment not verified!!"
        })
    }
}

const esewaPaymentVerification = async(req:IExtendedRequest,res:Response)=>{
    const {encodedData} = req.body 
    const userId = req.user?.id
    
    if(!encodedData) return res.status(400).json({
        message : "Please provide data base64 for verification!"
    })

    const result = base64.decode(encodedData)
        const newresult:{
            total_amount : string, 
            transaction_uuid : string
        } = JSON.parse(result)

    const response = await axios.get(`https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${newresult.total_amount}&transaction_uuid=${newresult.transaction_uuid}`)
    // console.log(response.data)
    if(response.status === 200 && response.data.status === "COMPLETE"){
        await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE transaction_uuid=?`,{
                    type : QueryTypes.UPDATE, 
                    replacements : ['paid',newresult.transaction_uuid]
                })
                res.status(200).json({
                    message : "Payment Verified Successfully!"
                })
            }else{
                res.status(500).json({
                    message : "Payment Not Verified!"
                })
    }
   

}

export {createStudentCourseOrder,khaltiPaymentVerification,esewaPaymentVerification}

