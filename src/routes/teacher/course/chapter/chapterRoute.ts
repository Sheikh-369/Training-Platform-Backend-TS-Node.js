import express, { Router } from "express"
import asyncErrorHandler from "../../../../services/asyncErrorHandler"
import { addChapterToCourse, deleteChapter, editChapter, fetchCourseChapters } from "../../../../controllers/teacher/course/chapter/chapterController"
import isLoggedIn from "../../../../middleware/middleware"

const route:Router=express.Router()

route.route("/course/chapter").post(isLoggedIn,asyncErrorHandler(addChapterToCourse))
route.route("/course/chapter/:id").get(isLoggedIn,asyncErrorHandler(fetchCourseChapters))
route.route("/course/chapter/:id").patch(isLoggedIn,asyncErrorHandler(editChapter))
route.route("/course/chapter/:id").delete(isLoggedIn,asyncErrorHandler(deleteChapter))

export default route