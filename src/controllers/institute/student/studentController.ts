import { Response } from "express";
import { IExtendedRequest } from "../../../middleware/type";
import sequelize from "../../../database/connection";
import { QueryTypes } from "sequelize";
import User from "../../../database/models/userModel";
import randomPasswordGenerator from "../../../services/randomPasswordGenerator";
import UserInstituteRole from "../../../database/models/userInstituteRoleModel";
import sendMail from "../../../services/sendMail";


const createStudent = async (req: IExtendedRequest, res: Response) => {
  const instituteNumber = req.params.instituteNumber;

  if (!instituteNumber) {
    return res.status(400).json({ message: "Institute number is required." });
  }

  const {
    studentName,
    studentEmail,
    studentPhoneNo,
    studentAddress,
    enrolledDate,
    aboutStudent
  } = req.body;

  const studentImage = req.file?.path || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  if (!studentName || !studentEmail || !studentPhoneNo || !studentAddress || !enrolledDate) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  // Check if student already exists in this institute
  const existingStudent = await sequelize.query(
    `SELECT * FROM student_${instituteNumber} WHERE studentEmail = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [studentEmail]
    }
  );

  if (existingStudent.length > 0) {
    return res.status(400).json({ message: "This student is already assigned to this institute." });
  }

  // Get institute info
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

  const studentInstituteName = instituteMeta?.instituteName || "";
  const studentInstituteAddress = instituteMeta?.instituteAddress || "";
  const studentInstituteImage = instituteMeta?.instituteImage || "";

  // Handle global user
  const existingUser = await User.findOne({
    where: { userEmail: studentEmail }
  });

  let userId: string;
  let plainPassword: string | null = null;
  let hashedPassword: string;

  if (existingUser) {
    userId = existingUser.id;
    hashedPassword = existingUser.userPassword;
  } else {
    const passwordData = randomPasswordGenerator(studentName);
    plainPassword = passwordData.plainVersion;
    hashedPassword = passwordData.hashedVersion;

    const newUser = await User.create({
      userName: studentName,
      userEmail: studentEmail,
      userPassword: hashedPassword
    });

    userId = newUser.id;
  }

  // Add to UserInstituteRole
  await UserInstituteRole.create({
    userId,
    instituteNumber,
    role: "student",
    instituteName: studentInstituteName,
    instituteAddress: studentInstituteAddress,
    instituteImage: studentInstituteImage
  });

  // Add to student_${instituteNumber} table
  await sequelize.query(
    `INSERT INTO student_${instituteNumber} (
      studentName,
      studentEmail,
      studentPhoneNo,
      studentAddress,
      enrolledDate,
      studentImage,
      aboutStudent,
      studentInstituteName,
      studentInstituteAddress,
      studentInstituteImage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    {
      type: QueryTypes.INSERT,
      replacements: [
        studentName,
        studentEmail,
        studentPhoneNo,
        studentAddress,
        enrolledDate,
        studentImage,
        aboutStudent || "Hi, I am new here!",
        studentInstituteName,
        studentInstituteAddress,
        studentInstituteImage
      ]
    }
  );

  // Send welcome email
  if (plainPassword) {
    await sendMail({
      to: studentEmail,
      subject: `Welcome to ${studentInstituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Welcome to ${studentInstituteName}, ${studentName}!</h2>
          <p>You&#8217;ve been registered as a <strong>student</strong>.</p>
          <p>Here are your login credentials:</p>
          <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; list-style: none;">
            <li><strong>Email:</strong> ${studentEmail}</li>
            <li><strong>Password:</strong> ${plainPassword}</li>
          </ul>
          <p>You can now log in and start exploring the courses!</p>
          <p>If you need help, feel free to reach out to our support team.</p>
          <br />
          <p><strong>${studentInstituteName}</strong></p>
        </div>
      `
    });
  } else {
    await sendMail({
      to: studentEmail,
      subject: `You’ve been added to ${studentInstituteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Hello ${studentName},</h2>
          <p>You&#8217;ve been added as a <strong>student</strong> in <strong>${studentInstituteName}</strong>.</p>
          <p>You can now access your account using your existing login credentials.</p>
          <p>If you forgot your password, reset it from the login page.</p>
          <br />
          <p><strong>${studentInstituteName}</strong></p>
        </div>
      `
    });
  }

  return res.status(200).json({
    message: "Student created successfully!",
    instituteNumber
  });
};

const getAllStudents = async (req: IExtendedRequest, res: Response) => {
  const instituteNumber = req.params.instituteNumber;

  const students = await sequelize.query(
    `SELECT * FROM student_${instituteNumber} ORDER BY createdAt DESC`,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    message: "Students fetched successfully",
    students,
  });
};

// const getSingleStudent = async (req: IExtendedRequest, res: Response) => {
//   const { instituteNumber } = req.params;
//   const { studentEmail, studentId } = req.query;

//   if (!instituteNumber) {
//     res.status(400).json({ message: "Institute number is required." });
//     return;
//   }

