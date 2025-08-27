import express, { Router } from "express"
import { accessTo, changeUserIdForTableName, isLoggedIn, Role } from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { createStudentCourseOrder, esewaPaymentVerification, khaltiPaymentVerification } from "../../../controllers/student/order/student-order-controller"

const router:Router=express.Router()

router.route("/order").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(createStudentCourseOrder)
)

router.route("/verify-khalti-payment").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(khaltiPaymentVerification)
)

router.route("/verify-esewa-payment").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(esewaPaymentVerification)
)

export default router