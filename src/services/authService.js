import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import fs from "fs/promises"

const SECRET = "segredo"
const USERS_FILE = "./src/data/users.json"

async function getUsers() {
    const data = await fs.readFile(USERS_FILE, "utf-8")
    return JSON.parse(data)
}

async function register(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

export const register = async ({ email, password }) => {

    const users = await getUsers()

    const userExists = users.find(u => u.email === email)

    if (userExists) {
        throw new Error("Usuário já existe")
    }

    const hash = await bcrypt.hash(password, 10)

    const newUser = {
        email,
        password: hash
    }

    users.push(newUser)

    await register(users)

    return { email }
}

export const login = async ({ email, password }) => {

    const users = await getUsers()

    const user = users.find(u => u.email === email)

    if (!user) {
        throw new Error("Usuário não encontrado")
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
        throw new Error("Senha inválida")
    }

    const token = jwt.sign({ email }, SECRET, {
        expiresIn: "1h"
    })

    return token
}

export const logout = async () => {
    return true
}