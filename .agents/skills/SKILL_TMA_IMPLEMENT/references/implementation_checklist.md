# TMA Implementation Checklist

Use this checklist for every screen implementation to ensure industrial-grade quality.

## 🎨 UI & Aesthetics
- [ ] **Typography**: Using `Inter` or specified Google Font. No browser defaults.
- [ ] **Colors**: Adhering to the project's palette. Using CSS variables for theme support.
- [ ] **Aesthetics**: Glassmorphism applied where specified (subtle blur, borders).
- [ ] **Animations**: Micro-interactions for buttons (hover/active), smooth transitions between states.

## ⚡ Performance
- [ ] **Assets**: Images optimized/compressed. SVGs used for icons.
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
