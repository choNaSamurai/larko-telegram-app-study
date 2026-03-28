---
name: SKILL_TMA_ARCH_SPEC
description: >
  Transforms BRD requirements and SA screen scenarios into formal Architecture Decision Records (ADR)
  and actionable step-by-step tech stack specifications for Telegram Mini Apps.
  Use this whenever a screen has a defined scenario and needs technical blueprints.
---

# SKILL_TMA_ARCH_SPEC — TMA Architecture & Tech Stack Specification

## Purpose

This skill provides the technical foundation for implementing Telegram Mini App (TMA) features. It bridge the gap between "WHAT" the system does (SA Scenarios) and "HOW" it is built (ADR + Tech Stack), ensuring decisions are documented, rationalized, and optimized for the TMA environment.

---

## Prerequisites

- `ba/BRD`: Business Requirements Document for context.
- `scenario/SCREEN_[NAME].md`: Detailed functional scenario for the feature/screen.
- [ADR Template](file:///Users/pavlyshyn/AI/ai-wt(27032026)/.agents/skills/SKILL_TMA_ARCH_SPEC/references/adr_template.md): Standard for documenting architectural choices.

---

## Output Standard

### 1. ADR Document (`adr/ADR_SCREEN_[NAME].md`)
Focus on **"WHY"** decisions are made. Reference [adr_template.md](./references/adr_template.md) for structure.
- **Context**: TMA specific constraints (auth, webview, performance).
- **Options**: Compare at least two viable technical paths.
- **Rationale**: Justify the choice based on MVP speed, scalability, or TMA limitations.

### 2. Tech Stack Document (`tech-stack/TECH_STACK_SCREEN_[NAME].md`)
Focus on **"HOW"** to implement. Reference [tech_stack_template.md](./assets/tech_stack_template.md).
- **Step-by-Step Implementation**: Precise logic flow for the developer.
- **Component Inventory**: Specific libraries, versions, and integration points.
- **Validation Criteria**: How to know if the implementation is correct.

---

## Execution Workflow (God-Level)

1.  **Contextual Analysis**:
    - Identify TMA-specific bottlenecks for this screen (e.g., heavy graphics, complex auth, offline mode).
    - Map BRD constraints to architectural requirements.
2.  **Drafting ADR**:
    - Select 1-2 core architectural problems (e.g., State Management, API Protocol).
    - Compare options and document the final decision using the mandatory template.
3.  **Generating Tech Stack**:
    - Define the implementation sequence.
    - Select specific technologies (e.g., React/Vite, NestJS, Prisma).
4.  **Improvement Loop**:
    - Brainstorm 2-3 technical improvements (e.g., caching layer, specialized UI components).
    - **CRITICAL**: Present these to the user for approval. Do NOT update final files with improvements until approved.
5.  **Finalization**:
    - Write files to `adr/` and `tech-stack/` directories using absolute paths.

---

## Constraints & Rules

- **DRY Architecture**: Re-use existing components/patterns where possible.
- **TMA First**: Prioritize light-weight, fast-loading solutions.
- **Actionable Steps**: Tech stack must be "step-by-step" so an Executor can follow it linearly.
- **No Placeholders**: Every library or tool mentioned must be real and specific.

---

## Examples

### Input: `scenario/SCREEN_W1_My_Tasks.md`
### Output (ADR snippet):
> "We choose React Query for task synchronization because it handles cache invalidation out-of-the-box, which is critical for the real-time nature of shift management in a TMA."
