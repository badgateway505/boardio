# LowDB Integration Plan for Transact

**Purpose**: Add lightweight JSON-based persistence to the Transact project using LowDB with JSONFile adapter.  
**Target**: Minimal changes, graceful DB resets, Travel Rule compatibility.  
**Created**: 2025-11-28

---

## Overview

This plan outlines the step-by-step process to integrate LowDB into the Transact project. The integration will replace the current in-memory state with persistent JSON storage while maintaining the existing frontend architecture and adding minimal backend complexity.

**Key Principles**:
- Single JSON file (`/server/db.json`) as the database
- Atomic writes with read-before-write pattern
- Graceful handling of missing/deleted database files
- Minimal frontend refactoring
- Travel Rule field compatibility (optional fields for future use)

---

## Phase 1: Backend Setup

### Step 1: Install Dependencies

Install LowDB and related packages in the project root.

**Action**: Run `npm install lowdb@7.0.1` (or latest stable v7.x).

**Note**: LowDB v7 uses ESM modules and JSONFile adapter. Ensure `package.json` has `"type": "module"` or use `.mjs` extensions if needed.

---

### Step 2: Create Server Directory Structure

Create a new `/server` directory at the project root to house all backend persistence logic.

**Action**: Create the following directory structure:
```
/server/
  ├── db.ts              # LowDB instance initialization
  ├── db/                # CRUD service modules
  │   ├── clients.ts     # Client CRUD operations
  │   ├── users.ts       # User CRUD operations
  │   ├── balances.ts    # Balance CRUD operations
  │   └── transactions.ts # Transaction CRUD operations
  ├── db.json            # JSON database file (auto-created)
  └── reset-db.ts        # Database reset utility script
```

**Note**: The `db.json` file will be created automatically on first run if missing.

---

### Step 3: Initialize LowDB Instance

Create the core database initialization module that all services will import.

**File**: `/server/db.ts`

**Responsibilities**:
- Import LowDB and JSONFile adapter.
- Define the database schema interface with TypeScript types.
- Initialize the database with default structure if `db.json` is missing or empty.
- Export a single `db` instance for use across all services.

**Default Schema**:
```json
{
  "clients": [],
  "users": [],
  "balances": [],
  "transactions": []
}
```

**Key Implementation Details**:
- Use `JSONFile` adapter pointing to `/server/db.json`.
- On initialization, check if data exists; if not, write default structure.
- Ensure atomic operations by always calling `db.read()` before reads and `db.write()` after mutations.

---

### Step 4: Create Client CRUD Service

Implement CRUD operations for managing clients in the database.

**File**: `/server/db/clients.ts`

**Functions to Export**:
- `getAllClients()`: Returns all clients from `db.data.clients`.
- `getClientById(clientId: string)`: Returns a single client by ID.
- `createClient(client: Client)`: Adds a new client to the array and writes to DB.
- `updateClient(clientId: string, updates: Partial<Client>)`: Updates client fields.
- `deleteClient(clientId: string)`: Removes a client from the array.

**Pattern**: Each mutation function must:
1. Call `await db.read()` to ensure fresh data.
2. Perform the mutation on `db.data.clients`.
3. Call `await db.write()` to persist changes atomically.

**Note**: Import the `db` instance from `/server/db.ts`.

---

### Step 5: Create User CRUD Service

Implement CRUD operations for managing users in the database.

**File**: `/server/db/users.ts`

**Functions to Export**:
- `getAllUsers()`: Returns all users from `db.data.users`.
- `getUserById(userId: string)`: Returns a single user by ID.
- `getUsersByClientId(clientId: string)`: Returns all users for a specific client.
- `createUser(user: User)`: Adds a new user to the array and writes to DB.
- `updateUser(userId: string, updates: Partial<User>)`: Updates user fields (including `sumsubId` and `balances`).
- `deleteUser(userId: string)`: Removes a user from the array.

**Pattern**: Same read-mutate-write pattern as clients service.

