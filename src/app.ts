import express from "express"
const app=express()
app.use(express.json())
import authRoute from "./routes/global/auth/authRoute"
app.use("/teaching",authRoute)

export default app