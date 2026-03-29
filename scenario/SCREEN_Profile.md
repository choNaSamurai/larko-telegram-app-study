# SCREEN_Profile — System Analyst Scenario (W4)

## 1. Screen Overview

The Profile screen (W4) is the personal settings hub for Telegram Mini App workers. It sits at position 3 in the fixed bottom navigation bar (Profile icon). The screen displays the user's avatar, full name, and current company, then provides a grouped options card with four settings rows: a link to Time Off (Вихідні та відпустки), a Language selector (🇺🇦 UK / 🇬🇧 EN), a Theme toggle (🌙 Dark / ☀️ Light), and a link to Support & FAQ. It is always accessible once the user is authenticated.

---

## 2. Actors

- **Worker (TMA User):** The authenticated Telegram worker who views and changes their own profile settings.
- **Telegram WebApp:** Provides user initData and identity context.
- **Backend API:** Stores and retrieves user profile data (name, avatar, company), persists language and theme preference per user.

---

## 3. Entry Conditions (Pre-conditions)

- User is authenticated (valid JWT token present).
- User has an active company membership.
- Screen is accessible via bottom navigation tab ③ (Profile icon `person`).

---

## 4. Main Flow (Happy Path)

1. User taps the Profile tab in the bottom navigation bar.
2. Frontend navigates to `/profile` route.
3. Frontend calls `GET /users/me` to fetch name, avatar URL, company name.
4. Screen renders in populated state: circular avatar (80×80px, with subtle border `rgba(255,255,255,0.25)`), bold full name (20px, `#ededed`), company name with company icon below avatar.
5. Options card (rounded `20px`, bg `#2d2d31`, border `rgba(255,255,255,0.08)`) renders four rows:
   - **Row 1 — Time Off:** icon (calendar-like), label "Вихідні та відпустки", chevron `›`.
   - **Row 2 — Language:** icon (globe-like), label "Мова", toggle pill (🇺🇦 UK / 🇬🇧 EN).
   - **Row 3 — Theme:** icon (`material-symbols:style-outline`), label "Тема", toggle pill (🌙 `fluent-mdl2:clear-night` / ☀️ `si:clear-day-line`).
   - **Row 4 — Support & FAQ:** icon (question-mark-like), label "Підтримка та FAQ", chevron `›`.
6. Bottom navigation bar remains visible.

---

## 5. Alternative Flows

### 5.1 Tap "Вихідні та відпустки"
- Navigates to SCREEN_TimeOff (W5).

### 5.2 Tap "Підтримка та FAQ"
- Navigates to SCREEN_SupportFAQ (out of scope for this sprint).

### 5.3 Toggle Language
- User taps the inactive language chip (UK or EN).  
- Active chip gets `bg-[rgba(255,255,255,0.05)]` + shadow; inactive chip reverts to plain.  
- Frontend stores preference (localStorage + `PATCH /users/me { language }`).
- App re-renders in selected language (i18n reload).

### 5.4 Toggle Theme
- User taps the inactive theme chip (moon or sun icon).
- Active chip highlights; inactive chip reverts.
- Frontend stores preference (localStorage + `PATCH /users/me { theme }`).
- App applies new color scheme (CSS class on `<html>`).

### 5.5 Loading State
- While `GET /users/me` is pending: avatar placeholder (80×80px skeleton, rounded-full), two skeleton bars for name and company.
- Options card shows a single `350×190px` skeleton block (no row detail).

---

## 6. Edge Cases & Error States

