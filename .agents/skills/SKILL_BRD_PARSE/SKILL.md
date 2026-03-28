---
name: SKILL_BRD_PARSE
description: >
  Parses a Business Requirements Document (BRD) to extract and map business rules, functional
  requirements, API contracts, NFRs, and actors to specific Figma screens. Use this skill whenever
  a BRD (text, PDF, or pasted content) is provided alongside a design and must be mapped to
  screen scenarios. Triggers on any mention of: "BRD", "business requirements", "requirements doc",
  "spec", "functional requirements", or when SKILL_SA_DOCUMENT requires BRD mapping as input.
---

# SKILL_BRD_PARSE — Extract & Map BRD to Screens

## Purpose

Extract structured business requirements from a BRD document and map every requirement to one
or more Figma screens. The output is used as input for `SKILL_SA_DOCUMENT` (sections 9–11).

---

## Prerequisites

- BRD content must be provided (paste, file path, or referenced artifact).
- Screen list from `SKILL_FIGMA_PARSE` must be available for mapping.

---

## BRD Input Formats Accepted

| Format | How to provide |
|--------|---------------|
| Plain text / Markdown | Paste directly into the conversation |
| `.md` or `.txt` file | Provide file path |
| PDF (text-extractable) | User pastes extracted content |
| Structured YAML/JSON spec | Provide file path |

---

## Execution Steps

### Step 1 — Identify BRD structure

Scan the document to identify top-level sections:
- Actors / User Roles
- Functional Requirements (FRs)
- Non-Functional Requirements (NFRs)
- Business Rules
- API Contracts / Data Models
- Acceptance Criteria

If the document is unstructured, impose the structure by reading for keywords.

### Step 2 — Extract and normalize requirements

For each found requirement, produce a `BRDRequirement` record:

```yaml
id: "FR-001"              # Assign ID if missing: FR-001, BR-001, NFR-001, API-001
type: "FR | BR | NFR | API | AC"
title: "Short title"
description: "Full text from BRD"
screens: []               # To be filled in Step 3
priority: "Must | Should | Could | Won't"
source_section: "Section 3.2"
```

### Step 3 — Map requirements to screens

For each `BRDRequirement`, determine which Figma screen(s) it applies to:

**Mapping rules:**
1. keyword match: does the requirement mention a screen name, feature, or action visible in Figma?
2. actor match: does the requirement mention an actor that performs actions on a known screen?
3. flow match: does the requirement describe a transition between states present in parsed screens?
4. If no match: mark `screens: [UNMAPPED]` — this is an open question for `SKILL_SA_DOCUMENT` section 12.

### Step 4 — Validate coverage

Run coverage check:
- Every Figma screen must have at least 1 mapped FR.
- Every "Must" priority requirement must be mapped.
- Gaps → flag as open questions.

### Step 5 — Output structured mapping

```yaml
brd_summary:
  total_requirements: 24
  mapped: 21
  unmapped: 3

screen_mappings:
  SCREEN_Login:
    functional_requirements: [FR-001, FR-002]
    business_rules: [BR-001]
    nfr: [NFR-002]
    api_contracts: [API-001]
    acceptance_criteria: [AC-001]

  SCREEN_Dashboard:
    functional_requirements: [FR-003, FR-004]
    business_rules: [BR-002, BR-003]
    ...

unmapped_requirements:
  - id: FR-019
    description: "..."
    reason: "No corresponding screen found in Figma design"
```

---

## Constraints

- Do not add or invent requirements not present in the BRD.
- If a requirement is ambiguous, preserve the original text and flag it.
- Priority must be maintained exactly as defined in BRD; if missing, default to `"Should"` and flag.
- Unmapped requirements must not be silently dropped — they become open questions in section 12 of the SA doc.

---

## Output Contract

- **Format**: YAML mapping in memory / passed to `SKILL_SA_DOCUMENT`
- **File (optional)**: `references/brd_mapping.yaml` — saved for traceability
- **Validation**: No "Must" requirement may remain unmapped without an explicit open question entry

---

## References

- [BRD Template Guide](references/brd_template_guide.md)
- [Requirements Taxonomy](references/requirements_taxonomy.md)
- [Screen Naming Convention](references/naming_conventions.md)

---

## Examples

### Input
```
BRD excerpt:
"FR-001: The user must be able to log in using email and password.
 BR-001: Passwords must be minimum 8 characters, one uppercase, one digit.
 API-001: POST /auth/login → returns {token, userId} on 200, 401 on invalid credentials."

Figma screens: [SCREEN_Login, SCREEN_Dashboard]
```

### Output
```yaml
screen_mappings:
  SCREEN_Login:
    functional_requirements:
      - id: FR-001
        description: "User must log in using email and password"
        priority: Must
    business_rules:
      - id: BR-001
        description: "Min 8 chars, one uppercase, one digit"
    api_contracts:
      - id: API-001
        endpoint: "POST /auth/login"
        response_200: "{token, userId}"
        response_401: "Invalid credentials"
```
