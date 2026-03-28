# Requirements Taxonomy

Reference for classifying requirements when parsing an unstructured BRD.

## Requirement Types

| Code | Type | Description | Example Keywords |
|------|------|-------------|-----------------|
| FR | Functional Requirement | What the system shall do | "must", "shall", "user can", "system allows" |
| BR | Business Rule | Hard domain constraints | "minimum", "maximum", "only when", "not allowed" |
| NFR | Non-Functional Requirement | Quality attributes | "performance", "availability", "accessibility", "security" |
| API | API Contract | Integration specification | "endpoint", "POST", "GET", "returns", "response" |
| AC | Acceptance Criteria | Testable pass/fail | "given/when/then", "test case", "verify that" |

## Disambiguation Rules

- If a statement describes **what** the system does → FR
- If a statement describes **how** a rule constrains business logic → BR
- If a statement describes **how well** the system performs → NFR
- If a statement defines **an integration point** → API
- If a statement is a **test scenario** → AC

## Mapping Ambiguous Statements

When a statement could be FR or BR:
- Ask: "Would a developer need to code a check for this?" → BR
- Ask: "Would a developer need to build a feature for this?" → FR

Example:
- "Passwords must be min 8 chars" → BR (validation rule, not a feature)
- "User can reset their password" → FR (feature to build)
