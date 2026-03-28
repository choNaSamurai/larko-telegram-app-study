#!/usr/bin/env python3
import os
import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description="Initialize TMA Implementation Log")
    parser.add_argument("--screen", required=True, help="Name of the screen (e.g. W1_My_Tasks)")
    args = parser.parse_args()

    screen_name = args.screen
    target_file = f"implemented/IMPLEMENTED_SCREEN_{screen_name}.md"
    template_file = ".agents/skills/SKILL_TMA_IMPLEMENT/assets/implemented_log_template.md"

    if os.path.exists(target_file):
        print(f"File {target_file} already exists. Skipping.")
        return

    os.makedirs("implemented", exist_ok=True)

    try:
        with open(template_file, "r") as f:
            content = f.read()
        
        content = content.replace("[SCREEN_NAME]", screen_name)

        with open(target_file, "w") as f:
            f.write(content)
        
        print(f"Successfully created {target_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
