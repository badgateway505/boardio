# Antigravity Rules for Transact

**Project**: Transact - Crypto Exchange Demo  
**Last Updated**: 2025-11-27

---

## Legacy vs New Code

### Respect the Working MVP

- **Current State**: The implementation under `src/` is a **working MVP** with a stable structure
- **No Large Refactors**: Do NOT perform large-scale refactors of the entire project unless explicitly requested by the user
- **Surgical Changes**: Make targeted, localized changes that preserve existing functionality
- **Test Before Breaking**: If the app runs successfully now, keep it that way after your changes

### Follow Existing Architecture

All new code should follow the established layering pattern:

```
UI (components)
    ↓ uses
Context (AppStateProvider)
    ↓ calls
Services (lib/services/)
    ↓ uses
Types (lib/types.ts)
```

**Guidelines**:
- **Components** (`src/components/`): UI-only, no business logic, call context actions
- **Context** (`src/context/AppStateProvider.tsx`): State + actions, orchestrate services
- **Services** (`src/lib/services/`): Pure functions, no React hooks, business logic only
- **Types** (`src/lib/types.ts`): TypeScript definitions, enums, constants

**Do NOT**:
- Put business logic directly in components
- Call services directly from components (go through context)
- Mix UI concerns into service layer
- Add external state management libraries (Redux, Zustand) without explicit request

---

## Task Scope & Token Usage

### Assume NARROW Scope

**For each task**:
- Work **only** in the files and folders explicitly mentioned in the user's request
- Avoid scanning unrelated feature folders when not needed
- If the task says "update withdraw form," don't also scan deposit, KYC, client selector, etc.
- If additional context is needed:
  1. First, use docs/component-map.json to narrow down the relevant files.
  2. Then inspect only those files.
  3. Only if the scope is still ambiguous, ask the user for clarification instead of scanning the entire codebase.

### Minimize Token Usage

**Do NOT**:
- Paste large files or full spec documents into responses
- Quote entire architecture docs when a small snippet will do
- View files "just in case" they might be relevant
- Show complete file contents if only 5-10 lines changed

**DO**:
- Quote only small, relevant snippets (2-5 lines) when explaining changes
- Use targeted view_file calls with StartLine/EndLine ranges
- Reference files by name without showing content when possible
- Keep responses concise and focused

### Prefer Minimal Diffs

- **Localized Changes**: Modify only the exact lines that need to change
- **Avoid Full Rewrites**: Use `replace_file_content` or `multi_replace_file_content` instead of rewriting entire files
- **Preserve Formatting**: Keep existing code style, whitespace, and patterns
- **Single Responsibility**: One change per file edit when possible

### Plan for Large Changes

**When a change touches more than 3-5 files**:
1. First, produce a short plan in `artifacts/plan_[task].md` or a similar artifact
2. Get user confirmation if the scope seems large
3. Apply changes step by step (not all at once)
4. Test incrementally if possible

### Scope Backoff Strategy (Token-Saving Rule)

To minimize unnecessary token usage and avoid scanning unrelated parts of the codebase:

1. **Start Narrow**  
   Always begin with the smallest possible scope:
   - Use `docs/component-map.json` to locate relevant files.
   - Inspect only those files first.

2. **If something is unclear — pause (backoff)**  
   Do NOT expand scope automatically.  
   Instead:
   - Re-check the component map entry,
   - Re-check the feature description from the user,
   - Only then decide on the next step.

3. **Escalate Scope Gradually**  
   Only expand beyond the mapped files when:
   - The user explicitly requests broader changes, **or**
   - The mapped files clearly reference another file required for the fix.

4. **Ask Before Large Scans**  
   If you believe you must inspect more than 3–5 files outside the mapped scope,  
   **stop and ask the user for confirmation** instead of scanning automatically.

5. **Self-Heal the Map**  
   If you discovered missing information during this backoff process,  
   update `docs/component-map.json` so future tasks avoid unnecessary scanning.

**Goal:**  
Stay narrow, escalate slowly, avoid wasteful file reads, and improve the map so future tasks require fewer tokens.


---


## Development Philosophy

