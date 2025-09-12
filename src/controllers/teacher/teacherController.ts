// import { Request, Response } from "express";
// import sequelize from "../../database/connection";
// import { QueryTypes } from "sequelize";
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken"
// import User from "../../database/models/userModel";

// const teacherLogin=async(req:Request,res:Response)=>{
//     const {teacherEmail,teacherPassword,instituteNumber}=req.body
//     if(!teacherEmail || !teacherPassword || !instituteNumber){
//         res.status(400).json({
//             message:"Please fill all the fields!"
//         })
//         return
//     }

//     const result:any[]=await sequelize.query(`SELECT * FROM teacher_${instituteNumber} where teacherEmail=?`,{
//         type:QueryTypes.SELECT,
//         replacements:[teacherEmail]
//     })

//     const teacher=result[0]
//     if(!teacher){
//         res.status(400).json({
//             message:"Invalid Credentials!"
//         })
//         return
//     }

//     // console.log("Password received from login:", JSON.stringify(teacherPassword));
//     // console.log("Password stored in DB:", teacher.teacherPassword);



//     const isPasswordMatch=bcrypt.compareSync(teacherPassword,teacher.teacherPassword)
//     if(!isPasswordMatch){
//         res.status(401).json({
//             message:"Invalid Credentials!"
//         })
//         return
//     }

//     //logic to get user data from users table
//     const userArr=await User.findAll({where:{
//         userEmail:teacherEmail,
//         role:"teacher"
//     }})

//     const user = userArr[0]; // Grab the first user

//     if (!user) {
//     res.status(404).json({ 
//         message: "User not found in users table!" 
//     });
//     return
//     }
    
//     // console.log("Password match with trim:", isPasswordMatch);
//     const token=jwt.sign({
//         id:user.id,
//         teacherEmail: teacher.teacherEmail,
//         instituteNumber
//       },process.env.JWT_SECRET!,{expiresIn:"1d"})

//       res.status(200).json({
//         message:"Teacher Login Successful!",
//         data:{
//             token,
//             instituteNumber,
//             teacherEmail
//         }
        
//       })


// }
// export default teacherLogin


import { Request, Response } from "express";
import sequelize from "../../database/connection";
import { QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../database/models/userModel";
import UserInstituteRole from "../../database/models/userInstituteRoleModel";


const teacherLogin = async (req: Request, res: Response) => {
  //taking input from teacher
  const { teacherEmail, teacherPassword, instituteNumber } = req.body;

  //validations
  if (!teacherEmail || !teacherPassword || !instituteNumber) {
    res.status(400).json({
      message: "Please fill all the fields!"
    });
    return
  }

  //Checking teacher record in teacher_<institute>
  const result: any[] = await sequelize.query(
    `SELECT * FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [teacherEmail],
    }
  );

  const teacher = result[0];//the very element from the array "result"
  
  //action if the teacher does not exist
  if (!teacher) {
    res.status(400).json({
      message: "Invalid credentials! (teacher not found)",
    });
    return
  }

  //Comparing passwords from frontend and teacher_<institute>
  const isPasswordMatch = bcrypt.compareSync(
    teacherPassword,
    teacher.teacherPassword
  );

  if (!isPasswordMatch) {
    res.status(401).json({
      message: "Invalid credentials! (wrong password)",
    });
    return
  }

  //Confirming the user exists in users table
  const user = await User.findOne({
    where: {
      userEmail: teacherEmail,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found in users table!",
    });
  }

  //Comparing institute_number and role in userInstituteRoles table
  const compareInstituteAndRole = await UserInstituteRole.findOne({
    where: {
      userId: user.id,
      instituteNumber,
      role: "teacher",
    },
  });

  if (!compareInstituteAndRole) {
    res.status(403).json({
      message:"You are not authorized as a teacher in this institute."
    });
    return
  }

  //Generate token if everything goes as per terms
  const token = jwt.sign(
    {
      id: user.id,
      teacherEmail: user.userEmail,
      instituteNumber,
      role: "teacher",
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  //Success response
  res.status(200).json({
    message: "Teacher login successful!",
    data: {
      token,
      instituteNumber,
      teacherEmail,
    },
  });

};

export default teacherLogin;