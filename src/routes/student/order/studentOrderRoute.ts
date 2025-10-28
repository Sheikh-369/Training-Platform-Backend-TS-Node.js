import express, { Router } from "express"
import { accessTo, changeUserIdForTableName, isLoggedIn } from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import {  createStudentOrder, esewaPaymentVerification, khaltiPaymentVerification } from "../../../controllers/student/order/student-order-controller"
import { Role } from "../../../types/role"

const router:Router=express.Router()

router.route("/:instituteId/order/:courseId").post(
    // changeUserIdForTableName,
    // accessTo(Role.Student),
    asyncErrorHandler(createStudentOrder)
)

router.route("/verify-khalti-payment").post(
    // isLoggedIn,
    // changeUserIdForTableName,
    // accessTo(Role.Student),
    asyncErrorHandler(khaltiPaymentVerification)
)

router.route("/verify-esewa-payment").post(
    // isLoggedIn,
    // changeUserIdForTableName,
    // accessTo(Role.Student),
    asyncErrorHandler(esewaPaymentVerification)
)

export default router