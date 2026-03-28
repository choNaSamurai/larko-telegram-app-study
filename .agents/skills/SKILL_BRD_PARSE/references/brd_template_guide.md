# BRD Template Guide

## Standard BRD Structure

A well-formed BRD should contain these top-level sections. If the provided document is
unstructured, map its content to these categories during parsing.

### 1. Document Header
- Project name, version, author, date

### 2. Actors / User Roles
- Who uses the system: roles, types, permissions

### 3. Functional Requirements (FR)
- What the system must DO
- Format: `FR-NNN: Description`
- Priority: Must | Should | Could | Won't

### 4. Non-Functional Requirements (NFR)
- Performance, security, accessibility, scalability
- Format: `NFR-NNN: Description`

### 5. Business Rules (BR)
- Hard constraints on the business logic
- Format: `BR-NNN: Description`

### 6. API Contracts
- Endpoint definitions, request/response schemas, error codes
- Format: `API-NNN: [METHOD] /path → response`

### 7. Acceptance Criteria (AC)
- Testable pass/fail conditions for each FR

## Priority Classification

| Priority | Meaning |
|----------|---------|
| Must | Required for MVP. Cannot be omitted. |
| Should | Highly desirable but not blockers. |
| Could | Nice to have if time/budget allows. |
| Won't | Out of scope for this iteration. |

## When BRD Is Missing or Partial

If the BRD is absent or incomplete:
1. Infer requirements only from Figma annotations.
2. Mark all inferred requirements as `source: "Inferred from Figma"`.
3. Add all inferred requirements to section 12 (Open Questions) in the SA doc.
4. Do not promote inferred requirements to "Must" priority without confirmation.
