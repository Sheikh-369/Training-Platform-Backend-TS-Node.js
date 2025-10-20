import express, { Router } from "express"
import { fetchInstitutes, instituteCourseDetailsForStudent, instituteCourseListForStudent } from "../../../controllers/student/institute-course/institute-course"
import asyncErrorHandler from "../../../services/asyncErrorHandler"

const router:Router=express.Router()

router.route("/institute").get(asyncErrorHandler(fetchInstitutes))
router.route("/:instituteId/course").get(asyncErrorHandler(instituteCourseListForStudent))

//for guest from home page
router.route("/:instituteId/course/:courseId").get(
    asyncErrorHandler(instituteCourseDetailsForStudent)
)

export default router