import express from "express"
import { register, login, logout } from "../controllers/authController.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/teste", (req, res) => {
    res.send("rota funcionando")
})

export default router;