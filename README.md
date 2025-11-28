# Transact - Crypto Exchange Demo

A lightweight demo web application simulating a crypto exchange-style withdraw/deposit interface with multi-client/user support and Travel Rule integration stubs.

## 🎯 Features

- **Multi-Client & Multi-User Support**: Switch between different clients and users
- **Crypto Balances**: View balances for 10 different cryptocurrencies (BTC, ETH, USDT, USDC, BNB, SOL, XRP, ADA, DOGE, LTC)
- **Withdraw & Deposit Operations**: Toggle between withdraw and deposit forms
- **Exchange-Style UX**:
  - Available balance display
  - "Max" button for quick withdrawals
  - Transaction fee calculation
  - "You will receive" amount display
  - Validation and error handling
- **Travel Rule Integration**: Toggle between API and SDK modes (stub implementation)
- **Transaction History**: View all completed transactions with full details
- **Toast Notifications**: Success/error feedback for all operations

## 🚀 How to Run

### Prerequisites
- Node.js 18+ installed

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
transact/
├── src/
│   ├── components/          # React UI components
│   │   ├── BalancesPanel.tsx
│   │   ├── ClientSelector.tsx
│   │   ├── DepositForm.tsx
│   │   ├── OperationToggle.tsx
│   │   ├── Toast.tsx
│   │   ├── TransactionHistoryTable.tsx
│   │   ├── TravelRuleModeToggle.tsx
│   │   ├── UserSelector.tsx
│   │   └── WithdrawForm.tsx
│   ├── context/             # State management
│   │   └── AppStateProvider.tsx
│   ├── lib/                 # Core logic
│   │   ├── services/
│   │   │   ├── balancesService.ts
│   │   │   ├── transactionsService.ts
│   │   │   └── travelRuleService.ts
│   │   ├── dataSeed.ts      # Demo data
│   │   └── types.ts         # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🧪 Testing the App

### Basic Flow

1. **Select a Client**: Choose from "Alpha Trading Corp", "Beta Investment LLC", or "Gamma Capital Partners"
2. **Select a User**: Choose a user from the selected client
3. **View Balances**: See the user's crypto balances in the left panel
4. **Choose Travel Rule Mode**: Toggle between API or SDK mode
5. **Perform Operations**:
   - **Withdraw**: Fill in recipient details, select currency, enter amount (or click "Max"), and submit
   - **Deposit**: Fill in sender details, transaction hash, amount, and submit
6. **View History**: Check the transaction history table at the bottom

### Validation Tests

- Try withdrawing more than available balance → Error toast
- Try submitting with empty fields → Error toast
- Try switching clients/users → Balances and history update correctly

## 🔌 How to Integrate Real Travel Rule (Sumsub)

The application is designed with clear extension points for real Travel Rule integration:

### For API Mode

**File**: `src/lib/services/travelRuleService.ts`

**Function**: `submitViaApi()`

Replace the stub implementation with:

```typescript
export async function submitViaApi(
  payload: TravelRulePayload
): Promise<TravelRuleApiResult> {
  // Make HTTP request to your backend
  const response = await fetch('/api/travel-rule/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
}
```

**Backend**: Create an endpoint that communicates with Sumsub's Travel Rule API using your API key.

### For SDK Mode

**File**: `src/lib/services/travelRuleService.ts`

**Function**: `launchSdkFlow()`

Replace the stub implementation with:

```typescript
export async function launchSdkFlow(
  payload: TravelRulePayload
): Promise<TravelRuleSdkResult> {
  // Initialize Sumsub SDK
  const sumsubSDK = await import('@sumsub/travel-rule-sdk');
  
  // Launch SDK modal/flow
  const result = await sumsubSDK.launch({
    apiKey: 'your-api-key',
    transactionData: payload,
  });

  return {
    success: result.success,
    message: result.message,
  };
}
```

**Installation**: Add Sumsub SDK to dependencies:
```bash
npm install @sumsub/travel-rule-sdk
```

### Where to Add API Calls

The Travel Rule service is called in `AppStateProvider.tsx`:
- `submitWithdraw()` - Line ~100
- `submitDeposit()` - Line ~125

Both call `processTravelRule()` which routes to the appropriate handler based on the selected mode.

## 🏗️ Architecture Decisions

- **Vite + React + TypeScript**: Fast dev experience, type safety
- **Tailwind CSS**: Rapid styling without custom CSS
- **Context API**: Simple state management (no Redux needed for this demo)
- **In-Memory State**: No backend/database required
- **Service Layer**: Clean separation of business logic from UI
- **Strict TypeScript**: No `any` types, full type safety

## 📝 Notes

- This is a **demo application** with fake data and no real blockchain integration
- All transactions are in-memory and will reset on page refresh
- Transaction fees are static values (not fetched from real networks)
- No authentication or authorization implemented
- Travel Rule integration is stubbed (logs to console only)

## 🔒 Security Considerations for Production

If extending this for production use:

1. Add authentication and authorization
2. Implement backend API with proper validation
3. Store data in a database (not in-memory)
4. Add rate limiting and CSRF protection
5. Validate all inputs server-side
6. Use environment variables for API keys
7. Implement proper error logging and monitoring
8. Add comprehensive testing (unit, integration, e2e)

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
