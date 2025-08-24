import express, { Router } from "express"
import asyncErrorHandler from "../../../../services/asyncErrorHandler"
import { createChapterLesson, deleteLesson, editChapterLesson, fetchChapterLesson } from "../../../../controllers/teacher/course/lesson/lesson-controller"
import upload from "../../../../middleware/multerUpload"
import { accessTo, isLoggedIn, Role } from "../../../../middleware/middleware"

const route:Router=express.Router()

route.route("/course/lesson").post(isLoggedIn,
  accessTo(Role.Teacher),
  upload.fields([
  { name: 'lessonThumbnail', maxCount: 1 },
  { name: 'lessonVideo', maxCount: 1 }
]),asyncErrorHandler(createChapterLesson)
)

route.route("/course/lesson/:id").patch(isLoggedIn,
  accessTo(Role.Teacher),
  upload.fields([
  { name: 'lessonThumbnail', maxCount: 1 },
  { name: 'lessonVideo', maxCount: 1 }
])
,asyncErrorHandler(editChapterLesson)
)

route.route("/course/:chapterId/lesson").get(isLoggedIn,
  accessTo(Role.Teacher),
  asyncErrorHandler(fetchChapterLesson)
)


route.route("/course/lesson/:id").delete(isLoggedIn,
  accessTo(Role.Teacher),
  asyncErrorHandler(deleteLesson)
)

export default route