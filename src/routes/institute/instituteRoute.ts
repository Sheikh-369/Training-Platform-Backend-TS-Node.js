import express, { Router } from "express"
import isLoggedIn from "../../middleware/middleware"
import { createCourseTable, createInstitute, createStudentTable, createTeacherTable } from "../../controllers/institute/instituteController"
import asyncErrorHandler from "../../services/asyncErrorHandler"
const router:Router=express.Router()

router.route("/institute").post(isLoggedIn,createInstitute,asyncErrorHandler(createTeacherTable),createStudentTable,asyncErrorHandler(createCourseTable))

export default router