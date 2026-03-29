---
name: SKILL_FIGMA_PARSE
description: >
  Parses a Figma design via the Figma MCP tool to extract a structured inventory of screens,
  UI elements, component states, and visual flows. Use this skill whenever a Figma URL or node ID
  is provided and the task involves design analysis, SA documentation, or UX review. Triggers on
  any mention of: "Figma link", "Figma URL", "design", "parse screen", "screen inventory",
  or when SKILL_SA_DOCUMENT requires parsed Figma data as input.
---

# SKILL_FIGMA_PARSE — Extract Structured Data from Figma Design

## Purpose

Invoke the Figma MCP to retrieve design context for a given screen node, then transform the
raw design data into a structured screen inventory used as input for `SKILL_SA_DOCUMENT`.

---

## Prerequisites

- A Figma URL or node ID must be provided by the user or passed from the workflow.
- Figma MCP server must be connected (`figma-dev-mode-mcp-server`).

---

## Execution Steps

### Step 1 — Identify node

Extract the `nodeId` from the Figma URL:
- URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2` → nodeId = `1:2`
- If no node ID in URL, call `get_metadata` on the page to enumerate all top-level frames.

### Step 2 — Get screen metadata (overview)

Call `get_metadata` with the page or frame node ID to get the full tree of screens.

```
Tool: get_metadata
Input: nodeId = <page or root frame id>
Output: XML tree with node IDs, layer types, names, positions, sizes
```

### Step 3 — Get design context per screen

For each screen node, call `get_design_context`:

```
Tool: get_design_context
Input: nodeId = <screen node id>
       artifactType = "WEB_PAGE_OR_APP_SCREEN" or "COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN"
Output: reference code, screenshot, component specs, spacing, colors, typography
```

**📌 ICON EXTRACTION — MANDATORY during this step:**
For every element that contains an SVG icon, find its `data-name` attribute in the output.
Examples of what to look for in the generated code:
```
<div data-name="solar:route-bold" ...>
<div data-name="mdi:company" ...>
<div data-name="majesticons:note-text" ...>
```
The `data-name` value is the exact `@iconify/react` icon ID.
Record each icon in the Icon Inventory table (see Step 6).

### Step 4 — Get screenshot for visual reference

```
Tool: get_screenshot
Input: nodeId = <screen node id>
Output: PNG screenshot saved as assets/screenshots/SCREEN_[NAME].png
```

### Step 5 — Extract variables (design tokens)

```
Tool: get_variable_defs
Input: nodeId = <screen node id>
Output: color tokens, spacing tokens used on this screen
```

### Step 6 — Structure output

Produce a `ParsedFigmaScreen` record for each screen:

```yaml
screen_name: "SCREEN_[NAME]"           # PascalCase, matches Figma layer name
node_id: "123:456"
screenshot: assets/screenshots/SCREEN_[NAME].png
actors: []                              # Inferred from context / annotations
ui_elements:
  - id: "element_id"
    type: "Button | TextField | Label | Icon | Card | ..."
    label: "Login"
    states: ["default", "pressed", "disabled", "loading"]
    variants: []
    position: {x, y, w, h}
    icon: "solar:route-bold"            # REQUIRED if element contains an icon — use Figma data-name
flows:
  - from: "SCREEN_A"
    to: "SCREEN_B"
    trigger: "Button tap / Form submit / ..."
design_tokens:
  colors: {}
  typography: {}
  spacing: {}
icon_inventory:                         # ← NEW: MANDATORY table of all icons on this screen
  - figma_node_id: "192:6209"
    data_name: "solar:route-bold"       # Exact value from data-name attribute
    size: 24
    color: "#ededed"
    component_used_in: "TaskCard"
  - figma_node_id: "192:6198"
    data_name: "mdi:company"
    size: 16
    color: "#9d9d9d"
    component_used_in: "TaskCard"
  - figma_node_id: "111:8627"
    data_name: "majesticons:note-text"
    size: 20
    color: "#9d9d9d"
    component_used_in: "TaskCard"
