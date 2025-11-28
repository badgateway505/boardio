import { db } from './db.js'
import type { Client, User } from '../src/lib/types.js'

// ============================================================================
// CLIENTS
// ============================================================================

export async function getAllClients(): Promise<Client[]> {
    await db.read()
    return db.data.clients
}

export async function createClient(client: Client): Promise<Client> {
    await db.read()
    db.data.clients.push(client)
    await db.write()
    return client
}

// ============================================================================
// USERS
// ============================================================================

export async function getAllUsers(): Promise<User[]> {
    await db.read()
    return db.data.users
}

export async function getUsersByClientId(clientId: string): Promise<User[]> {
    await db.read()
    return db.data.users.filter(u => u.clientId === clientId)
}

export async function createUser(user: User): Promise<User> {
    await db.read()
    db.data.users.push(user)
    await db.write()
    return user
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    await db.read()
    const user = db.data.users.find(u => u.userId === userId)
    if (!user) return null
    Object.assign(user, updates)
    await db.write()
    return user
}
