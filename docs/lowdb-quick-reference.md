# LowDB Integration - Quick Reference

**Full Plan**: See `lowdb-integration-plan.md` for detailed step-by-step instructions.

---

## File Structure (New)

```
/server/
  ├── db.ts                    # LowDB instance init
  ├── server.ts                # Express API server
  ├── reset-db.ts              # DB reset utility
  ├── db.json                  # JSON database (auto-created)
  └── db/                      # CRUD services
      ├── clients.ts           # Client CRUD
      ├── users.ts             # User CRUD
      ├── balances.ts          # Balance CRUD
      └── transactions.ts      # Transaction CRUD
```

---

## Database Schema

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
      "balances": {
        "BTC": 0,
        "ETH": 0
        // ... all AssetSymbols
      }
    }
  ],
  "balances": [],
  "transactions": [
    {
      "id": "string",
      "clientId": "string",
      "userId": "string",
      "type": "withdraw" | "deposit",
      "asset": "AssetSymbol",
      "amount": 0,
      "createdAt": "ISO string",
      "status": "Completed" | "Pending",
      "senderName": "string?",
      "senderAddress": "string?",
      "recipientName": "string?",
      "recipientAddress": "string?",
      "txHash": "string?",
      "travelRuleModeAtSubmission": "API" | "SDK",
      "travel_rule_mode": "api" | "sdk" | null,
      "travel_rule_status": "pending" | "success" | "error" | null
    }
  ]
}
```

---

## API Endpoints (New)

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:userId` - Update user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `POST /api/withdraw` - Submit withdrawal (balance + transaction)
- `POST /api/deposit` - Submit deposit (balance + transaction)

### Balances
- `GET /api/balances/:userId` - Get user balances
- `PATCH /api/balances/:userId` - Update balance

---

## Frontend Changes (Minimal)

### Files to Modify
1. **`src/context/AppStateProvider.tsx`** - Replace in-memory state with API calls
2. **`src/api/transactApi.ts`** (new) - API utility functions
3. **`src/lib/types.ts`** - Add Travel Rule fields to `Transaction` type

### Files to Keep Unchanged
- All components (`WithdrawForm.tsx`, `DepositForm.tsx`, etc.)
- All services (`balancesService.ts`, `transactionsService.ts`, etc.)
- `App.tsx`, `main.tsx`

---

## CRUD Pattern (All Services)

```typescript
// Read-only operation
export async function getAll() {
  await db.read();
  return db.data.items;
}

// Mutation operation
export async function create(item: Item) {
  await db.read();
  db.data.items.push(item);
  await db.write();
  return item;
}
```

**Rule**: Always `db.read()` before accessing data, `db.write()` after mutations.

---

## Reset Database

```bash
# Delete and recreate db.json
npm run reset:db

# Or manually
rm server/db.json
# App will auto-recreate on next start
```

---

## Travel Rule Fields (Optional)

Add to `Transaction` type:
```typescript
travel_rule_mode?: 'api' | 'sdk' | null;
travel_rule_status?: 'pending' | 'success' | 'error' | null;
```

These fields are **optional** and can be `null`/`undefined` for MVP.

---

## Implementation Order

1. **Backend Setup** (Steps 1-7): Install LowDB, create `/server` structure, implement CRUD services
2. **Backend API** (Steps 8-9): Create Express server with REST endpoints
3. **Frontend Integration** (Steps 10-13): Update `AppStateProvider` to call backend
4. **DB Management** (Steps 14-16): Add reset script and auto-initialization
5. **Testing** (Steps 17-19): Test CRUD, frontend flows, reset behavior
6. **Documentation** (Steps 20-22): Update README, add npm scripts
7. **Travel Rule** (Steps 23-24): Add optional fields for future integration

---

## Quick Start Commands

```bash
# Install dependencies
npm install lowdb@7.0.1

# Start backend server (after implementation)
npm run dev:server

# Reset database
npm run reset:db

# Start frontend (existing)
npm run dev
```

---

## Key Principles

✅ **Minimal Changes**: Only `AppStateProvider.tsx` needs significant refactoring  
✅ **Atomic Writes**: Always read-before-write pattern  
✅ **Graceful Resets**: Auto-recreate `db.json` if missing  
✅ **Travel Rule Ready**: Optional fields in place for future use  
✅ **No Over-Engineering**: Keep it simple, LowDB is for lightweight persistence  

---

**See `lowdb-integration-plan.md` for full details.**
