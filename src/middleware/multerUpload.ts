import multer from "multer";
import {storage} from "../services/cloudinaryConfig"
const upload=multer({storage:storage})

export default upload