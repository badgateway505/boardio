---
description: Safely update an existing form (Withdraw, Deposit, KYC) without touching unrelated features
---

# Workflow: Update Form Feature

Use this workflow when modifying an existing form component in the Transact application.

---

## Step 1: Identify Form and Changes

**Action**: Ask the user for clarification

**Questions to ask**:
- Which form needs to be updated? (Withdraw, Deposit, KYC, Add User, Add Client, etc.)
- What specific change is required? (new field, validation update, UI change, behavior modification)
- Are there any related flows that should be updated? (e.g., if changing withdraw, does deposit need similar changes?)

**Example**:
> "I need to understand which form you'd like to update. Please specify:
> 1. Form name (e.g., WithdrawForm, DepositForm, KycModal)
> 2. What should change (e.g., add new field, update validation, change layout)
> 3. Any related flows to consider?"

---

## Step 2: Limit Scope to Relevant Files

**Action**: Identify ONLY the files that need to be inspected/modified

**Scope by form type**:

### Withdraw Form
- `src/components/WithdrawForm.tsx` - UI component
- `src/context/AppStateProvider.tsx` - `submitWithdraw()` action
- `src/lib/services/balancesService.ts` - if balance logic changes
- `src/lib/services/transactionsService.ts` - if transaction creation changes
- `src/lib/services/travelRuleService.ts` - if Travel Rule logic changes
- `src/lib/types.ts` - if new types are needed

### Deposit Form
- `src/components/DepositForm.tsx` - UI component
- `src/context/AppStateProvider.tsx` - `submitDeposit()` action
- `src/lib/services/transactionsService.ts` - if transaction creation changes
- `src/lib/types.ts` - if new types are needed

### KYC Modal
- `src/components/KycModal.tsx` - UI component
- `src/api/sumsubApi.ts` - if API integration changes
- `src/lib/types.ts` - if new types are needed

### Add User/Client Modals
- `src/components/AddUserModal.tsx` or `AddClientModal.tsx`
- `src/context/AppStateProvider.tsx` - `addUser()` or `addClient()` action
- `src/lib/types.ts` - if new types are needed

**Do NOT inspect**:
- Other unrelated form components
- Other services not directly used by the form
- Configuration files unless absolutely necessary

---

## Step 3: Inspect Current Behavior

**Action**: View ONLY the identified files and summarize current behavior

**For each relevant file**:
1. Use `view_file_outline` to understand structure
2. Use `view_file` with targeted line ranges for specific sections
3. Note current validation rules, field names, state management

**Summarize**:
- Current fields and their types
- Current validation logic
- Current submission flow
- Dependencies on other services

**Example summary**:
> "Current WithdrawForm behavior:
> - Fields: asset, amount, recipientAddress, recipientFirstName, recipientLastName, toMyself toggle
> - Validation: Checks sufficient balance, required fields based on toMyself state
> - Submission: Calls submitWithdraw() which processes Travel Rule, updates balance, creates transaction
> - Dependencies: balancesService (for validation), context action (for submission)"

---

## Step 4: Create Change Plan

**Action**: Create a detailed 3-5 step plan and save to artifacts

**Plan file**: `artifacts/plan_update_[form_name].md`

**Plan structure**:
```markdown
# Plan: Update [Form Name]

## Goal
[Brief description of what we're changing and why]

## Files to Modify
- [ ] src/components/[FormName].tsx
- [ ] src/context/AppStateProvider.tsx (if needed)
- [ ] src/lib/services/[service].ts (if needed)
- [ ] src/lib/types.ts (if needed)

## Steps

### 1. [First Change]
**File**: [filename]
**Action**: [what to do]
**Details**: [specific implementation notes]

### 2. [Second Change]
**File**: [filename]
**Action**: [what to do]
**Details**: [specific implementation notes]

[... additional steps ...]

## Validation
- [ ] Form still renders correctly
- [ ] Validation works as expected
- [ ] Submission flow completes successfully
- [ ] No TypeScript errors
- [ ] Other forms unaffected
```

**Wait for user approval** before proceeding to implementation.

---

## Step 5: Apply Changes with Minimal Diffs

**Action**: Implement the plan with surgical precision

**Guidelines**:
- Use `replace_file_content` for single contiguous changes
- Use `multi_replace_file_content` for multiple non-adjacent changes in one file
- Make ONE logical change per tool call
- Preserve existing code style and formatting
- Keep modifications localized to exactly what needs to change

**Order of operations**:
1. Update types first (if needed) - `src/lib/types.ts`
2. Update services (if needed) - `src/lib/services/*.ts`
3. Update context actions (if needed) - `src/context/AppStateProvider.tsx`
4. Update UI component last - `src/components/[Form].tsx`

**For each change**:
- Provide clear description of what's changing
- Show only the relevant code being modified (no large file dumps)
- Verify TypeScript types match

---

## Step 6: Verify No Side Effects

**Action**: Check that other forms and flows remain unaffected

**Verification checklist**:
- [ ] Run `npm run dev` still works (check terminal status)
- [ ] TypeScript compilation succeeds (no new errors)
- [ ] Modified form functionality works (mentally trace the flow)
- [ ] Other forms not inspected or modified
- [ ] No changes to unrelated services
- [ ] Context actions not used by this form remain unchanged

**If scope expanded unexpectedly**:
- Document why additional files needed changes
- Ensure changes still follow minimal diff principle
- Note any potential impacts on other features

---

## Step 7: Summarize Changes

**Action**: Provide concise summary of what was modified

**Summary format**:
```markdown
## Changes Applied: [Form Name] Update

### Modified Files
1. **src/components/[Form].tsx**
   - Added: [what was added]
   - Modified: [what was changed]
   - Removed: [what was removed, if any]

2. **src/lib/types.ts** (if modified)
   - Added types: [list new types]

3. **src/context/AppStateProvider.tsx** (if modified)
   - Updated action: [action name]
   - Changes: [what changed in the action]

### Testing Checklist
- [ ] Form renders without errors
- [ ] New/modified fields work as expected
- [ ] Validation behaves correctly
- [ ] Submission completes successfully
- [ ] No TypeScript errors
- [ ] App still runs (npm run dev)

### Next Steps
[Suggest any follow-up testing or related updates if needed]
```

---

## Notes

- **Always stay focused**: Only touch files directly related to the form being updated
- **Preserve working state**: The app should still run after changes
- **Minimal diffs only**: Don't refactor unrelated code "while you're there"
- **Ask before expanding**: If scope needs to grow beyond the plan, ask user first

---

## Example Usage

**User request**: "Update the withdraw form to add a 'priority' field for transaction speed"

**Workflow execution**:
1. Clarify: "You want to add a priority field (standard/fast/instant)? Should this affect fees?"
2. Scope: WithdrawForm.tsx, types.ts, AppStateProvider (submitWithdraw)
3. Inspect: Review current WithdrawForm structure and withdrawal flow
4. Plan: Save 4-step plan to artifacts/plan_update_withdraw_priority.md
5. Apply: Add priority type → Update form UI → Update submission logic
6. Verify: Check app still runs, other forms untouched
7. Summary: List modified files and testing checklist
