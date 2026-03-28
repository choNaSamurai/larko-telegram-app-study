# SCREEN_W3_My_Balance — System Analyst Scenario

> **Figma Source:** https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6570&m=dev  
> **Section node:** `83:6570` — "W3 Мій баланс"  
> **BRD Reference:** §2 (Worker Role → Screen: My Balance), Business Rules §1–5

---

## 1. Screen Overview

"My Balance" (W3) is the Worker's personal payroll transparency screen accessible from the bottom navigation bar ("Balance" tab). It gives the currently authenticated Worker a real-time view of their financial standing for the current billing period: total earned, total advances received, and the remaining amount payable. Below the summary cards, the screen displays a scrollable transaction history showing individual earnings (from completed orders/time logs) and advances, allowing the worker to track every credit and debit. The screen is **read-only** — Workers cannot initiate any actions that modify data. The screen is scoped strictly to the currently active Company context.

---

## 2. Actors

| Actor | Role |
|:------|:-----|
| **Worker** | Primary consumer; authenticated Telegram user belonging to a Company as a Worker role. Views own balance and history. |
| **Payroll Service** | Backend system that calculates Earned, Advances, and Remaining amounts from time logs, order rates, overtime rules, and advance records. |
| **Navigation System** | Routes the Worker to W3 from bottom nav "Balance" tab or from a deep-link. |

---

## 3. Entry Conditions (Pre-conditions)

