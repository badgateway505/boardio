# LowDB Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    UI Components                              │  │
│  │  WithdrawForm │ DepositForm │ UserSelector │ ClientSelector  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              AppStateProvider (Context)                       │  │
│  │  - submitWithdraw()  ──────────────────┐                     │  │
│  │  - submitDeposit()   ──────────────────┤                     │  │
│  │  - addUser()         ──────────────────┤                     │  │
│  │  - addClient()       ──────────────────┤                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              /src/api/transactApi.ts                          │  │
│  │  - fetchClients()                                             │  │
│  │  - createClient()                                             │  │
│  │  - fetchUsers()                                               │  │
│  │  - createUser()                                               │  │
│  │  - submitWithdraw()  ────────────────┐                       │  │
│  │  - submitDeposit()   ────────────────┤                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               │ HTTP (fetch/axios)
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              /server/server.ts (Express)                      │  │
│  │                                                                │  │
│  │  GET    /api/clients                                          │  │
│  │  POST   /api/clients                                          │  │
│  │  GET    /api/users                                            │  │
│  │  POST   /api/users                                            │  │
│  │  PATCH  /api/users/:userId                                    │  │
│  │  GET    /api/transactions                                     │  │
│  │  POST   /api/transactions                                     │  │
│  │  POST   /api/withdraw    ◄── Special endpoint                │  │
│  │  POST   /api/deposit     ◄── Special endpoint                │  │
│  │  GET    /api/balances/:userId                                 │  │
│  │  PATCH  /api/balances/:userId                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              CRUD Services (/server/db/)                      │  │
│  │                                                                │  │
│  │  ┌────────────────┐  ┌────────────────┐                      │  │
│  │  │  clients.ts    │  │  users.ts      │                      │  │
│  │  │  - getAll()    │  │  - getAll()    │                      │  │
│  │  │  - getById()   │  │  - getById()   │                      │  │
│  │  │  - create()    │  │  - create()    │                      │  │
│  │  │  - update()    │  │  - update()    │                      │  │
│  │  │  - delete()    │  │  - delete()    │                      │  │
│  │  └────────────────┘  └────────────────┘                      │  │
│  │                                                                │  │
│  │  ┌────────────────┐  ┌────────────────┐                      │  │
│  │  │ balances.ts    │  │ transactions.ts│                      │  │
│  │  │  - get()       │  │  - getAll()    │                      │  │
│  │  │  - update()    │  │  - getById()   │                      │  │
│  │  │  - increment() │  │  - create()    │                      │  │
│  │  │  - decrement() │  │  - update()    │                      │  │
│  │  └────────────────┘  └────────────────┘                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              /server/db.ts (LowDB Instance)                   │  │
│  │                                                                │  │
│  │  const db = new Low(new JSONFile('db.json'))                 │  │
│  │                                                                │  │
│  │  db.data = {                                                  │  │
│  │    clients: [],                                               │  │
│  │    users: [],                                                 │  │
│  │    balances: [],                                              │  │
│  │    transactions: []                                           │  │
│  │  }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              /server/db.json (JSON File)                      │  │
│  │                                                                │  │
│  │  {                                                            │  │
│  │    "clients": [...],                                          │  │
│  │    "users": [...],                                            │  │
│  │    "balances": [...],                                         │  │
│  │    "transactions": [...]                                      │  │
│  │  }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                         BACKEND (Node.js)                            │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### Withdraw Flow

```
1. User fills WithdrawForm
   ↓
2. Clicks "Submit"
   ↓
3. WithdrawForm calls submitWithdraw() from AppStateProvider
   ↓
4. AppStateProvider calls submitWithdraw() from transactApi.ts
   ↓
5. transactApi.ts sends POST /api/withdraw to backend
   ↓
6. Backend /api/withdraw endpoint:
   a. Calls getUserBalances(userId) from balances.ts
   b. Validates sufficient balance
   c. Calls decrementBalance(userId, asset, amount) from balances.ts
   d. Calls createTransaction(transaction) from transactions.ts
   e. Returns { success, transaction, updatedBalance }
   ↓
7. transactApi.ts receives response
   ↓
8. AppStateProvider updates local state with new transaction
   ↓
9. UI re-renders with updated balance and transaction history
```

### Deposit Flow

```
1. User fills DepositForm
   ↓
2. Clicks "Submit"
   ↓
3. DepositForm calls submitDeposit() from AppStateProvider
   ↓
4. AppStateProvider calls submitDeposit() from transactApi.ts
   ↓
5. transactApi.ts sends POST /api/deposit to backend
   ↓
6. Backend /api/deposit endpoint:
   a. Calls incrementBalance(userId, asset, amount) from balances.ts
   b. Calls createTransaction(transaction) from transactions.ts
   c. Returns { success, transaction, updatedBalance }
   ↓
7. transactApi.ts receives response
   ↓
8. AppStateProvider updates local state with new transaction
   ↓
9. UI re-renders with updated balance and transaction history
```

### Add User Flow

