---
name: SKILL_TMA_ARCH_ADR
description: >
  Transforms BRD requirements and SA screen scenarios into Architecture Decision Records (ADR)
  and step-by-step tech stack specifications for Telegram Mini Apps.
---

# SKILL_TMA_ARCH_ADR — TMA Architecture & Tech Stack

## Purpose

This skill converts high-level business requirements and detailed screen scenarios into
formal architectural decisions and a concrete technical implementation plan (tech stack)
specifically optimized for the Telegram Mini App environment.

---

## Prerequisites

- `ba/BRD`: Business Requirements Document.
- `scenario/SCREEN_[NAME].md`: System Analyst scenario for the specific screen.

---

## Output Standard

### 1. ADR Document (`adr/ADR_SCREEN_[NAME].md`)
Follow the example in `adr-document`:
- **Title**: ADR-XXX: [Decision Name]
- **Status**: PROPOSED
- **Context**: Project context and constraints (TMA specific).
- **Problem**: What architectural problem are we solving for this screen?
- **Options**: Comparison of at least 2 options (e.g., Mono vs Micro, Node vs Go).
- **Decision**: The selected technical path.
- **Rationale**: Why this choice (speed, team size, TMA constraints).
- **Consequences**: Positive and negative impacts.
- **Future**: Scaling considerations.

### 2. Tech Stack Document (`tech-stack/TECH_STACK_SCREEN_[NAME].md`)
- **Step-by-Step Description**: Detailed technical steps to implement the screen.
- **Components**: List of libraries, frameworks, and tools.
- **Integration**: How it connects to the TMA environment and existing backend.

---

## Execution Steps

1. **Analysis**: Read the BRD and the specific screen scenario.
2. **ADR Generation**: Draft the ADR based on the standard template, focusing on "WHY" certain decisions are made.
3. **Tech Stack Generation**: List the specific technology choices and the step-by-step implementation logic.
4. **Improvement Proposal**: After generating the tech stack, list potential technical or architectural improvements.
5. **Approval Flow**:
   - Present the ADR and Tech Stack to the user.
   - Present the improvement list separately.
   - **WAIT** for user consent before appending improvements to the tech stack file.
6. **Finalize**: Write files to `adr/` and `tech-stack/` directories.

---

## Constraints

- Focus on Telegram Mini App limitations (web-view constraints, auth via Telegram).
- ADR must explain the "WHY", not just the "WHAT".
- improvements must be explicitly approved before file modification.
