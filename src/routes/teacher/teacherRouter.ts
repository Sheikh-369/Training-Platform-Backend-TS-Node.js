import express, { Router } from "express"
import teacherLogin from "../../controllers/teacher/teacherController"
import asyncErrorHandler from "../../services/asyncErrorHandler"

const router:Router=express.Router()

router.route("/login").post(asyncErrorHandler(teacherLogin))

export default router