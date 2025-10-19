import express, { Router } from "express"
import { createTeacher, deleteTeacher, getAllTeachers, getSingleTeacher, updateTeacher } from "../../../controllers/institute/teacher/teacherController"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import upload from "../../../middleware/multerUpload"
import { accessTo, isLoggedIn } from "../../../middleware/middleware"
import { Role } from "../../../types/role"

const router:Router=express.Router()

router.route("/:instituteNumber/teacher").post(isLoggedIn,
    accessTo(Role.Institute),
    upload.single("teacherImage"),
    asyncErrorHandler(createTeacher))

router.route("/:instituteNumber/teacher").get(isLoggedIn,
    asyncErrorHandler(getAllTeachers))

router.route("/teacher").get(isLoggedIn,
    asyncErrorHandler(getSingleTeacher))

router.route("/:instituteNumber/teacher/:id").delete(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(deleteTeacher))

router.route("/teacher/:instituteNumber/:id").patch(isLoggedIn,
    accessTo(Role.Institute,Role.Teacher),
    upload.single("teacherImage"),
    asyncErrorHandler(updateTeacher))

export default router