# Transact Project Roadmap

**Status**: Demo → Production-Ready  
**Last Updated**: 2025-11-27

---

## 1. MVP Hardening (Current Phase)

**Goal**: Polish existing demo into a stable, user-friendly prototype

- [ ] Add form validation library (Zod) to replace inline validation
- [ ] Improve error messages and user feedback (clearer toast notifications)
- [ ] Add loading states for async operations (KYC modal, Travel Rule)
- [ ] Refine "To myself" / "To another person" withdraw UX (better visual feedback)
- [ ] Add proper TypeScript UUID library for transaction ID generation
- [ ] Create basic component documentation (JSDoc comments)
- [ ] Fix minor UI inconsistencies (button styles, spacing, responsive layout)

---

## 2. Persistence & Backend

**Goal**: Add database and REST API for real data management

- [ ] Set up Neon Postgres database with schema for clients, users, balances, transactions
- [ ] Build Express/Fastify REST API with endpoints:
  - Auth: `POST /auth/login`, `POST /auth/logout`
  - Transactions: `POST /transactions/withdraw`, `POST /transactions/deposit`
  - Data: `GET /users/:id/balances`, `GET /transactions/:userId`
- [ ] Implement JWT authentication and session management
- [ ] Configure Vite proxy to connect frontend to backend
- [ ] Migrate from in-memory state to API calls with React Query/SWR
- [ ] Add database migrations and seed scripts

---

## 3. Travel Rule Production Integration

**Goal**: Replace stubs with real compliance integration

- [ ] Integrate with Travel Rule provider (Notabene, Sygna, or similar)
- [ ] Implement IVMS101 payload structure for beneficiary/originator data
- [ ] Add Travel Rule API mode with real REST endpoints
- [ ] Add Travel Rule SDK mode with actual modal launch
- [ ] Handle async approval flows and status callbacks
- [ ] Add error handling for failed Travel Rule checks
- [ ] Display Travel Rule status in transaction history

---

## 4. Testing & Quality

**Goal**: Add automated testing and improve code reliability

- [ ] Set up Jest + React Testing Library for unit tests
- [ ] Write tests for service layer (balancesService, transactionsService)
- [ ] Add integration tests for withdraw/deposit forms
- [ ] Set up Playwright for E2E testing (full user flows)
- [ ] Add React error boundaries to prevent full app crashes
- [ ] Configure ESLint strict mode and fix all warnings
- [ ] Add pre-commit hooks (Husky) for linting and type checking

---

## 5. Nice-to-Have Enhancements

**Goal**: Improve architecture and developer experience

- [ ] Split AppStateProvider into multiple contexts (Auth, Transactions, UI)
- [ ] Add React Router for proper URL routing and deep linking
- [ ] Implement optimistic UI updates for better perceived performance
- [ ] Add transaction export functionality (CSV/PDF)
- [ ] Create admin dashboard for client/user management
- [ ] Add WebSocket support for real-time transaction updates
- [ ] Implement dark mode toggle

---

## Future Considerations (Beyond v1.0)

- Multi-currency fiat support (USD, EUR conversions)
- Two-factor authentication (2FA) for withdrawals
- Transaction limits and compliance rules engine
- Audit log system for regulatory compliance
- Mobile-responsive design improvements
- Internationalization (i18n) support

---

**Priority**: Work through phases 1 → 5 sequentially.  
**Timeline**: MVP Hardening (1-2 weeks) → Backend (2-3 weeks) → Travel Rule (2-3 weeks) → Testing (1-2 weeks) → Nice-to-Have (ongoing)
