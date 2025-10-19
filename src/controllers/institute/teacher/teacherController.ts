import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import randomPasswordGenerator from "../../../services/randomPasswordGenerator";
import sendMail from "../../../services/sendMail";
import User from "../../../database/models/userModel";
import UserInstituteRole from "../../../database/models/userInstituteRoleModel";

// const createTeacher = async (req: IExtendedRequest, res: Response) => {
//   const instituteNumber = req.user?.currentInstituteNumber;
//   const {
//     teacherName,
//     teacherEmail,
//     teacherPhoneNumber,
//     teacherExpertise,
//     teacherJoinDate,
//     teacherSalary,
//     teacherAddress,
//     aboutTeacher
//   } = req.body;

//   const teacherImage = req.file ? req.file.path : null;

//   //Input Validation
//   if (!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !teacherJoinDate || !teacherSalary || !teacherAddress) {
//     res.status(400).json({
//       message: "Please fill all the fields!"
//     });
//     return;
//   }

//   //Checking if teacher already exists in this institute
//   const existingTeacher = await sequelize.query(
//     `SELECT * FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
//     {
//       type: QueryTypes.SELECT,
//       replacements: [teacherEmail]
//     }
//   );

//   if (existingTeacher.length > 0) {
//     res.status(400).json({
//       message: "This teacher is already assigned to this institute."
//     });
//     return;
//   }

//   //Generate password
//   const passwordData = randomPasswordGenerator(teacherName);
//   const plainPassword = passwordData.plainVersion;

//   // Fetching institute name for userinstituterole and teacherInstituteName field
//   const result = await sequelize.query(
//     `SELECT instituteName,instituteAddress,instituteImage FROM institute_${instituteNumber} WHERE instituteNumber=?`,
//     {
//       type: QueryTypes.SELECT,
//       replacements: [instituteNumber],
//     }
//   ) as { instituteName: string }[];

//   const teacherInstituteName = result[0]?.instituteName || "";

//   //checking if user exists as a student with that email
//   const existingUser = await User.findOne({
//     where: {
//       userEmail: teacherEmail,
//     },
//   });

//   if (existingUser) {
//     if (existingUser.role === "student") {
//       await User.update(
//         {
//           role: "teacher",
//           instituteNumber: instituteNumber
//         },
//         {
//           where: {
//             userEmail: teacherEmail,
//           },
//         }
//       );
//     }

//     // Directly insert into userInstituteRole (no existence check)
//     await UserInstituteRole.create({
//       userId: existingUser.id,
//       instituteNumber,
//       role: "teacher"
//     });

//   } else {
//     //Create new user
//     const newUser = await User.create({
//       userName: teacherName,
//       userEmail: teacherEmail,
//       userPassword: passwordData.hashedVersion
//     });

//     // Store teacher's info in userInstituteRole table
//     await UserInstituteRole.create({
//       userId: newUser.id,
//       instituteNumber,
//       role: "teacher"
//     });
//   }




//   // Finally, insert into institute-specific teacher table
//   await sequelize.query(
//     `INSERT INTO teacher_${instituteNumber}(teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherJoinDate,teacherImage,teacherSalary,teacherAddress,instituteNumber,teacherInstituteName,teacherPassword,aboutTeacher
//     ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`, {
//     type: QueryTypes.INSERT,
//     replacements: [
//       teacherName,
//       teacherEmail,
//       teacherPhoneNumber,
//       teacherExpertise,
//       teacherJoinDate,
//       teacherImage,
//       teacherSalary,
//       teacherAddress,
//       instituteNumber,
//       teacherInstituteName,
//       passwordData.hashedVersion,
//       aboutTeacher || "Hi, I am new here!"
//     ]
//   });

//   // Sending Email to the teacher informing he is assigned and providing his password too
//   const mailInformation = {
//     to: teacherEmail,
//     subject: "You are Welcome to ABC Language Center.",
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <h2 style="color: #2E86C1;">Welcome to ABC Language Center, ${teacherName}!</h2>
//         <p>We’re excited to have you join our team of passionate educators.</p>
//         <p>Here are your login details:</p>
//         <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
//           <li><strong>Email:</strong> ${teacherEmail}</li>
//           <li><strong>Institute Number:</strong> ${instituteNumber}</li>
//           <li><strong>Password:</strong> ${plainPassword}</li>
//         </ul>
//         <p>You can now log in to your account and start managing your classes.</p>
//         <p>If you have any questions or need support, feel free to reach out to our admin team.</p>
//         <br />
//         <p>Best regards,</p>
//         <p><strong>ABC Language Center</strong></p>
//       </div>
//     `
//   };

