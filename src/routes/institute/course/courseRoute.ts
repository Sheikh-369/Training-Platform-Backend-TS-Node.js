import express, { Router } from "express"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createCourse, deleteCourse, getAllCourses, getSingleCourse, updateCourse } from "../../../controllers/institute/course/courseController"
import upload from "../../../middleware/multerUpload"
import { accessTo, isLoggedIn, Role } from "../../../middleware/middleware"

const router:Router=express.Router()

router.route("/course").post(isLoggedIn,
    accessTo(Role.Institute),
    upload.single("courseThumbnail"),
    asyncErrorHandler(createCourse))

router.route("/course").get(isLoggedIn,
    asyncErrorHandler(getAllCourses))

router.route("/course/:id").get(isLoggedIn,
    asyncErrorHandler(getSingleCourse))

router.route("/course/:id").delete(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(deleteCourse))

router.route("/course/:id").patch(isLoggedIn,
    accessTo(Role.Institute),
    upload.single("courseThumbnail"),
    asyncErrorHandler(updateCourse))

export default router