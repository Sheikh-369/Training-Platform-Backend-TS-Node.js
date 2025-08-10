import express, { Router } from "express"
import teacherLogin from "../../controllers/teacher/teacherController"

const router:Router=express.Router()

router.route("/login").post(teacherLogin)

export default router