import fs from "fs/promises"
import { randomUUID } from "node:crypto"

const MESSAGES_FILE = "./src/data/messages.json"
const MAX_STORED_MESSAGES = 100

let writeQueue = Promise.resolve()

async function ensureMessagesFile() {
    try {
        await fs.access(MESSAGES_FILE)
    } catch {
        await fs.writeFile(MESSAGES_FILE, "[]\n")
    }
}

async function readMessages() {
    await ensureMessagesFile()

    const data = await fs.readFile(MESSAGES_FILE, "utf-8")
    return JSON.parse(data)
}

function queueWrite(messages) {
    writeQueue = writeQueue
        .catch(() => { })
        .then(() => fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2)))

    return writeQueue
}

export async function listMessages() {
    return readMessages()
}

export async function saveMessage({ email, text }) {
    const normalizedText = text?.trim()

    if (!normalizedText) {
        throw new Error("A mensagem não pode ser vazia")
    }

    if (normalizedText.length > 500) {
        throw new Error("A mensagem deve ter no máximo 500 caracteres")
    }

    const messages = await readMessages()

    const message = {
        id: randomUUID(),
        email,
        text: normalizedText,
        createdAt: new Date().toISOString()
    }

    messages.push(message)

    const recentMessages = messages.slice(-MAX_STORED_MESSAGES)
    await queueWrite(recentMessages)

    return message
}
