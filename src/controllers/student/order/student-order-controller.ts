// import { QueryTypes } from "sequelize";
// import sequelize from "../../../database/connection";
// import { IExtendedRequest } from "../../../middleware/type";
// import { Response } from "express";
// import User from "../../../database/models/userModel";
// import axios from "axios";
// import generateSha256Hash from "../../../services/generateSha256Hash";
// import base64 from 'base-64'

// enum PaymentMethod{
//     QR = "qr", 
//     ESEWA = "esewa", 
//     KHALTI = "khalti"
// }

// interface KhaltiInitiateResponse {
//   pidx: string;
//   payment_url: string;
//   expires_at: string;
// }

// interface KhaltiLookupResponse{
//     status:string
// }


// const createStudentCourseOrder = async(req:IExtendedRequest,res:Response)=>{
//     const userId = req.user?.id 
//     console.log(userId,"UserID")
    
//     const notChangedUserId = req.user?.id.split("_").join("-")
//     const userData = await User.findByPk(notChangedUserId)
    
//     const {whatsapp_no, remarks,paymentMethod, totalAmount} = req.body 
    
//     const orderDetailsData:{
//         courseId : string , 
//         instituteId : string
//     }[] = req.body.orderDetails

//     if(orderDetailsData.length === 0 ){
//         res.status(400).json({
//             message : "Please Send The Course You Want To Purchase!"
//         })
//         return
//     }

//     if(!whatsapp_no || !remarks){
//         res.status(400).json({
//             message : "Please provide whatsapp_no, remarks"
//         })
//         return
//     }

