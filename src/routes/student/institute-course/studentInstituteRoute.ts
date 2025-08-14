import express, { Router } from "express"
import { fetchInstitutes } from "../../../controllers/student/institute-course/institute-course"
import asyncErrorHandler from "../../../services/asyncErrorHandler"

const router:Router=express.Router()

router.route("/institute").get(asyncErrorHandler(fetchInstitutes))

export default router