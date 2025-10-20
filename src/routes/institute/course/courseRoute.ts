import express, { Router } from "express"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createCourse, deleteCourse, getAllCourses, getSingleCourse, updateCourse } from "../../../controllers/institute/course/courseController"
import upload from "../../../middleware/multerUpload"
import { accessTo, isLoggedIn } from "../../../middleware/middleware"
import { Role } from "../../../types/role"

const router:Router=express.Router()

router.route("/:instituteNumber/course").post(
    isLoggedIn,
    accessTo(Role.Institute),
    upload.single("courseThumbnail"),
    asyncErrorHandler(createCourse))

router.route("/:instituteNumber/course").get(
    isLoggedIn,
    asyncErrorHandler(getAllCourses))

//for institute dashboard
router.route("/:instituteNumber/course").get(
    isLoggedIn,
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