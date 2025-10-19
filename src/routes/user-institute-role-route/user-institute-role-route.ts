import express, { Router } from "express"
import { accessTo, isLoggedIn} from "../../middleware/middleware"
import asyncErrorHandler from "../../services/asyncErrorHandler"
import {  fetchUserInstitutes } from "../../controllers/user-institute-role/user-institute-role-controller"
import { Role } from "../../types/role"

const router:Router=express.Router()

router.route("/user-institutes").get(
    isLoggedIn,
    asyncErrorHandler(fetchUserInstitutes)
)

// router.get(
//   "/institute-details/:instituteNumber",
//   isLoggedIn,
//   asyncErrorHandler(fetchUserInstitutes)
// );



export default router