//     //studetn order
//    await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_${userId}(
//             id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
//             email VARCHAR(25) NOT NULL,
//             whatsapp_no VARCHAR(26) NOT NULL, 
//             remarks TEXT, 
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`)

//     // student order-details 
//     await sequelize.query(`CREATE TABLE IF NOT EXISTS student_order_details_${userId}(
//           id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
//             courseId VARCHAR(36) , 
//             instituteId VARCHAR(36), 
//             orderId VARCHAR(36) REFERENCES student_order_${userId}, 
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//         )`)

//     //student payment-method    
//     await sequelize.query(`CREATE TABLE IF NOT EXISTS student_payment_${userId}(
//          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), 
//             paymentMethod ENUM('esewa','khalti','cod'), 
//             paymentStatus ENUM('paid','pending','unpaid') DEFAULT('unpaid'),
//             totalAmount VARCHAR(10) NOT NULL,
//             orderId VARCHAR(36) REFERENCES student_order_${userId},
//             pidx VARCHAR(100),
//             transaction_uuid VARCHAR(150), 
//             createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
//             updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             UNIQUE(orderId)
//         )`)
        
//         // insert query for student-order
//         console.log(userData,"userData")

//        const data =  await sequelize.query(`INSERT INTO student_order_${userId}(whatsapp_no,remarks,email) VALUES(?,?,?)`,{
//             type  : QueryTypes.INSERT, 
//             replacements : [whatsapp_no,remarks,userData?.userEmail]
//         })
//         console.log(data)

//         //extracting the orderId
//         const [orderRow]: any = await sequelize.query(
//             `SELECT id FROM student_order_${userId} WHERE whatsapp_no = ? AND remarks = ? ORDER BY createdAt DESC LIMIT 1`,
//             {
//             type: QueryTypes.SELECT,
//             replacements: [whatsapp_no, remarks],
//             }
//         );
//         const orderId = orderRow.id;

//         //insert query for every order
//         for(let orderDetail of orderDetailsData){
//             await sequelize.query(`INSERT INTO student_order_details_${userId}(courseId,instituteId, orderId) VALUES(?,?,?)`,{
//                 type : QueryTypes.INSERT, 
//                 replacements : [orderDetail.courseId,orderDetail.instituteId,orderId]
//             })
//         }

//         //logic for payment integration
//         let pidx=null;
//         if(paymentMethod === PaymentMethod.ESEWA){
//         // esewa integration function call here
//         const{amount} = req.body
//             const paymentData = {
//                  tax_amount : 0,
//                  product_service_charge : 0,
//                  product_delivery_charge : 0 ,
//                  product_code : process.env.ESEWA_PRODUCT_CODE,
//                  amount : amount,
//                  total_amount : amount,
//                  transaction_uuid : userId + "_" + orderDetailsData[0].courseId,
//                  success_url : "http://localhost:3000/",
//                  failure_url  : "http://localhost:3000/failure",
//                  signed_field_names : "total_amount,transaction_uuid,product_code"
//             }
            
//             const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`
//             console.log(data,"This is data")

//             const esewaSecretKey = process.env.ESEWA_SECRET_KEY
            
//             const signature = generateSha256Hash(data,esewaSecretKey as string)
//             console.log(signature, esewaSecretKey,"This is signature")
//             console.log(paymentData,"PaymentData")

//            const response = await axios.post("https://rc-epay.esewa.com.np/api/epay/main/v2/form",{
//             ...paymentData, signature
//            },{
//                 headers : {
//                     "Content-Type" : "application/x-www-form-urlencoded"
//                 }
//             })
//             console.log(response.request.res.responseUrl,"This is response")

//             if(response.status === 200){
//                     await sequelize.query(`INSERT INTO student_payment_${userId}(paymentMethod,paymentStatus,totalAmount,orderId,transaction_uuid) VALUES(?,?,?,?,?)`,{
//             type : QueryTypes.INSERT, 
//             replacements : [paymentMethod,"pending",amount,orderId,paymentData.transaction_uuid]
//         })

//                 res.status(200).json({
//                     message : "Payment Initiated", 
//                     data : response.request.res.responseUrl
//                 })
//             }
            
//         }else if(paymentMethod === PaymentMethod.KHALTI){
//         // khalti integration logic 
//          const data = {
//           return_url : "http://localhost:7900/", 
//           website_url : "http://localhost:7900/", 
//           amount : totalAmount * 100, 
//           purchase_order_id : orderId, 
//           purchase_order_name : "order_" + orderId
//         }
//        const response =  await axios.post<KhaltiInitiateResponse>("https://a.khalti.com/api/v2/epayment/initiate/",data,{
//           headers : {
//             Authorization : "Key d6b8b250e2024fb5b258a9beee2fa6c6"
//           }
//         })
//         if(response.status === 200){
//             pidx=response.data.pidx
            
//             //stopping from double or more payment
//             const [alreadyPaid]= await sequelize.query(
//                 `SELECT * FROM student_payment_${userId} WHERE orderId = ? AND paymentMethod =?`,{
//                     type: QueryTypes.SELECT,
//                     replacements: [orderId, paymentMethod],
//                 });

//                 if (alreadyPaid) {
//                     res.status(409).json({
//                         message: "Payment already initiated for this order.",
//                     });
//                     return
//                 }
//             // Insert payment record for all payment methods 
//             await sequelize.query(
//             `INSERT INTO student_payment_${userId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx) VALUES (?, ?, ?, ?, ?)`,
//             {
//             type: QueryTypes.INSERT,
//             replacements: [
//                 paymentMethod,
//                 "pending", // initial payment status
//                 totalAmount,
//                 orderId,
//                 pidx,
//             ],
//             })

//             return res.status(200).json({
//             message : "Takethis", 
//             data : response.data
//             })
//         }else{
//             return res.status(200).json({
//             message : "Something went wrong, try again !!"
//             })   
//         }
//         }else if(paymentMethod === PaymentMethod.QR){
//             // QR function call here
//             pidx=null

//             // Insert payment record for payment methods
//             await sequelize.query(
//             `INSERT INTO student_payment_${userId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx) VALUES (?, ?, ?, ?, ?)`,
//             {
//             type: QueryTypes.INSERT,
//             replacements: [
//                 paymentMethod,
//                 "pending", // initial payment status
//                 totalAmount,
//                 orderId,
//                 pidx,
//             ],
//             })

//             return res.status(200).json({
//             message : "Order Made Successfully!", 
//             })
//         }        
// }

// const khaltiPaymentVerification = async(req:IExtendedRequest,res:Response)=>{
//     const {pidx} = req.body 
//     const userId = req.user?.id 

//     if(!pidx){
//         res.status(400).json({
//             message : "Please provide pidx"
//         })
//     }
//     const response = await axios.post<KhaltiLookupResponse>(
//         "https://dev.khalti.com/api/v2/epayment/lookup/",
//         {pidx},
//         {
//     headers:{
//         Authorization : "Key d6b8b250e2024fb5b258a9beee2fa6c6"
//     }})

//     const data = response.data 
//     if(data.status ==="Completed"){
//         await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE pidx=?`,{
//             type : QueryTypes.UPDATE, 
//             replacements : ['paid',pidx]
//         })
//         res.status(200).json({
//             message : "Payment Verified Successfully!"
//         })
//     }else{
//         res.status(500).json({
//             message : "Payment Not Verified!"
//         })
//     }
// }

// const esewaPaymentVerification = async(req:IExtendedRequest,res:Response)=>{
//     const {encodedData} = req.body 
//     const userId = req.user?.id
    
//     if(!encodedData) return res.status(400).json({
//         message : "Please provide data base64 for verification!"
//     })

//     const result = base64.decode(encodedData)
//         const newresult:{
//             total_amount : string, 
//             transaction_uuid : string
//         } = JSON.parse(result)

//     const response = await axios.get(`https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${newresult.total_amount}&transaction_uuid=${newresult.transaction_uuid}`)
//     // console.log(response.data)
//     if(response.status === 200 && response.data.status === "COMPLETE"){
//         await sequelize.query(`UPDATE student_payment_${userId} SET paymentStatus=? WHERE transaction_uuid=?`,{
//                     type : QueryTypes.UPDATE, 
//                     replacements : ['paid',newresult.transaction_uuid]
//                 })
//                 res.status(200).json({
//                     message : "Payment Verified Successfully!"
//                 })
//             }else{
//                 res.status(500).json({
//                     message : "Payment Not Verified!"
//                 })
//     }
   

// }

// export {createStudentCourseOrder,khaltiPaymentVerification,esewaPaymentVerification}


import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import axios from "axios";
import base64 from "base-64";
import sequelize from "../../../database/connection";
import User from "../../../database/models/userModel";
import randomPasswordGenerator from "../../../services/randomPasswordGenerator";
import UserInstituteRole from "../../../database/models/userInstituteRoleModel";
import generateSha256Hash from "../../../services/generateSha256Hash";
import sendMail from "../../../services/sendMail";

enum PaymentMethod {
  QR = "qr",
  ESEWA = "esewa",
  KHALTI = "khalti"
}

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
}

