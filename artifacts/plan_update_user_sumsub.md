# Plan: Update User Form and Sumsub Integration

## Goal
Implement auto-selection of newly created users and enhance the Sumsub integration by storing and displaying the Sumsub Applicant ID, and updating the UI state accordingly.

## Files to Modify
- [ ] src/lib/types.ts
- [ ] src/context/AppStateProvider.tsx
- [ ] src/App.tsx
- [ ] src/components/UserInfoPanel.tsx

## Steps

### 1. Update User Type
**File**: `src/lib/types.ts`
**Action**: Add optional `sumsubId` property to the `User` interface.
**Details**: This will allow us to store the returned Applicant ID from Sumsub.

### 2. Update App State Logic
**File**: `src/context/AppStateProvider.tsx`
**Action**: 
1. Modify `addUser` to auto-select the newly created user.
2. Add `updateUserSumsubId` action to update a user's `sumsubId`.
**Details**: 
- In `addUser`, call `setSelectedUserId(userId)` after `setUsers`.
- Create `updateUserSumsubId` which finds the user and updates their `sumsubId`.

### 3. Handle Sumsub Response
**File**: `src/App.tsx`
**Action**: Update `handlePushToSumsub` to save the applicant ID.
**Details**: 
- Extract `applicantId` from the API response.
- Call `updateUserSumsubId` with the ID.

### 4. Update User Info Panel UI
**File**: `src/components/UserInfoPanel.tsx`
**Action**: 
1. Display "Sumsub ID" in the user details section.
2. Update "Push to Sumsub" button state and styling.
**Details**:
- If `currentUser.sumsubId` exists:
    - Show the ID field.
    - Render the button as disabled, white with green dashed border, and "Already in Sumsub" text with a checkmark.

## Validation
- [ ] Creating a new user automatically selects them in the dropdown.
- [ ] Clicking "Push to Sumsub" successfully updates the user state with the returned ID.
- [ ] The Sumsub ID is visible in the User Info panel.
- [ ] The "Push to Sumsub" button changes appearance and becomes disabled after a successful push.
- [ ] Existing functionality (withdraw/deposit) remains unaffected.
