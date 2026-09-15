import express from "express"
import { signUp, login, googleLogin, refreshToken, logout } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/sign-up", signUp)
router.post("/login", login)
router.post("/google-login", googleLogin )
router.post("/refresh-token", refreshToken)
router.post("/logout", verifyJWT, logout )

export default router