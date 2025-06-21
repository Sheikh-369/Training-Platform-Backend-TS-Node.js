import express from "express"
const app=express()
app.use(express.json())
import authRoute from "./routes/global/auth/authRoute"
import teachingRoute from "./routes/institute/instituteRoute"
app.use("/teaching",authRoute)
app.use("/teaching",teachingRoute)

export default app