# ADR Template for Telegram Mini App

Follow this structure for every Architectural Decision Record.

> **Core Principle (from project standards):**
> - ❌ Do NOT write "WHAT" — this is visible in the code.
> - ✅ DO write "WHY" — this is the most valuable part.
> - ADR ≠ documentation. ADR is the *history of a decision*, not a full system description.
> - SA document = "how the system works" | ADR = "why we decided this way"
> - Many small ADRs > one big ADR.

---

## Title: ADR-[ID]: [Decision Name]

**Status**: `PROPOSED` | `ACCEPTED` | `DEPRECATED`

---

## Context

Describe the current state, technical environment, and constraints.

- **Project Scope**: [e.g. Shift Management TMA]
- **TMA Constraints**: [e.g. Telegram WebApp, fast initial load, limited screen size]
- **Team Size**: [e.g. small team, MVP phase]

---

## Problem

What specific technical challenge are we solving for this screen?

- "How to handle real-time updates?"
- "Which state management strategy is best for X?"

---

## Options Considered

### Option 1: [Name]
- **Pros**: ...
- **Cons**: ...

### Option 2: [Name]
- **Pros**: ...
- **Cons**: ...

---

## Decision

Clear statement of the chosen path.

---

## Rationale

Why this choice is better for the current MVP and TMA context.

- MVP Speed — [explain]
- Team Familiarity — [explain]
- TMA Constraints — [explain]

---

## Consequences

**Positive:**
- ...

**Negative:**
- ...

---

## Future Considerations

> If system grows beyond [threshold]: consider [alternative].

---

## Full Example

```markdown
# ADR-001: Backend Architecture for Telegram Mini App

Status: ACCEPTED

## Context
We are building a Telegram Mini App for shift management.
Constraints: Must work inside Telegram WebApp, fast initial load.

## Problem
We need to choose backend architecture.

## Options

### Option 1: Monolith (NestJS)
- fast to build
- easy to maintain

### Option 2: Microservices
- scalable
- high complexity

## Decision
We choose Monolith (NestJS).

## Rationale
- MVP speed is priority
- Small engineering team
- Telegram Mini App constraints

## Consequences
Positive: faster delivery, simpler debugging
Negative: future scaling refactor required

## Future
Introduce microservices only if scaling requires it.
```