notes: ""                               # Any ambiguous or missing annotations
```

**The `icon_inventory` section feeds directly into:**
- Scenario `§ 7 UI Elements` — "Icon" column
- Tech Stack — `@iconify/react` dependency and component usage patterns
- TMA Implementer — `Figma Icon Extraction Check` verification gate

### Step 7 — Extract CSS Design Tokens (MANDATORY output)

From the `get_variable_defs` and `get_design_context` outputs, produce a structured **Design Tokens Table** for every screen. This table is the authoritative source for the implementer's CSS values.

```yaml
design_tokens_css:
  # Colors — exact hex values from Figma variables/fills
  colors:
    - token: "--color-bg-screen"         # CSS var name (use kebab-case)
      hex: "#0f0f1a"                     # Exact hex from Figma
      usage: "Screen background"         # Where it's used
    - token: "--color-bg-card"
      hex: "#1a1a2e"
      usage: "Task card, balance card background"
    - token: "--color-text-primary"
      hex: "#ffffff"
      usage: "Primary text, card titles"
    - token: "--color-text-secondary"
      hex: "#9d9d9d"
      usage: "Subtitle, meta text"
    - token: "--color-border-status-active"
      hex: "#60a5fa"
      usage: "Active task card left border"

  # Spacing — px values from Figma layout
  spacing:
    - element: "Screen horizontal padding"
      value: "16px"
    - element: "Card internal padding"
      value: "12px 16px"
    - element: "List item gap"
      value: "8px"
    - element: "Section gap"
      value: "24px"

  # Typography — exact values from Figma text styles
  typography:
    - role: "Card title"
      font_family: "Inter"
      font_size: "14px"
      font_weight: "500"
      line_height: "20px"
      letter_spacing: "0px"
    - role: "Meta / label text"
      font_family: "Inter"
      font_size: "12px"
      font_weight: "400"
      line_height: "16px"

  # Border radius
  border_radius:
    - element: "Task card"
      value: "12px"
    - element: "Status badge"
      value: "6px"
    - element: "Avatar"
      value: "50%"

  # Shadows (if any)
  shadows:
    - element: "Card shadow"
      value: "0px 4px 16px rgba(0, 0, 0, 0.25)"
```

> **This Design Tokens table MUST be:**
> 1. Included verbatim in the `SKILL_SA_DOCUMENT` output under `§ 12.1`
> 2. Referenced in the Tech Stack as the authoritative source for CSS values
> 3. Used by the TMA Implementer's "Color Token Check" and "Spacing Fidelity Check" gates

---

## Constraints

- Do not invent UI elements not present in Figma.
- If a node is a component variant, enumerate all variant states explicitly.
- If Figma annotations are missing, mark the element with `notes: "ANNOTATION MISSING"`.
- Save screenshots to `assets/screenshots/` using the screen name as filename.
- Pass structured output directly to `SKILL_SA_DOCUMENT` or `SKILL_BRD_PARSE`.

---

## Output Contract

- **Format**: YAML record per screen (in memory / passed to next skill)
- **Screenshots**: PNG files in `assets/screenshots/SCREEN_[NAME].png`
- **Validation**: Each screen must have at minimum: `screen_name`, `node_id`, `ui_elements` (non-empty)

---

## References

- [Figma MCP Tool Docs](references/figma_mcp_guide.md)
- [Screen Naming Convention](references/naming_conventions.md)

---

## Examples

### Input
```
User: "Here is the Figma link: https://figma.com/design/AbC123/MyApp?node-id=12-34"
```

### Output
```yaml
screen_name: "SCREEN_Dashboard"
node_id: "12:34"
screenshot: assets/screenshots/SCREEN_Dashboard.png
ui_elements:
  - id: "btn_logout"
    type: "Button"
    label: "Log Out"
    states: ["default", "pressed"]
  - id: "card_balance"
    type: "Card"
    label: "Balance"
    states: ["populated", "loading", "empty"]
flows:
  - from: "SCREEN_Dashboard"
    to: "SCREEN_Login"
    trigger: "Tap Log Out"
design_tokens:
  colors:
    primary: "#1A73E8"
    surface: "#FFFFFF"
```
