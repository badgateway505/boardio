# Transact Product Specification

**Version**: 1.0  
**Last Updated**: 2025-11-27  
**Status**: Demo / Prototype

---

## 1. Overview

**Transact** is a lightweight crypto exchange demo application that simulates multi-client, multi-user cryptocurrency withdrawal and deposit operations. Built as a single-page React application with TypeScript and Tailwind CSS, it demonstrates:

- **Multi-tenant architecture**: Multiple clients, each with multiple users
- **Crypto operations**: Withdraw and deposit flows for 10 cryptocurrencies (BTC, ETH, USDT, USDC, BNB, SOL, XRP, ADA, DOGE, LTC)
- **Compliance integration points**: Travel Rule API/SDK modes and Sumsub KYC verification
- **In-memory state**: All data exists in browser memory with no backend persistence

**Primary Use Case**: Demo/prototype for showcasing crypto exchange UI patterns and compliance integration workflows.

---

## 2. Actors and Entities

### Actors
- **Admin/Operator** (implicit): Any user accessing the application can act as any client or user
- **Clients**: Organizations/entities using the exchange (e.g., "Alpha Trading", "Beta Investment")
- **Users**: Individual accounts belonging to clients

### Core Entities

#### **Client**
- `id`: Unique identifier
- `name`: Client organization name
- `userIds[]`: Array of user IDs belonging to this client

#### **User**
- `id`: Unique identifier
- `clientId`: Parent client ID
- `firstName`, `lastName`: User identity
- `email`: Contact information
- `balances{}`: Map of `AssetSymbol → number` (e.g., `{ BTC: 0.5, ETH: 2.3 }`)

#### **Transaction**
- `id`: Unique identifier
- `clientId`, `userId`: Owner references
- `type`: `WITHDRAW` | `DEPOSIT`
- `asset`: One of 10 supported cryptocurrencies
- `amount`: Transaction value (number)
- `fee`: Calculated fee (0.1% of amount)
- `status`: `PENDING` | `COMPLETED` | `FAILED`
- `timestamp`: Creation date/time
- **Withdraw-specific**: `recipientAddress`, `recipientName` (optional)
- **Deposit-specific**: `senderAddress`, `senderName`, `transactionHash`

#### **Supported Assets**
BTC, ETH, USDT, USDC, BNB, SOL, XRP, ADA, DOGE, LTC (10 total)

---

## 3. Main Flows

### 3.1 Client and User Selection Flow

**Goal**: Select active context for operations

1. User selects a **Client** from dropdown (3 pre-seeded clients available)
2. User dropdown populates with users belonging to selected client
3. User selects a **User** from dropdown (2 users per client pre-seeded)
4. User info panel displays selected user's name, email, and balances
5. All subsequent operations (withdraw/deposit) execute in context of selected user

**Alternative**: User can add new clients or users via "Add Client" / "Add User" modals

### 3.2 Withdraw Flow

**Goal**: Send cryptocurrency from selected user to recipient

1. User clicks "Withdraw" tab in operation toggle
2. User fills out withdraw form:
   - **Asset**: Select from 10 supported cryptocurrencies
   - **Amount**: Enter value or click "Max" to withdraw full available balance
   - **Recipient Toggle**: Select "To myself" or "To another person"
     - If "To myself": Skip recipient name fields
     - If "To another person": Enter recipient first name and last name
   - **Recipient Address**: Enter destination wallet address
3. Application validates:
   - Amount > 0
   - Sufficient balance (amount + 0.1% fee)
   - Required fields populated
4. On submit:
   - Process Travel Rule (based on selected mode: API stub or SDK stub)
   - Deduct `amount + fee` from user's selected asset balance
   - Create transaction record with status `COMPLETED`
   - Show success toast notification
5. Transaction appears in history table

### 3.3 Deposit Flow

**Goal**: Receive cryptocurrency into selected user's account

1. User clicks "Deposit" tab in operation toggle
2. User fills out deposit form:
   - **Asset**: Select cryptocurrency
   - **Amount**: Enter deposit value
   - **Sender Address**: Enter source wallet address
   - **Sender Name**: Enter sender's name
   - **Transaction Hash**: Enter blockchain transaction ID
3. Application validates required fields
4. On submit:
   - Add `amount` to user's selected asset balance (no fee)
   - Create transaction record with status `COMPLETED`
   - Show success toast
