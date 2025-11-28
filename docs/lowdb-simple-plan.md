# LowDB Integration - Simple Plan

**Goal**: Add JSON persistence for clients and users only. Keep it simple.  
**Later**: Add transactions and other features incrementally.

---

## Phase 1: Basic Setup (Clients & Users Only)

### Step 1: Install LowDB

```bash
npm install lowdb
```

---

### Step 2: Create Simple Database File

**File**: `/server/db.ts`

```typescript
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { Client, User } from '../src/lib/types.js'

interface Database {
  clients: Client[]
  users: User[]
}

// Initialize database
const adapter = new JSONFile<Database>('server/db.json')
const db = new Low(adapter, { clients: [], users: [] })

// Read data on startup
await db.read()

// If db.json doesn't exist or is empty, write default structure
if (!db.data) {
  db.data = { clients: [], users: [] }
  await db.write()
}

export { db }
```

**That's it.** This creates a `db.json` file with clients and users.

---

### Step 3: Create Simple CRUD Functions

**File**: `/server/api.ts`

```typescript
import { db } from './db.js'
import { Client, User } from '../src/lib/types.js'

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
```

**That's it.** Simple CRUD functions.

---

### Step 4: Create Simple Express Server

**File**: `/server/server.ts`

```typescript
import express from 'express'
import cors from 'cors'
import { getAllClients, createClient, getAllUsers, createUser, updateUser } from './api.js'

const app = express()
app.use(cors())
app.use(express.json())

// Clients
app.get('/api/clients', async (req, res) => {
  const clients = await getAllClients()
  res.json(clients)
})

app.post('/api/clients', async (req, res) => {
  const client = await createClient(req.body)
  res.json(client)
})

// Users
app.get('/api/users', async (req, res) => {
  const users = await getAllUsers()
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body)
  res.json(user)
})

app.patch('/api/users/:userId', async (req, res) => {
  const user = await updateUser(req.params.userId, req.body)
  res.json(user)
})

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
})
```

**That's it.** Simple REST API.

---

### Step 5: Update Frontend to Use Backend

**File**: `/src/context/AppStateProvider.tsx`

**Change 1**: Load clients and users from backend on mount

```typescript
useEffect(() => {
  // Load clients and users from backend
  fetch('http://localhost:3001/api/clients')
    .then(res => res.json())
    .then(data => setClients(data))
  
  fetch('http://localhost:3001/api/users')
    .then(res => res.json())
    .then(data => setUsers(data))
}, [])
```

**Change 2**: Update `addClient` to save to backend

```typescript
const addClient = async (name: string) => {
  const newClient: Client = {
    clientId: `client-${Date.now()}`,
    name,
    userIds: []
  }
  
  // Save to backend
  const response = await fetch('http://localhost:3001/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newClient)
  })
  const savedClient = await response.json()
  
  // Update local state
  setClients(prev => [...prev, savedClient])
  setSelectedClientId(savedClient.clientId)
}
```

**Change 3**: Update `addUser` to save to backend

```typescript
const addUser = async (firstName: string, lastName: string) => {
  if (!selectedClientId) return
  
  const newUser: User = {
    userId: `user-${Date.now()}`,
    clientId: selectedClientId,
    firstName,
    lastName,
    balances: { /* ... */ }
  }
  
  // Save to backend
  const response = await fetch('http://localhost:3001/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  })
  const savedUser = await response.json()
  
  // Update local state
  setUsers(prev => [...prev, savedUser])
  setSelectedUserId(savedUser.userId)
  
  // Update client's userIds
  setClients(prev => prev.map(c => 
    c.clientId === selectedClientId 
      ? { ...c, userIds: [...c.userIds, savedUser.userId] }
      : c
  ))
}
```

**That's it.** Clients and users now persist.

---

### Step 6: Add NPM Scripts

**File**: `/package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "tsx server/server.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\""
  }
}
```

Install `tsx` for running TypeScript:
```bash
npm install -D tsx
```

Optional: Install `concurrently` to run both servers at once:
```bash
npm install -D concurrently
```

---

### Step 7: Test It

1. **Start backend**: `npm run dev:server`
2. **Start frontend**: `npm run dev` (in another terminal)
3. **Test**:
   - Add a client → Refresh page → Client should still be there
   - Add a user → Refresh page → User should still be there
   - Check `/server/db.json` → Should see clients and users

---

## That's It! 🎉

**What we have now**:
- ✅ Clients persist in JSON
- ✅ Users persist in JSON
- ✅ Simple CRUD API
- ✅ Minimal frontend changes

**What we'll add later**:
- ⏳ Transactions (when ready)
- ⏳ Balances (when ready)
- ⏳ Travel Rule fields (when ready)

---

## File Structure

```
/server/
  ├── db.ts          # LowDB initialization
  ├── api.ts         # CRUD functions
  ├── server.ts      # Express server
  └── db.json        # JSON database (auto-created)

/src/context/
  └── AppStateProvider.tsx  # Updated to use backend
```

**Total new files**: 3  
**Modified files**: 1

---

## Database Schema (Current)

```json
{
  "clients": [
    {
      "clientId": "string",
      "name": "string",
      "userIds": ["string"]
    }
  ],
  "users": [
    {
      "userId": "string",
      "clientId": "string",
      "firstName": "string",
      "lastName": "string",
      "sumsubId": "string?",
      "balances": { "BTC": 0, "ETH": 0, ... }
    }
  ]
}
```

---

## Next Steps (Later)

When ready, we can add:
1. Transactions persistence
2. Balance updates via API
3. Travel Rule fields
4. Reset script
5. Better error handling

**But for now, keep it simple!** ✨
