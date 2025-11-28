---
description: Extend or adjust Travel Rule integration (API / SDK) for existing transaction flows
---

# Workflow: Add Travel Rule Integration

Use this workflow when modifying or extending Travel Rule functionality in the Transact application.

---

## Step 1: Identify Integration Mode

**Action**: Clarify which Travel Rule mode(s) need work

**Questions to ask**:
- Which mode needs updates? (API, SDK, or both)
- What specific change is required? (new fields, real integration, error handling, UI updates)
- Is this replacing the current stub with a real provider, or extending the stub?
- Which transactions should trigger Travel Rule? (currently: withdrawals only)

**Modes**:
- **API Mode**: Backend REST endpoint for Travel Rule submission
- **SDK Mode**: Client-side modal/widget for Travel Rule data collection
- **Both**: Ensure parity between both approaches

**Example**:
> "I need to understand your Travel Rule integration requirements:
> 1. Which mode? (API / SDK / Both)
> 2. What should change? (add real provider / extend stub / add fields / error handling)
> 3. Are you integrating with a specific provider? (Notabene, Sygna, other)
> 4. Should deposits also trigger Travel Rule, or only withdrawals?"

---

## Step 2: Inspect Current Implementation

**Action**: Review ONLY Travel Rule-specific files

**Core files to inspect**:

### Service Layer
- `src/lib/services/travelRuleService.ts` - ALL functions
  - `preparePayload()` - Converts transaction to Travel Rule format
  - `submitViaApi()` - Mock API submission
  - `launchSdkFlow()` - Mock SDK launch
  - `processTravelRule()` - Router based on mode

### Context Layer
- `src/context/AppStateProvider.tsx` - Look for:
  - `submitWithdraw()` action - calls `processTravelRule()`
  - `travelRuleMode` state
  - `setTravelRuleMode()` action

### UI Components
- `src/components/TravelRuleModeToggle.tsx` - Mode selection UI
- `src/components/WithdrawForm.tsx` - Where Travel Rule is triggered
- `src/components/DepositForm.tsx` - Check if Travel Rule should apply

### Types
- `src/lib/types.ts` - Look for:
  - `TravelRuleMode` enum
  - `TravelRulePayload` interface
  - `TravelRuleApiResult`, `TravelRuleSdkResult` types

**Inspection strategy**:
1. Start with `travelRuleService.ts` - understand current flow
2. Check `AppStateProvider.tsx` - see how service is called
3. Review UI components - understand user interaction
4. Note types - identify data structures

**Summarize current behavior**:
- What data is included in `TravelRulePayload`
- How API mode currently works (stub details)
- How SDK mode currently works (stub details)
- What happens on success/failure
- Where console logging occurs

---

## Step 3: Review Documentation

**Action**: Read relevant sections from documentation files

**Required reading** (targeted sections only):

### docs/architecture-current.md
- Section: "Travel Rule Integration" under Features/Modules
- Section: "Travel Rule Service" under Data & Services
- Note any architectural constraints or patterns

### specs/spec.md
- Section: "3.4 Travel Rule Mode Selection"
- Section: "5. Future Extensions" - Phase 2: Real Compliance Integration
- Understand product requirements for Travel Rule

### SUMSUB_INTEGRATION.md (if relevant)
- Check if Sumsub is the intended Travel Rule provider
- Note integration requirements (API keys, endpoints, payload format)
- Understand HMAC authentication if needed

**What to extract**:
- Current limitations (e.g., "Both modes are stubs with identical behavior")
- Future goals (e.g., "Integrate with actual Travel Rule provider")
- Data requirements (e.g., IVMS101 format, beneficiary/originator fields)
- Security considerations (e.g., backend-only API calls, no client secrets)

**Don't read**:
- Entire architecture doc (only Travel Rule sections)
- Unrelated service documentation
- Full spec (only Travel Rule sections)

---

## Step 4: Create Integration Plan

**Action**: Create a detailed plan and save to artifacts

**Plan file**: `artifacts/plan_travel_rule_[mode].md`

