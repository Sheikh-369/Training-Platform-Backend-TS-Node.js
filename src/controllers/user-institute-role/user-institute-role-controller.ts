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
