#!/bin/bash
# validate_sa_doc.sh — Validates a scenario/SCREEN_[NAME].md file against the SA doc standard
# Usage: ./validate_sa_doc.sh <path_to_scenario_file>

FILE="$1"
ERRORS=0

if [ -z "$FILE" ]; then
  echo "❌ Usage: validate_sa_doc.sh <path>"
  exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

echo "🔍 Validating: $FILE"

# Check for all 13 required sections
SECTIONS=(
  "## 1. Screen Overview"
  "## 2. Actors"
  "## 3. Entry Conditions"
  "## 4. Main Flow"
  "## 5. Alternative Flows"
  "## 6. Edge Cases"
  "## 7. UI Elements"
  "## 8. Screen States"
  "## 9. Business Rules"
  "## 10. Integrations"
  "## 11. Non-Functional"
  "## 12. Open Questions"
)

for SECTION in "${SECTIONS[@]}"; do
  if ! grep -q "$SECTION" "$FILE"; then
    echo "❌ Missing section: $SECTION"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check file naming convention: SCREEN_ prefix
BASENAME=$(basename "$FILE")
if [[ ! "$BASENAME" == SCREEN_* ]]; then
  echo "❌ File name must start with 'SCREEN_': $BASENAME"
  ERRORS=$((ERRORS + 1))
fi

# Check that file is not empty
WORDS=$(wc -w < "$FILE")
if [ "$WORDS" -lt 100 ]; then
  echo "⚠️  File seems too short ($WORDS words). Verify content is complete."
fi

if [ "$ERRORS" -eq 0 ]; then
  echo "✅ Validation PASSED: $FILE"
  exit 0
else
  echo "❌ Validation FAILED with $ERRORS error(s)"
  exit 1
fi
