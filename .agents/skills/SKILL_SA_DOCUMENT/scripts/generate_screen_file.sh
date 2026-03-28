#!/bin/bash
# generate_screen_file.sh — Generates an empty SCREEN_[NAME].md with all 13 section stubs
# Usage: ./generate_screen_file.sh <SCREEN_NAME> [output_dir]

SCREEN_NAME="$1"
OUTPUT_DIR="${2:-scenario}"

if [ -z "$SCREEN_NAME" ]; then
  echo "❌ Usage: generate_screen_file.sh <SCREEN_NAME> [output_dir]"
  exit 1
fi

# Normalize name: replace spaces with underscore, PascalCase already preserved
SAFE_NAME=$(echo "$SCREEN_NAME" | sed 's/ /_/g')
FILE_PATH="$OUTPUT_DIR/SCREEN_${SAFE_NAME}.md"

mkdir -p "$OUTPUT_DIR"

cat > "$FILE_PATH" << EOF
# SCREEN_${SAFE_NAME} — System Analyst Scenario

## 1. Screen Overview

<!-- One paragraph: screen purpose, where it sits in the user journey -->

## 2. Actors

<!-- List all actors: User roles, systems, external services -->

## 3. Entry Conditions (Pre-conditions)

<!-- What must be true before the user can access this screen -->

## 4. Main Flow (Happy Path)

<!-- Numbered steps: Actor → Action → System Response -->
1. 

## 5. Alternative Flows

<!-- Named alternative paths -->
### 5.1 [Name]

## 6. Edge Cases & Error States

<!-- Exhaustive list: validation failures, timeouts, empty states, errors -->

## 7. UI Elements & States

| Element | Type | States | Behavior | Validation Rules |
|---------|------|--------|----------|-----------------|
|         |      |        |          |                 |

## 8. Screen States

<!-- All possible screen-level states: loading, empty, error, populated, disabled -->

## 9. Business Rules

<!-- BRD-sourced rules. Cite BRD section if known -->

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|----------|--------|---------|----------|-------------|
|          |        |         |          |             |

## 11. Non-Functional Requirements

<!-- Performance, accessibility (WCAG), offline behavior, security -->

## 12. Open Questions

<!-- Unresolved questions for stakeholders -->

## 13. Proposed Improvements (PENDING APPROVAL)

<!-- Do NOT populate this section until user explicitly approves improvements -->
EOF

echo "✅ Created: $FILE_PATH"
