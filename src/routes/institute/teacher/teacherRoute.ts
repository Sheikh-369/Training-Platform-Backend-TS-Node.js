import express, { Router } from "express"
import { createTeacher, deleteTeacher, getAllTeachers, getSingleTeacher, updateTeacher } from "../../../controllers/institute/teacher/teacherController"
import isLoggedIn from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import upload from "../../../middleware/multerUpload"

const router:Router=express.Router()

router.route("/teacher").post(isLoggedIn,upload.single("teacherImage"),asyncErrorHandler(createTeacher))
router.route("/teacher").get(isLoggedIn,asyncErrorHandler(getAllTeachers))
router.route("/teacher/:id").get(isLoggedIn,asyncErrorHandler(getSingleTeacher))
router.route("/teacher/:id").delete(isLoggedIn,asyncErrorHandler(deleteTeacher))
router.route("/teacher/:id").patch(isLoggedIn,upload.single("teacherImage"),asyncErrorHandler(updateTeacher))

export default router