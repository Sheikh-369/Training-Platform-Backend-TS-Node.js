import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API,
    api_secret:process.env.CLOUDINARY_SECRET
})

const storage=new CloudinaryStorage({
    cloudinary,
    params:async(req,file)=>({
        folder:"Teaching Platform"
    })
})

export {cloudinary,storage}