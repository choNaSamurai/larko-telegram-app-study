---
name: SKILL_TMA_IMPLEMENT
description: |
  Assertive skill for high-fidelity implementation of Telegram Mini App (TMA) screens. 
  Triggers on any task involving "implement", "coding screen", or "translating design to code".
  This skill is the primary tool for the Telegram_Mini_App_Implementer_TMA role.
---

# SKILL_TMA_IMPLEMENT: Industrial-Grade TMA Implementation

This skill transforms architectural specifications (ADR, Tech Stack) and UI scenarios into production-ready code for Telegram Mini Apps. It enforces strict adherence to the project's [Global Rules](../../.agents-father/infrastructure/rules/global_rules.md) and architectural decisions.

## 1. Prerequisites

- `adr/ADR_SCREEN_[NAME].md`: Architectural constraints.
- `tech-stack/TECH_STACK_SCREEN_[NAME].md`: Step-by-step technical instructions.
- `scenario/SCREEN_[NAME].md`: Functional requirements.

## 2. Execution Workflow

### Phase 1: Context Loading & Checklist
1. Validate presence of all prerequisites.
2. Load [Implementation Checklist](./references/implementation_checklist.md).
3. Initialize the implementation log using `scripts/init_log.py` if it doesn't exist.

### Phase 2: Implementation & Validation
1. **Component Context Extraction First**: Before coding ANY component:
   - Call `get_design_context` on its Figma node.
   - Collect ALL `data-name` attributes from icon wrapper `<div>` elements (maps to `@iconify/react`).
   - Extract the **exact** CSS values for padding and gap (e.g. `pl-[17px]`, `gap-[12px]`). NEVER use rough Tailwind approximations (like `p-4` or `gap-2`).
2. **Design Token Snapshot**: Before writing any CSS, record the exact tokens per component:
   - Exact px paddings, margins, and gaps extracted from Figma
   - Background color hex (`#1a1a2e`)
   - Text color hex per hierarchy level
   - Border-radius px value
   - Font-size, font-weight, line-height
   Log these in the `implemented/` step entry under `## Design Tokens & Spacing Used`.
3. **Atomic Coding**: Implement one technical task from the Tech Stack at a time.
4. **UML-First Documentation**: For every complex logic or component, generate a Mermaid diagram:
   - **Sequence Diagram**: For API calls or complex state changes.
   - **Class Diagram**: For new data structures or component hierarchies.
   - **Activity Diagram**: For complex algorithms.
5. **Commit/Log**: Update `implemented/IMPLEMENTED_SCREEN_[NAME].md` after every atomic step.

### Phase 3.5: Visual Fidelity Verification (MANDATORY — per component)

> **This phase CANNOT be skipped.** Run after implementing every major visual component.
> **EXCEPTION — Data Layer only:** When implementing the data layer via `/local-db` workflow
> (no Figma screens, no UI components), Phase 3.5 is N/A. You MUST log this explicitly:
> ```markdown
> ### Phase 3.5: Visual Fidelity
> N/A — Data layer implementation (no UI components). Visual fidelity does not apply.
> Replaced with: Data Flow verification in Phase 5 Integration Gate.
> ```
> Skipping Phase 3.5 WITHOUT this log entry is treated as FAIL.

For **each major component** (Header, Card, Status Badge, Bottom Bar, Form, etc.):

1. **Get Figma screenshot**:
   ```
   Tool: get_screenshot
   Input: nodeId = <Figma node ID of the component from Scenario §7>
   Output: reference image
   ```
2. **Get browser screenshot**: Open the app in the browser (dev server) and capture the component.
3. **Visual diff comparison**: Compare side-by-side:
   - Colors match? (check hex values)
   - Typography match? (size, weight, spacing)
   - Spacing/padding match? (count px visually or measure)
   - Icons correct? (right icon, right size, right color)
   - Border style correct? (left-only vs all-sides, width, color)
4. **Log result**: In `implemented/IMPLEMENTED_SCREEN_[NAME].md` add:
   ```
   ### Visual Fidelity — [ComponentName]
   - Figma screenshot: [node id]
   - Implementation screenshot: [captured]
   - Delta: [PASS / FAIL + specific differences found]
   - Corrections made: [list any fixes]
   ```
5. **If FAIL**: Fix and re-run comparison before proceeding.

### Phase 4: Final Verification
1. Run the full [Implementation Checklist](./references/implementation_checklist.md).
2. Ensure **every item in 🎯 Figma Visual Fidelity** section is PASS.
3. Run built-in validation scripts (if available).

## 3. Output Standard: IMPLEMENTED_SCREEN_[NAME].md

Every implementation must be documented in a log file following the [Log Template](./assets/implemented_log_template.md).

## 4. Constraints

- **Zero Deviation**: Never ignore ADR/Tech Stack instructions. If a conflict is found, stop and ask for clarification.
- **TMA Specifics**: Always use the correct Telegram WebApp API methods for UI interactions (MainButton, BackButton, etc.).
- **Aesthetic Excellence**: Follow the [Global Aesthetic Rules](../../.agents-father/infrastructure/rules/global_rules.md) (gradients, Inter font, micro-animations).

### 📌 Figma-to-Code Rules (from W1 post-mortem — MANDATORY)

| Rule | WRONG | CORRECT |
|---|---|---|
| **Icons** | `<svg><path d="M21 3L3..."/>` | `<Icon icon="solar:route-bold" />` via @iconify/react |
| **Card border** | `border: 1px solid #60a5fa` (all sides) | `borderLeft: '2px solid #60a5fa'` (left only) |
| **Price format** | `toLocaleString('uk-UA')` → `"12 400"` | regex: `"12,400"` |
| **Safe area** | `pt-4` (hardcoded) | `pt-[env(safe-area-inset-top,16px)]` |

```tsx
// ✅ ICONS: always @iconify/react, always exact Figma data-name
import { Icon } from '@iconify/react';
<Icon icon="solar:route-bold" width={24} height={24} />

// ✅ PRICE: comma format matching Figma
const formatMoney = (n: number) => Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
`₴${formatMoney(price)}`  // → "₴12,400"

// ✅ CARD BORDER: left-only
style={{ borderLeft: `2px solid ${STATUS_BORDER[status]}` }}

// ✅ SAFE AREA: CSS env variable
style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
```

## 5. Example

**Input**: ADR for "Profile Screen", Tech Stack specifying React + Vite.
**Action**: Implement `ProfileCard` component.
**Log Entry**:
```markdown
### Step 1: UI Layout for ProfileCard
- **Action**: Created layout with glassmorphism and animated avatar.
- **Files**: `src/components/ProfileCard.tsx`, `src/styles/glass.css`.
- **Diagram**: 
  [Mermaid Sequence Diagram showing card rendering]
```