**Travel Rule Fields**: Ensure `User` type supports optional fields:
- `sumsubId?: string` (already exists in current types)
- Future fields can be added to `User` type without breaking existing code.

---

### Step 6: Create Balance CRUD Service

Implement balance-specific operations that interact with user balances.

**File**: `/server/db/balances.ts`

**Functions to Export**:
- `getUserBalances(userId: string)`: Returns the `balances` object for a user.
- `updateUserBalance(userId: string, asset: AssetSymbol, newAmount: number)`: Updates a specific asset balance for a user.
- `incrementBalance(userId: string, asset: AssetSymbol, amount: number)`: Adds to existing balance (for deposits).
- `decrementBalance(userId: string, asset: AssetSymbol, amount: number)`: Subtracts from existing balance (for withdrawals).

**Pattern**: 
1. Read database.
2. Find user in `db.data.users`.
3. Mutate `user.balances[asset]`.
4. Write database.

**Note**: These functions wrap the user update logic for cleaner balance management in transaction flows.

---

### Step 7: Create Transaction CRUD Service

Implement CRUD operations for managing transactions in the database.

**File**: `/server/db/transactions.ts`

**Functions to Export**:
- `getAllTransactions()`: Returns all transactions from `db.data.transactions`.
- `getTransactionById(txId: string)`: Returns a single transaction by ID.
- `getTransactionsByUserId(userId: string)`: Returns all transactions for a specific user.
- `getTransactionsByClientId(clientId: string)`: Returns all transactions for a specific client.
- `createTransaction(transaction: Transaction)`: Adds a new transaction to the array and writes to DB.
- `updateTransaction(txId: string, updates: Partial<Transaction>)`: Updates transaction fields (e.g., status).

**Pattern**: Same read-mutate-write pattern as other services.

**Travel Rule Fields**: Ensure `Transaction` type supports optional fields:
- `travel_rule_mode?: 'api' | 'sdk' | null` (new field to add to `Transaction` type)
- `travel_rule_status?: 'pending' | 'success' | 'error' | null` (new field to add to `Transaction` type)

**Note**: These fields remain optional and default to `null` or `undefined` for MVP.

---

## Phase 2: Backend API Integration

### Step 8: Create or Update Backend Server

Set up an Express server (or extend `backend-example/server.js`) to expose REST API endpoints for the frontend.

**Option A**: Create new `/server/server.ts` (recommended for clean separation).  
**Option B**: Extend existing `/backend-example/server.js`.

**Endpoints to Create**:
- `GET /api/clients` → calls `getAllClients()`
- `POST /api/clients` → calls `createClient()`
- `GET /api/users` → calls `getAllUsers()`
- `POST /api/users` → calls `createUser()`
- `PATCH /api/users/:userId` → calls `updateUser()`
- `GET /api/transactions` → calls `getAllTransactions()`
- `POST /api/transactions` → calls `createTransaction()`
- `GET /api/balances/:userId` → calls `getUserBalances()`
- `PATCH /api/balances/:userId` → calls balance update functions

**Implementation Details**:
- Import CRUD functions from `/server/db/*.ts`.
- Each endpoint calls the appropriate service function and returns JSON.
- Use Express middleware for JSON parsing (`express.json()`).
- Enable CORS for local development.

**Note**: Keep endpoints simple; business logic stays in services.

---

### Step 9: Add Withdraw/Deposit Transaction Endpoints

Create specialized endpoints that handle the full withdraw/deposit flow, including balance updates and transaction creation.

**Endpoints**:
- `POST /api/withdraw` → Validates balance, decrements balance, creates transaction, returns updated balance + transaction.
- `POST /api/deposit` → Increments balance, creates transaction, returns updated balance + transaction.

**Request Body (Withdraw)**:
```json
{
  "userId": "string",
  "clientId": "string",
  "asset": "AssetSymbol",
  "amount": number,
  "recipientAddress": "string",
  "recipientFirstName": "string",
  "recipientLastName": "string",
  "toMyself": boolean,
  "travelRuleMode": "API" | "SDK"
}
```

