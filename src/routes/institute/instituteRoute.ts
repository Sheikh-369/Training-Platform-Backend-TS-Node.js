import express, { Router } from "express"
import isLoggedIn from "../../middleware/middleware"
import { createCategoryTable, createChapterLessonTable, createCourseChapterTable, createCourseTable, createInstitute, createStudentTable, createTeacherTable } from "../../controllers/institute/instituteController"
import asyncErrorHandler from "../../services/asyncErrorHandler"
const router:Router=express.Router()

router.route("/institute").post(isLoggedIn,
    asyncErrorHandler(createInstitute),asyncErrorHandler(createTeacherTable),
    asyncErrorHandler(createCourseChapterTable),
    asyncErrorHandler(createChapterLessonTable),
    asyncErrorHandler(createStudentTable),
    asyncErrorHandler(createCategoryTable),
    asyncErrorHandler(createCourseTable))

export default router