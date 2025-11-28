# Plan: Update Client and User Selectors (Auto-Apply)

## Goal
Remove the "Apply" button from Client and User selectors and make the selection take effect immediately upon change.

## Files to Modify
- [ ] src/components/ClientSelector.tsx
- [ ] src/components/UserSelector.tsx

## Steps

### 1. Update ClientSelector.tsx
**File**: src/components/ClientSelector.tsx
**Action**:
- Remove `tempClientId` state.
- Remove `handleApply` function.
- Update `select` `value` to use `selectedClientId` directly (or handle empty string).
- Update `select` `onChange` to call `selectClient(e.target.value)` immediately.
- Remove the "Apply" button.

### 2. Update UserSelector.tsx
**File**: src/components/UserSelector.tsx
**Action**:
- Remove `tempUserId` state and `useEffect` that syncs it.
- Remove `handleApply` function.
- Update `select` `value` to use `selectedUserId` directly.
- Update `select` `onChange` to call `selectUser(e.target.value)` immediately.
- Remove the "Apply" button.

## Validation
- [ ] Selectors still render correctly.
- [ ] Changing selection updates the app state immediately.
- [ ] No TypeScript errors.