**Request Body (Deposit)**:
```json
{
  "userId": "string",
  "clientId": "string",
  "asset": "AssetSymbol",
  "amount": number,
  "senderName": "string",
  "senderAddress": "string",
  "txHash": "string"
}
```

**Response**:
```json
{
  "success": true,
  "transaction": { /* Transaction object */ },
  "updatedBalance": number
}
```

**Implementation Flow**:
1. Validate request body.
2. For withdrawals: Check sufficient balance using `getUserBalances()`.
3. Call `decrementBalance()` or `incrementBalance()`.
4. Call `createTransaction()` with all transaction details.
5. Return transaction + updated balance to frontend.

**Note**: This replaces the current in-memory logic in `AppStateProvider.tsx`.

---

## Phase 3: Frontend Integration

### Step 10: Update AppStateProvider to Call Backend

Modify the `AppStateProvider.tsx` to fetch data from the backend instead of using in-memory state.

**Changes Required**:
- Replace `useState` for `clients`, `users`, `transactions` with API calls.
- On mount, call `GET /api/clients`, `GET /api/users`, `GET /api/transactions` to populate initial state.
- Update `submitWithdraw()` to call `POST /api/withdraw` instead of local state mutation.
- Update `submitDeposit()` to call `POST /api/deposit` instead of local state mutation.
- Update `addUser()` to call `POST /api/users`.
- Update `addClient()` to call `POST /api/clients`.

**Pattern**:
- Keep the same function signatures for actions (no breaking changes to components).
- Replace internal logic with `fetch()` or `axios` calls to backend.
- Update local state after successful API responses.

**Note**: This is the only file in the frontend that needs significant changes.

---

### Step 11: Update API Utility Functions

Create or update `/src/api/transactApi.ts` (new file) to centralize all backend API calls.

**Functions to Export**:
- `fetchClients()`: Calls `GET /api/clients`.
- `createClient(client: Client)`: Calls `POST /api/clients`.
- `fetchUsers()`: Calls `GET /api/users`.
- `createUser(user: User)`: Calls `POST /api/users`.
- `updateUser(userId: string, updates: Partial<User>)`: Calls `PATCH /api/users/:userId`.
- `fetchTransactions()`: Calls `GET /api/transactions`.
- `submitWithdraw(data: WithdrawPayload)`: Calls `POST /api/withdraw`.
- `submitDeposit(data: DepositPayload)`: Calls `POST /api/deposit`.

**Note**: These functions are called by `AppStateProvider` actions. Keep existing `sumsubApi.ts` unchanged.

---

### Step 12: Update Types for Travel Rule Fields

Add optional Travel Rule fields to the `Transaction` type in `/src/lib/types.ts`.

**Fields to Add**:
```typescript
export interface Transaction {
  // ... existing fields ...
  travel_rule_mode?: 'api' | 'sdk' | null;
  travel_rule_status?: 'pending' | 'success' | 'error' | null;
}
```

**Note**: These fields are optional and will not break existing code. They can be populated in future Travel Rule integrations.

---

### Step 13: Remove In-Memory Seed Data (Optional)

Once the backend is integrated, the frontend no longer needs to initialize with seed data.

**Action**: 
- Remove or comment out the import of `dataSeed.ts` in `AppStateProvider.tsx`.
- Optionally, create a backend seed script that populates `db.json` with demo data on first run.

**Note**: This step is optional for MVP. Seed data can remain for local development convenience.

---

## Phase 4: Database Management

### Step 14: Create Database Reset Script

Create a utility script to reset the database to its default state.

**File**: `/server/reset-db.ts`

**Functionality**:
- Delete `/server/db.json` if it exists.
- Optionally, recreate it with the default structure (or let the app auto-initialize on next run).
- Optionally, seed with demo data from a predefined JSON file.

**Usage**: Run `node server/reset-db.ts` (or `tsx server/reset-db.ts` if using TypeScript).

