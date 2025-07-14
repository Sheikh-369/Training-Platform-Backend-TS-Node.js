import express from "express"
const app=express()
app.use(express.json())

import authRoute from "./routes/global/auth/authRoute"
import teachingRoute from "./routes/institute/instituteRoute"
import teacherRoute from "./routes/institute/teacher/teacherRoute"
import courseRoute from "./routes/institute/course/courseRoute"
import studentRoute from "./routes/institute/student/studentRoute"
import categoryRoute from "./routes/institute/category/categoryRoute"
import teacherRoutePrivate from "./routes/teacher/teacherRouter"

app.use("/teaching",authRoute)
app.use("/teaching",teachingRoute)
app.use("/teaching/institute",teacherRoute)
app.use("/teaching/institute",courseRoute)
app.use("/teaching/institute",studentRoute)
app.use("/teaching/institute",categoryRoute)
app.use("/teaching/institute/teacher",teacherRoutePrivate)

export default app