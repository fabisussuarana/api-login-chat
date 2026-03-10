import express from "express"
import authRoutes from "./routes/authRoutes.js"

const app = express()

app.use(express.json())

app.use("/auth", authRoutes)

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000")
})