- **Network error on profile load:** Show skeleton indefinitely OR retry after 3s (3 retries max); on persistent failure, show error toast: "Не вдалося завантажити профіль."
- **Avatar URL broken / 404:** Show fallback initials avatar (user initials in circle, same size).
- **Long company name:** Truncate with `…` after ~20 chars; tooltip on tap (NON-BLOCKING).
- **Long user name:** Truncate with ellipsis below avatar.
- **Preference PATCH failure:** Show brief error toast; revert toggle to previous state.
- **Simultaneous language + theme change:** Each preference saved independently via separate PATCH calls.

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Validation |
|---|---|---|---|---|---|---|
| Screen background | Container | `73:54177` | — | always | bg `#222226`, flex-col full height | — |
| Avatar | Image | `73:54180` | — | loaded / loading / error | 80×80px, rounded-full, border `rgba(255,255,255,0.25)` | fallback to initials |
| User full name | Text (h1) | `73:54182` | — | populated / loading | 20px, bold, `#ededed`, tracking `-0.5px` | — |
| Company button | Button | `73:54184` | `mdi:company` (16px) via Component 5 | tapped / default | Company flag icon + name + chevron-down; opens company selector (out of scope) | — |
| Options card | Card container | `73:54196` | — | populated / loading | bg `#2d2d31`, rounded-20px, border `rgba(255,255,255,0.08)` | — |
| Time Off row | Nav link | `I73:54197;73:54003` | icon via Component 3 variant 3 (calendar) | default / pressed | pb-17px pt-16px, separator bottom | Navigates to W5 |
| Language row | Setting row | `73:54209` | icon via Component 5 variant 5 (globe) | default | Active chip highlighted | Saves / reverts on failure |
| Language toggle chip (UK) | Toggle button | `73:54219` | — | active / inactive | `bg-[rgba(255,255,255,0.05)]` when active | — |
| Language toggle chip (EN) | Toggle button | `73:54221` | — | active / inactive | plain when inactive | — |
| Theme row | Setting row | `119:5274` | `material-symbols:style-outline` (16px, via img) | default | Active chip highlighted | Saves / reverts on failure |
| Theme toggle chip (dark) | Toggle button | `119:5305` | `fluent-mdl2:clear-night` (16px) | active / inactive | highlighted when active | — |
| Theme toggle chip (light) | Toggle button | `119:5297` | `si:clear-day-line` (16px) | active / inactive | plain when inactive | — |
| Support & FAQ row | Nav link | `73:54223` | icon via Component 3 variant 6 (question mark) | default / pressed | no bottom separator | Navigates to Support |
| Bottom navigation bar | Nav bar | `113:10733` | Tasks icon, Balance icon, Profile icon (active) | Profile active | bg `rgba(45,45,49,0.85)`, rounded-full, shadow, 64px h | Fixed bottom |

---

## 8. Screen States

| State | Description |
|---|---|
| **Loading** | Skeleton avatar, name, company + large card skeleton |
| **Populated (Default)** | Full user info + all 4 option rows |
| **Language changed** | Active chip updates; app re-renders text |
| **Theme changed** | Active chip updates; CSS theme class applied immediately |

---

## 9. Business Rules

- **BR-P01:** Language setting is global (all labels in TMA update immediately). Supported: `uk`, `en`. Default: `uk`.
- **BR-P02:** Theme setting is global (dark / light). Default follows Telegram WebApp color scheme if available, else `dark`.
- **BR-P03:** Avatar URL comes from Telegram user profile picture. Fallback = initials.
- **BR-P04:** Company name is read-only in Profile; changes only via Company Settings (manager flow).
- **BR-P05:** "Вихідні та відпустки" row navigates to W5 (SCREEN_TimeOff).
- **BR-P06:** "Підтримка та FAQ" row navigates to read-only FAQ screen (out of scope W4).

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error |
|---|---|---|---|---|
| `/users/me` | GET | Bearer token | `{ id, name, avatar_url, company: { name } }` | 401, 500 |
| `/users/me` | PATCH | `{ language?: "uk"\|"en", theme?: "dark"\|"light" }` | `{ updated: true }` | 401, 422, 500 |

