# TMA Implementation Checklist

Use this checklist for every screen implementation to ensure industrial-grade quality.

## 🎯 Figma Visual Fidelity (FIRST — run before marking any phase complete)

> This section is MANDATORY. Every item must be PASS before the implementation is considered done.

### Icon Fidelity
- [ ] **Icons**: ALL icons use `@iconify/react` with exact `data-name` from Figma. Zero inline `<path>` SVGs.
- [ ] **Icon size**: Each icon size (width/height) matches Figma spec (px value).
- [ ] **Icon color**: Each icon color matches Figma spec (exact hex).

### Color Fidelity
- [ ] **Background colors**: Every card, container, header background matches Figma hex exactly.
- [ ] **Text colors**: Primary, secondary, muted text colors match Figma hex exactly.
- [ ] **Accent/Status colors**: Status badge, accent border colors match Figma hex exactly.
- [ ] **No generic colors**: No plain red/green/blue (`#ff0000`, `text-red-500` etc.) unless Figma specifies.

### Typography Fidelity
- [ ] **Font family**: Google Font loaded and applied (usually `Inter`). No system fallback visible.
- [ ] **Font sizes**: All text elements use the exact px/rem values from Figma.
- [ ] **Font weights**: Bold/Medium/Regular match Figma weight values (400/500/600/700).
- [ ] **Line heights**: Specified line-height values applied (do not use browser defaults).
- [ ] **Letter spacing**: Applied where Figma specifies tracking.

### Spacing & Layout Fidelity
- [ ] **Padding**: Internal padding of cards/containers matches Figma px values EXACTLY (must use `get_design_context` to verify, e.g. `pl-[17px]`).
- [ ] **Gap/Margin**: Spacing between elements matches Figma gap values EXACTLY. No guessing with generic Tailwind `gap-2` or `p-4`.
- [ ] **Border radius**: Every rounded corner matches Figma border-radius px value.
- [ ] **Safe area**: Screen header uses `env(safe-area-inset-top, 16px)` — NOT hardcoded `pt-4`.

### Card & Border Fidelity
- [ ] **Card borders**: Accent borders are LEFT-ONLY (`borderLeft`), never all 4 sides.
- [ ] **Border width**: Border width matches Figma (typically `2px`).
- [ ] **Shadow**: Box-shadow values match Figma drop shadow spec (color, blur, offset).

### Number & Price Format Fidelity
- [ ] **Price format**: Prices display as `₴12,400` (comma separator) — NOT `₴12 400` (space).
- [ ] **formatMoney()**: Uses regex replace, NOT `toLocaleString('uk-UA')`.

### Visual Comparison Gate
- [ ] **Figma screenshot**: Called `get_screenshot` for every major component node in Figma.
- [ ] **Browser screenshot**: Captured implementation output via browser tool.
- [ ] **Diff confirmed**: Side-by-side comparison done. Visual delta < 5% of design intent.
- [ ] **Deviations logged**: Any intentional deviation from Figma documented in `implemented/` log.

---

## 🎨 UI & Aesthetics
- [ ] **Typography**: Using `Inter` or specified Google Font. No browser defaults.
- [ ] **Colors**: Adhering to the project's palette. Using CSS variables for theme support.
- [ ] **Aesthetics**: Glassmorphism applied where specified (subtle blur, borders).
- [ ] **Animations**: Micro-interactions for buttons (hover/active), smooth transitions between states.

## ⚡ Performance
- [ ] **Assets**: Images optimized/compressed. Icons use `@iconify/react` (NOT inline SVG).
- [ ] **Loading**: Skeleton screens or animated loaders for async data.
- [ ] **Bundle**: No unused imports; dynamic imports for large components.

## 📱 Telegram Integration
- [ ] **WebApp SDK**: `window.Telegram.WebApp` initialized correctly.
- [ ] **Theme Integration**: Colors synchronized with `themeParams`.
- [ ] **Haptics**: Impact feedback on primary actions (buttons, switches).
- [ ] **Navigation**: `BackButton` managed according to screen history.

## 🛡 Security & Logic
- [ ] **Validation**: All user inputs sanitized and validated.
- [ ] **State**: Managing local vs global state as per ADR (e.g., Zustand/Redux).
- [ ] **API**: Using standard headers (auth, initData) for backend requests.

## 📊 Documentation
- [ ] **UML**: Diagrams generated for all non-trivial logic.
- [ ] **Log**: Every step recorded in `implemented/IMPLEMENTED_[NAME].md`.

