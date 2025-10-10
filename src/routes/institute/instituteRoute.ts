import express, { Router } from "express"
import { createCategoryTable, createChapterLessonTable, createCourseChapterTable, createCourseTable, createInstitute, createStudentTable, createTeacherTable, fetchSingleInstitute } from "../../controllers/institute/instituteController"
import asyncErrorHandler from "../../services/asyncErrorHandler"
import { isLoggedIn } from "../../middleware/middleware"
import upload from "../../middleware/multerUpload"
const router:Router=express.Router()

router.route("/institute").post(isLoggedIn,
    upload.single("instituteImage"),
    asyncErrorHandler(createInstitute),
    asyncErrorHandler(createTeacherTable),
    asyncErrorHandler(createCourseChapterTable),
    asyncErrorHandler(createChapterLessonTable),
    asyncErrorHandler(createStudentTable),
    asyncErrorHandler(createCategoryTable),
    asyncErrorHandler(createCourseTable))

router.route("/institute").get(
    isLoggedIn,
    asyncErrorHandler(fetchSingleInstitute)
)

export default router