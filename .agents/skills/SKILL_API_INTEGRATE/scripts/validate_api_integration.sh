#!/usr/bin/env bash
# validate_api_integration.sh
# Validates API integration completeness for a given screen.
# Usage: ./validate_api_integration.sh [SCREEN_NAME]
# Exit 0 = PASS, Exit 1 = FAIL

SCREEN_NAME="${1:-UNKNOWN}"
LOG_FILE="implemented/IMPLEMENTED_API_${SCREEN_NAME}.md"
LIB_DIR="lib"
ERRORS=0
WARNINGS=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo " API Integration Validator"
echo " Screen: $SCREEN_NAME"
echo "========================================"
echo ""

# ──────────────────────────────────────────
# CHECK 1: IMPLEMENTED_API log exists
# ──────────────────────────────────────────
if [ ! -f "$LOG_FILE" ]; then
  echo -e "${RED}[FAIL]${NC} Log file not found: $LOG_FILE"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}[PASS]${NC} Log file exists: $LOG_FILE"
fi

# ──────────────────────────────────────────
# CHECK 2: Endpoint Map populated
# ──────────────────────────────────────────
if grep -q "§Endpoint Map" "$LOG_FILE" 2>/dev/null; then
  MAP_ROWS=$(grep -c "| POST\|| GET\|| PUT\|| PATCH\|| DELETE" "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$MAP_ROWS" -gt 0 ]; then
    echo -e "${GREEN}[PASS]${NC} Endpoint Map has $MAP_ROWS endpoint(s)."
  else
    echo -e "${RED}[FAIL]${NC} Endpoint Map exists but has no endpoint rows."
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}[FAIL]${NC} §Endpoint Map section missing in $LOG_FILE."
  ERRORS=$((ERRORS + 1))
fi

# ──────────────────────────────────────────
# CHECK 3: Phase 6 Integration Gate present
# ──────────────────────────────────────────
if grep -q "Phase 6" "$LOG_FILE" 2>/dev/null; then
  if grep -q "Integration Gate: PASS" "$LOG_FILE" 2>/dev/null; then
    echo -e "${GREEN}[PASS]${NC} Phase 6 Integration Gate: PASS found in log."
  else
    echo -e "${RED}[FAIL]${NC} Phase 6 Integration Gate is not marked PASS."
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}[FAIL]${NC} Phase 6 section missing in log."
  ERRORS=$((ERRORS + 1))
fi

# ──────────────────────────────────────────
# CHECK 4: No active mock bypasses for this screen
# ──────────────────────────────────────────
SCREEN_LOWER=$(echo "$SCREEN_NAME" | tr '[:upper:]' '[:lower:]')
MOCK_HITS=$(grep -r "MockData\|mockService\|MOCK_MODE\s*=\s*true" "$LIB_DIR" 2>/dev/null | \
  grep -i "$SCREEN_LOWER" | grep -v "_test\." | wc -l)
if [ "$MOCK_HITS" -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} No active mock bypasses found for screen '$SCREEN_NAME'."
else
  echo -e "${RED}[FAIL]${NC} Found $MOCK_HITS active mock reference(s) for '$SCREEN_NAME':"
  grep -r "MockData\|mockService\|MOCK_MODE\s*=\s*true" "$LIB_DIR" 2>/dev/null | \
    grep -i "$SCREEN_LOWER" | grep -v "_test\."
  ERRORS=$((ERRORS + 1))
fi

# ──────────────────────────────────────────
# CHECK 5: No inline API key in source code
# ──────────────────────────────────────────
INLINE_KEY=$(grep -r "IMuLwFzIMpJ7d7lQT9Q\|CdnIorZ0fmr414EmXZX\|vdMA9KzNnOJC6INA1\|Fujr9ZvDXSnl" \
  "$LIB_DIR" 2>/dev/null | grep -v "api_constants\." | wc -l)
if [ "$INLINE_KEY" -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} No inline API keys found in source code."
else
  echo -e "${RED}[FAIL]${NC} Found $INLINE_KEY inline API key occurrence(s) — move to ApiConstants!"
  ERRORS=$((ERRORS + 1))
fi

# ──────────────────────────────────────────
# CHECK 6: No tokens in SharedPreferences
# ──────────────────────────────────────────
TOKEN_PREFS=$(grep -r "SharedPreferences\|prefs\.set" "$LIB_DIR" 2>/dev/null | \
  grep -i "token\|access_token\|refresh_token" | wc -l)
if [ "$TOKEN_PREFS" -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} No JWT tokens in SharedPreferences."
else
  echo -e "${RED}[FAIL]${NC} Found $TOKEN_PREFS token storage in SharedPreferences — use SecureStorage!"
  ERRORS=$((ERRORS + 1))
fi

# ──────────────────────────────────────────
# CHECK 7: AppError sealed class exists
# ──────────────────────────────────────────
if find "$LIB_DIR" -name "app_error.dart" | grep -q .; then
  if grep -q "sealed class AppError\|class AppError" "$LIB_DIR/core/errors/app_error.dart" 2>/dev/null || \
     find "$LIB_DIR" -name "app_error.dart" -exec grep -q "AppError" {} \;; then
    echo -e "${GREEN}[PASS]${NC} AppError class exists."
  fi
else
  echo -e "${YELLOW}[WARN]${NC} app_error.dart not found at expected path lib/core/errors/app_error.dart."
  WARNINGS=$((WARNINGS + 1))
fi

# ──────────────────────────────────────────
# CHECK 8: Dio interceptors present
# ──────────────────────────────────────────
AUTH_INTERCEPTOR=$(find "$LIB_DIR" -name "*auth_interceptor*" -o -name "*interceptor*" 2>/dev/null | wc -l)
if [ "$AUTH_INTERCEPTOR" -gt 0 ]; then
  echo -e "${GREEN}[PASS]${NC} Auth/Dio interceptor file(s) found."
else
  echo -e "${YELLOW}[WARN]${NC} No interceptor files found — ensure AuthInterceptor is configured."
  WARNINGS=$((WARNINGS + 1))
fi

# ──────────────────────────────────────────
# CHECK 9: Production URL not used in non-prod code
# ──────────────────────────────────────────
PROD_URL_HITS=$(grep -r "api-larko\.driveapp\.work" "$LIB_DIR" 2>/dev/null | \
  grep -v "api_constants\.\|// prod\|#.*prod" | grep -v "_test\." | wc -l)
if [ "$PROD_URL_HITS" -eq 0 ]; then
  echo -e "${GREEN}[PASS]${NC} Production URL not hardcoded in non-constants source files."
else
  echo -e "${YELLOW}[WARN]${NC} Found $PROD_URL_HITS production URL reference(s) — ensure this is intentional."
  WARNINGS=$((WARNINGS + 1))
fi

# ──────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────
echo ""
echo "========================================"
echo " Validation Summary"
echo "========================================"
echo -e " Errors:   ${RED}$ERRORS${NC}"
echo -e " Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✅ PASS — API integration for '$SCREEN_NAME' is complete.${NC}"
  exit 0
else
  echo -e "${RED}❌ FAIL — $ERRORS error(s) must be fixed before marking integration as DONE.${NC}"
  exit 1
fi
