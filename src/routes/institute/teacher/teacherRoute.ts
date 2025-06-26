import express, { Router } from "express"
import { createTeacher, deleteTeacher, getAllTeachers, getSingleTeacher } from "../../../controllers/institute/teacher/teacherController"
import isLoggedIn from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"

const router:Router=express.Router()

router.route("/teacher").post(isLoggedIn,asyncErrorHandler(createTeacher))
router.route("/teacher").get(isLoggedIn,asyncErrorHandler(getAllTeachers))
router.route("/teacher/:id").get(isLoggedIn,asyncErrorHandler(getSingleTeacher))
router.route("/teacher/:id").delete(isLoggedIn,asyncErrorHandler(deleteTeacher))

export default router