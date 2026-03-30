#!/bin/bash
# validate_dad.sh — Validates a DAD output file against SKILL_DATA_ARCH_DAD contract
# Usage: ./validate_dad.sh dad/DAD_[SCOPE].md

set -e

DAD_FILE="${1}"
ERRORS=0
WARNINGS=0

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "========================================"
echo " DAD Validation — SKILL_DATA_ARCH_DAD"
echo "========================================"
echo "File: $DAD_FILE"
echo ""

if [ -z "$DAD_FILE" ] || [ ! -f "$DAD_FILE" ]; then
  echo -e "${RED}❌ ERROR: DAD file not found: $DAD_FILE${NC}"
  exit 1
fi

check_section() {
  local section="$1"
  local label="$2"
  if grep -q "$section" "$DAD_FILE"; then
    echo -e "${GREEN}✅ Section present: $label${NC}"
  else
    echo -e "${RED}❌ MISSING SECTION: $label${NC}"
    ERRORS=$((ERRORS + 1))
  fi
}

check_pattern() {
  local pattern="$1"
  local label="$2"
  local severity="${3:-ERROR}"
  if grep -qE "$pattern" "$DAD_FILE"; then
    echo -e "${GREEN}✅ $label${NC}"
  else
    if [ "$severity" == "WARNING" ]; then
      echo -e "${YELLOW}⚠️  WARNING: $label${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "${RED}❌ MISSING: $label${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  fi
}

echo "--- Required Sections ---"
check_section "## 1. Overview"                  "1. Overview"
check_section "## 2. Constraints"               "2. Constraints & Context"
check_section "## 3. Technology Decision"       "3. Technology Decision"
check_section "## 4. Data Model"                "4. Data Model"
check_section "## 5. Storage Structure"         "5. Storage Structure"
check_section "## 6. Data Flow"                 "6. Data Flow"
check_section "## 7. Sync Strategy"             "7. Sync Strategy"
check_section "## 8. Caching Strategy"          "8. Caching Strategy"
check_section "## 9. Data Layer Architecture"   "9. Data Layer Architecture"
check_section "## 10. Offline Behavior"         "10. Offline Behavior"
check_section "## 11. Migrations"               "11. Migrations"
check_section "## 12. Error Handling"           "12. Error Handling"
check_section "## 13. Security"                 "13. Security"
check_section "## 14. Edge Cases"               "14. Edge Cases"
check_section "## 15. Open Questions"           "15. Open Questions"
check_section "## 16. Developer Notes"          "16. Developer Notes"

echo ""
echo "--- Data Model Requirements ---"
check_pattern "isSynced"              "Entity has isSynced field"
check_pattern "updatedAt"             "Entity has updatedAt field"
check_pattern "SyncQueue"             "SyncQueue entity defined"
check_pattern "retryCount"            "SyncQueue has retryCount field"
check_pattern "action.*create.*update.*delete|'create'.*'update'.*'delete'" \
                                      "SyncQueue action enum defined"
check_pattern "CacheMetadata"         "CacheMetadata entity defined"
check_pattern "ttl"                   "CacheMetadata has TTL field"
check_pattern "_localVersion"         "Entity has _localVersion field" "WARNING"

echo ""
echo "--- Sync Strategy Requirements ---"
check_pattern "last.write.wins|server.priority|merge.fields" \
                                      "Conflict resolution policy defined"
check_pattern "exponential.backoff|2\^retryCount|Math\.min" \
                                      "Retry backoff strategy defined"
check_pattern "retryCount.*5|max.*retries.*5|5.*retries" \
                                      "Max retry limit defined"
check_pattern "DEAD_LETTER|dead.letter" \
                                      "DEAD_LETTER handling defined"

echo ""
echo "--- Caching Requirements ---"
# Fixed: use grep -F for literal string matching of '* 60 * 1000'
if grep -qF '* 60 * 1000' "$DAD_FILE"; then
  echo -e "${GREEN}✅ TTL defined in milliseconds (N * 60 * 1000 format)${NC}"
else
  echo -e "${RED}❌ MISSING: TTL defined in milliseconds (N * 60 * 1000 format)${NC}"
  ERRORS=$((ERRORS + 1))
fi
check_pattern "Invalidation|invalidation|invalidate" \
                                      "Cache invalidation rules defined"

echo ""
echo "--- Architecture Requirements ---"
check_pattern "Repository"            "Repository layer mentioned"
check_pattern "→|──|↓"               "Architecture diagram present (layered flow)"
check_pattern "SyncService|Sync Service" \
                                      "SyncService mentioned separately"

echo ""
echo "--- Security Requirements ---"
check_pattern "NEVER store|never store|forbidden|❌" \
                                      "Security NEVER-store list defined"
check_pattern "JWT|access.token|token" \
                                      "Token storage policy defined"

echo ""
echo "--- Edge Cases Requirements ---"
check_pattern "[Ff]irst.launch|first.run|empty.DB" \
                                      "First launch edge case documented"
check_pattern "[Cc]orruption|corrupt|open.*error" \
                                      "DB corruption edge case documented"
check_pattern "[Mm]igration|version.*upgrade|schema.*change" \
                                      "Migration edge case documented"
check_pattern "[Oo]ffline.*first.launch|first.launch.*offline" \
                                      "Offline-at-first-launch edge case" "WARNING"

echo ""
echo "--- Open Questions ---"
check_pattern "\[BLOCKING\]|\[NON-BLOCKING\]" \
                                      "Questions tagged with BLOCKING/NON-BLOCKING"
check_pattern "fallback:" \
                                      "Fallback assumption documented" "WARNING"

echo ""
echo "--- Placeholder Check ---"
if grep -qE "\[EntityName\]|\[YYYY-MM-DD\]|\[Question text\]|\[BRD_FILE\]" "$DAD_FILE"; then
  echo -e "${RED}❌ PLACEHOLDERS REMAIN: Replace all [EntityName], [YYYY-MM-DD], [Question text], [BRD_FILE] before handoff${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No unfilled placeholders found${NC}"
fi

echo ""
echo "========================================"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✅ DAD VALID — All checks passed.${NC}"
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  DAD VALID WITH WARNINGS — $WARNINGS warning(s). Review before handoff.${NC}"
else
  echo -e "${RED}❌ DAD INVALID — $ERRORS error(s), $WARNINGS warning(s). Fix before handoff.${NC}"
fi
echo "========================================"

exit $ERRORS