//   await sendMail(mailInformation);

//   //Final Success response
//   return res.status(200).json({
//     message: "Teacher created successfully!",
//     instituteNumber
//   });
// };

const createTeacher = async (req: IExtendedRequest, res: Response) => {
  // const instituteNumber = req.user?.currentInstituteNumber;
  // const instituteNumber=req.user?.instituteNumber
  const instituteNumber = req.params.instituteNumber;
  if (!instituteNumber) {
    return res.status(400).json({ message: "Institute number not found in user context." });
  }

  const {
    teacherName,
    teacherEmail,
    teacherPhoneNumber,
    teacherExpertise,
    teacherJoinDate,
    teacherSalary,
    teacherAddress,
    aboutTeacher
  } = req.body;

  const teacherImage = req.file ? req.file.path : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // Input validation
  if (
    !teacherName ||
    !teacherEmail ||
    !teacherPhoneNumber ||
    !teacherExpertise ||
    !teacherJoinDate ||
    !teacherSalary ||
    !teacherAddress
  ) {
    return res.status(400).json({
      message: "Please fill all the fields!"
    });
  }

  // Check if already assigned in this institute
  const existingTeacher = await sequelize.query(
    `SELECT * FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [teacherEmail]
    }
  );

  if (existingTeacher.length > 0) {
    return res.status(400).json({
      message: "This teacher is already assigned to this institute."
    });
  }

  // Get institute metadata
  const [instituteMeta] = await sequelize.query(
    `SELECT instituteName, instituteAddress, instituteImage 
     FROM institute_${instituteNumber} 
     WHERE instituteNumber = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [instituteNumber]
    }
  ) as {
    instituteName: string;
    instituteAddress: string;
    instituteImage: string;
  }[];

  const teacherInstituteName = instituteMeta?.instituteName || "";
  const instituteAddress = instituteMeta?.instituteAddress || "";
  const instituteImage = instituteMeta?.instituteImage || "";

  // Global user check or create
  const existingUser = await User.findOne({
    where: {
      userEmail: teacherEmail,
    },
  });

  let userId: string;
  let plainPassword: string | null = null;
  let hashedPassword: string;

  if (existingUser) {
    userId = existingUser.id;
    hashedPassword = existingUser.userPassword;
  } else {
    // New user creation
    const passwordData = randomPasswordGenerator(teacherName);
    plainPassword = passwordData.plainVersion;
    hashedPassword = passwordData.hashedVersion;

    const newUser = await User.create({
      userName: teacherName,
      userEmail: teacherEmail,
      userPassword: hashedPassword
    });

    userId = newUser.id;
  }

  // Insert into UserInstituteRole
  await UserInstituteRole.create({
    userId,
    instituteNumber,
    role: "teacher",
    instituteName: teacherInstituteName,
    instituteAddress,
    instituteImage
  });

  // Insert into teacher_{instituteNumber} table
  await sequelize.query(
    `INSERT INTO teacher_${instituteNumber}(
      teacherName,
      teacherEmail,
      teacherPhoneNumber,
      teacherExpertise,
      teacherJoinDate,
      teacherImage,
      teacherSalary,
      teacherAddress,
      instituteNumber,
      teacherInstituteName,
      teacherInstituteAddress,
      teacherInstituteImage,
      aboutTeacher
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
    {
      type: QueryTypes.INSERT,
      replacements: [
        teacherName,
        teacherEmail,
        teacherPhoneNumber,
        teacherExpertise,
        teacherJoinDate,
        teacherImage,
        teacherSalary,
        teacherAddress,
        instituteNumber,
        teacherInstituteName,
        instituteAddress,
        instituteImage,
        aboutTeacher || "Hi, I am new here!"
      ]
    }
  );

  // Email the user (new or existing)
  if (plainPassword) {
    // New user → send credentials
    const mailInformation = {
      to: teacherEmail,
      subject: `You're added to ${teacherInstituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Welcome to ${teacherInstituteName}, ${teacherName}!</h2>
          <p>You’ve been added as a <strong>teacher</strong>.</p>
          <p>Here are your login credentials:</p>
          <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
            <li><strong>Email:</strong> ${teacherEmail}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
          </ul>
          <p>Use these to log in to your account and get started.</p>
          <br />
          <p>Welcome aboard!</p>
          <p><strong>${teacherInstituteName}</strong></p>
        </div>
      `
    };

    await sendMail(mailInformation);
  } else {
    // Existing user → notify they’ve been added to a new institute
    const mailInformation = {
      to: teacherEmail,
      subject: `You've been added to ${teacherInstituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Hello ${teacherName},</h2>
          <p>You’ve been added as a <strong>teacher</strong> in <strong>${teacherInstituteName}</strong>.</p>
          <p>You can now access this institute using your existing login credentials.</p>
          <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
            <li><strong>Email:</strong> ${teacherEmail}</li>
            <li><strong>Institute:</strong> ${teacherInstituteName}</li>
          </ul>
          <p>If you forgot your password, you can reset it from the login page.</p>
          <br />
          <p>See you inside!</p>
          <p><strong>${teacherInstituteName}</strong></p>
        </div>
      `
    };

    await sendMail(mailInformation);
  }

  return res.status(200).json({
    message: "Teacher created successfully!",
    instituteNumber
  });
};


const getAllTeachers=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber;
    console.log(instituteNumber)
    const teachers=await sequelize.query(`SELECT * FROM teacher_${instituteNumber}`,{
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"All teachers fetched successfully!",
        data:teachers
    })
}

const getSingleTeacher=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber

    const teacherId=req.params.id
    console.log('Fetching teacher:', { teacherId, instituteNumber });
    const teacher=await sequelize.query(`SELECT * FROM teacher_${instituteNumber} WHERE id=? AND instituteNumber=?`,{
        replacements:[teacherId,instituteNumber],
        type:QueryTypes.SELECT
    })
    res.status(200).json({
        message:"Single teacher fetched successfully!",
        data:teacher
    })
}

// const getSingleTeacher = async (req: IExtendedRequest, res: Response) => {
//   const userId = req.user?.id;
//   const instituteNumber = req.user?.instituteNumber;

//   console.log("Resolved instituteNumber:", instituteNumber);

//   if (!instituteNumber || !userId) {
//     return res.status(403).json({ message: "Unauthorized — missing user or institute info" });
//   }

//   // Validate table name safety
//   if (!/^[a-zA-Z0-9_]+$/.test(String(instituteNumber))) {
//     return res.status(400).json({ message: "Invalid institute number format." });
//   }

//   const [teacher] = await sequelize.query(
//     `SELECT * FROM teacher_${instituteNumber} WHERE instituteNumber = ? AND userId = ?`,
//     {
//       replacements: [instituteNumber, userId],
//       type: QueryTypes.SELECT,
//     }
//   );

//   if (!teacher) {
//     return res.status(404).json({ message: "Teacher not found." });
//   }

//   res.status(200).json({
//     message: "Teacher fetched successfully",
//     data: teacher,
//   });
// };



const deleteTeacher=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    const instituteNumber = req.params.instituteNumber;
    const teacherId=req.params.id
    await sequelize.query(`DELETE FROM teacher_${instituteNumber} WHERE id=?`,{
        type:QueryTypes.DELETE,
        replacements:[teacherId]
    })
    res.status(200).json({
        message:"Teacher Deleted Successfully!"
    })
}

const updateTeacher=async(req:IExtendedRequest,res:Response)=>{
    // const instituteNumber=req.user?.currentInstituteNumber
    // const id=req.params.id
    const { instituteNumber, id } = req.params;
    const {teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherAddress,aboutTeacher}=req.body

    // const teacherImage=req.file?req.file.path:null
    const teacherImage = req.file?.path || req.body.teacherImage || null;


    if(!teacherName || !teacherEmail || !teacherPhoneNumber || !teacherExpertise || !teacherAddress || !aboutTeacher){
        res.status(400).json({
            message:"Please fill all the fields!"
        })
        return
    }

    await sequelize.query(`UPDATE teacher_${instituteNumber} SET teacherName=?,teacherEmail=?,teacherPhoneNumber=?,teacherExpertise=?,teacherImage=?,teacherAddress=?,aboutTeacher=? WHERE id=? AND instituteNumber=?`,{
        type:QueryTypes.UPDATE,
        replacements:[teacherName,teacherEmail,teacherPhoneNumber,teacherExpertise,teacherImage,teacherAddress,aboutTeacher,id,instituteNumber]
    })
    res.status(200).json({
        message:"Teacher Updated Successfully!"
    })
}

export {createTeacher,getAllTeachers,getSingleTeacher,deleteTeacher,updateTeacher}