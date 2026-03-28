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
flows:
  - from: "SCREEN_A"
    to: "SCREEN_B"
    trigger: "Button tap / Form submit / ..."
design_tokens:
  colors: {}
  typography: {}
  spacing: {}
notes: ""                               # Any ambiguous or missing annotations
```

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
