import express, { Router } from "express"
import app from "../../../app"
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "../../../controllers/institute/category/categoryController"
import isLoggedIn from "../../../middleware/middleware"
import asyncErrorHandler from "../../../services/asyncErrorHandler"

const router:Router=express.Router()

router.route("/category").post(isLoggedIn,asyncErrorHandler(createCategory))
router.route("/category").get(isLoggedIn,asyncErrorHandler(getAllCategories))
router.route("/category/:id").get(isLoggedIn,asyncErrorHandler(getSingleCategory))
router.route("/category/:id").delete(isLoggedIn,asyncErrorHandler(deleteCategory))
router.route("/category/:id").patch(isLoggedIn,asyncErrorHandler(updateCategory))

export default router