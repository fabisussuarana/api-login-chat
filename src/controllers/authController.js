import * as authService from "../services/authService.js"

import { Resend } from 'resend';

const resend = new Resend('');

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body)
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'antonioandre1008@gmail.com',
            subject: 'Hello World',
            html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
        });
        res.json(user)
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