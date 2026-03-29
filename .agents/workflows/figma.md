---
description: End-to-end orchestration of Telegram Mini App screen
---

name: "TMA_Full_Pipeline_Orchestrator"
description: >
  End-to-end orchestration of Telegram Mini App screen development pipeline.
  Controls System Analyst → Software Architect → Implementer flow,
  including blocking resolution and artifact validation.

trigger:
  type: message_pattern
  pattern: "^ADR\\s+scenarios\\/SCREEN_[A-Z_]+\\.md$"

context:
  extract:
    - screen_name from input_path

stages:

  # ─────────────────────────────────────────────
  # 1. SYSTEM ANALYST (optional re-generation)
  # ─────────────────────────────────────────────
  - name: "Ensure Scenario Exists"
    type: conditional
    if:
      not_exists: "scenario/SCREEN_${screen_name}.md"
    then:
      - call: System_Analyst
        input:
          - "Figma URL"
          - "ba/BRD"
        output: "scenario/SCREEN_${screen_name}.md"

  # ─────────────────────────────────────────────
  # 2. BLOCKING CHECK (CRITICAL GATE)
  # ─────────────────────────────────────────────
  - name: "Check Blocking Questions"
    type: validation
    source: "scenario/SCREEN_${screen_name}.md"
    rules:
      - find: "[BLOCKING]"
    on_fail:
      action: pause
      message: >
        Scenario contains [BLOCKING] open questions.
        Resolve them before continuing OR confirm fallback generation.

  # ─────────────────────────────────────────────
  # 3. ARCHITECTURE GENERATION
  # ─────────────────────────────────────────────
  - name: "Generate ADR + Tech Stack"
    type: agent_call
    agent: Software_Architect_TMA
    input:
      - "scenario/SCREEN_${screen_name}.md"
      - "ba/BRD"
    output:
      - "adr/ADR_SCREEN_${screen_name}.md"
      - "tech-stack/TECH_STACK_SCREEN_${screen_name}.md"

  # ─────────────────────────────────────────────
  # 4. TECH STACK VALIDATION
  # ─────────────────────────────────────────────
  - name: "Validate Tech Stack Integrity"
    type: validation
    source: "tech-stack/TECH_STACK_SCREEN_${screen_name}.md"
    rules:
      - must_contain: "## File Structure"
      - must_contain: "## Step-by-Step Implementation"
      - must_contain: "## TypeScript Interfaces"
      - must_contain: "Traces to:"
      - must_contain: "MockData.ts"
    on_fail:
      action: retry_stage
      stage: "Generate ADR + Tech Stack"

  # ─────────────────────────────────────────────
  # 5. IMPLEMENTATION READINESS CHECK
  # ─────────────────────────────────────────────
  - name: "Pre-Implementation Gate"
    type: validation
    sources:
      - "scenario/SCREEN_${screen_name}.md"
      - "tech-stack/TECH_STACK_SCREEN_${screen_name}.md"
    rules:
      - ensure_no_blocking_questions
      - ensure_types_defined
      - ensure_file_structure_complete
    on_fail:
      action: pause
      message: >
        Implementation cannot start.
        Fix Scenario or Tech Stack inconsistencies.

  # ─────────────────────────────────────────────
  # 6. IMPLEMENTATION
  # ─────────────────────────────────────────────
  - name: "Run Implementation"
    type: agent_call
    agent: Telegram_Mini_App_Implementer_TMA
    input:
      - "scenario/SCREEN_${screen_name}.md"
      - "tech-stack/TECH_STACK_SCREEN_${screen_name}.md"
      - "adr/ADR_SCREEN_${screen_name}.md"
      - "ba/04_BRD_Larko_MVP.md"
    output:
      - "implemented/IMPLEMENTED_SCREEN_${screen_name}.md"
      - "src/**"

  # ─────────────────────────────────────────────
  # 7. POST-IMPLEMENTATION VALIDATION
  # ─────────────────────────────────────────────
  - name: "Validate Implementation Log"
    type: validation
    source: "implemented/IMPLEMENTED_SCREEN_${screen_name}.md"
    rules:
      - must_contain: "Verification gate result"
      - must_contain: "Files created/modified"
    on_fail:
      action: retry_stage
      stage: "Run Implementation"

  # ─────────────────────────────────────────────
  # 8. FINAL OUTPUT
  # ─────────────────────────────────────────────
  - name: "Pipeline Complete"
    type: output
    message: >
      ✅ Screen ${screen_name} fully implemented.
      Artifacts:
      - Scenario
      - ADR
      - Tech Stack
      - Production Code
      - Implementation Log