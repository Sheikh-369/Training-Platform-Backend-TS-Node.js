import express, { Router } from "express"
import { isLoggedIn } from "../../middleware/middleware"
import asyncErrorHandler from "../../services/asyncErrorHandler"
import { fetchUserInstitutes } from "../../controllers/user-institute-role/user-institute-role-controller"

const router:Router=express.Router()

router.route("/user-institutes").get(
    isLoggedIn,
    asyncErrorHandler(fetchUserInstitutes)
)

export default router