### Keep It Working

- **Always maintain a working MVP state**: The app should build and run after every change
- **Don't break existing features**: When adding new functionality, ensure old features still work
- **Graceful degradation**: If a feature is stubbed (like Travel Rule), keep stubs functional
- **Test locally**: If `npm run dev` is running, preserve that working state

### Clean Code First, Optimization Later

**First**: Make it work and keep the structure clean
- Clear naming conventions
- Strong TypeScript typing (no `any` unless absolutely necessary)
- Consistent patterns with existing code
- Simple, readable logic

**Then**: Extend for future needs
- Neon database integration
- Real Travel Rule provider integration
- Comprehensive test coverage
- Performance optimizations

### Follow Existing Patterns

**Naming Conventions**:
- Components: PascalCase (e.g., `WithdrawForm.tsx`)
- Services: camelCase (e.g., `balancesService.ts`)
- Context actions: camelCase verbs (e.g., `submitWithdraw()`)
- Types/Interfaces: PascalCase (e.g., `Transaction`, `User`)

**Code Style**:
- Use existing TypeScript patterns (interfaces, types, enums)
- Follow Tailwind CSS class organization already in use
- Match indentation and formatting of surrounding code
- Use React functional components with hooks (no class components)

**File Organization**:
- Put new components in `src/components/`
- Put new services in `src/lib/services/`
- Add new types to `src/lib/types.ts` (don't create scattered type files)
- Put API wrappers in `src/api/`

### Stay Lightweight

**Remember**: This is a **demo app**, not a full production exchange

- **Keep forms simple**: Don't over-engineer validation or complex state machines
- **Keep services focused**: Each service should do one thing well
- **Avoid over-abstraction**: Don't create layers of indirection for simple operations
- **Prefer clarity over cleverness**: Readable code > highly optimized code

### Documentation Over Comments

- Update relevant docs when making significant changes:
  - `docs/architecture-current.md` - for architectural changes
  - `specs/spec.md` - for new features or flow changes
  - `todo/roadmap.md` - mark items complete or add new tasks
- Use JSDoc for complex functions, but prefer self-documenting code
- Add inline comments only when the "why" is not obvious

---

## Common Tasks - Quick Reference

### Adding a New Component
1. Create `.tsx` file in `src/components/`
2. Import and use `useAppContext()` hook
3. Keep UI-only logic; call context actions for state changes
4. Follow existing Tailwind patterns for styling
5. Export component and import in `App.tsx` or parent component

### Adding a New Service Function
1. Add to appropriate service file in `src/lib/services/`
2. Keep it pure (no side effects, no React hooks)
3. Add TypeScript types for all parameters and returns
4. Export the function
5. Call from context actions, not directly from components

### Adding New State
1. Add state field to `AppStateProvider.tsx`
2. Add action to modify that state
3. Expose via context hook
4. Update components to use the new state/action

### Adding New Types
1. Add to `src/lib/types.ts` (keep types centralized)
2. Export the type/interface
3. Use throughout the codebase

---

## Final Reminders

✅ **Do**:
- Keep the app in a working state
- Follow existing patterns and conventions
- Make surgical, targeted changes
- Ask for clarification when scope is unclear
- Update docs for significant changes

❌ **Don't**:
- Refactor the entire codebase without being asked
- View every file "just in case"
- Paste large files or specs in responses
- Break existing functionality
- Add heavy libraries without discussion

---

**When in doubt**: Ask the user for clarification rather than making assumptions about scope or direction.

---

## Machine-Readable Component Map & Feature Scope

### Using the Component Map

- The file **`docs/component-map.json`** defines a machine-readable map of features and their related files
- This map is the **authoritative source** for understanding feature boundaries and file dependencies
- Always consult this map when working with features to ensure correct scope

### Feature Identification

For any task that refers to a feature by name or ID (e.g., "user dropdown", "withdraw form", "travel_rule"):

1. **First**, read and parse `docs/component-map.json`
2. **Locate** the relevant feature entry by:
   - **Exact ID match** if provided (e.g., `user_dropdown`, `withdraw_form`, `travel_rule`)
   - **Fuzzy match** on `label`, `description`, `tags`, or `aliases` otherwise
   - Examples:
     - "fix user selector" → `user_dropdown`
     - "update withdraw" → `withdraw_form`
     - "travel rule integration" → `travel_rule`
3. **Extract** the file scope from the feature entry:
   - `ui_files` - UI components to inspect/modify
   - `state_files` - Context/state files involved
   - `service_files` - Business logic services
   - `type_refs` - Type definitions referenced
   - `doc_refs` - Related documentation

### Scope Limitation Strategy

**Use the component map to define initial scope**:
- Prefer to limit code changes to the files listed in the feature entry
- Don't scan unrelated features or folders when a specific feature ID is known
- Expand scope only if the user explicitly requests a broader refactor or if dependencies require it

**Example workflow**:
```
User: "Fix the withdraw form validation"

1. Read docs/component-map.json
2. Find feature: "withdraw_form"
3. Extract scope:
   - ui_files: ["src/components/WithdrawForm.tsx"]
   - state_files: ["src/context/AppStateProvider.tsx"]
   - service_files: ["src/lib/services/balancesService.ts", ...]
4. Limit inspection to these files only
5. Do NOT view DepositForm, KycModal, etc. unless needed
```

### Before Making Changes

**When in doubt, list which files you plan to touch**:
1. Show the feature ID you identified
2. List the files from the component map
3. Explain which specific files need changes
4. Wait for user confirmation if scope seems large

**Example**:
> "I identified this as the `withdraw_form` feature. Based on component-map.json, I'll modify:
> - `src/components/WithdrawForm.tsx` (validation logic)
> - `src/lib/services/balancesService.ts` (add new validation function)
> 
> I will NOT touch DepositForm or other transaction forms. Proceed?"

### Benefits of Using the Map

✅ **Faster scope identification** - No need to explore entire codebase  
✅ **Accurate file targeting** - Know exactly which files are involved  
✅ **Reduced token usage** - Don't view unrelated files  
✅ **Consistent boundaries** - Feature definitions are standardized  
✅ **Documentation links** - Quick access to relevant docs  

### When NOT to Use the Map

The component map may not help if:
- The task is about project configuration (vite.config.ts, package.json, etc.)
- The task involves creating entirely new features not yet mapped
- The task requires cross-cutting changes across all features

In these cases, fall back to the standard rules above for scope determination.

### Component Map Maintenance

- The file `docs/component-map.json` is the **source of truth** for feature → files mapping
- **You MUST update this file** whenever you:
  - Add a new feature (new screen, flow, or major UI component)
  - Significantly refactor or move files belonging to an existing feature

**When adding a feature**:
- Create a new `feature` entry with:
  - Unique `id` (lowercase with underscores, e.g., `new_feature_name`)
  - Descriptive `label` (human-readable name)
  - Correct `ui_files`, `state_files`, `service_files` arrays
  - Relevant `tags` for categorization
  - `doc_refs` if documentation exists

**When refactoring**:
- Adjust the file paths in the relevant `feature` entry
- Ensure paths match the new structure
- Update `label` or `description` if feature behavior changed

**Keep the map compact**:
- Only list main files that are part of the feature's core behavior
- Do NOT list every tiny helper or shared UI primitive
- Focus on files an agent would need to modify when working on this feature

**Example maintenance**:
```
# Added a new "Reports" feature
→ Add new entry to docs/component-map.json:
{
  "id": "reports_dashboard",
  "label": "Reports Dashboard",
  "ui_files": ["src/components/ReportsDashboard.tsx"],
  "state_files": ["src/context/AppStateProvider.tsx"],
  "service_files": ["src/lib/services/reportsService.ts"]
}

# Refactored WithdrawForm → split into smaller components
→ Update withdraw_form entry:
{
  "ui_files": [
    "src/components/WithdrawForm.tsx",
    "src/components/WithdrawValidation.tsx"  // NEW
  ]
}
```

---

**Remember**: the component map is a tool to help you work efficiently.
If you had to think hard or search manually to find something, improve the map so future tasks are faster and require less code scanning.