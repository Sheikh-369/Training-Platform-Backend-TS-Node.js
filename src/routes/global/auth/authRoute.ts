import express from "express"
import AuthController from "../../../controllers/global/auth/authController"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
const router=express.Router()

router.route("/register").post(AuthController.registerUser)
router.route("/login").post(AuthController.loginUser)
router.route("/forgot-password").post(asyncErrorHandler(AuthController.forgotPassword))

export default router