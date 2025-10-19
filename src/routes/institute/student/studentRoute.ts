import express, { Router } from "express"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createStudent, deleteStudent, getAllStudents, getSingleStudent, updateStudent } from "../../../controllers/institute/student/studentController"
import upload from "../../../middleware/multerUpload"
import { accessTo, isLoggedIn } from "../../../middleware/middleware"
import { Role } from "../../../types/role"

const router:Router=express.Router()

router.route("/:instituteNumber/student").post(
    isLoggedIn,
    accessTo(Role.Institute),
    upload.single("studentImage"),
    asyncErrorHandler(createStudent))

router.route("/:instituteNumber/student").get(
    isLoggedIn,
    accessTo(Role.Institute,Role.Teacher),
    asyncErrorHandler(getAllStudents))

router.route("/:instituteNumber/student").get(isLoggedIn,
    asyncErrorHandler(getSingleStudent))

router.route("/:instituteNumber/student/:id").delete(
    isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(deleteStudent))

router.route("/:instituteNumber/student").patch(isLoggedIn,
    accessTo(Role.Institute,Role.Student),
    upload.single("studentImage"),
    asyncErrorHandler(updateStudent))

export default router