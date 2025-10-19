import { Response } from "express";
import { IExtendedRequest } from "../../middleware/type";
import UserInstituteRole from "../../database/models/userInstituteRoleModel";

export const fetchUserInstitutes = async (req: IExtendedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const institutes = await UserInstituteRole.findAll({
    where: { userId },
    attributes: [
      "instituteNumber",
      "instituteName",
      "instituteAddress",
      "instituteImage",
      "role"
    ]
  });

  res.status(200).json(institutes);
};

// export const fetchInstituteDetails = async (req: IExtendedRequest, res: Response) => {
//   const userId = req.user?.id;
//   const instituteNumber = req.params.instituteNumber as string;

//   // 🔒 Unauthorized if no user
//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   // ❗ Bad Request if no institute number
//   if (!instituteNumber) {
//     return res.status(400).json({ message: "Institute number is required" });
//   }

//   // 🔍 Look up institute
//   const institute = await UserInstituteRole.findOne({
//     where: { userId, instituteNumber },
//     attributes: [
//       "instituteNumber",
//       "instituteName",
//       "instituteAddress",
//       "instituteImage",
//       "instituteEmail",
//       "institutePhoneNumber",
//       "createdAt"
//     ]
//   });

//   // 🚫 Not Found or not linked
//   if (!institute) {
//     return res.status(404).json({
//       message: "Institute not found or not associated with this user"
//     });
//   }

//   // ✅ Success
//   return res.status(200).json({
//     message: "Institute details fetched successfully",
//     data: institute
//   });
// };
