import { Request } from "express";



export interface IExtendedRequest extends Request{
       user ?: {
       id : string,
       userEmail : string, 
       role : string, 
       userName : string | null,
       currentInstituteNumber:string | number
       }, 
       // instituteNumber ?: number | string
       
      
}