import express, { Router } from "express"
import { createTeacher } from "../../../controllers/institute/teacher/teacherController"
import isLoggedIn from "../../../middleware/middleware"
const router:Router=express.Router()

router.route("/teacher").post(isLoggedIn,createTeacher)

export default router