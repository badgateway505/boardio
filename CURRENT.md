# Current Project Architecture

## Project Overview

**Transact** is a lightweight crypto exchange demo web application built with:
- **Tech Stack**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API
- **Architecture**: Client-side SPA with optional backend integration for Sumsub KYC/Travel Rule

The app simulates withdraw/deposit operations for multiple clients and users with 10 supported cryptocurrencies (BTC, ETH, USDT, USDC, BNB, SOL, XRP, ADA, DOGE, LTC). All data is in-memory with no persistence.

---

## Project Metrics

### Codebase Size

**Total Frontend Source Code:**
- **2,309 lines** across 25 TypeScript/TSX files
- **~136 KB** total source size
- Average: ~92 lines per file

**Backend Example:**
- **363 lines** across 2 server files (JS/TS)
- **~28 KB** total size

**Breakdown by Layer:**

| Layer | Files | Lines of Code | Purpose |
|-------|-------|---------------|---------|
| **UI Components** | 13 `.tsx` files | ~1,274 LOC | Forms, modals, selectors, panels |
| **State Management** | 1 `AppStateProvider.tsx` | 239 LOC | Global context + actions |
| **Business Logic** | 4 service files | 234 LOC | Balances, transactions, travel rule, sumsub |
| **Core Types** | 1 `types.ts` | 126 LOC | TypeScript definitions |
| **App Shell** | `App.tsx` + `main.tsx` | 215 LOC | Layout + entry point |
| **Seed Data** | 1 `dataSeed.ts` | ~140 LOC | Demo clients/users |
| **Backend** | 2 files | 363 LOC | Express server + Sumsub auth |

**Largest Components:**
- `WithdrawForm.tsx`: 276 lines (form logic + validation)
- `AppStateProvider.tsx`: 239 lines (state + 7 actions)
- `App.tsx`: 191 lines (layout orchestration)
- `TransactionHistoryTable.tsx`: ~140 lines (data table)
- `KycModal.tsx`: ~125 lines (Sumsub integration)

### Project Complexity

**Complexity Estimate:** **Low-Medium** (suitable for 1-2 developers)

- **Total Modules**: 6 feature areas (Client/User, Withdraw/Deposit, Travel Rule, KYC, Balances, Notifications)
- **State Atoms**: 8 core state values (3 selections + 5 data arrays/objects)
- **Actions**: 7 global actions in context
- **Services**: 4 service modules (clean abstraction layer)
- **External Dependencies**: 6 runtime deps (React, React-DOM, no heavy libraries)

**Maintainability Score:** ⭐⭐⭐⭐ (4/5)
- ✅ Strong TypeScript typing
- ✅ Clear separation of concerns
- ✅ Consistent naming conventions
- ⚠️ No automated tests
- ⚠️ Single global context (could split as project grows)

---

## Features / Modules

### 1. **Client & User Management**
- Multi-tenant support: Select client → Select user workflow
- Add new clients and users dynamically via modals
- Client-user relationship tracking (`Client.userIds[]`)
- Components: `ClientSelector`, `UserSelector`, `AddClientModal`, `AddUserModal`

### 2. **Withdraw & Deposit Operations**
- Toggle between withdraw/deposit modes
- **Withdraw**: Recipient address/name, amount, currency selection, "Max" button, fee calculation
  - New feature: "To myself" vs "To another person" toggle (recipient fields conditional)
- **Deposit**: Sender details, transaction hash, amount, currency
- Real-time balance validation (insufficient funds checks)
- Components: `WithdrawForm` (276 lines), `DepositForm`, `OperationToggle`

### 3. **Travel Rule Integration** *(stub)*
- Two modes: **API** (backend REST) vs **SDK** (client-side modal)
- Toggleable via `TravelRuleModeToggle`
- Logs payloads to console in demo mode
- Hooks for production integration in `travelRuleService.ts`

### 4. **KYC Verification** *(Sumsub Integration)*
- Push user data to Sumsub via `KycModal`
- Mocked API call to `/api/sumsub/create-applicant` (fallback to mock response)
- Backend example provided in `backend-example/` with HMAC SHA256 authentication
- Component: `KycModal`

### 5. **Balances & Transaction History**
- View user balances for all 10 assets
- Transaction history table with filtering by client/user
- Components: `BalancesPanel`, `UserInfoPanel`, `TransactionHistoryTable`

### 6. **Notifications**
- Toast system for success/error feedback
- Component: `Toast`, Hook: `useToast()`

---

## Routing / Entrypoints

### Frontend
- **Entry**: `src/main.tsx` → renders `App.tsx`
- **Single Page**: `App.tsx` contains all UI in a single-page layout (no routing library)
- **Layout Structure**:
  - Header: App title
  - Selectors: Client + User dropdowns
  - Travel Rule toggle
  - Main Grid:
    - Left: User info panel with KYC controls
    - Right: Withdraw/Deposit forms (toggled)
  - Bottom: Transaction history table
  - Modals: Add User, Add Client, KYC (conditionally rendered)

### Backend (Example)
- **File**: `backend-example/server.js` (Express)
- **Endpoints**:
  - `POST /api/sumsub/access-token`: Generate Sumsub access tokens with HMAC auth
  - `GET /health`: Server health check
- **CORS enabled** for local dev (port 3001)

---

## Data & Services

### Core Types (`src/lib/types.ts`)
- **Entities**: `Client`, `User`, `Transaction`
- **Enums**: `AssetSymbol`, `TravelRuleMode`, `TransactionType`, `TransactionStatus`
- **Drafts**: `TransactionDraft`, `WithdrawFormData`, `DepositFormData`
- **Travel Rule**: `TravelRulePayload`, `TravelRuleApiResult`, `TravelRuleSdkResult`
- **Constants**: `ASSET_SYMBOLS[]`, `TRANSACTION_FEES{}`

