#!/usr/bin/env python3
"""
validate_brd_mapping.py — Validates BRD mapping YAML output from SKILL_BRD_PARSE.
Ensures no "Must" requirements are unmapped and screen_mappings are well-formed.
Usage: python3 validate_brd_mapping.py <brd_mapping.yaml>
"""
import sys
import yaml

VALID_TYPES = {"FR", "BR", "NFR", "API", "AC"}
VALID_PRIORITIES = {"Must", "Should", "Could", "Won't"}

def validate(path: str):
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    errors = []
    warnings = []

    if "brd_summary" not in data:
        errors.append("Missing top-level 'brd_summary'")
    if "screen_mappings" not in data:
        errors.append("Missing top-level 'screen_mappings'")

    # Check unmapped "Must" requirements
    unmapped = data.get("unmapped_requirements", [])
    for req in unmapped:
        if req.get("priority") == "Must":
            errors.append(
                f"'Must' requirement {req.get('id', '?')} is unmapped. "
                f"Reason: {req.get('reason', 'not specified')}"
            )

    # Validate screen_mappings structure
    screen_mappings = data.get("screen_mappings", {})
    for screen_name, mapping in screen_mappings.items():
        if not screen_name.startswith("SCREEN_"):
            errors.append(f"Screen name must start with 'SCREEN_': {screen_name}")

        frs = mapping.get("functional_requirements", [])
        if not frs:
            warnings.append(f"{screen_name} has no functional_requirements mapped")

        for req in frs:
            if "id" not in req:
                errors.append(f"{screen_name}: functional_requirements entry missing 'id'")
            priority = req.get("priority", "Should")
            if priority not in VALID_PRIORITIES:
                warnings.append(f"{screen_name}: unknown priority '{priority}' on {req.get('id', '?')}")

    for w in warnings:
        print(f"⚠️  {w}")

    if errors:
        for e in errors:
            print(f"❌ {e}")
        print(f"\n❌ Validation FAILED ({len(errors)} error(s))")
        sys.exit(1)
    else:
        print(f"✅ Validation PASSED: {path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: validate_brd_mapping.py <brd_mapping.yaml>")
        sys.exit(1)
    validate(sys.argv[1])