5. Transaction appears in history table

### 3.4 Travel Rule Mode Selection

**Goal**: Toggle between compliance integration approaches

- **Toggle Control**: Radio buttons labeled "Travel Rule API" vs "Travel Rule SDK"
- **API Mode** (default):
  - On withdraw, application calls mock API endpoint `/api/travel-rule/submit`
  - Logs payload to console and simulates 300ms delay
- **SDK Mode**:
  - On withdraw, application simulates launching Travel Rule SDK modal
  - Logs payload to console and simulates 300ms delay
- **Current Implementation**: Both modes are stubs with identical behavior (logging only)

### 3.5 KYC / Sumsub Modal Flow

**Goal**: Demonstrate Sumsub KYC integration for user verification

1. User clicks "Launch KYC" button in user info panel
2. KYC modal opens with selected user's pre-filled data:
   - First name, last name, email
3. User reviews information and clicks "Create Applicant in Sumsub"
4. Application attempts to call backend API `/api/sumsub/create-applicant`
   - **If backend connected**: Returns Sumsub access token
   - **If backend unavailable**: Falls back to mock response
5. Modal displays success message or error
6. User closes modal

**Backend Integration**: Optional Express server in `backend-example/` implements HMAC SHA256 authentication with Sumsub API

---

## 4. Non-Goals and Limitations

### Currently Out of Scope

❌ **No Data Persistence**
- All state resets on page refresh
- No database, no localStorage
- Transactions and balances exist only in memory

❌ **No Authentication/Authorization**
- Anyone can act as any client or user
- No login, sessions, or access control

❌ **No Real Blockchain Integration**
- No actual crypto transfers
- Transaction hashes are user-provided strings (not validated)
- Balances are simulated numbers

❌ **No Backend by Default**
- Frontend operates standalone with mock API responses
- Backend example exists but requires manual setup

❌ **No Real Travel Rule Compliance**
- Both API and SDK modes are logging stubs
- No actual IVMS101 data structure or provider integration

❌ **No Production-Ready KYC**
- Sumsub integration is example-only
- Requires API credentials and backend setup to function

❌ **No Error Handling/Boundaries**
- Unhandled errors could crash the entire app

❌ **No Automated Tests**
- No unit, integration, or E2E tests

❌ **No Form Validation Library**
- Manual inline validation only

❌ **No Transaction Reversal/Cancellation**
- All transactions are immediately final

---

## 5. Future Extensions

### Phase 1: Backend Integration
- **Database**: Integrate Neon DB (PostgreSQL) for persistent storage
  - Tables: `clients`, `users`, `transactions`, `balances`
- **REST API**: Build Express/Fastify backend with endpoints:
  - `POST /auth/login` - User authentication
  - `GET /users/:id/balances` - Fetch real-time balances
  - `POST /transactions/withdraw` - Process withdrawals
  - `POST /transactions/deposit` - Process deposits
- **Environment**: Connect frontend to backend via Vite proxy configuration

### Phase 2: Real Compliance Integration
- **Travel Rule**: Integrate with actual Travel Rule provider (e.g., Notabene, Sygna)
  - Implement IVMS101 payload structure
  - Add beneficiary/originator data fields
  - Handle async approval flows
- **KYC**: Complete Sumsub integration
  - Handle webhook callbacks
  - Display verification status in UI
  - Enforce KYC requirements before large withdrawals

### Phase 3: Security & Quality
- **Authentication**: Add JWT-based login with session management
- **Authorization**: Role-based access control (admin, client admin, user)
- **Validation**: Integrate Zod or Yup for form schema validation
- **Error Boundaries**: React error boundaries for graceful failure handling
- **Testing**: Add Jest + React Testing Library (unit) and Playwright (E2E)

### Phase 4: Advanced Features
- **Real-Time Updates**: WebSocket for live transaction status
- **Audit Logs**: Track all state changes for compliance
- **Multi-Currency Fiat**: Support USD/EUR deposits and conversions
- **Transaction Limits**: Configurable daily/monthly limits per user
- **2FA**: Two-factor authentication for withdrawals
- **Admin Dashboard**: Client management, user oversight, transaction monitoring

---

**Document Owner**: Development Team  
**Review Cycle**: As needed for major feature additions
