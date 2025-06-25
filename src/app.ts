import express from "express"
const app=express()
app.use(express.json())

import authRoute from "./routes/global/auth/authRoute"
import teachingRoute from "./routes/institute/instituteRoute"
import teacherRoute from "./routes/institute/teacher/teacherRoute"

app.use("/teaching",authRoute)
app.use("/teaching",teachingRoute)
app.use("/teaching/institute",teacherRoute)

export default app