1. Worker is authenticated via Telegram Mini App with a valid session.
2. Worker belongs to **at least one Company** (has an active Company context).
3. Worker has a valid role = `worker` (or `manager`/`owner` accessing their own worker balance).
4. Current Company context is set (Company Switcher resolves which company's data is shown).
5. The Balance tab must be accessible — no plan-gate on viewing own balance (available on Free and all paid plans).

---

## 4. Main Flow (Happy Path)

**State: Default (Populated) — Worker has completed orders and no negative balance**

1. Worker taps "Balance" in the bottom navigation bar.
2. System loads W3 screen, making a data request for the Worker's balance for the current billing period.
3. Screen displays **Header** with screen title "Мій баланс" and the current month/year (e.g., "Березень 2026").
4. Screen displays **Info button** (ⓘ) in the top-right corner of the header.
5. Screen displays **3 Stat Cards** in a horizontal row:
   - 🟢 **Зароблено (Earned)** — green icon + green amount (e.g., ₴18,450)
   - 🔵 **Аванси (Advances)** — blue icon + blue amount (e.g., ₴5,000)
   - 💰 **Залишок (Remaining)** — coin emoji icon + neutral/white amount (e.g., ₴13,450)
6. Screen displays **"Історія операцій" (Transaction History)** section header.
7. System renders a scrollable list of transaction items, each showing:
   - Left circle icon (color-coded by type: green for earnings, blue for advances, yellow for overtime)
   - Item name (order name or "Аванс")
   - Date + hours worked (e.g., "23 бер · 9.0 год") for earnings; date only for advances
   - Amount in monospace font, right-aligned, color-coded: `+₴X,XXX` green for earnings, `−₴X,XXX` blue for advances/debits, `+₴X,XXX` yellow for overtime
8. Worker scrolls history to review their transactions.
9. Worker taps ⓘ (Info button) → Info Popup overlay appears showing a breakdown explanation of the 3 balance components (see §5.1 Alternative Flow: Info Popup).

---

## 5. Alternative Flows

### 5.1 — Info Popup Overlay

1. Worker taps the ⓘ button in the top-right of the header.
2. System displays an Info Popup card with title **"Розрахунок балансу"** and 3 explanation rows:
   - **Зароблено** — icon + label + description: "Загальна сума нарахованої оплати за виконані замовлення за поточний місяць"
   - **Аванси** — icon + label + description: "Сума грошей, які ви вже отримали авансом до кінця розрахункового періоду"
   - **Залишок** — emoji icon + label + description: "Різниця між заробленим та отриманими авансами. Якщо від'ємний — ви повинні компанії"
3. Bottom stat cards (Зароблено / Аванси / Залишок) remain visible below the popup.
4. Worker dismisses popup by tapping outside or by scrolling.

### 5.2 — Empty State (No Completed Orders)

1. Worker has never completed an order in the current company — no earnings exist for any period.
2. Screen displays Stat Cards with all 3 values equal to **₴0**.
3. Below stat cards: animated empty state with 📊 emoji illustration, heading **"Ще немає заробітку"**, and description: "Завершіть перше замовлення і ваш баланс з'явиться тут".
4. CTA button: **"Переглянути завдання"** → navigates to W1 My Tasks screen.

### 5.3 — Negative Balance (Advances Exceed Earnings)

1. Worker's Advances > Earned amount → Remaining = negative value.
2. **Залишок (Remaining)** stat card displays:
   - Red/danger card background
   - Red icon variant (warning icon, not coin)
   - Amount displayed as `−₴X,XXX` in red
3. **Warning Banner** appears immediately below the stat cards:
   - Orange/red background with warning triangle icon (⚠️)
   - Title: **"Від'ємний баланс"**
   - Description: "Аванси перевищують заробіток на ₴[X]" (exact overage amount)
4. Transaction history still displayed below the warning banner.

### 5.4 — Error State (Data Load Failure)

1. API request for balance data fails (network error, server error, timeout).
2. Screen displays:
   - Header with title "Мій баланс" and month remains visible.
   - Centered error illustration with red circle + warning icon (⓪).
   - Heading: **"Помилка завантаження"**
   - Description: "Не вдалося завантажити завдання. Перевірте інтернет-з'єднання та спробуйте ще раз."
   - CTA button: **"Спробувати знову"** → retries the data request.

### 5.5 — Loading State (Skeleton)

1. While balance data is being fetched:
   - Header skeleton: company name and period shimmer bars.
   - Filter tab area: 3 shimmer pill placeholders.
   - Content area: 3 skeleton cards (each with 2 shimmer lines + 1 wider shimmer bar).
2. Skeleton uses `shimmer` animation on `bg-bg-card` / `bg-l-bg-card` backgrounds.

> **Note on Loading State (node ids 87:7528 / 87:7493):** The metadata shows these are named `section#W1_Loading_Dark/Light` but positioned within the W3 section canvas — they appear to be Loading state variants shared or reused. Filter tabs visible in loading skeleton suggest W3 may have a filter feature planned. See §12 Open Questions.

---

## 6. Edge Cases & Error States

| Scenario | Trigger | Behavior |
|:---------|:--------|:---------|
| Negative balance | Advances > Earned within period | Red Remaining card + Warning banner with exact overage amount |
| Zero earnings | Worker joined but never completed an order | Empty state (§5.2) with CTA to Tasks |
| All values zero but history exists | Period roll-over, new month starts | Stat cards show ₴0 but history list may still show prior-period entries (behavior depends on scope — see §12) |
| Advances not available | Worker on Free plan (advances are Starter+ only) | Аванси card should show ₴0 or be hidden — behavior not shown in Figma. See §12 |
| Long order names | Order name exceeds available width in history row | Text truncated with ellipsis (…), as seen "Ремонт електропр…" in Figma |
| Overtime entry in history | Order with overtime hours logged | Entry line shows "Овертайм · [Order Name]" with date and multiplier (e.g., "2.5 год × 1.5"), amount in amber/yellow |
| Network timeout | API call takes > 10 seconds | Error state (§5.4) |
| Monthly period not yet started | First login of month, no data yet | Empty state or ₴0 across all cards with empty history |

---

## 7. UI Elements & States

| Element | Type | Node ID | States | Behavior | Notes |
|:--------|:-----|:--------|:-------|:---------|:------|
| Screen Title "Мій баланс" | Label (h1, text-lg, 18px, Semi Bold) | `I113:10273;110:8177` | static | Read-only | font: Inter Semi Bold |
| Period label "Березень 2026" | Label (text-xs, 12px, Regular) | `I113:10273;110:8183` | dynamic | Shows current billing month/year | Color: `#9d9d9d` (secondary) |
| Info Button (ⓘ) | Button (icon-only, 32×32px, rounded-full, white bg) | `I113:10273;110:8196` | default, pressed | Opens Info Popup overlay | White background with info SVG icon |
| Earned Stat Card | Card (120px wide, 86px tall, rounded-xl, bg-bg-card) | `73:52934` | positive, zero | Shows green icon + "Зароблено" label + amount in `#34d399` (JetBrains Mono Bold) | Color: green `#34d399` |
| Advances Stat Card | Card (99px wide, 86px tall) | `73:52943` | positive, zero | Shows blue icon + "Аванси" label + amount in `#60a5fa` (JetBrains Mono Bold) | Color: blue `#60a5fa` |
| Remaining Stat Card | Card (108px wide, 86px tall) | `73:52952` | positive, zero, negative | Coin icon (positive/zero) or red warning icon (negative); amount color: white `#ededed` (positive), red (negative) | Negative: card bg changes to red tint |
| Warning Banner | Alert card (358×78px, rounded) | `73:53369` / `73:53486` | visible (negative only), hidden | Shows ⚠️ + title + amount overage text | Only visible when Remaining < 0 |
| Info Popup | Overlay card (358×327px) | `73:53569` / `73:53671` | visible, hidden | Explanatory popup with 3 rows | Title: "Розрахунок балансу" |
| Transaction History Header | Label ("Історія операцій", text-sm, 14px) | `73:52963` | static | Section title | Font: Inter Semi Bold |
| Transaction Row (Earnings) | List item (358×61px per row) | `73:52965`–`73:53020` | default | Icon (green bg, arrow-up) + order name + date·hours + `+₴X,XXX` green | Separator: `rgba(255,255,255,0.08)` bottom border |
| Transaction Row (Advance) | List item (358×61px per row) | — | default | Icon (blue bg, arrow-down) + "Аванс" + date + `−₴X,XXX` blue | Same row pattern |
| Transaction Row (Overtime) | List item (358×61px per row) | `73:52998` | default | Icon (amber bg, clock) + "Овертайм · [Order]" + date·hours×multiplier + `+₴X,XXX` amber | Color: `#fbbf24` |
| Empty State Illustration | Emoji (📊, 48×72px) | `73:53215` | static | Decorative | No interaction |
| Empty State CTA Button | Button (207×44px, rounded-full) | `73:53222` | default, pressed | Navigates to W1 My Tasks | Label: "Переглянути завдання" |
| Error Icon | Icon (64×64px circle, red bg) | `85:7292` / `85:7286` | static | Decorative | Warning icon inside |
| Retry Button | Button (175×40px, rounded-full) | `83:6744` / `83:6789` | default, pressed | Triggers data reload | Label: "Спробувати знову" |
| Bottom Navigation Bar | Nav bar (358×64px, rounded-full, glassmorphic) | `113:10090` | active=Balance | 3 tabs: Tasks (left), Balance (center, active, white circle), Profile (right) | Active tab has white circle pill |

---

## 8. Screen States

| State | Trigger | Visual |
|:------|:--------|:-------|
| **loading** | Initial data fetch in progress | Skeleton shimmer (header + stat cards + history list cards) |
| **populated (positive)** | Data loaded, Remaining ≥ 0 | Stat cards (green/blue/white), history list visible |
| **populated (negative)** | Data loaded, Remaining < 0 | Remaining card red, Warning Banner below stat cards, history list visible |
| **empty** | No earnings data exists for the Worker in this Company | ₴0 stat cards + illustrative empty state + CTA button |
| **error** | API/network failure | Error illustration + "Спробувати знову" button |
| **info_popup_open** | Worker tapped ⓘ button | Info Popup overlay covers top portion; stat cards remain visible below |

---

## 9. Business Rules

| Rule ID | Rule | Source |
|:--------|:-----|:-------|
| BRD §1 (Payroll Models) | Earned is calculated based on active Payment Model: Per Unit, Per Hour, Per Job. | BRD §4 Business Rules #1 |
| BRD §2 (Rate Locking) | The rate used for each order row in history is the rate **locked at order creation**. Future rate changes do not affect historical earnings shown here. | BRD §4 Business Rules #2 |
| BRD §4 (Overtime) | Overtime hours (> daily threshold) apply a multiplier (1.5x or 2x per company settings). Overtime is shown separately in history as "Овертайм · [Order]" with multiplier annotation. | BRD §4 Business Rules #4 |
| BRD §5 (Negative Balance) | Advances can exceed Earned. When Remaining < 0, it is displayed in red with "−" prefix and the Worker sees a Warning Banner explaining the overage. | BRD §4 Business Rules #5 |
| BRD §2 (Advances Plan Gate) | Advances are a **Starter+ plan** feature. Free plan Workers may see ₴0 for Advances, or the Аванси card may be hidden/locked. Exact behavior TBD — see §12 Open Questions. | BRD §2 "Advances Received — Starter+ only" |
| BRD-Scope (Period) | Balance is shown for **current billing period** (month). History is filterable — filter feature flagged "2nd iteration" in Figma annotations (Frame 50, text node `125:5383`). Period scope displayed in the header subtitle. | Figma annotation + BRD §2 |
| BRD-Scope (Company) | All data is company-scoped. If Worker belongs to multiple companies, only the currently active company's data is shown. Company Switcher (in header) must be accessible from W3. | BRD §2 Global Component: Company Switcher |
| BRD-Materials | Material costs do NOT affect the Worker's personal payroll balance. They are strictly business expenses. | BRD §4 Business Rules #1 note |
| BRD-Ledger | Manual ledger adjustments (+/- amounts) added by Owner/Manager should appear in transaction history as a distinct row type. | BRD §4, Rule #30 note on Ledger Adjustment |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|:---------|:-------|:--------|:---------|:------------|
| `GET /balance/summary` | GET | `{ workerId, companyId, period: "YYYY-MM" }` | `{ earned: number, advances: number, remaining: number, currency: string }` | 401 (Unauthorized), 403 (Forbidden), 500 (Server Error) |
| `GET /balance/history` | GET | `{ workerId, companyId, period: "YYYY-MM", page?, limit? }` | `{ items: TransactionItem[], total: number }` where `TransactionItem = { id, date, type: 'earning'\|'advance'\|'overtime'\|'adjustment', orderName?, hours?, multiplier?, amount: number }` | 401, 500 |

> **Note:** Filter-by-period (This Week / This Month / All Time) is a **2nd iteration** feature per Figma annotations. For MVP, the scope is **current calendar month** only.

---

## 11. Non-Functional Requirements

| Requirement | Specification |
|:------------|:-------------|
| **Performance** | Balance summary must load within **1.5 seconds** on a 4G connection. Skeleton shown immediately on mount. |
| **Typography** | Financial amounts use **JetBrains Mono Bold** for monospace alignment. Labels use **Inter** (Regular / Medium / Semi Bold). |
| **Color coding** | Earned: `#34d399` (green), Advances: `#60a5fa` (blue), Remaining positive: `#ededed` (neutral), Remaining negative: red. Overtime: `#fbbf24` (amber). |
| **Dark/Light theme** | Both themes fully designed in Figma. Dark: `bg-[#222226]`, cards `bg-[#2d2d31]`. Light: white background, light card bg. Theme follows Worker Profile preference. |
| **Accessibility** | Text sizes minimum 12px. Color contrast ratios ≥ 4.5:1. Tappable targets ≥ 44×44px (validated: Nav bar icons 48px, buttons 44px+). |
| **Offline behavior** | If cached balance data exists from last successful load, display stale data with a "Updated [time ago]" indicator. If no cache: show error state immediately. |
| **Currency display** | Always display the Company's Base Currency symbol (₴ for UAH by default). No unit conversion. |
| **Read-only** | No input fields, no editable components. All touches are navigation or informational only. |

---

## 12. Open Questions

| # | Question | Impact | Classification |
|:--|:---------|:-------|:---------------|
| Q1 | **What happens to the Аванси card on Free plan?** BRD says advances are Starter+. Does the card show ₴0 (always), get hidden, or show a lock icon + upgrade CTA? | Affects Free plan UX significantly | **[BLOCKING]** — must resolve before implementation |
| Q2 | **What period does "current" mean?** Is it calendar month (visible in Figma as "Березень 2026"), a payroll period defined by Manager, or rolling 30 days? | Affects all calculation endpoints | **[BLOCKING]** — must resolve before API contract |
| Q3 | **Loading skeleton** nodes `87:7493 / 87:7528` are named "W1_Loading" but appear in the W3 section canvas area. Are these intended for W3 or is this a Figma naming mistake? If W3 uses same loading skeleton pattern as W1, confirm same component is reused. | Affects component architecture | **[NON-BLOCKING]** — safe to assume shared skeleton pattern |
| Q4 | **Filter by period** (This Week / This Month / All Time) noted in Figma: "Треба додати фільтр на історію операцій (2-га ітерація)". Confirmed deferred to 2nd iteration. No implementation needed for MVP. OK to confirm? | Scope definition | **[NON-BLOCKING]** — deferred, no action needed |
| Q5 | **Ledger adjustments**: Should manual "+/- adjustment" entries issued by Owner appear in Worker's transaction history? If yes, what label and icon? | History data model | **[BLOCKING]** — worker may be confused about unknown debits |
| Q6 | **Overtime indicator**: BRD §2 mentions "⏰ Including [X]h overtime" as an indicator card. Figma shows overtime as a row in history but not as a separate stat card overlay. Should an overtime indicator also appear on the Earned stat card? | Figma-BRD discrepancy | **[NON-BLOCKING]** — can default to Figma design (history row only) |
| Q7 | **Dispute entry point from Balance**: BRD §2 (Report Issue) mentions the entry point being "Balance screen." No dispute button is visible in W3 Figma screens. Should there be a "⚠️ Повідомити про проблему" CTA on W3 and if so, where? | Missing feature from BRD | **[BLOCKING]** — requires explicit stakeholder decision |
| Q8 | **Negative balance — does transaction history still show all items?** Figma shows only 3 items on the negative state (fewer than the default 5). Is this limited by data or does the design intentionally truncate? | UX behavior | **[NON-BLOCKING]** — likely fewer transactions in the test scenario |
| Q9 | **Pagination/infinite scroll**: History can grow indefinitely. How many rows before pagination? Is infinite scroll or "Load More" button used? | Performance | **[NON-BLOCKING]** — implementation detail, suggest 20 items/page |

---

## 13. Proposed Improvements (PENDING APPROVAL)

> *Section reserved. No improvements added until user approval.*
