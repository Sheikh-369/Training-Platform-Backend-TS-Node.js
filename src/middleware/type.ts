// import { Request } from "express";



// export interface IExtendedRequest extends Request{
//        user ?: {
//        id : string,
//        userEmail ?: string, 
//        role? : string, 
//        userName ?: string | null,
//        currentInstituteNumber?:string | number
//        instituteNumber ?: number | string
//        }, 
//        instituteNumber?: string;
      
// }

//change2
// import { Request } from "express";

// export interface IExtendedRequest extends Request {
//   user?: {
//     id: string;
//     userEmail?: string;
//     role?: string;
//     userName?: string | null;
//     currentInstituteNumber?: string | number;
//     instituteNumber?: string | number;
//   };
//   instituteNumber?: string;  // You may also keep this here if needed separately
// }

//change3
import { Request } from "express";
import { Role } from "../types/role";

export interface IExtendedRequest extends Request {
  user?: {
    id: string;
    userEmail?: string;
    role?: string; // optional if still used
    userName?: string | null;
    currentInstituteNumber?: string | number;
    instituteNumber?: string | number;
    roles?: Role[];
  };
  instituteNumber?: string;  // if you want to keep it here
}
