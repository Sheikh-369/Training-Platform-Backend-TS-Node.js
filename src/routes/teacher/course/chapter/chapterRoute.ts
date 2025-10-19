import express, { Router } from "express"
import asyncErrorHandler from "../../../../services/asyncErrorHandler"
import { addChapterToCourse, deleteChapter, editChapter, fetchCourseChapters } from "../../../../controllers/teacher/course/chapter/chapterController"
import { accessTo, isLoggedIn } from "../../../../middleware/middleware"
import { Role } from "../../../../types/role"

const router:Router=express.Router()

router.route("/course/chapter").post(isLoggedIn,
    accessTo(Role.Teacher),
    asyncErrorHandler(addChapterToCourse))

router.route("/:courseId/chapter").get(isLoggedIn,
    asyncErrorHandler(fetchCourseChapters))

router.route("/course/chapter/:id").patch(isLoggedIn,
    accessTo(Role.Teacher),
    asyncErrorHandler(editChapter))

router.route("/course/chapter/:id").delete(isLoggedIn,
    accessTo(Role.Teacher),
    asyncErrorHandler(deleteChapter))

export default router