**Note**: This is useful for development and testing. Can be extended to seed specific test scenarios.

---

### Step 15: Add Auto-Initialization on Missing DB

Ensure the app gracefully handles a missing or corrupted `db.json` file.

**Implementation** (in `/server/db.ts`):
- On initialization, check if `db.json` exists.
- If missing, create it with the default structure:
  ```json
  {
    "clients": [],
    "users": [],
    "balances": [],
    "transactions": []
  }
  ```
- If corrupted (invalid JSON), log an error and recreate with default structure.

**Note**: This ensures the app never crashes due to DB file issues.

---

### Step 16: Add Database Backup (Optional)

Create a simple backup mechanism for the database.

**File**: `/server/backup-db.ts`

**Functionality**:
- Copy `/server/db.json` to `/server/backups/db-backup-[timestamp].json`.
- Optionally, run this script on a schedule or before risky operations.

**Note**: This is optional for MVP but recommended for production.

---

## Phase 5: Testing & Validation

### Step 17: Test Backend CRUD Operations

Manually test all CRUD endpoints using a tool like Postman or curl.

**Test Cases**:
- Create a client → Verify it appears in `db.json`.
- Create a user → Verify it appears in `db.json` with correct `clientId`.
- Submit a withdrawal → Verify balance decrements and transaction is created.
- Submit a deposit → Verify balance increments and transaction is created.
- Fetch all transactions → Verify correct filtering by user/client.

**Note**: Ensure `db.json` is updated atomically after each operation.

---

### Step 18: Test Frontend Integration

Test the full frontend flow with the backend connected.

**Test Cases**:
- Select a client and user → Verify data loads from backend.
- Submit a withdrawal → Verify balance updates in UI and transaction appears in history.
- Submit a deposit → Verify balance updates in UI and transaction appears in history.
- Add a new user → Verify it appears in the user selector.
- Add a new client → Verify it appears in the client selector.
- Refresh the page → Verify all data persists (no loss of state).

**Note**: This validates that the frontend-backend integration is working correctly.

---

### Step 19: Test Database Reset Behavior

Test that the app handles missing or deleted `db.json` gracefully.

**Test Cases**:
- Delete `/server/db.json` while the server is running → Restart server → Verify it recreates with default structure.
- Corrupt `db.json` (invalid JSON) → Restart server → Verify it recreates with default structure.
- Run `reset-db.ts` script → Verify database is reset to default state.

**Note**: This ensures the app is resilient to DB file issues.

---

## Phase 6: Documentation & Cleanup

### Step 20: Update Project Documentation

Update the project's README and architecture docs to reflect the new persistence layer.

**Files to Update**:
- `/README.md`: Add section on backend setup and database management.
- `/CURRENT.md`: Update "No Persistence" risk to "LowDB Persistence Implemented".
- `/docs/architecture-current.md`: Add backend architecture section with LowDB details.

**New Sections to Add**:
- How to start the backend server.
- How to reset the database.
- Database schema overview.
- API endpoint documentation.

---

### Step 21: Add Environment Configuration

Create a `.env` file for backend configuration (if not already present).

**File**: `/server/.env` or root `/.env`