**Plan structure**:
```markdown
# Plan: Travel Rule Integration - [API/SDK/Both]

## Goal
[Brief description of what we're integrating and why]

## Current State
- Travel Rule service: [stub/partial/real]
- API mode: [current behavior]
- SDK mode: [current behavior]
- Triggered by: [withdrawal only / deposit also]

## Target State
- Travel Rule provider: [Notabene / Sygna / Sumsub / Custom]
- API mode: [intended behavior]
- SDK mode: [intended behavior]
- New fields: [list any new data fields needed]

## Files to Modify
- [ ] src/lib/services/travelRuleService.ts
- [ ] src/lib/types.ts (if new types needed)
- [ ] src/context/AppStateProvider.tsx (if flow changes)
- [ ] src/components/TravelRuleModeToggle.tsx (if UI changes)
- [ ] src/api/ (if adding new API wrapper)
- [ ] backend-example/ (if backend changes needed)

## Steps

### 1. [First Change - Usually Types]
**File**: src/lib/types.ts
**Action**: Add/update Travel Rule types
**Details**: 
- Add IVMS101 field types
- Update TravelRulePayload interface
- Add provider-specific response types

### 2. [Second Change - Service Layer]
**File**: src/lib/services/travelRuleService.ts
**Action**: Implement real provider integration
**Details**:
- Update preparePayload() to match provider format
- Replace submitViaApi() stub with real API call
- Add error handling and retry logic
- Maintain backward compatibility with demo mode

### 3. [Additional steps...]

## Demo Mode Preservation
- [ ] Add environment variable to toggle demo/production mode
- [ ] Ensure stub behavior still works when no API keys provided
- [ ] Add fallback to mock response on provider failure

## Extension Points
[Where can real integration be plugged in later?]
- API endpoint: [where to add real backend call]
- SDK initialization: [where to add real SDK script]
- Webhook handlers: [where to handle callbacks]

## Testing
- [ ] API mode: Can submit mock Travel Rule data
- [ ] SDK mode: Can launch mock SDK flow
- [ ] Error handling: Gracefully handles provider failures
- [ ] TypeScript: No compilation errors
- [ ] App still runs: npm run dev works
```

**Wait for user approval** before implementing.

---

## Step 5: Implement Changes

**Action**: Apply changes while preserving demo functionality

**Implementation order**:

#### 5.1 Update Types First
**File**: `src/lib/types.ts`
- Add new interfaces for provider-specific payloads
- Update `TravelRulePayload` with additional fields
- Add error types for Travel Rule failures

#### 5.2 Extend Service Layer
**File**: `src/lib/services/travelRuleService.ts`

**Key principles**:
- **Keep demo mode working**: Add conditional logic for stub vs real integration
- **Clean abstractions**: Separate provider-specific logic into helper functions
- **Error handling**: Wrap API calls in try/catch with meaningful errors

**Example pattern**:
```typescript
// Good: Preserves demo mode
export async function submitViaApi(payload: TravelRulePayload): Promise<TravelRuleApiResult> {
  const isDemoMode = !process.env.VITE_TRAVEL_RULE_API_URL;
  
  if (isDemoMode) {
    // Original stub behavior
    console.log('[Travel Rule API] Mock submission:', payload);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, transactionId: 'mock-123' };
  }
  
  // Real integration
  try {
    const response = await fetch(process.env.VITE_TRAVEL_RULE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error('[Travel Rule API] Error:', error);
    throw new Error('Travel Rule submission failed');
  }
}
```

#### 5.3 Update Context Actions (if needed)
**File**: `src/context/AppStateProvider.tsx`

Only modify if:
- Adding new Travel Rule state (e.g., loading, error status)
- Changing how Travel Rule results affect transactions
- Adding new actions (e.g., retryTravelRule)

**Minimal changes only** - don't refactor entire context.

#### 5.4 Extend UI (if needed)
**Files**: `TravelRuleModeToggle.tsx`, `WithdrawForm.tsx`

Only modify if:
- Adding new mode options (e.g., "Auto" mode that chooses API/SDK)
- Showing Travel Rule status/errors in UI
- Adding Travel Rule configuration fields

#### 5.5 Add API Wrapper (if needed)
**New file**: `src/api/travelRuleApi.ts`

Create if integrating with a specific backend:
```typescript
// Example structure
export async function submitTravelRuleData(payload: TravelRulePayload) {
  const response = await fetch('/api/travel-rule/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error('Travel Rule submission failed');
  }
  
  return response.json();
}
```

#### 5.6 Backend Changes (if applicable)
**Directory**: `backend-example/`

If adding backend support:
- Add new route for Travel Rule submission
- Implement provider authentication (API keys, HMAC)
- Add webhook handlers for async callbacks
- Update README with setup instructions

**Guidelines for all changes**:
- Use `replace_file_content` for single changes
- Use `multi_replace_file_content` for multiple changes in one file
- Preserve existing code style
- Add comments explaining integration points
- Keep functions small and focused

---

## Step 6: Verify Demo Mode Still Works

**Action**: Ensure stub behavior is preserved

