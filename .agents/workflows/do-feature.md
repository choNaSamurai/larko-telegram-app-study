---
description: End-to-end feature development workflow with strict File-Based Handover Protocol
---
# Feature Development Workflow (Do Feature)

**Input Requirements:**
To initiate this workflow, you must provide one or more design links: `[figma-design-link]`.

**MANDATORY RULE:** 
To prevent context loss across agent sessions, every role MUST read the specified input files and MUST write their results to the exact output file paths defined below. **Do not proceed to the next step without saving the artifact.**

**Step-by-Step Process:**

1. **System Analysis Phase**
   - **Invoke Role**: @[.agents/roles/system_analyst.yaml]
   - **Input Context**: `[figma-design-link]` and business requirements from @[ba].
   - **Task**: Analyze the provided design and business requirements to generate appropriate screen scenarios.
   - **Output Guarantee**: Must save the scenario to `scenario/SCREEN_[NAME].md`.

2. **Software Architecture Phase**
   - **Invoke Role**: @[.agents/roles/software_architect_tma.yaml]
   - **Input Context**: `[figma-design-link]`, @[ba], and the generated scenarios in `scenario/SCREEN_[NAME].md`.
   - **Task**: Translate the generated scenarios into technical specifications and formulate Architecture Decision Records (ADR).
   - **Output Guarantee**: Must save artifacts to `tech-stack/TECH_STACK_[NAME].md` and `adr/ADR_[NAME].md`.

3. **Implementation Phase**
   - **Invoke Role**: @[.agents/roles/tma_implementer.yaml]
   - **Input Context**: `[figma-design-link]`, @[ba], `scenario/SCREEN_[NAME].md`, `tech-stack/TECH_STACK_[NAME].md`, and `adr/ADR_[NAME].md`.
   - **Task**: Implement the feature by writing production-ready code.
   - **Output Guarantee**: Must save an implementation log and dev notes to `implemented/IMPLEMENTED_[NAME].md`.

4. **Code Review Phase**
   - **Invoke Role**: @[.agents/roles/tech_lead_reviewer.yaml]
   - **Input Context**: Source code, `[figma-design-link]`, `tech-stack/TECH_STACK_[NAME].md`, and `adr/ADR_[NAME].md`.
   - **Task**: Conduct a detailed code review ensuring architectural compliance, DRY/SOLID, and security.
   - **Output Guarantee**: Must save the review report to `reviews/REVIEW_[NAME].md`.

5. **Design Validation Phase (UI/UX)**
   - **Invoke Role**: @[.agents/roles/ui_ux_validator.yaml]
   - **Input Context**: Source code and `[figma-design-link]`.
   - **Task**: Perform Pixel-Perfect Figma verification of React/Tailwind components.
   - **Output Guarantee**: Must save visual inspection results to `qa_reports/UI_UX_[NAME].md`.

6. **Quality Assurance Phase**
   - **Invoke Role**: @[.agents/roles/qa_automation_tester.yaml]
   - **Input Context**: Source code, @[ba], and `scenario/SCREEN_[NAME].md`.
   - **Task**: Conduct logic validation by testing the code against Acceptance Criteria and generate Unit/E2E test files.
   - **Output Guarantee**: Must save the final QA logic report to `qa_reports/QA_EVAL_[NAME].md`.