interface KhaltiLookupResponse {
  status: string;
}

export const createStudentOrder = async (req: Request, res: Response) => {
  const { studentName, studentEmail, studentPhoneNo, studentAddress, paymentMethod, totalAmount, remarks } = req.body;
  const { instituteId, courseId } = req.params;

  if (!studentName || !studentEmail || !studentPhoneNo || !studentAddress || !courseId || !paymentMethod || !totalAmount) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // ===== Step 1: Fetch institute info =====
 // ===== Step 1: Fetch institute info =====
const [instituteMeta] = await sequelize.query(
  `
  SELECT instituteName, instituteAddress, instituteImage
  FROM institute_${instituteId}
  WHERE instituteNumber = ?
  `,
  {
    type: QueryTypes.SELECT,
    replacements: [instituteId],
  }
) as { instituteName: string; instituteAddress: string; instituteImage: string; }[];


  const instituteName = instituteMeta?.instituteName || "";
  const instituteAddressDb = instituteMeta?.instituteAddress || "";
  const instituteImage = instituteMeta?.instituteImage || "";

  // ===== Step 2: Check if user exists =====
  const existingUser = await User.findOne({ where: { userEmail: studentEmail } });
  let userId: string;
  let plainPassword: string | null = null;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const passwordData = randomPasswordGenerator(studentName);
    plainPassword = passwordData.plainVersion;
    const newUser = await User.create({
      userName: studentName,
      userEmail: studentEmail,
      userPassword: passwordData.hashedVersion
    });
    userId = newUser.id;
  }

  // ===== Step 3: Check / Create UserInstituteRole =====
  const existingRole = await UserInstituteRole.findOne({
    where: { userId, instituteNumber: instituteId, role: "student" }
  });

  if (!existingRole) {
    await UserInstituteRole.create({
      userId,
      instituteNumber: instituteId,
      role: "student",
      instituteName,
      instituteAddress: instituteAddressDb,
      instituteImage
    });
  }

  // ===== Step 4: Check / Create student_${instituteNumber} record =====
  const [existingStudent] = await sequelize.query(
    `SELECT * FROM student_${instituteId} WHERE studentEmail = ?`,
    { type: QueryTypes.SELECT, replacements: [studentEmail] }
  );

  if (!existingStudent) {
    await sequelize.query(
      `INSERT INTO student_${instituteId} (studentName, studentEmail, studentPhoneNo, studentAddress, enrolledDate, studentInstituteName, studentInstituteAddress, studentInstituteImage)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [studentName, studentEmail, studentPhoneNo, studentAddress, instituteName, instituteAddressDb, instituteImage]
      }
    );
  }

  // ===== Step 5: Create order in student_order_${instituteNumber} =====
  const safeRemarks = typeof remarks === "string" ? remarks : "";
  const [orderResult]: any = await sequelize.query(
    `INSERT INTO student_order_${instituteId} (email, whatsapp_no, remarks)
    VALUES (:email, :whatsapp_no, :remarks)`,
    {
      type: QueryTypes.INSERT,
      replacements: {
        email: studentEmail,
        whatsapp_no: studentPhoneNo,
        remarks: safeRemarks,
      }
    }
  );

    // Fetch the newly inserted order
const newOrders: any[] = await sequelize.query(
  `SELECT id FROM student_order_${instituteId} WHERE email = ? ORDER BY createdAt DESC LIMIT 1`,
  { type: QueryTypes.SELECT, replacements: [studentEmail] }
);

if (!newOrders || newOrders.length === 0) {
  return res.status(500).json({ message: "Failed to fetch newly created order." });
}

const orderId = newOrders[0].id;


  // ===== Step 6: Insert into student_order_details_${instituteNumber} =====
  await sequelize.query(
    `INSERT INTO student_order_details_${instituteId} (courseId, instituteId, orderId) VALUES (?, ?, ?)`,
    { type: QueryTypes.INSERT, replacements: [courseId, instituteId, orderId] }
  );

  // ===== Step 7: Handle Payment =====
  let pidx: string | null = null;

  if (paymentMethod === PaymentMethod.ESEWA) {
    const transaction_uuid = userId + "_" + courseId;
    const paymentData = {
      tax_amount: 0,
      product_service_charge: 0,
      product_delivery_charge: 0,
      product_code: process.env.ESEWA_PRODUCT_CODE,
      amount: totalAmount,
      total_amount: totalAmount,
      transaction_uuid,
      success_url: "http://localhost:3000/",
      failure_url: "http://localhost:3000/failure",
      signed_field_names: "total_amount,transaction_uuid,product_code"
    };

    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateSha256Hash(data, process.env.ESEWA_SECRET_KEY as string);

    const response = await axios.post(
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      { ...paymentData, signature },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    await sequelize.query(
      `INSERT INTO student_payment_${instituteId}(paymentMethod, paymentStatus, totalAmount, orderId, transaction_uuid)
       VALUES (?, ?, ?, ?, ?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [paymentMethod, "pending", totalAmount, orderId, transaction_uuid]
      }
    );

    return res.status(200).json({
      message: "Payment Initiated via eSewa",
      redirectUrl: response.request.res.responseUrl
    });
  }

  if (paymentMethod === PaymentMethod.KHALTI) {
    const data = {
      return_url: "http://localhost:3000/payment/verify/khalti",
      website_url: "http://localhost:3000/",
      amount: totalAmount * 100,
      purchase_order_id: orderId,
      purchase_order_name: "order_" + orderId
    };

    const response = await axios.post<KhaltiInitiateResponse>(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      data,
      { headers: { Authorization: `Key d6b8b250e2024fb5b258a9beee2fa6c6` } }
    );

    if (response.status === 200) {
      pidx = response.data.pidx;

      await sequelize.query(
        `INSERT INTO student_payment_${instituteId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx)
         VALUES (?, ?, ?, ?, ?)`,
        {
          type: QueryTypes.INSERT,
          replacements: [paymentMethod, "pending", totalAmount, orderId, pidx]
        }
      );

      return res.status(200).json({
        message: "Payment Initiated via Khalti",
        data: response.data
      });
    }
  }

  if (paymentMethod === PaymentMethod.QR) {
    await sequelize.query(
      `INSERT INTO student_payment_${instituteId}(paymentMethod, paymentStatus, totalAmount, orderId, pidx)
       VALUES (?, ?, ?, ?, NULL)`,
      {
        type: QueryTypes.INSERT,
        replacements: [paymentMethod, "pending", totalAmount, orderId]
      }
    );

    // return res.status(200).json({
    //   message: "Order Created Successfully via QR"
    // });
  }

  // ===== Step 8: Send Email =====
  if (plainPassword) {
    const mailInformation = {
      to: studentEmail,
      subject: `Welcome to ${instituteName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Welcome to ${instituteName}, ${studentName}!</h2>
          <p>You've been enrolled in our institute as a <strong>student</strong>.</p>
          <p>Here are your login credentials:</p>
          <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
            <li><strong>Email:</strong> ${studentEmail}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
          </ul>
          <p>Use these to log in to your account and continue learning!</p>
          <br />
          <p><strong>${instituteName}</strong></p>
        </div>
      `
    };
    await sendMail(mailInformation);
  } else {
    const mailInformation = {
      to: studentEmail,
      subject: `You're enrolled at ${instituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Hello ${studentName},</h2>
          <p>You're successfully enrolled in <strong>${instituteName}</strong>.</p>
          <p>You can access your courses using your existing credentials.</p>
          <br />
          <p><strong>${instituteName}</strong></p>
        </div>
      `
    };
    await sendMail(mailInformation);
  }

  return res.status(200).json({ message: "Order created successfully!" });
};

