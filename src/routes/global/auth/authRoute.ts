import express from "express"
import AuthController from "../../../controllers/global/auth/authController"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
const router=express.Router()

router.route("/register").post(asyncErrorHandler(AuthController.registerUser))
router.route("/login").post(asyncErrorHandler(AuthController.loginUser))
router.route("/forgot-password").post(asyncErrorHandler(AuthController.forgotPassword))
router.route("/reset-password").post(asyncErrorHandler(AuthController.resetPassword))

export default router