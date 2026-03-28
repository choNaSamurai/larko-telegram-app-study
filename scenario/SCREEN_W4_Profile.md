# SCREEN_W4_Profile — System Analyst Scenario

**Figma Section:** `84:7112` | **Screen ID:** W4  
**Figma URL:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=84-7112

---

## 1. Screen Overview

The Profile screen (W4) is the personal settings hub for the Worker role in the Larko Telegram Mini App. It is the fourth tab in the bottom navigation bar (icon: person/circle). The screen displays the authenticated user's avatar, full name, and current company with role badge. Below the header, a settings card groups four navigable options: Time Off & Vacations, Language selector, Theme toggle, and Support & FAQ. This screen is the single entry point for all personal preferences and absence management within the TMA.

---

## 2. Actors

- **Worker** — authenticated Telegram user with Worker role in a Company. Primary user of this screen.
- **System** — reads user profile from Telegram context + Larko account data; persists language and theme preferences per account.

---

## 3. Entry Conditions (Pre-conditions)

1. User is authenticated via Telegram (Telegram user context is established).
2. User is a member of at least one Company (Worker role or higher).
3. User taps the "Profile" icon in the bottom navigation bar (4th tab).
4. Network connection can be offline — profile data loaded from local cache.

---

## 4. Main Flow (Happy Path)

1. User taps the **Profile** tab in the bottom navigation bar [figma: 113:10715].
2. System loads the user profile: avatar, full name, company name + role badge [figma: 73:54253].
3. Screen renders:
   - **Header:** avatar photo (80×80 px, circular) [figma: 73:54256], full name text [figma: 73:54258], company button with icon [figma: 73:54260].
   - **Options Card:** single card containing four rows [figma: 73:54272].
4. User taps **"Вихідні та відпустки"** (Time Off & Vacations) → navigates to W5 screen.
5. User taps **Language Toggle** (Мова / Language) → toggles between 🇺🇦 UK and 🇬🇧 EN [figma: 73:54285].
6. User taps **Theme Toggle** (Тема / Theme) → toggles between 🌙 Dark and ☀️ Light [figma: 119:5325].
7. User taps **"Підтримка та FAQ"** (Support & FAQ) → navigates to a FAQ screen.

---

## 5. Alternative Flows

### 5.1 Company Switcher
- User taps the **Company Badge** button beneath their name [figma: 73:54260] → triggers bottom sheet overlay with Company Switcher (W1_Switcher) [figma: 113:10749].
- User selects a different company → active company context switches → all data scopes to the newly selected company.
- Note: W1_Switcher states (both Light [figma: 113:10749] and Dark [figma: 113:10759]) are included in this Figma section.

### 5.2 Language Change
- User taps **UK** tab in the Language Toggle → interface language switches to Ukrainian 🇺🇦.
- User taps **EN** tab → interface language switches to English 🇬🇧.
- Change is persisted per Larko account (not per device). Applied immediately across all screens.
- Currently active language tab is shown as selected (filled/active state).

### 5.3 Theme Change
- User taps **🌙 Dark** tab → app switches to dark mode theme.
- User taps **☀️ Light** tab → app switches to light mode theme.
- Change is persisted per Larko account. Applied immediately via CSS class toggle.

---

## 6. Edge Cases & Error States

| Edge Case | Visual Behavior |
|:----------|:----------------|
| Avatar not set / Telegram profile has no photo | Show initials placeholder (e.g., "ПМ" for Павло Мельник) |
| Company name too long | Truncated with ellipsis in the company badge button |
| User belongs to only one company | Company Switcher badge still shows but switcher shows single company |
| Network offline | Profile loaded from local cache; language/theme changes saved locally and synced when online |
| Loading state | Skeleton screens shown for avatar (80×80 circle placeholder), name bar (160×24 rect), company badge (96×16 rect), and options card (350×190 rect shimmer) [figma: 73:54331 Dark / 73:54360 Light] |

---

## 7. UI Elements & States

| Element | Type | Figma Node | States | Behavior | Notes |
|:--------|:-----|:-----------|:-------|:---------|:------|
| Avatar — ProfilePhoto | Image (circular, 80×80) | `73:54256` | default, loading (skeleton) | Displays Telegram profile photo | Falls back to initials if no photo |
| FullName — h1.text-xl | Text | `73:54258` | default | Displays user's full name | Bold, centered |
| CompanyBadge — button.flex | Button | `73:54260` | default, pressed | Shows icon + current company name; taps opens Company Switcher | Chevron/toggle icon on right |
| OptionsCard — Navigation Options | Card container | `73:54272` | default | Wraps all 4 option rows | Rounded card, bg-card background |
| TimeOffRow — Component 3 (row 1) | Navigation Row | `73:54273` | default, pressed | Tap → navigate to W5 | Shows calendar icon + label "Вихідні та відпустки" + chevron |
| LanguageToggle — Language Toggle (Мова) | Toggle Group | `73:54285` | UK active / EN active | Tapping a tab changes language globally; currently active tab is filled/selected | Two tabs: 🇺🇦 UK, 🇬🇧 EN |
| ThemeToggle — Language Toggle (Тема) | Toggle Group | `119:5325` | Dark active / Light active | Tapping a tab changes theme globally; currently active tab filled | Two tabs: 🌙 Dark (fluent-mdl2:clear-night), ☀️ Light (si:clear-day-line) |
| SupportRow — Component 3 (row 4) | Navigation Row | `73:54299` | default, pressed | Tap → navigate to Support & FAQ screen | Shows question-mark icon + label "Підтримка та FAQ" + chevron |
| BottomNav — Navigation Bottom Bar | Component | `113:10716` | Profile tab active | 4th tab is active | Standard shared component |