**Variables**:
```
DB_PATH=./server/db.json
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Note**: Use `dotenv` package to load these in the backend server.

---

### Step 22: Update Package Scripts

Add npm scripts for common backend tasks.

**File**: `/package.json`

**Scripts to Add**:
```json
{
  "scripts": {
    "dev:server": "tsx server/server.ts",
    "reset:db": "tsx server/reset-db.ts",
    "backup:db": "tsx server/backup-db.ts"
  }
}
```

**Note**: Assumes `tsx` is installed for running TypeScript files. Alternatively, use `ts-node` or compile to JS first.

---

## Phase 7: Travel Rule Compatibility

### Step 23: Add Travel Rule Fields to Transaction Type

Ensure the `Transaction` type includes optional Travel Rule fields for future integration.

**Fields** (already added in Step 12):
- `travel_rule_mode?: 'api' | 'sdk' | null`
- `travel_rule_status?: 'pending' | 'success' | 'error' | null`

**Usage**:
- When creating a transaction via `POST /api/withdraw` or `POST /api/deposit`, optionally include these fields in the request body.
- The backend should accept and store these fields if provided.
- The frontend can display Travel Rule status in the transaction history table.

**Note**: These fields remain optional for MVP. Full Travel Rule integration is a future enhancement.

---

### Step 24: Prepare for Travel Rule API/SDK Integration

Document how future Travel Rule integrations will interact with the database.

**API Mode**:
- When `travel_rule_mode` is `'api'`, the backend should call an external Travel Rule API before creating the transaction.
- Store the API response status in `travel_rule_status`.
- If the API call fails, do not create the transaction.

**SDK Mode**:
- When `travel_rule_mode` is `'sdk'`, the frontend should launch the Travel Rule SDK modal.
- After the SDK completes, the frontend sends the result to the backend.
- The backend stores the SDK result in `travel_rule_status` and creates the transaction.

**Note**: This is a placeholder for future work. The current implementation should support these fields but not enforce any logic.

---

## Summary Checklist

### Backend Setup
- [ ] Install LowDB (`npm install lowdb`)
- [ ] Create `/server` directory structure
- [ ] Implement `/server/db.ts` (LowDB initialization)
- [ ] Implement `/server/db/clients.ts` (Client CRUD)
- [ ] Implement `/server/db/users.ts` (User CRUD)
- [ ] Implement `/server/db/balances.ts` (Balance CRUD)
- [ ] Implement `/server/db/transactions.ts` (Transaction CRUD)
- [ ] Create `/server/server.ts` (Express API server)
- [ ] Add withdraw/deposit endpoints (`POST /api/withdraw`, `POST /api/deposit`)
- [ ] Create `/server/reset-db.ts` (Database reset script)

### Frontend Integration
- [ ] Update `AppStateProvider.tsx` to call backend APIs
- [ ] Create `/src/api/transactApi.ts` (API utility functions)
- [ ] Update `Transaction` type to include Travel Rule fields
- [ ] Remove or update seed data usage

### Database Management
- [ ] Implement auto-initialization on missing `db.json`
- [ ] Test database reset behavior
- [ ] (Optional) Create backup script

### Testing
- [ ] Test all backend CRUD endpoints
- [ ] Test frontend withdraw/deposit flows
- [ ] Test database reset and auto-recreation
- [ ] Test data persistence across page refreshes

### Documentation
- [ ] Update `/README.md` with backend setup instructions
- [ ] Update `/CURRENT.md` to reflect persistence layer
- [ ] Update `/docs/architecture-current.md` with backend architecture
- [ ] Add npm scripts for backend tasks

### Travel Rule Compatibility
- [ ] Add optional Travel Rule fields to `Transaction` type
- [ ] Document future Travel Rule integration approach

---

## Notes for Implementation

### Key Principles
1. **Minimal Frontend Changes**: Only `AppStateProvider.tsx` and new API utility file need updates.
2. **Atomic Writes**: Always `db.read()` before mutations and `db.write()` after.
3. **Graceful Resets**: App must handle missing/corrupted `db.json` without crashing.
4. **Travel Rule Ready**: Optional fields in place for future integration.

### Common Pitfalls to Avoid
- **Forgetting `db.read()`**: Always read before accessing `db.data` to ensure fresh data.
- **Concurrent Writes**: LowDB is not designed for high concurrency. For production, consider a real database.
- **Large Datasets**: JSON files become slow with thousands of records. LowDB is best for small-to-medium datasets.
- **No Transactions**: LowDB does not support database transactions. Implement application-level rollback logic if needed.

### Future Enhancements
- Migrate to a real database (PostgreSQL, MongoDB) for production.
- Add authentication and authorization to backend endpoints.
- Implement proper error handling and validation middleware.
- Add automated tests for backend services.
- Implement Travel Rule API/SDK integration logic.

---

**End of Plan**