```
1. User fills AddUserModal
   ↓
2. Clicks "Add User"
   ↓
3. AddUserModal calls addUser() from AppStateProvider
   ↓
4. AppStateProvider calls createUser() from transactApi.ts
   ↓
5. transactApi.ts sends POST /api/users to backend
   ↓
6. Backend /api/users endpoint:
   a. Calls createUser(user) from users.ts
   b. Returns created user
   ↓
7. transactApi.ts receives response
   ↓
8. AppStateProvider updates local state with new user
   ↓
9. UI re-renders with new user in selector
```

---

## CRUD Pattern (All Services)

```typescript
// ============================================================================
// READ OPERATION (No mutation)
// ============================================================================

export async function getAllItems() {
  await db.read();  // ← Always read first
  return db.data.items;
}

export async function getItemById(id: string) {
  await db.read();  // ← Always read first
  return db.data.items.find(item => item.id === id);
}

// ============================================================================
// CREATE OPERATION (Mutation)
// ============================================================================

export async function createItem(item: Item) {
  await db.read();           // ← Read before mutation
  db.data.items.push(item);  // ← Mutate
  await db.write();          // ← Write after mutation
  return item;
}

// ============================================================================
// UPDATE OPERATION (Mutation)
// ============================================================================

export async function updateItem(id: string, updates: Partial<Item>) {
  await db.read();           // ← Read before mutation
  const item = db.data.items.find(i => i.id === id);
  if (!item) throw new Error('Item not found');
  Object.assign(item, updates);  // ← Mutate
  await db.write();          // ← Write after mutation
  return item;
}

// ============================================================================
// DELETE OPERATION (Mutation)
// ============================================================================

export async function deleteItem(id: string) {
  await db.read();           // ← Read before mutation
  const index = db.data.items.findIndex(i => i.id === id);
  if (index === -1) throw new Error('Item not found');
  db.data.items.splice(index, 1);  // ← Mutate
  await db.write();          // ← Write after mutation
}
```

---

## File Dependencies

```
/server/db.ts
  └── Exports: db (LowDB instance)

/server/db/clients.ts
  └── Imports: db from '../db.ts'
  └── Exports: getAllClients, getClientById, createClient, updateClient, deleteClient

/server/db/users.ts
  └── Imports: db from '../db.ts'
  └── Exports: getAllUsers, getUserById, getUsersByClientId, createUser, updateUser, deleteUser

/server/db/balances.ts
  └── Imports: db from '../db.ts'
  └── Exports: getUserBalances, updateUserBalance, incrementBalance, decrementBalance

/server/db/transactions.ts
  └── Imports: db from '../db.ts'
  └── Exports: getAllTransactions, getTransactionById, getTransactionsByUserId, createTransaction, updateTransaction

/server/server.ts
  └── Imports: All CRUD functions from /server/db/*.ts
  └── Exports: Express app (default export or app.listen())

/src/api/transactApi.ts
  └── Imports: Types from '../lib/types.ts'
  └── Exports: fetchClients, createClient, fetchUsers, createUser, submitWithdraw, submitDeposit, etc.

/src/context/AppStateProvider.tsx
  └── Imports: All API functions from '../api/transactApi.ts'
  └── Exports: AppStateProvider, useAppContext
```

---

## Travel Rule Integration (Future)

### API Mode Flow

```
1. User submits withdrawal with travel_rule_mode = 'api'
   ↓
2. Backend /api/withdraw endpoint:
   a. Calls external Travel Rule API
   b. Waits for response
   c. If success:
      - Sets travel_rule_status = 'success'
      - Proceeds with withdrawal (decrement balance, create transaction)
   d. If error:
      - Sets travel_rule_status = 'error'
      - Returns error to frontend (no withdrawal)
   ↓
3. Transaction stored with travel_rule_mode and travel_rule_status
```

### SDK Mode Flow

```
1. User submits withdrawal with travel_rule_mode = 'sdk'
   ↓
2. Frontend launches Travel Rule SDK modal
   ↓
3. User completes SDK flow
   ↓
4. SDK returns result to frontend
   ↓
5. Frontend sends result + withdrawal data to backend
   ↓
6. Backend /api/withdraw endpoint:
   a. Validates SDK result
   b. Sets travel_rule_status based on SDK result
   c. Proceeds with withdrawal (decrement balance, create transaction)
   ↓
7. Transaction stored with travel_rule_mode and travel_rule_status
```

---

## Database Reset Flow

```
Option 1: Manual Delete
  rm server/db.json
  → Restart server
  → db.ts auto-creates db.json with default structure

Option 2: Reset Script
  npm run reset:db
  → Runs /server/reset-db.ts
  → Deletes db.json
  → Optionally recreates with seed data
  → Restart server (or script auto-restarts)

Option 3: Corrupted File
  → Server starts
  → db.ts detects invalid JSON
  → Logs error
  → Recreates db.json with default structure
```

---

## Key Principles

1. **Single Source of Truth**: `db.json` is the only persistent storage.
2. **Atomic Operations**: Always `db.read()` → mutate → `db.write()`.
3. **Graceful Degradation**: Auto-recreate `db.json` if missing or corrupted.
4. **Minimal Frontend Changes**: Only `AppStateProvider.tsx` and new API file.
5. **Travel Rule Ready**: Optional fields in place for future integration.
6. **No Over-Engineering**: Keep it simple, LowDB is for lightweight persistence.

---

**See `/docs/lowdb-integration-plan.md` for full implementation details.**
