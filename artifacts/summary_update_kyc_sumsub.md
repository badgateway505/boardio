## Changes Applied: KYC Form & Sumsub Integration Update

### Modified Files
1. **backend-example/server.js**
   - Updated `/api/sumsub/access-token` endpoint to use Sumsub's `/resources/accessTokens/sdk`.
   - Changed request method to include `userId`, `levelName`, `ttlInSecs` in the JSON body.
   - Updated HMAC signature generation to include the request body.

2. **src/components/KycModal.tsx**
   - Removed usage of `mockApiServer`.
   - Implemented `generateSumsubAccessToken` to call the real backend endpoint.

3. **src/lib/services/sumsubService.ts**
   - Verified `generateSumsubAccessToken` sends the correct JSON body structure.

### Testing Checklist
- [ ] Backend server receives POST request at `/api/sumsub/access-token`.
- [ ] Backend successfully calls Sumsub `/resources/accessTokens/sdk`.
- [ ] Frontend receives valid token and initializes Sumsub SDK.
- [ ] "Session expired" error should be resolved.
