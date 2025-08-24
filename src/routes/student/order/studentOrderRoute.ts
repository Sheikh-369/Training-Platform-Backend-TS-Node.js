import express, { Router } from "express"
import { accessTo, changeUserIdForTableName, isLoggedIn, Role } from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createStudentCourseOrder, paymentVerification } from "../../../controllers/student/order/student-order-controller"

const router:Router=express.Router()

router.route("/order").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(createStudentCourseOrder)
)

router.route("/verify-payment").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(paymentVerification)
)

export default router