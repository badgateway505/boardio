## Changes Applied: User Form and Sumsub Integration Update

### Modified Files
1. **src/lib/types.ts**
   - Added `sumsubId` optional property to `User` interface.

2. **src/context/AppStateProvider.tsx**
   - Updated `addUser` to automatically select the newly created user.
   - Added `updateUserSumsubId` action to update a user's Sumsub ID.

3. **src/App.tsx**
   - Updated `handlePushToSumsub` to capture the `applicantId` from the API response and call `updateUserSumsubId`.

4. **src/components/UserInfoPanel.tsx**
   - Added display of "Sumsub ID" in the user details section.
   - Updated "Push to Sumsub" button to show "Already in Sumsub" state with custom styling (white background, green solid border, checkmark) when `sumsubId` is present.

### Testing Checklist
- [ ] Create a new user -> Verify they are automatically selected in the dropdown.
- [ ] Click "Push to Sumsub" -> Verify success toast and button state change.
- [ ] Verify "Sumsub ID" field appears in User Info panel.
- [ ] Verify "Already in Sumsub" button is disabled and styled correctly.
- [ ] Verify app still runs without errors.

### Next Steps
- Ensure the backend API correctly returns `applicantId` (assumed based on current implementation).
