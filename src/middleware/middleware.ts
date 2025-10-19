import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import User from "../database/models/userModel";
import { IExtendedRequest } from "./type";
import UserInstituteRole from "../database/models/userInstituteRoleModel";
import { Role } from "../types/role";


// log in logic 
// const isLoggedIn=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
//     const token=req.headers.authorization

//     // if someone tries to create institute table without being logged in
//     if(!token){
//         res.status(401).json({
//             message:"Please provide token!"
//         })
//         return
//     }
//     jwt.verify(token,"Secret",async(error,success:any)=>{
//         // yadi token galat ayo vne
//         if(error){
//             res.status(403).json({
//                 message:"Invalid Token!"
//             })
//         }else{
//             // if id doesn't match
//             const userData = await User.findByPk(success.id)
           
//             if(!userData){
//                 res.status(403).json({
//                     message : "No user with that id, invalid token "
//                 })
//                 // if all fine
//             }else{

//                 req.user = userData
//                 next()//jumps to next step
//             }
//         }
//     })
// }

//change2
// const isLoggedIn=async (req:IExtendedRequest,res:Response,next:NextFunction)=>{
//     const token=req.headers.authorization

//     // if someone tries to create institute table without being logged in
//     if(!token){
//         res.status(401).json({
//             message:"Please provide token!"
//         })
//         return
//     }
//     console.log("Incoming token:", req.headers.authorization);

//     jwt.verify(token,"Secret",async(error,success:any)=>{
//         // yadi token galat ayo vne
//         if(error){
//             res.status(403).json({
//                 message:"Invalid Token!"
//             })
//         }else{
//             // if id doesn't match
//             const userData = await User.findByPk(success.id)
           
//             if(!userData){
//                 res.status(403).json({
//                     message : "No user with that id, invalid token "
//                 })
//                 // if all fine
//             }else{
//                 const userInstituteRoleData=await UserInstituteRole.findAll({
//                   where:{userId:userData.id}
//                 })
//                 if (userInstituteRoleData.length === 0) {
//                     res.status(403).json({
//                         message: "User has no associated institute roles.",
//                     });
//                     return;
//                 }
//                 req.user = {
//                     id: userData.id,
//                     instituteNumber: userInstituteRoleData[0].instituteNumber,
//                     role: userInstituteRoleData[0].role
//                 };

//                 next()//jumps to next step
//             }
//         }
//     })
// }

//change3
// const isLoggedIn = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
//     const token = req.headers.authorization;

//     if (!token) {
//         res.status(401).json({
//             message: "Please provide token!"
//         });
//         return;
//     }

//     jwt.verify(token, "Secret", async (error, success: any) => {
//         if (error) {
//             res.status(403).json({
//                 message: "Invalid Token!"
//             });
//         } else {
//             const userData = await User.findByPk(success.id);

//             if (!userData) {
//                 res.status(403).json({
//                     message: "No user with that ID. Invalid token."
//                 });
//                 return;
//             }

//             const userInstituteRoleData = await UserInstituteRole.findAll({
//                 where: { userId: userData.id }
//             });

//             if (userInstituteRoleData.length === 0) {
//                 res.status(403).json({
//                     message: "User has no associated institute roles.",
//                 });
//                 return;
//             }

//             // extract instituteNumber from the route param
//             const instituteNumber = req.params.instituteNumber;
//             console.log("Requested instituteNumber:", instituteNumber);
// console.log("UserInstituteRoleData:", userInstituteRoleData.map(r => ({ instituteNumber: r.instituteNumber, role: r.role })));
//             // filter roles for the specific institute
//             const rolesForInstitute = userInstituteRoleData
//                 .filter(role => role.instituteNumber === instituteNumber)
//                 .map(role => role.role as Role);

//             if (rolesForInstitute.length === 0) {
//                 res.status(403).json({
//                     message: "You are not associated with this institute.",
//                 });
//                 return;
//             }

//             req.user = {
//                 id: userData.id,
//                 instituteNumber: instituteNumber,
//                 roles: rolesForInstitute  // now storing array of roles
//             };

//             next();
//         }
//     });
// };

//change4
const isLoggedIn = async (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({
            message: "Please provide token!"
        });
        return;
    }

    jwt.verify(token, "Secret", async (error, success: any) => {
        if (error) {
            res.status(403).json({
                message: "Invalid Token!"
            });
            return;
        }

        const userData = await User.findByPk(success.id);

        if (!userData) {
            res.status(403).json({
                message: "No user with that ID. Invalid token."
            });
            return;
        }

        const userInstituteRoleData = await UserInstituteRole.findAll({
            where: { userId: userData.id }
        });

        if (userInstituteRoleData.length === 0) {
            res.status(403).json({
                message: "User has no associated institute roles.",
            });
            return;
        }

        const instituteNumber = req.params.instituteNumber;

        let rolesForInstitute: Role[];

        if (instituteNumber) {
            // institute-specific route
            rolesForInstitute = userInstituteRoleData
                .filter(role => String(role.instituteNumber).trim() === String(instituteNumber).trim())
                .map(role => role.role as Role);

            if (rolesForInstitute.length === 0) {
                return res.status(403).json({
                    message: "You are not associated with this institute.",
                });
            }
        } else {
            // global route — allow all roles
            rolesForInstitute = userInstituteRoleData.map(role => role.role as Role);
        }

        req.user = {
            id: userData.id,
            instituteNumber: instituteNumber, // will be undefined for global
            roles: rolesForInstitute
        };

        next();
    });
};



const changeUserIdForTableName = (req:IExtendedRequest,res:Response,next:NextFunction)=>{
    console.log(req.user,"Req user outside")
    if(req.user && req.user.id){
         const newUserId =  req.user.id.split("-").join("_") 
         req.user = {id:newUserId,role:req.user.role}
         console.log(req.user,"RequserId")
        //  console.log(req.user?.id.split("-").join("_") ,"data")
        next()
        }

}

// const accessTo=(...roles:Role[])=>{ 
//         return (req:IExtendedRequest,res:Response,next:NextFunction)=>{
//             const userRole = req.user?.role as Role
//            if(!roles.includes(userRole)){
//                 res.status(403).json({
//                     message : `As a ${userRole ?? "guest"}, you do not have access to this action.`
//                 })
//                 return
//             }
//             next()
//         }
//     }

//change2
const accessTo = (...allowedRoles: Role[]) => {
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
        const userRoles = req.user?.roles as Role[] || [];

        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (!hasAccess) {
            res.status(403).json({
                message: `As a ${userRoles.join(', ') || "guest"}, you do not have access to this action.`
            });
            return;
        }

        next();
    }
}




    
export {isLoggedIn,accessTo,changeUserIdForTableName}


