import { Server } from "socket.io"

import { verifyToken } from "../services/authService.js"
import { listMessages, saveMessage } from "../services/chatService.js"

const onlineUsers = new Map()

const toOnlineUsersPayload = () => {
    return Array.from(onlineUsers.entries())
        .map(([email, connections]) => ({ email, connections }))
        .sort((a, b) => a.email.localeCompare(b.email))
}

const getTokenFromHandshake = (socket) => {
    const authToken = socket.handshake.auth?.token

    if (authToken) {
        return authToken
    }

    const authorization = socket.handshake.headers.authorization

    if (!authorization?.startsWith("Bearer ")) {
        return null
    }

    return authorization.slice("Bearer ".length)
}

const markUserAsConnected = (email) => {
    const currentConnections = onlineUsers.get(email) || 0
    onlineUsers.set(email, currentConnections + 1)
}

const markUserAsDisconnected = (email) => {
    const currentConnections = onlineUsers.get(email)

    if (!currentConnections || currentConnections === 1) {
        onlineUsers.delete(email)
        return
    }

    onlineUsers.set(email, currentConnections - 1)
}

export const createChatServer = (server, { clientOrigin = "*" } = {}) => {
    const io = new Server(server, {
        cors: {
            origin: clientOrigin === "*" ? true : clientOrigin
        }
    })

    io.use((socket, next) => {
        const token = getTokenFromHandshake(socket)

        if (!token) {
            next(new Error("Token JWT não enviado"))
            return
        }

        try {
            const payload = verifyToken(token)
            socket.data.user = {
                email: payload.email
            }
            next()
        } catch {
            next(new Error("Token JWT inválido"))
        }
    })

    io.on("connection", async (socket) => {
        const email = socket.data.user.email

        markUserAsConnected(email)

        socket.emit("chat:history", await listMessages())
        io.emit("chat:users", toOnlineUsersPayload())

        socket.on("chat:message:send", async (payload, callback) => {
            try {
                const message = await saveMessage({
                    email,
                    text: payload?.text
                })

                io.emit("chat:message", message)

                if (typeof callback === "function") {
                    callback({ ok: true, message })
                }
            } catch (error) {
                if (typeof callback === "function") {
                    callback({ ok: false, error: error.message })
                    return
                }

                socket.emit("chat:error", { error: error.message })
            }
        })

        socket.on("disconnect", () => {
            markUserAsDisconnected(email)
            io.emit("chat:users", toOnlineUsersPayload())
        })
    })

    return io
}
