#!/usr/bin/env python3
"""
validate_figma_output.py — Validates ParsedFigmaScreen YAML output from SKILL_FIGMA_PARSE.
Usage: python3 validate_figma_output.py <parsed_output.yaml>
"""
import sys
import yaml

REQUIRED_FIELDS = ["screen_name", "node_id", "ui_elements"]

def validate(path: str):
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    errors = []

    if not isinstance(data, dict):
        print(f"❌ Expected a YAML mapping, got {type(data)}")
        sys.exit(1)

    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: '{field}'")

    if "ui_elements" in data:
        elements = data["ui_elements"]
        if not isinstance(elements, list) or len(elements) == 0:
            errors.append("'ui_elements' must be a non-empty list")
        else:
            for i, el in enumerate(elements):
                if "type" not in el:
                    errors.append(f"ui_elements[{i}] is missing 'type'")
                if "label" not in el and "id" not in el:
                    errors.append(f"ui_elements[{i}] must have at least 'id' or 'label'")

    if "screen_name" in data:
        name = data["screen_name"]
        if not name.startswith("SCREEN_"):
            errors.append(f"screen_name must start with 'SCREEN_', got: {name}")

    if errors:
        for e in errors:
            print(f"❌ {e}")
        print(f"\n❌ Validation FAILED ({len(errors)} error(s))")
        sys.exit(1)
    else:
        print(f"✅ Validation PASSED: {path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: validate_figma_output.py <parsed_output.yaml>")
        sys.exit(1)
    validate(sys.argv[1])
