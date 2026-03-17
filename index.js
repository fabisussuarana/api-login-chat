import "dotenv/config"
import express from "express"

import authRoutes from "./src/routes/authRoutes.js"

const app = express()

app.use(express.json())

app.use("/auth", authRoutes)

app.get('/', (req, res) => {
    res.send('Servidor Express funcionando!')
})

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000')
})
