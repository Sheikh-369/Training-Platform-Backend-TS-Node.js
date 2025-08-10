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
app.use(express.json())

app.use(cors({
    origin:"*"
}))
//auth
app.use("/teaching/auth",authRoute)

//institute
app.use("/teaching",teachingRoute)
app.use("/teaching/institute",teacherRoute)
app.use("/teaching/institute",courseRoute)
app.use("/teaching/institute",studentRoute)
app.use("/teaching/institute",categoryRoute)

//teacher
app.use("/teaching/institute/teacher",teacherRoutePrivate)

export default app