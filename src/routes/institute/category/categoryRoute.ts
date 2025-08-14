import express, { Router } from "express"
import app from "../../../app"
import { createCategory, deleteCategory, getAllCategories, getSingleCategory, updateCategory } from "../../../controllers/institute/category/categoryController"
import asyncErrorHandler from "../../../services/asyncErrorHandler"
import { accessTo, isLoggedIn, Role } from "../../../middleware/middleware"

const router:Router=express.Router()

router.route("/category").post(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(createCategory))

router.route("/category").get(isLoggedIn,
    asyncErrorHandler(getAllCategories))

router.route("/category/:id").get(isLoggedIn,
    asyncErrorHandler(getSingleCategory))

router.route("/category/:id").delete(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(deleteCategory))

router.route("/category/:id").patch(isLoggedIn,
    accessTo(Role.Institute),
    asyncErrorHandler(updateCategory))

export default router