**Verification checklist**:
- [ ] Without API keys: App still runs and uses mock responses
- [ ] With API keys: Real integration is attempted
- [ ] Console logs: Still show Travel Rule payloads in demo mode
- [ ] Switch modes: Toggle between API/SDK works
- [ ] Error handling: Graceful fallback on provider failure
- [ ] TypeScript: No compilation errors
- [ ] Other features: Withdraw/Deposit still work without Travel Rule
- [ ] No regressions: App runs with `npm run dev`

**Environment variable pattern**:
```
VITE_TRAVEL_RULE_MODE=demo          # Use stubs (default)
VITE_TRAVEL_RULE_MODE=production    # Use real provider
VITE_TRAVEL_RULE_API_URL=https://...
VITE_TRAVEL_RULE_API_KEY=...
```

---

## Step 7: Summarize Changes and Next Steps

**Action**: Document what changed and how to proceed

**Summary format**:
```markdown
## Travel Rule Integration: [Mode] - Changes Applied

### Modified Files
1. **src/lib/types.ts**
   - Added: [new types/interfaces]
   - Updated: [existing types]

2. **src/lib/services/travelRuleService.ts**
   - Updated `submitViaApi()`: [changes]
   - Updated `launchSdkFlow()`: [changes]
   - Added: [new helper functions]
   - Preserved: Demo mode with environment check

3. **src/api/travelRuleApi.ts** (if created)
   - New API wrapper for [provider name]
   - Functions: [list]

4. **backend-example/** (if modified)
   - New route: POST /api/travel-rule/submit
   - Authentication: [method]

### Integration Points for Real Provider

#### API Mode
**Where to plug in**: `src/lib/services/travelRuleService.ts` - `submitViaApi()`
**Current stub**: Logs payload and returns mock success
**To integrate**:
1. Set `VITE_TRAVEL_RULE_API_URL` environment variable
2. Add provider API key to `.env`
3. Update `submitViaApi()` to call real endpoint
4. Handle provider-specific response format

#### SDK Mode
**Where to plug in**: `src/lib/services/travelRuleService.ts` - `launchSdkFlow()`
**Current stub**: Logs payload and returns mock success
**To integrate**:
1. Add provider SDK script to `index.html`
2. Initialize SDK with API credentials
3. Update `launchSdkFlow()` to launch real SDK modal
4. Handle SDK callbacks and results

### Testing Checklist
- [ ] Demo mode: Works without API keys (stubs active)
- [ ] API mode: [tested / ready for testing with real API]
- [ ] SDK mode: [tested / ready for testing with real SDK]
- [ ] Error handling: Gracefully handles failures
- [ ] TypeScript: No errors
- [ ] App runs: `npm run dev` successful

### Next Steps
1. **To test with real provider**:
   - Obtain API credentials from [provider name]
   - Set environment variables in `.env`
   - Configure backend (if using API mode)
   - Test with small transaction amounts

2. **Additional improvements needed**:
   - [ ] Add Travel Rule status display in transaction history
   - [ ] Implement webhook handlers for async approvals
   - [ ] Add retry mechanism for failed submissions
   - [ ] Create admin UI for Travel Rule configuration

3. **Documentation updates**:
   - [ ] Update `docs/architecture-current.md` - Travel Rule section
   - [ ] Update `specs/spec.md` - Travel Rule flows
   - [ ] Create `docs/travel-rule-integration.md` for provider setup
```

---

## Notes

**Key Principles**:
- **Demo mode first**: Always preserve stub functionality
- **Clean abstractions**: Keep provider logic isolated and swappable
- **Environment-driven**: Use env vars to toggle demo/production
- **Graceful degradation**: Fall back to stubs on integration failure
- **Extensible design**: Make it easy to swap providers later

**Common Pitfalls to Avoid**:
- ❌ Removing stub logic (always keep as fallback)
- ❌ Hardcoding provider details (use environment variables)
- ❌ Breaking withdraw/deposit flows (Travel Rule should be optional)
- ❌ Tight coupling to one provider (abstract provider interface)
- ❌ No error handling (always try/catch external APIs)

---

## Example Usage

**User request**: "Integrate Notabene Travel Rule API for the withdraw flow"

**Workflow execution**:
1. Clarify: "API mode only or both? Do deposits need Travel Rule too?"
2. Inspect: Review `travelRuleService.ts`, `AppStateProvider.tsx`, withdraw flow
3. Read docs: Check Travel Rule sections in architecture and spec
4. Plan: Save 5-step plan to `artifacts/plan_travel_rule_notabene_api.md`
5. Implement: 
   - Add Notabene types
   - Update `submitViaApi()` with environment check
   - Create `notabeneApi.ts` wrapper
   - Preserve demo mode
6. Verify: Test without API key (stub works), test with key (real API)
7. Summary: List changes and next steps for Notabene webhook setup
