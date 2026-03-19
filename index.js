import "dotenv/config"
import express from "express"
import http from "node:http"
import cors from "cors"

import authRoutes from "./src/routes/authRoutes.js"
import { createChatServer } from "./src/socket/chatSocket.js"

const app = express()
const server = http.createServer(app)
const CLIENT_ORIGIN = process.env.FRONTEND_URL || "*"
const PORT = Number(process.env.PORT) || 3000

app.use(
    cors({
        origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN
    })
)
app.use(express.json())

app.use("/auth", authRoutes)

app.get('/', (req, res) => {
    res.json({
        message: "Servidor Express funcionando!",
        chat: {
            websocket: true,
            events: {
                connect: "Envie o token JWT em socket.auth.token",
                history: "chat:history",
                users: "chat:users",
                receiveMessage: "chat:message",
                sendMessage: "chat:message:send"
            }
        }
    })
})

createChatServer(server, { clientOrigin: CLIENT_ORIGIN })

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
