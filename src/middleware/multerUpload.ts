import multer from "multer";
import {storage} from "../services/cloudinaryConfig"
import { Request } from "express";

const upload=multer({storage:storage,
    fileFilter:(req:Request,file:Express.Multer.File,cb)=>{
        const allowedFileTypes=['image/jpeg', 'image/png', 'video/mp4']
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG images and MP4 videos are allowed'));
        }
        
    },
    limits: { fileSize: 50 * 1024 * 1024 }
})

export default upload