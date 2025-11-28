---
description: Add simple JSON persistence for clients and users using LowDB
---

# Workflow: Add LowDB Backend (Simple)

**Goal**: Add JSON persistence for clients and users only. Keep it simple.

---

## Step 1: Install Dependencies

```bash
npm install lowdb
npm install -D tsx
```

---

## Step 2: Create Database Initialization

**File**: `/server/db.ts`

Create LowDB instance with simple schema (clients + users only).

**Key points**:
- Use JSONFile adapter pointing to `server/db.json`
- Default structure: `{ clients: [], users: [] }`
- Auto-initialize if file doesn't exist

---

## Step 3: Create CRUD Functions

**File**: `/server/api.ts`

Implement simple CRUD functions:
- `getAllClients()`
- `createClient(client)`
- `getAllUsers()`
- `createUser(user)`
- `updateUser(userId, updates)`

**Pattern**: Always `await db.read()` before accessing data, `await db.write()` after mutations.

---

## Step 4: Create Express Server

**File**: `/server/server.ts`

Create simple REST API:
- `GET /api/clients`
- `POST /api/clients`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:userId`

**Port**: 3001  
**Middleware**: `cors()` + `express.json()`

---

## Step 5: Update AppStateProvider

**File**: `/src/context/AppStateProvider.tsx`

**Changes**:
1. Load clients and users from backend on mount (useEffect)
2. Update `addClient()` to POST to backend
3. Update `addUser()` to POST to backend

**Keep**: All other logic unchanged (transactions, balances, etc. stay in-memory for now)

---

## Step 6: Add NPM Scripts

**File**: `/package.json`

Add scripts:
```json
{
  "dev:server": "tsx server/server.ts"
}
```

---

## Step 7: Test

1. Start backend: `npm run dev:server`
2. Start frontend: `npm run dev`
3. Add a client → Refresh → Should persist
4. Add a user → Refresh → Should persist
5. Check `/server/db.json` → Should see data

---

## Step 8: Summary

**Created**:
- `/server/db.ts` - Database initialization
- `/server/api.ts` - CRUD functions
- `/server/server.ts` - Express API

**Modified**:
- `/src/context/AppStateProvider.tsx` - Load/save from backend

**Result**: Clients and users now persist in JSON!

---

## Later (Not Now)

- Add transactions persistence
- Add balance updates via API
- Add Travel Rule fields
- Add reset script

**Keep it simple for now!** ✨
