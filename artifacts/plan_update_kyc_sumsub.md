# Plan: Update KYC Form and Sumsub Integration

## Goal
Fix the "Verify Me" button flow by integrating with the real Sumsub SDK backend endpoint, ensuring valid access tokens are generated and used.

## Files to Modify
- [ ] backend-example/server.js
- [ ] src/components/KycModal.tsx
- [ ] src/lib/services/sumsubService.ts

## Steps

### 1. Update Backend Token Generation
**File**: `backend-example/server.js`
**Action**: Update the `/api/sumsub/access-token` endpoint to use the Sumsub `/resources/accessTokens/sdk` endpoint.
**Details**:
- Change Sumsub API path to `/resources/accessTokens/sdk`.
- Pass `userId`, `levelName`, and `ttlInSecs` in the request body instead of query parameters (as per user instruction).
- Ensure HMAC signature includes the JSON body.

### 2. Update KYC Modal to Use Real Backend
**File**: `src/components/KycModal.tsx`
**Action**: Replace mock API call with real service call.
**Details**:
- Import `generateSumsubAccessToken` from `../lib/services/sumsubService`.
- Remove `mockApiServer` usage.
- Call `generateSumsubAccessToken` to get the token.

### 3. Cleanup Service
**File**: `src/lib/services/sumsubService.ts`
**Action**: Ensure `generateSumsubAccessToken` is clean and ready.
**Details**:
- Verify it sends the correct JSON body structure.

## Validation
- [ ] Backend server receives request with correct body.
- [ ] Backend calls Sumsub with correct signature and body.
- [ ] Frontend receives valid token.
- [ ] Sumsub SDK initializes without "session expired" error (assuming valid credentials in .env).
