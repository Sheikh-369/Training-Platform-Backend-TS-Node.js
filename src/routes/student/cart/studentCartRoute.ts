import express,{ Router } from "express";
import { accessTo, changeUserIdForTableName, isLoggedIn, Role } from "../../../middleware/middleware";
import asyncErrorHandler from "../../../services/asyncErrorHandler";
import { deleteStudentCartItem, fetchStudentCartItems, insertIntoCartTableOfStudent } from "../../../controllers/student/cart/student-cart-controller";

const router:Router = express.Router()

router.route("/cart").post(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),     
    asyncErrorHandler(insertIntoCartTableOfStudent))
    
router.route("/cart").get(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(fetchStudentCartItems))

router.route("/cart/:id").delete(isLoggedIn,
    changeUserIdForTableName,
    accessTo(Role.Student),
    asyncErrorHandler(deleteStudentCartItem))


export default router;