### Seed Data (`src/lib/dataSeed.ts`)
- 3 demo clients: Alpha Trading, Beta Investment, Gamma Capital
- 6 demo users (2 per client) with realistic balances

### Services Layer (`src/lib/services/`)

#### 1. **balancesService.ts**
- `getAvailableBalance()`: Calculate balance minus fees
- `hasSufficientBalance()`: Validation helper
- `updateBalance()`: Immutable balance updates (add/subtract)

#### 2. **transactionsService.ts**
- `createTransaction()`: Generate transaction records with IDs and timestamps
- `getTransactionsForUser()`: Filter transactions by client + user

#### 3. **travelRuleService.ts** *(stub)*
- `preparePayload()`: Convert transaction draft to Travel Rule format
- `submitViaApi()`: Mock API submission (logs + 300ms delay)
- `launchSdkFlow()`: Mock SDK launch (logs + 300ms delay)
- `processTravelRule()`: Router function based on selected mode

#### 4. **sumsubService.ts**
- KYC-related helpers (if implemented)

### API Layer (`src/api/`)
- `sumsubApi.ts`: Client-side API wrappers for backend communication

---

## State Management

### Context Provider (`src/context/AppStateProvider.tsx`)

**Pattern**: Single global context with state + actions

**State:**
- **Selection**: `selectedClientId`, `selectedUserId`, `travelRuleMode`
- **Data**: `clients[]`, `users[]`, `transactions[]`
- **Computed**: `currentUser`, `availableUsers`, `currentUserTransactions`

**Actions:**
- `selectClient()`, `selectUser()`, `setTravelRuleMode()`
- `submitWithdraw()`, `submitDeposit()` (includes balance updates, transaction creation, Travel Rule processing)
- `addUser()`, `addClient()`

**Hook**: `useAppContext()` - used by all components to access state/actions

**Flow:**
1. Components call actions (e.g., `submitWithdraw()`)
2. Action validates, processes Travel Rule, updates balances
3. State updates trigger re-renders via context

**No external state management libraries** (Redux, Zustand, etc.)

---

## Notes / Potential Risks

### Architecture Strengths
- ✅ Clean separation: UI (components) → Business Logic (services) → State (context)
- ✅ Strict TypeScript with no `any` types
- ✅ Service layer is modular and testable
- ✅ Clear extension points for Sumsub integration

### Potential Risks & Limitations

#### 1. **No Persistence**
- All state resets on page refresh
- Need backend + database for production

#### 2. **No Authentication**
- Anyone can act as any user
- Need auth system (JWT, OAuth, session)

#### 3. **Client-Side Balance Management**
- Balances calculated in browser (easily manipulated)
- Production needs server-side balance ledger

#### 4. **Single Context Performance**
- Entire app re-renders on any state change
- Consider splitting contexts or using React Query for larger scale

#### 5. **Incomplete Sumsub Integration**
- Travel Rule service is stubbed (logs only)
- KYC modal has fallback mock response
- Backend example exists but not integrated by default

#### 6. **No Error Boundaries**
- Unhandled errors could crash entire app
- Add React error boundaries for production

#### 7. **Missing Backend Communication**
- Frontend has mock API calls with fallbacks
- Backend example (`backend-example/`) is separate and not auto-connected
- Need Vite proxy config or deployment setup

#### 8. **No Validation Schema**
- Form validation is manual (inline checks)
- Consider Zod or Yup for robust validation

#### 9. **Transaction ID Generation**
- Uses `Math.random()` in `transactionsService.ts`
- Use UUID library for production

#### 10. **CORS in Production**
- Backend has `cors()` with no origin restrictions
- Must restrict in production

---

## Backend Example Notes

### Structure
- `backend-example/server.js`: Express server with Sumsub HMAC authentication
- `backend-example/sumsubBackend.ts`: TypeScript reference implementation
- `backend-example/.env.example`: Environment variable template

### Integration Status
- ⚠️ **Not connected** to frontend by default
- Requires manual startup (`node server.js` on port 3001)
- Frontend has fallback mock responses

### To Activate
1. Set `SUMSUB_APP_TOKEN` and `SUMSUB_SECRET_KEY` in `.env`
2. Start server: `node backend-example/server.js`
3. Update frontend API calls to use `http://localhost:3001/api/...`
4. Or configure Vite proxy in `vite.config.ts`

---

## File Organization

```
Root Structure:
├── src/                    # Frontend source
│   ├── components/         # 13 UI components
│   ├── context/            # AppStateProvider (global state)
│   ├── lib/
│   │   ├── services/       # Business logic (4 services)
│   │   ├── types.ts        # TypeScript definitions
│   │   └── dataSeed.ts     # Demo data
│   ├── api/                # API wrappers
│   ├── App.tsx             # Main layout
│   └── main.tsx            # Entry point
├── backend-example/        # Express server for Sumsub
│   ├── server.js           # Running server
│   ├── sumsubBackend.ts    # TS reference
│   └── .env.example        # Config template
├── README.md               # Project documentation
├── SUMSUB_INTEGRATION.md   # Sumsub integration guide
└── package.json            # Dependencies

Layer Boundaries:
UI (components)
    ↓ uses
Context (AppStateProvider)
    ↓ calls
Services (lib/services/)
    ↓ uses
Types (lib/types.ts)
```

---

**Last Updated**: 2025-11-26  
**Lines of Code**: ~3,500 (excluding node_modules)  
**Key Dependencies**: React, TypeScript, Tailwind CSS, Vite
