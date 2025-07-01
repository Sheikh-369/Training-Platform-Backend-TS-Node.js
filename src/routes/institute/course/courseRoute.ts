import express, { Router } from "express"
import isLoggedIn from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createCourse, deleteCourse, getAllCourses, getSingleCourse } from "../../../controllers/institute/course/courseController"
import upload from "../../../middleware/multerUpload"

const router:Router=express.Router()

router.route("/course").post(isLoggedIn,upload.single("courseThumbnail"),asyncErrorHandler(createCourse))
router.route("/course").get(isLoggedIn,asyncErrorHandler(getAllCourses))
router.route("/course/:id").get(isLoggedIn,asyncErrorHandler(getSingleCourse))
router.route("/course/:id").delete(isLoggedIn,asyncErrorHandler(deleteCourse))

export default router