// ---------------------------- Khalti Verification ----------------------------
// export const khaltiPaymentVerification = async (req: Request, res: Response) => {
//   const { instituteNumber, pidx } = req.body;
//   const paymentTable = `student_payment_${instituteNumber}`;

//   if (!pidx) return res.status(400).json({ message: "Please provide pidx" });

//   const response = await axios.post<KhaltiLookupResponse>(
//     "https://dev.khalti.com/api/v2/epayment/lookup/",
//     { pidx },
//     { headers: { Authorization: `Key d6b8b250e2024fb5b258a9beee2fa6c6` } }
//   );

//   const status = response.data.status === "Completed" ? "paid" : "failed";

//   await sequelize.query(
//     `UPDATE ${paymentTable} SET paymentStatus=? WHERE pidx=?`,
//     { type: QueryTypes.UPDATE, replacements: [status, pidx] }
//   );

//   return res.status(200).json({ message: status === "paid" ? "Payment Verified Successfully!" : "Payment Not Verified!" });
// };



interface Order {
  instituteNumber: string;
}

export const khaltiPaymentVerification = async (req: Request, res: Response) => {
  const { pidx, purchase_order_id } = req.body;

  if (!pidx || !purchase_order_id)
    return res.status(400).json({ message: "Missing pidx or purchase order ID" });

  try {
    // Step 1: Lookup the order in your database to get instituteNumber
    const orders = await sequelize.query<Order>(
      "SELECT instituteNumber FROM student_orders WHERE orderId = ?",
      { replacements: [purchase_order_id], type: QueryTypes.SELECT }
    );

    const order = orders[0];

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const instituteNumber = order.instituteNumber;
    const paymentTable = `student_payment_${instituteNumber}`;

    // Step 2: Call Khalti lookup API
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers: { Authorization: `Key YOUR_KHALTI_SECRET_KEY` } }
    );

    const status = response.data.status === "Completed" ? "paid" : "failed";

    // Step 3: Update the payment table
    await sequelize.query(
      `UPDATE ${paymentTable} SET paymentStatus=? WHERE pidx=?`,
      { type: QueryTypes.UPDATE, replacements: [status, pidx] }
    );

    if (status === "paid") {
      res.json({ message: "Payment Verified Successfully!" });
    } else {
      res.json({ message: "Payment Failed or Not Verified." });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// ---------------------------- ESEWA Verification ----------------------------
export const esewaPaymentVerification = async (req: Request, res: Response) => {
  const { instituteNumber, encodedData } = req.body;
  const paymentTable = `student_payment_${instituteNumber}`;

  if (!encodedData) return res.status(400).json({ message: "Please provide base64 data for verification!" });

  const result = base64.decode(encodedData);
  const { total_amount, transaction_uuid } = JSON.parse(result);

  const response = await axios.get(
    `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`
  );

  const status = response.data.status === "COMPLETE" ? "paid" : "failed";

  await sequelize.query(
    `UPDATE ${paymentTable} SET paymentStatus=? WHERE transaction_uuid=?`,
    { type: QueryTypes.UPDATE, replacements: [status, transaction_uuid] }
  );

  return res.status(200).json({ message: status === "paid" ? "Payment Verified Successfully!" : "Payment Not Verified!" });
};