---

## 8. Screen States

| State | Description | Visual |
|:------|:------------|:-------|
| **Loading** | Data is being fetched; profile not yet available | Skeleton avatar circle, skeleton name bars, skeleton card rectangle [figma Dark: `73:54331`, Light: `73:54360`] |
| **Default (Populated)** | Full user data loaded; all options visible | Avatar, name, company, 4-option card [figma Dark: `73:54177`, Light: `73:54253`] |
| **Company Switcher Overlay** | User has tapped company badge; switcher bottom sheet appears over blurred background | Bottom sheet slides from bottom, background blurred [figma Light: `113:10749`, Dark: `113:10759`] |

> **Note:** No paginated lists exist on this screen, so empty-ever / empty-page state distinction is N/A.

---

## 9. Business Rules

| Rule | Description | BRD Source |
|:-----|:------------|:-----------|
| BR-W4-01 | Language selector has exactly 2 options: Ukrainian (🇺🇦 / `uk`) and English (🇬🇧 / `en`). Default is determined by Telegram user locale or previously saved preference. | BRD §2 Worker Profile |
| BR-W4-02 | Theme selector has exactly 2 options: Dark (`dark`) and Light (`light`). Default: Light (inferred from Figma default state). Saved per Larko account. | BRD §2 Worker Profile |
| BR-W4-03 | Language and Theme are stored per Larko account, not per device. Changes apply immediately across all open sessions. | BRD §2 Worker Profile |
| BR-W4-04 | The Company Switcher is available to any user who belongs to more than one Company in any role. Single-company users see the badge but the switcher shows only one entry. | BRD §Global Component: Company Switcher |
| BR-W4-05 | "Time Off" link navigates to the My Absences screen (W5). This is the sole entry point from the Worker TMA. | BRD §2 Worker Profile |
| BR-W4-06 | Avatar is sourced from the Telegram user profile. Larko does not provide a separate avatar upload in MVP. | BRD §2 Worker Profile |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|:---------|:-------|:--------|:---------|:------------|
| GET /auth/me | GET | Authorization: Bearer {token} | `{ id, full_name, avatar_url, telegram_id, current_company: { id, name, role } }` | 401 Unauthorized |
| GET /user/companies | GET | Authorization: Bearer {token} | `[{ id, name, industry_type, user_role }]` | 401 |
| PATCH /user/preferences | PATCH | `{ language: 'uk' | 'en', theme: 'dark' | 'light' }` | `{ language, theme }` (updated) | 400 Bad Request, 401 |

**Language enum values:** `'uk'`, `'en'`  
**Theme enum values:** `'dark'`, `'light'`  
**Default Language:** `'uk'` (Ukrainian); **Default Theme:** `'light'`

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|:----|:------------|
| Performance | Screen must render within 300ms from cached data; skeleton shown if API response > 200ms |
| Offline Support | Profile data (name, preferences) cached locally via persistent store; preference changes queued for sync |
| Accessibility | Language/Theme toggles must be accessible with aria-pressed and role="radiogroup" |
| Security | Avatar URL must be served over HTTPS; no sensitive data (worker rates, balances) shown on this screen |
| i18n | All labels must use i18n keys; switching language updates all labels immediately without reload |

---

## 12. Open Questions

| # | Question | Blocking? | Notes |
|:--|:---------|:----------|:------|
| OQ-W4-01 | Does the company badge show the **role** (e.g., "Worker") alongside the company name, or only the company name? Figma shows "Larko.ai Inc" with a building icon but no explicit role label. | [NON-BLOCKING] | Can default to company name only; role badge can be added later |
| OQ-W4-02 | What is the default theme for new users — Light or Dark? Figma "Default" state is Light, but should the system respect Telegram's system theme by default? | [NON-BLOCKING] | Safe to default to Light; Telegram system theme detection can be added in iteration |
| OQ-W4-03 | When the user changes language, does the entire app reload or does it dynamically re-render? React i18n supports dynamic switching, but Telegram WebApp may have constraints. | [BLOCKING] | Must be resolved before implementing the language toggle |
| OQ-W4-04 | Is "Support & FAQ" a screen within the TMA, or does it open an external URL (e.g., Notion / Intercom)? BRD mentions an accordion FAQ screen but doesn't specify if it's in-app or external. | [BLOCKING] | Affects routing architecture for W4 |

---

## 13. Proposed Improvements (PENDING APPROVAL)

*Section intentionally empty — pending user approval per SKILL_SA_DOCUMENT protocol.*
