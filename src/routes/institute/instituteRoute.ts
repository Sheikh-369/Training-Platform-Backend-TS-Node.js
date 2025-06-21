import express, { Router } from "express"
import isLoggedIn from "../../middleware/middleware"
import createInstitute from "../../controllers/institute/instituteController"
const router:Router=express.Router()

router.route("/institute").post(isLoggedIn,createInstitute)

export default router