**TMA Integration:**
- `Telegram.WebApp.ready()` called on mount.
- `Telegram.WebApp.BackButton.hide()` on this tab (it's a root nav tab).

---

## 11. Non-Functional Requirements

- Profile data load < 1s on 4G.
- Theme/language toggle response < 100ms visual change (optimistic UI); PATCH fires in background.
- Accessibility: all interactive rows have `role="button"` or `<button>`.
- Screen header safe area: **YES** — TMA fullscreen, needs `paddingTop: env(safe-area-inset-top, 16px)`.

---

## 12. Open Questions

- [NON-BLOCKING] Q1: Should the company name row be tappable (company switcher UX)?
- [NON-BLOCKING] Q2: Should "Support & FAQ" open in-app or external Telegram link?
- [NON-BLOCKING] Q3: Is there a scope for "Logout" action on the Profile screen?

---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)
| Figma data-name | Size | Color | Component |
|---|---|---|---|
| `material-symbols:style-outline` | 16px | `#ededed` | Theme row icon |
| `fluent-mdl2:clear-night` | 16px | `#ededed` | Theme toggle dark chip |
| `si:clear-day-line` | 16px | `#ededed` | Theme toggle light chip |

> **Note:** Calendar icon (Time Off row) and globe icon (Language row) and question icon (Support row) are rendered as custom SVG components in Figma (not Iconify data-names). Use the closest Iconify equivalents: `solar:calendar-bold`, `heroicons:globe-alt`, `solar:question-circle-bold`.

### Color Table (MANDATORY — exact Figma hex per element)
| CSS Variable | Hex value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background |
| `--color-bg-card` | `#2d2d31` | Options card, avatar border bg |
| `--color-bg-input` | `#3e3e42` | Language/theme toggle container |
| `--color-text-primary` | `#ededed` | User name, option labels |
| `--color-text-secondary` | `#9d9d9d` | Company name, inactive chip text |
| `--color-text-muted` | `#525252` | Inactive chip text (alternate) |
| `--color-border-card` | `rgba(255,255,255,0.08)` | Options card border |
| `--color-border-avatar` | `rgba(255,255,255,0.25)` | Avatar ring border |
| `--color-border-row` | `rgba(255,255,255,0.05)` | Row separators inside card |
| `--color-chip-active` | `rgba(255,255,255,0.05)` | Active chip bg |
| `--color-nav-bg` | `rgba(45,45,49,0.85)` | Bottom nav bar background |

### Spacing Table (MANDATORY — exact Figma px values)
| Element | Padding / Gap value |
|---|---|
| Screen padding-top (header) | `env(safe-area-inset-top, 16px)` |
| Avatar area padding | `pt-40px pb-24px px-20px` |
| Options card padding (outer) | `px-16px py-24px` |
| Card internal padding (1px border + clip) | `p-1px` |
| Row padding | `px-16px pt-16px pb-17px` |
| Row icon container | `32×32px, rounded-full` |
| Gap between icon and label | `12px` |
| Language/Theme toggle outer padding | `5px` |
| Toggle chip padding | `px-12px py-4px` |
| Bottom nav padding-bottom | `pb-16px` |

### Typography Table (MANDATORY — exact Figma text style values)
| Role / Usage | font-size | font-weight | line-height | letter-spacing |
|---|---|---|---|---|
| User name | `20px` | `700` (Bold) | `28px` | `-0.5px` |
| Company label | `14px` | `500` (Medium) | `20px` | `0px` |
| Option row label | `14px` | `600` (Semi Bold) | `20px` | `0px` |
| Toggle chip text | `12px` | `600` (Semi Bold) | `16px` | `0px` |
| Header screen title (if any) | `18px` | `600` | `28px` | `-0.5px` |

### Border Radius Table
| Element | border-radius |
|---|---|
| Avatar | `9999px` (full circle) |
| Options card | `20px` |
| Row icon container | `9999px` (full circle) |
| Language/Theme toggle container | `16px` |
| Toggle chip | `12px` |
| Bottom nav | `9999px` |

### Card border style
`all-sides` — Options card has border on all sides: `1px solid rgba(255,255,255,0.08)`

### Screen Header Safe Area
**YES** — TMA fullscreen, `paddingTop: env(safe-area-inset-top, 16px)` required on the outermost container.

---

## 13. Proposed Improvements (PENDING APPROVAL)

_(empty — pending user approval)_
