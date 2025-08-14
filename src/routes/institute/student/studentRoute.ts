import express, { Router } from "express"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createStudent, deleteStudent, getAllStudents, getSingleStudent, updateStudent } from "../../../controllers/institute/student/studentController"
import upload from "../../../middleware/multerUpload"
import { accessTo, isLoggedIn, Role } from "../../../middleware/middleware"

const router:Router=express.Router()

router.route("/student").post(isLoggedIn,
    accessTo(Role.Institute),
    upload.single("studentImage"),
    asyncErrorHandler(createStudent))

router.route("/student").get(isLoggedIn,
    asyncErrorHandler(getAllStudents))

router.route("/student/:id").get(isLoggedIn,
    asyncErrorHandler(getSingleStudent))

router.route("/student/:id").delete(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(deleteStudent))

router.route("/student/:id").patch(isLoggedIn,
    accessTo(Role.Institute),
    upload.single("studentImage"),
    asyncErrorHandler(updateStudent))

export default router