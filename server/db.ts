import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import type { Client, User } from '../src/lib/types.js'

interface Database {
    clients: Client[]
    users: User[]
}

// Initialize database with JSONFile adapter
const adapter = new JSONFile<Database>('server/db.json')
const defaultData: Database = { clients: [], users: [] }
const db = new Low(adapter, defaultData)

// Read data on startup and initialize if needed
await db.read()

// Write default structure to ensure db.json is created
db.data ||= defaultData
await db.write()

export { db }
