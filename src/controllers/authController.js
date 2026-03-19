import * as authService from "../services/authService.js"

import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

const sendRegisterEmail = async (email) => {
    if (!resend) {
        return
    }

    try {
        setTimeout(async () => {
            const { error } = await resend.emails.send({
                from: "noreply@email.redactopro.com",
                to: email,
                subject: "Sua conta foi criada",
                html: "<p>Parabéns! Sua conta foi criada com sucesso.</p>"
            })
            if (error) {
                console.error("Falha ao enviar e-mail de cadastro:", error.message)
            }
        }, 30_000);
    } catch (error) {
        console.error("Erro ao chamar o serviço de e-mail:", error.message)
    }
}

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body)

        await sendRegisterEmail(req.body.email)

        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const login = async (req, res) => {
    try {
        const token = await authService.login(req.body)
        res.json({ token })
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
}

const logout = async (req, res) => {
    try {
        await authService.logout()
        res.json({ message: "Logout realizado com sucesso" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export { register, login, logout }
