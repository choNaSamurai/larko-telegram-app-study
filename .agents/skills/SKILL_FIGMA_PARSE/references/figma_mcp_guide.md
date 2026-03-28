# Figma MCP Tool Guide

## Available Tools

### `get_metadata`
Returns XML tree of all nodes (IDs, types, names, positions, sizes).
- Use for: discovering all screens/frames on a page.
- Input: `nodeId` (page or frame node ID)

### `get_design_context`
Returns reference code, screenshot, component specs, spacing, colors, typography.
- Use for: deep analysis of a single screen or component.
- Input: `nodeId`, `artifactType`
- `artifactType` values:
  - `WEB_PAGE_OR_APP_SCREEN` — full screens
  - `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN` — parts of screens
  - `REUSABLE_COMPONENT` — design system components

### `get_screenshot`
Returns PNG screenshot of the specified node.
- Use for: visual reference in SA documents.
- Input: `nodeId`

### `get_variable_defs`
Returns design token definitions (colors, spacing, typography).
- Use for: extracting brand tokens for NFR documentation.
- Input: `nodeId`

## Extracting nodeId from URLs

| URL pattern | nodeId |
|-------------|--------|
| `?node-id=12-34` | `12:34` |
| `?node-id=12%3A34` | `12:34` |
| No node-id param | Use page root, call `get_metadata` to find frames |

## Tips

- Always call `get_metadata` first on the ROOT PAGE node to see all screens.
- For component variants, the `get_design_context` response includes all variant states.
- Screenshots are returned as base64 or URL — save to `assets/screenshots/`.
- If Figma returns a large component tree, focus on the named frames (pages → frames = screens).
