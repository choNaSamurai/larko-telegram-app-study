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
1. **Atomic Coding**: Implement one technical task from the Tech Stack at a time.
2. **UML-First Documentation**: For every complex logic or component, generate a Mermaid diagram:
   - **Sequence Diagram**: For API calls or complex state changes.
   - **Class Diagram**: For new data structures or component hierarchies.
   - **Activity Diagram**: For complex algorithms.
3. **Commit/Log**: Update `implemented/IMPLEMENTED_SCREEN_[NAME].md` after every atomic step.

### Phase 3: Final Verification
1. Run built-in validation scripts (if available).
2. Ensure everything in the [Checklist](./references/implementation_checklist.md) is covered.

## 3. Output Standard: IMPLEMENTED_SCREEN_[NAME].md

Every implementation must be documented in a log file following the [Log Template](./assets/implemented_log_template.md).

## 4. Constraints

- **Zero Deviation**: Never ignore ADR/Tech Stack instructions. If a conflict is found, stop and ask for clarification.
- **TMA Specifics**: Always use the correct Telegram WebApp API methods for UI interactions (MainButton, BackButton, etc.).
- **Aesthetic Excellence**: Follow the [Global Aesthetic Rules](../../.agents-father/infrastructure/rules/global_rules.md) (gradients, Inter font, micro-animations).

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
