import express, { Router } from "express"
import { createCategoryTable, createChapterLessonTable, createCourseChapterTable, createCourseTable, createInstitute, createStudentTable, createTeacherTable, editInstituteInfo, fetchInstituteDetails, fetchSingleInstitute } from "../../controllers/institute/instituteController"
import asyncErrorHandler from "../../services/asyncErrorHandler"
import { accessTo, isLoggedIn, } from "../../middleware/middleware"
import upload from "../../middleware/multerUpload"
import { Role } from "../../types/role"
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

router.route("/institute-details/:instituteNumber").get(
    isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(fetchInstituteDetails)
)

router.route("/institute").patch(
    isLoggedIn,
    upload.single("instituteImage"),
    asyncErrorHandler(editInstituteInfo)
)

export default router