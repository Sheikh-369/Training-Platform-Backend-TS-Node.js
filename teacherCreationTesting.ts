// import { Response } from "express";
// import { QueryTypes } from "sequelize";
// import { IExtendedRequest } from "./src/middleware/type";
// import User from "./src/database/models/userModel";
// import UserInstituteRole from "./src/database/models/userInstituteRoleModel";
// import randomPasswordGenerator from "./src/services/randomPasswordGenerator";
// import sequelize from "./src/database/connection";
// import sendMail from "./src/services/sendMail";

// const createTeacher = async (req: IExtendedRequest, res: Response) => {
//   const instituteNumber = req.user?.currentInstituteNumber;

//   const {
//     teacherName,
//     teacherEmail,
//     teacherPhoneNumber,
//     teacherExpertise,
//     teacherJoinDate,
//     teacherSalary
//   } = req.body;

//   const teacherImage = req.file ? req.file.path : null;

//   // ✅ 1. Validate input
//   if (
//     !teacherName ||
//     !teacherEmail ||
//     !teacherPhoneNumber ||
//     !teacherExpertise ||
//     !teacherJoinDate ||
//     !teacherSalary
//   ) {
//     return res.status(400).json({
//       message: "Please fill all the fields!"
//     });
//   }

//   // ✅ 2. Check if teacher already exists in this institute
//   const existingTeacher = await sequelize.query(
//     `SELECT * FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
//     {
//       type: QueryTypes.SELECT,
//       replacements: [teacherEmail]
//     }
//   );

//   if (existingTeacher.length > 0) {
//     return res.status(400).json({
//       message: "This teacher is already assigned to this institute."
//     });
//   }

//   // ✅ 3. Generate password
//   const passwordData = randomPasswordGenerator(teacherName);
//   const plainPassword = passwordData.plainVersion;

//   // ✅ 4. Create new user
//   const newUser = await User.create({
//     userName: teacherName,
//     userEmail: teacherEmail,
//     userPassword: passwordData.hashedVersion,
//     role: "teacher",
//     currentInstituteNumber: instituteNumber
//   });

//   // ✅ 5. Create mapping in UserInstituteRole
//   await UserInstituteRole.create({
//     userId: newUser.id,
//     instituteNumber,
//     role: "teacher"
//   });

//   // ✅ 6. Insert into institute-specific teacher table
//   await sequelize.query(
//     `INSERT INTO teacher_${instituteNumber}(
//       teacherName,
//       teacherEmail,
//       teacherPhoneNumber,
//       teacherExpertise,
//       teacherJoinDate,
//       teacherImage,
//       teacherSalary,
//       teacherPassword
//     ) VALUES(?,?,?,?,?,?,?,?)`,
//     {
//       type: QueryTypes.INSERT,
//       replacements: [
//         teacherName,
//         teacherEmail,
//         teacherPhoneNumber,
//         teacherExpertise,
//         teacherJoinDate,
//         teacherImage,
//         teacherSalary,
//         passwordData.hashedVersion
//       ]
//     }
//   );

//   // ✅ 7. Send email with credentials
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

//   // ✅ 8. Final response
//   return res.status(200).json({
//     message: "Teacher created successfully!",
//     instituteNumber
//   });
// };

// export default createTeacher;




// import { Table, Model, Column, DataType, ForeignKey, Unique } from "sequelize-typescript";
// import User from "./userModel";

// @Table({
//   tableName: "UserInstituteRoles",
//   timestamps: true
// })
// @Unique("user_institute_role_unique", ["userId", "instituteNumber", "role"])
// class UserInstituteRole extends Model {
//   @Column({
//     type: DataType.UUID,
//     defaultValue: DataType.UUIDV4,
//     primaryKey: true
//   })
//   declare id: string;

//   @ForeignKey(() => User)
//   @Column({
//     type: DataType.UUID,
//     allowNull: false
//   })
//   declare userId: string;

//   @Column({
//     type: DataType.STRING,
//     allowNull: false
//   })
//   declare instituteNumber: string;

//   @Column({
//     type: DataType.ENUM("teacher", "student", "admin", "super-admin"),
//     allowNull: false
//   })
//   declare role: string;
// }
// export default UserInstituteRole;




// import { Request, Response } from "express";
// import sequelize from "../../database/connection";
// import { QueryTypes } from "sequelize";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import User from "../../database/models/userModel";
// import UserInstituteRole from "../../database/models/userInstituteRoleModel";

// const teacherLogin = async (req: Request, res: Response) => {
//   const { teacherEmail, teacherPassword, instituteNumber } = req.body;

//   if (!teacherEmail || !teacherPassword || !instituteNumber) {
//     return res.status(400).json({
//       message: "Please fill all the fields!",
//     });
//   }

//   // ✅ 1. Check teacher record in teacher_<institute>
//   const result: any[] = await sequelize.query(
//     `SELECT * FROM teacher_${instituteNumber} WHERE teacherEmail = ?`,
//     {
//       type: QueryTypes.SELECT,
//       replacements: [teacherEmail],
//     }
//   );

//   const teacher = result[0];

//   if (!teacher) {
//     return res.status(400).json({
//       message: "Invalid credentials! (teacher not found)",
//     });
//   }

//   // ✅ 2. Compare passwords (institute-specific password)
//   const isPasswordMatch = bcrypt.compareSync(
//     teacherPassword,
//     teacher.teacherPassword
//   );

//   if (!isPasswordMatch) {
//     return res.status(401).json({
//       message: "Invalid credentials! (wrong password)",
//     });
//   }

//   // ✅ 3. Get user data (no role filter)
//   const user = await User.findOne({
//     where: {
//       userEmail: teacherEmail,
//     },
//   });

//   if (!user) {
//     return res.status(404).json({
//       message: "User not found in users table!",
//     });
//   }

//   // ✅ 4. Ensure role mapping exists
//   const roleMapping = await UserInstituteRole.findOne({
//     where: {
//       userId: user.id,
//       instituteNumber,
//       role: "teacher",
//     },
//   });

//   if (!roleMapping) {
//     return res.status(403).json({
//       message:
//         "You are not authorized as a teacher in this institute.",
//     });
//   }

//   // ✅ 5. Generate token
//   const token = jwt.sign(
//     {
//       id: user.id,
//       teacherEmail: user.userEmail,
//       instituteNumber,
//       role: "teacher",
//     },
//     process.env.JWT_SECRET!,
//     { expiresIn: "1d" }
//   );

//   // ✅ 6. Success response
//   return res.status(200).json({
//     message: "Teacher login successful!",
//     data: {
//       token,
//       instituteNumber,
//       teacherEmail,
//     },
//   });
// };

// export default teacherLogin;