//   if (!studentEmail && !studentId) {
//     res.status(400).json({ message: "Provide either studentEmail or studentId." });
//     return;
//   }

//   const query = `
//     SELECT 
//       id,
//       studentName,
//       studentEmail,
//       studentPhoneNo,
//       studentAddress,
//       enrolledDate,
//       studentImage,
//       aboutStudent,
//       studentInstituteName,
//       studentInstituteAddress,
//       studentInstituteImage,
//       createdAt,
//       updatedAt
//     FROM student_${instituteNumber}
//     WHERE ${studentEmail ? "studentEmail = ?" : "id = ?"}
//     LIMIT 1
//   `;

//   const replacements = [studentEmail || studentId];

//   const [student] = await sequelize.query(query, {
//     type: QueryTypes.SELECT,
//     replacements,
//   }) as any[];

//   if (!student) {
//     res.status(404).json({ message: "Student not found." });
//     return;
//   }

//   res.status(200).json({
//     message: "Student fetched successfully.",
//     student,
//   });
// };


// const deleteStudent=async(req:IExtendedRequest,res:Response)=>{
//     const instituteNumber=req.user?.currentInstituteNumber
//     const studentId=req.params.id
//     await sequelize.query(`DELETE FROM student_${instituteNumber} WHERE id=?`,{
//         type:QueryTypes.DELETE,
//         replacements:[studentId]
//     })
//     res.status(200).json({
//         message:"Student Deleted Successfully!",
//         instituteNumber
//     })
// }
const getSingleStudent = async (req: IExtendedRequest, res: Response) => {
  const { instituteNumber, id: studentId } = req.params;  // <-- get studentId from params
  const { studentEmail } = req.query;

  if (!instituteNumber) {
    res.status(400).json({ message: "Institute number is required." });
    return;
  }

  if (!studentEmail && !studentId) {
    res.status(400).json({ message: "Provide either studentEmail or studentId." });
    return;
  }

  const query = `
    SELECT 
      id,
      studentName,
      studentEmail,
      studentPhoneNo,
      studentAddress,
      enrolledDate,
      studentImage,
      aboutStudent,
      studentInstituteName,
      studentInstituteAddress,
      studentInstituteImage,
      createdAt,
      updatedAt
    FROM student_${instituteNumber}
    WHERE ${studentEmail ? "studentEmail = ?" : "id = ?"}
    LIMIT 1
  `;

  const replacements = [studentEmail || studentId];

  const [student] = await sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements,
  }) as any[];

  if (!student) {
    res.status(404).json({ message: "Student not found." });
    return;
  }

  res.status(200).json({
    message: "Student fetched successfully.",
    student,
  });
};

const deleteStudent = async (req: IExtendedRequest, res: Response) => {
  const { instituteNumber, id } = req.params;

  if (!instituteNumber || !id) {
    return res.status(400).json({ message: "Institute number and student ID are required." });
  }

  // Check if student exists
  const [existingStudent] = await sequelize.query(
    `SELECT * FROM student_${instituteNumber} WHERE id = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  ) as any[];

  if (!existingStudent) {
    return res.status(404).json({ message: "Student not found." });
  }

  // Delete student
  await sequelize.query(
    `DELETE FROM student_${instituteNumber} WHERE id = ?`,
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );

  return res.status(200).json({ message: "Student deleted successfully!" });
};

const updateStudent = async (req: IExtendedRequest, res: Response) => {
  const { instituteNumber} = req.params;
  const { id } = req.body; 
  const {
    studentName,
    studentEmail,
    studentPhoneNo,
    studentAddress,
    enrolledDate,
    aboutStudent,
  } = req.body;

  if (
    !studentName ||
    !studentEmail ||
    !studentPhoneNo ||
    !studentAddress ||
    !enrolledDate
  ) {
    res.status(400).json({ message: "Please fill all the fields!" });
    return;
  }

  // Get existing student
  const [existingStudent] = await sequelize.query(
    `SELECT * FROM student_${instituteNumber} WHERE id = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  ) as any[];

  if (!existingStudent) {
    return res.status(404).json({ message: "Student not found." });
  }

  const studentImage = req.file?.path || existingStudent.studentImage;
  const about = aboutStudent || existingStudent.aboutStudent || "Hi, I am new here!";

  await sequelize.query(
    `
    UPDATE student_${instituteNumber} 
    SET 
      studentName = ?, 
      studentEmail = ?, 
      studentPhoneNo = ?, 
      studentAddress = ?, 
      enrolledDate = ?, 
      aboutStudent = ?, 
      studentImage = ?
    WHERE id = ?
    `,
    {
      type: QueryTypes.UPDATE,
      replacements: [
        studentName,
        studentEmail,
        studentPhoneNo,
        studentAddress,
        enrolledDate,
        about,
        studentImage,
        id,
      ],
    }
  );

  res.status(200).json({ message: "Student updated successfully!" });
};

export {createStudent,getAllStudents,getSingleStudent,deleteStudent,updateStudent}