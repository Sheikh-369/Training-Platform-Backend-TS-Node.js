import express from "express"
import cors from "cors"
const app=express()

import authRoute from "./routes/global/auth/authRoute"
import teachingRoute from "./routes/institute/instituteRoute"
import teacherRoute from "./routes/institute/teacher/teacherRoute"
import courseRoute from "./routes/institute/course/courseRoute"
import studentRoute from "./routes/institute/student/studentRoute"
import categoryRoute from "./routes/institute/category/categoryRoute"
import teacherRoutePrivate from "./routes/teacher/teacherRouter"
import chapterRoute from "./routes/teacher/course/chapter/chapterRoute"
import lessonRoute from "./routes/teacher/course/lesson/lesson-route"
import studentInstituteRoute from "./routes/student/institute-course/studentInstituteRoute"
import studentCartRoute from "./routes/student/cart/studentCartRoute"
import studentOrderRoute from "./routes/student/order/studentOrderRoute"
import userInstituteRole from "./routes/user-institute-role-route/user-institute-role-route"
app.use(express.json())

app.use(cors({
    origin:"*"
}))
//global auth
app.use("/teaching/auth",authRoute)

//institute
app.use("/teaching",teachingRoute)
app.use("/teaching/institute",teacherRoute)
app.use("/teaching/institute",courseRoute)
app.use("/teaching/institute",studentRoute)
app.use("/teaching/institute",categoryRoute)

//solo teacher
app.use("/teaching/teacher",teacherRoutePrivate)
app.use("/teaching/teacher",chapterRoute)
app.use("/teaching/teacher",lessonRoute)

//solo student
app.use("/teaching/student",studentInstituteRoute)
app.use("/teaching/student",studentCartRoute)
app.use("/teaching/student",studentOrderRoute)

//user-institutes-role
app.use("/teaching",userInstituteRole)

export default app