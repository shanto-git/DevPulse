import { Router } from "express";
import { authController } from "./auth.controller";
import { userController } from "../users/user.controller";

const router = Router()

router.post("/signup", userController.createUser)
router.post("/login", authController.loginUser);

export const authRoute = router