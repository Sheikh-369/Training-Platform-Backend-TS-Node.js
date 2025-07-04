import express, { Router } from "express"
import isLoggedIn from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createStudent, deleteStudent, getAllStudents, getSingleStudent, updateStudent } from "../../../controllers/institute/student/studentController"
import upload from "../../../middleware/multerUpload"

const router:Router=express.Router()

router.route("/student").post(isLoggedIn,upload.single("studentImage"),asyncErrorHandler(createStudent))
router.route("/student").get(isLoggedIn,asyncErrorHandler(getAllStudents))
router.route("/student/:id").get(isLoggedIn,asyncErrorHandler(getSingleStudent))
router.route("/student/:id").delete(isLoggedIn,asyncErrorHandler(deleteStudent))
router.route("/student/:id").patch(isLoggedIn,upload.single("studentImage"),asyncErrorHandler(updateStudent))

export default router