# SCREEN_My_Balance — System Analyst Scenario

> **Screen ID:** W3  
> **Figma Node:** `83:6570` (section root)  
> **Primary frame (Default Dark):** `73:52914`  
> **Date produced:** 2026-03-29  
> **Author:** TMA_Full_Pipeline_Orchestrator (SKILL_FIGMA_PARSE + SKILL_BRD_PARSE + SKILL_SA_DOCUMENT)

---

## 1. Screen Overview

**My Balance** (Мій баланс) is the second tab in the Worker's three-item bottom navigation (`Tasks · Balance · Profile`). It gives the Worker a real-time financial snapshot of the current billing period — showing total earnings, total advances received, and the remaining payable balance. Below the stat cards the screen lists a chronological history of individual financial operations (order completions and advance issuances). The screen is **read-only** — no interactive data entry occurs here. A contextual info popup, a negative-balance warning banner, and an empty state cover the full range of possible states.

The screen is accessed exclusively through the bottom navigation and is scoped to the Worker's current active Company. Period context defaults to the current calendar month and is displayed in the header subtitle (e.g., "Березень 2026").

---

## 2. Actors

| Actor | Role |
|---|---|
| **Worker** | Primary user — views their balance and transaction history |
| **Backend API** | Supplies balance totals and ordered history list |
| **Telegram WebApp** | Provides the runtime environment and safe-area insets |

---

## 3. Entry Conditions (Pre-conditions)

1. Worker is authenticated via Telegram initData.
2. Worker belongs to at least one active Company.
3. Worker taps the **Balance** icon in the bottom navigation bar.
4. Network is available (or cached data is served in offline degraded state).

---

## 4. Main Flow (Happy Path)

**Given:** Worker has at least one completed order or logged advance in the current period.

1. Worker taps **Balance** tab in bottom navigation.
2. System shows skeleton loader for stat cards and history list.
3. System fetches `GET /worker/balance?period=current_month` from backend.
4. System renders **Stat Cards** row: Earned (🟢) · Advances (🔵) · Remaining (💰).
5. System renders scrollable **Istoriya operatsiy** (History of operations) list beneath the cards.
6. Each history row shows: icon (type color-coded), operation name, date/hours, signed amount.
7. Worker scrolls through history — no action required.
8. Worker optionally taps the **ⓘ** button in the top-right corner.
9. System displays the **Info Popup** (Розрахунок балансу) overlay explaining each stat card.
10. Worker taps outside the popup (or closes it) → popup dismisses, balance screen visible.

---

## 5. Alternative Flows

### 5.1 Empty State (No earnings yet)
- Worker has no completed orders and no advances in current period.
- Stat cards all show **₴0**.
- History section is replaced by an empty state: 📊 emoji + "Ще немає заробітку" + "Завершіть перше замовлення і ваш баланс з'явиться тут".
- CTA button **"Переглянути замовлення"** → navigates to the My Tasks (W1) screen.

### 5.2 Negative Balance State
- Advances issued to the Worker exceed their earned total.
- **Remaining** stat card shows a negative amount (e.g., `−₴4,800`) in **red** (`#ef4444` / red variant).
- An amber-bordered **Warning Banner** appears between the stat cards and the history section:
  - Icon: ⚠️ (amber circle with triangle icon)
  - Title: "Від'ємний баланс"
  - Subtitle: "Аванси перевищують заробіток на ₴[X]"
- History list still renders normally.

### 5.3 Info Popup Overlay
- Worker taps **ⓘ** button (white circle, 32×32px, top-right corner of header).
- Modal sheet slides up from center with title "Розрахунок балансу".
- Three rows explain each stat: Зароблено / Аванси / Залишок — each with an icon and description text.
- Stat Cards row still visible below the popup.
- Dismisses on tap outside or system back gesture.

### 5.4 Loading State
- System shows skeleton cards (rounded rectangle placeholders) while fetching.
- Header still renders (title + period subtitle).
- Skeleton layout: header → tab filter skeletons (3) → 3 card skeletons → list item skeletons.

### 5.5 Error / Network Failure
- API request fails or times out.
- System shows error state: 🔴 icon + "Помилка завантаження" + `[Button: Спробувати знову]`.
- Retrying triggers a fresh API call.

---

## 6. Edge Cases & Error States

| Condition | Behavior |
|---|---|
| Remaining is exactly ₴0 | Shows `₴0` in default text color `#ededed` (not red) |
| Advances-only period (no earned) | Earned = ₴0, Advances = positive, Remaining = negative → triggers negative state |
| Very long operation name | Text truncates with ellipsis (`…`) at one line |
| Many history entries | List is scrollable; no pagination indicator in MVP |
| Offline state | Show cached data with offline banner; hide ⓘ popup ability |
| Worker deactivated | Screen blocked — redirect to error/deactivation screen |
| Period change (month rollover) | System updates subtitle and data automatically on reopen |
| Negative Remaining exact equal to advances | Warning banner shows exactly the overflow amount |

---

## 7. UI Elements & States

| Element | Type | Figma Node ID | Icon (`data-name`) | States | Behavior | Notes |
|---|---|---|---|---|---|---|
| Screen root | Container | `73:52914` | — | default, dark, light | Full-height; `bg-[#222226]` | — |
| Header | Container | `I113:10273` | — | always visible | Contains title, period subtitle, ⓘ button | H=68px, `px-[16px]` |
| Screen title | Text | `I113:10273;110:8177` | — | static | "Мій баланс" — 18px, SemiBold, `#ededed` | — |
| Period subtitle | Text | `I113:10273;110:8183` | — | dynamic | "Березень 2026" — 12px Regular, `#9d9d9d` | Auto-updated each month |
| Info button | Button | `I113:10273;110:8196` | *(SVG info icon)* | default, pressed | 32×32px white circle; tap → shows Info Popup | `shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`, `rounded-full` |
| Stat Cards row | Container | `73:52933` | — | default, empty, loading | Flex row, `gap-[16px]`, `h-[86px]` | Full width, `px-[16px]` |
| Stat Card: Earned | Card | `73:52934` | — | positive, zero | `bg-[#2d2d31]`, `rounded-[20px]`, `p-[13px]` | Left icon: green circle |
| Earned icon | Icon badge | `73:52936` | *(arrow-up svg, Component1 variant 11)* | — | `bg-[rgba(52,211,153,0.15)]` circle 24px | Green: `#34d399` |
| Earned label | Text | `73:52940` | — | static | "Зароблено" 12px Regular `#9d9d9d` | — |
| Earned amount | Text | `73:52942` | — | positive=green, zero=default | 18px Bold JetBrains Mono, `#34d399` | Format: `₴18,450` (comma separator) |
| Stat Card: Advances | Card | `73:52943` | — | positive, zero | `bg-[#2d2d31]`, `rounded-[20px]` | Left icon: blue circle |
| Advances icon | Icon badge | `73:52945` | *(arrow-down svg, Component1 variant 12)* | — | `bg-[rgba(96,165,250,0.15)]` circle 24px | Blue: `#60a5fa` |
| Advances label | Text | `73:52949` | — | static | "Аванси" 12px Regular `#9d9d9d` | — |
| Advances amount | Text | `73:52951` | — | positive=blue, zero=default | 18px Bold JetBrains Mono, `#60a5fa` | Format: `₴5,000` |
| Stat Card: Remaining | Card | `73:52952` | — | positive, zero, negative | `bg-[#2d2d31]`, `rounded-[20px]` | Left: emoji 💰 in white-tinted circle |
| Remaining icon | Icon | `73:52954` | 💰 emoji (16px) | — | `bg-[rgba(255,255,255,0.1)]` circle 24px | Emoji span, not Iconify |
| Remaining label | Text | `73:52958` | — | static | "Залишок" 12px Regular `#9d9d9d` | — |
| Remaining amount | Text | `73:52960` | — | positive/zero=`#ededed`, negative=`#ef4444` | 18px Bold JetBrains Mono | Negative format: `−₴4,800` (minus sign + ₴) |
| Negative Warning Banner | Banner | `73:53369` | *(warning triangle icon, Component 1)* | visible only when Remaining < 0 | `rounded-[12px]`, amber border, full width `mx-[16px]` | Title: "Від'ємний баланс", Subtitle: "Аванси перевищують заробіток на ₴[X]" |
| History section header | Text | `73:52963` | — | static | "Історія операцій" 14px SemiBold `#ededed` | `ml-[16px]`, `mb-[12px]` (margin before list) |
| History item (earned type) | List row | e.g. `73:52965` | *(arrow-up svg, Component1 variant 15)* | default | Green circle badge 36px; name, date/hours; signed amount right-aligned | Amount: `+₴X,XXX` in `#34d399` |
| History item (advance type) | List row | e.g. `73:52976` | *(arrow-down svg, Component1 variant 14)* | default | Blue circle badge 36px; "Аванс", date; signed amount | Amount: `−₴X,XXX` in `#60a5fa` |
| History item (overtime type) | List row | e.g. `73:52998` | *(clock svg, Component1 variant 17)* | default | Amber circle badge 36px | Amount: `+₴X,XXX` in `#fbbf24` |
| History item divider | Divider | — | — | — | `border-b border-[rgba(255,255,255,0.08)]` | Last item has no bottom border |
| History item name | Text | e.g. `73:52971` | — | truncated | 14px Medium `#ededed`, 1 line max | — |
| History item meta | Text | e.g. `73:52973` | — | static | 12px Regular `#9d9d9d`; format: "23 бер · 9.0 год" or "22 бер" | — |
| History item amount | Text | e.g. `73:52975` | — | color by type | 14px Bold JetBrains Mono; right-aligned | — |
| Empty state emoji | Image | `73:53214` | 📊 emoji | — | Centered, 48×72px | — |
| Empty state title | Text | `73:53218` | — | — | "Ще немає заробітку" 16px SemiBold `#ededed` | Centered |
| Empty state subtitle | Text | `73:53220` | — | — | "Завершіть перше замовлення і ваш баланс з'явиться тут" 14px Regular `#9d9d9d` | Centered, max 245px |
| Empty state CTA | Button | `291:16059` | — | default, pressed | "Переглянути замовлення" — full width primary button | Navigates to W1 (My Tasks) |
| Info Popup backdrop | Overlay | `73:53568` | — | visible on ⓘ tap | Semi-transparent overlay behind card | — |
| Info Popup card | Sheet | `73:53569` | — | visible on ⓘ tap | `rounded-[12px]` card, 327px wide, `mx-[16px]` | Contains 3 explanation rows |
| Info Popup title | Text | `73:53571` | — | static | "Розрахунок балансу" 14px SemiBold `#ededed` | `p-[17px]` |
| Info row: Зароблено | Row | `73:53578` | *(arrow-up icon, Component 2)* | static | Icon 28px, title + multi-line description | "Загальна сума нарахованої оплати за виконані замовлення за поточний місяць" |
| Info row: Аванси | Row | `73:53588` | *(arrow-down icon, Component 2)* | static | Icon 28px | "Сума грошей, які ви вже отримали авансом до кінця розрахункового періоду" |
| Info row: Залишок | Row | `73:53601` | 💰 emoji | static | Emoji 28px | "Різниця між заробленим та отриманими авансами. Якщо від'ємний — ви повинні компанії" |
| Bottom Navigation | Component | `113:10090` | — | balance tab active | Fixed bottom bar, `h-[64px]`, `rounded-full`, dark glass | Balance icon is active (white circle highlight) |

---

## 8. Screen States

| State ID | State Name | Trigger | Visual Description |
|---|---|---|---|
| S1 | **Loading** | Screen first opens, network request in flight | Skeleton placeholders for all sections; header renders normally |
| S2 | **Default (Populated, Positive)** | API returns data, Remaining ≥ 0 | 3 stat cards + history list; no warning banner |
| S3 | **Negative Balance** | Remaining < 0 | Remaining card red, Warning Banner between cards and history |
| S4 | **Empty** | No operations for period | Stat cards all ₴0, empty state illustration + CTA replaces history |
| S5 | **Info Popup** | Worker taps ⓘ | Overlay card with 3-row balance explanation; stat cards visible below |
| S6 | **Error** | API call fails | Full-screen error state with retry button |
| S7 | **Offline (degraded)** | No network | Cached data shown with offline indicator; ⓘ popup disabled |

---

## 9. Business Rules

| Rule ID | Rule | BRD Source |
|---|---|---|
| BR-W3-01 | **Earned** = total wages for all completed orders and logged hours (including overtime at configured multiplier) for current billing period | BRD §2 "My Balance", §6 Rule 4 |
| BR-W3-02 | **Advances** column is visible only on **Starter+ plans**; on Free plan it shows ₴0 with a lock/upgrade hint | BRD §2 "My Balance" |
| BR-W3-03 | **Remaining** = Earned − Advances. May be negative. Negative balance is **allowed** — it means the company is owed money | BRD §6 Rule 5 |
| BR-W3-04 | When Remaining is negative, the **Warning Banner** must be visible, showing the exact deficit amount | BRD §2 "My Balance", §6 Rule 5 |
| BR-W3-05 | Overtime hours are calculated at the company-configured multiplier (1.5× or 2×). Overtime amounts are included in Earned total | BRD §6 Rule 4 |
| BR-W3-06 | Screen is **read-only** — no modifications to data are possible | BRD §2 "My Balance" ("Available actions: View only") |
| BR-W3-07 | History items: each row is either an **earned operation** (order completed) or an **advance issuance**. Format: `date · hours` for orders, `date only` for advances | BRD §2 "My Balance" |
| BR-W3-08 | All amounts are displayed in the company's **Base Currency** (defined at Company creation; immutable) | BRD §3 Companies, §6 Rule 1 |
| BR-W3-09 | Data is strictly isolated to the Worker's current active Company — no cross-company data | BRD §6 Rule 10 |
| BR-W3-10 | When Worker taps "Переглянути замовлення" from empty state, they are navigated to W1 (My Tasks) screen | BRD §2 "My Balance" (empty state implied from W1 link) |
| BR-W3-11 | Advance issuance notifications arrive separately via Telegram bot: "💸 Advance: [Amount]. Remaining: [Y]" | BRD §5.1 Notifications |

---

## 10. Integrations & API Contracts

| Endpoint | Method | Request | Response | Error Codes |
|---|---|---|---|---|
| `/worker/balance` | `GET` | Query: `?company_id=X&period=YYYY-MM` | `{ earned: number, advances: number, remaining: number, period_label: string, history: BalanceHistoryItem[] }` | 401 (unauth), 403 (deactivated), 500 |

### BalanceHistoryItem type (inferred):
```typescript
type BalanceHistoryItem = {
  id: string;
  type: 'earned' | 'advance' | 'overtime';
  name: string;            // Order name or "Аванс"
  date: string;            // "23 бер"
  hours?: string;          // "9.0 год" — only for earned/overtime
  amount: number;          // Signed: positive for earned, negative for advance
  currency: string;        // "₴"
};
```

### TMA Integration:
- `Telegram.WebApp.ready()` called on screen open.
- Safe area: `Telegram.WebApp.safeAreaInset.top` applied to screen padding.
- Back button: managed by Bottom Nav (no TMA back button needed on this tab).

---

## 11. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| **Performance** | Balance data must load in < 2s on 3G. Skeleton state shown immediately. |
| **Offline** | Cached balance data served from local store if network unavailable. Staleness indicator shown if data > 5 min old. |
| **Accessibility** | WCAG AA contrast ratio ≥ 4.5:1 for all text. Negative amounts communicated via color AND "−" prefix (not color alone). |
| **Security** | API calls include Bearer token. initData passed to backend for session validation. Amount data never logged to console. |
| **Localization** | Amounts formatted with comma separator (`₴18,450`). Dates formatted in Ukrainian: "23 бер · 9.0 год". Currency symbol always prefixed. |
| **Responsiveness** | Designed for 390px width (standard TMA width). Stat cards flex-wrap safely on narrower viewports. |

---

## 12. Open Questions

| ID | Priority | Question | Impact |
|---|---|---|---|
| OQ-W3-01 | NON-BLOCKING | Should there be a **period filter** (This Week / This Month / All Time) as described in BRD §2? Figma shows no filter tabs — only current month. Possibly deferred to 2.0. | History display scope |
Answer: there be a **period filter** (This Week / This Month / All Time) as described in BRD §2.
| OQ-W3-02 | NON-BLOCKING | BRD §2 mentions "Overtime indicator: If any overtime hours in current period, shows '⏰ Including [X]h overtime'". Figma does NOT show this indicator anywhere on the screen. Is it deferred or shown in history items only (e.g., "Овертайм · Станція…" row)? | Overtime surface |
Answer: it is deferred
| OQ-W3-03 | NON-BLOCKING | Is the **Advances** stat card visible (but locked/grayed) on Free plan, or completely hidden? BRD says "Starter+ only" but does not specify the Free UX. | Free plan UI |
Answer: it is visible (but locked/grayed) on Free plan
| OQ-W3-04 | NON-BLOCKING | The history list shows a maximum of 5 items in Figma. Is there pagination, a "Load more" button, or is the list fully scrollable with all items? | Infinite scroll vs pagination |
Answer: it is fully scrollable with all items
| OQ-W3-05 | NON-BLOCKING | What is the exact Figma color for the Negative Remaining amount — the metadata shows `#2d2d31` as the card background. Need to confirm the negative red color token. Observed in screenshot as red text but the Design Context shows `#ef4444` is not in variable defs. Assumed `#ef4444` (standard Tailwind red-500). | Color fidelity |
Answer: it is `#ef4444` (standard Tailwind red-500)
---

## 12.1 Design-to-Code Specifics (MANDATORY — feed into Tech Stack)

### Icon Inventory (from SKILL_FIGMA_PARSE icon_inventory)

| Figma data-name | Size | Color | Component | Notes |
|---|---|---|---|---|
| *(arrow-up SVG — Component1 v11)* | 12px | `#34d399` | Earned stat card icon (24px circle bg) | No Iconify ID — rendered as SVG asset from Figma |
| *(arrow-down SVG — Component1 v12)* | 12px | `#60a5fa` | Advances stat card icon (24px circle bg) | No Iconify ID — SVG asset |
| 💰 (emoji) | 16px | `#ededed` | Remaining stat card icon (24px circle bg) | Emoji span, not icon |
| *(arrow-up SVG — Component1 v15)* | 14px | `#34d399` | History item: earned (36px circle bg) | SVG asset |
| *(arrow-down SVG — Component1 v14)* | 14px | `#60a5fa` | History item: advance (36px circle bg) | SVG asset |
| *(clock SVG — Component1 v17)* | 14px | `#fbbf24` | History item: overtime (36px circle bg) | SVG asset |
| *(info SVG — Component1 in header)* | 16px | `#111827` (dark) | Info ⓘ button on header | SVG asset inside white circle |
| *(warning triangle — Component1 in banner)* | 18px | amber | Negative balance warning banner | SVG asset |
| 📊 (emoji) | 48×72px | — | Empty state illustration | Large emoji span |

> **ANNOTATION NOTE:** No Iconify `data-name` attributes were found in the generated code for this screen. All icons are rendered as SVG vector paths embedded via `<img>` tags from the Figma MCP asset server. The implementer MUST:
> 1. Either find matching `@iconify/react` icons that visually match (prefer `solar:*` or `mdi:*` equivalents)
> 2. Or extract SVG path data directly from the Figma design context SVG URLs

**Suggested Iconify alternatives (to confirm against design):**
| Component Use | Suggested Iconify ID |
|---|---|
| Earned (arrow-up) | `solar:arrow-up-bold` |
| Advance (arrow-down) | `solar:arrow-down-bold` |
| Overtime (clock) | `solar:clock-circle-bold` |
| Warning banner | `solar:danger-triangle-bold` |
| Info button | `solar:info-circle-bold` |

---

### Color Table (exact Figma hex per element)

| CSS Variable | Hex Value | Usage |
|---|---|---|
| `--color-bg-screen` | `#222226` | Screen root background (dark/color/bg/primary) |
| `--color-bg-card` | `#2d2d31` | Stat card and history item background (dark/color/bg/card) |
| `--color-bg-elevated` | `#2d2d31` | Navigation bar background (dark/color/bg/elevated) |
| `--color-text-primary` | `#ededed` | Titles, history item names, amounts (dark/color/content/primary) |
| `--color-text-secondary` | `#9d9d9d` | Subtitle, stat labels, meta text (dark/color/content/secondary) |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Card borders, history item dividers |
| `--color-status-success` | `#34d399` | Earned amount, earned history rows (dark/color/status/success) |
| `--color-advances` | `#60a5fa` | Advances amount, advance history rows (dark/colors/advances) |
| `--color-status-warning` | `#fbbf24` | Overtime history rows, warning badge (dark/color/status/warning) |
| `--color-status-negative` | `#ef4444` | Negative Remaining amount (inferred — confirm with stakeholder) |
| `--color-earned-bg` | `rgba(52,211,153,0.15)` | Earned icon badge background |
| `--color-advances-bg` | `rgba(96,165,250,0.15)` | Advances icon badge background |
| `--color-overtime-bg` | `rgba(251,191,36,0.15)` | Overtime icon badge background |
| `--color-remaining-bg` | `rgba(255,255,255,0.1)` | Remaining icon badge background |
| `--color-white-solid` | `#ffffff` | Info button background, nav active bubble |

---

### Spacing Table (exact Figma px values)

| Element | Padding / Gap value |
|---|---|
| Screen horizontal padding | `16px` |
| Header padding | `16px` (all sides) |
| Header height | `68px` |
| Stat Cards row height | `86px` |
| Stat Cards gap between cards | `16px` |
| Stat Card internal padding | `13px` |
| Stat Card border-radius | `20px` |
| Stat Card gap (label row → amount) | `8px` |
| Icon badge size (stat cards) | `24px` |
| Icon badge size (history items) | `36px` |
| Icon-to-label gap in stat card header | `6px` |
| History section top margin | `32px` (from Stat Cards bottom) |
| History item padding | `12px` top + `13px` bottom |
| History item horizontal | `16px` left + `16px` right |
| History item gap (icon + content + amount) | `12px` |
| Warning Banner horizontal margin | `16px` each side |
| Warning Banner height | `78px` |
| Warning Banner border-radius | `12px` (inferred) |
| Info Popup margin | `16px` each side |
| Info Popup internal padding | `17px` |
| Info Popup row gap | `12px` (`space-y-3`) |
| Info button size | `32px` |
| Navigation bar height | `64px` |
| Navigation container padding | `16px` bottom |

---

### Typography Table (exact Figma text style values)

| Role / Usage | font-size | font-weight | font-family | line-height | letter-spacing |
|---|---|---|---|---|---|
| Screen title "Мій баланс" | `18px` | `600` (SemiBold) | Inter | `28px` | `-0.5px` |
| Period subtitle "Березень 2026" | `12px` | `400` (Regular) | Inter | `16px` | `0px` |
| Stat card label (Зароблено, Аванси, Залишок) | `12px` | `400` | Inter | `16px` | `0px` |
| Stat card amount (₴18,450) | `18px` | `700` (Bold) | JetBrains Mono / Noto Sans | `28px` | `0px` |
| History section header | `14px` | `600` (SemiBold) | Inter | `20px` | `0px` |
| History item name | `14px` | `500` (Medium) | Inter | `20px` | `0px` |
| History item meta (date · hours) | `12px` | `400` | Inter | `16px` | `0px` |
| History item amount | `14px` | `700` (Bold) | JetBrains Mono / Noto Sans | `20px` | `0px` |
| Warning banner title | `14px` | `500` (Medium) | Inter | `20px` | `0px` |
| Warning banner subtitle | `12px` | `400` | Inter | `16px` | `0px` |
| Info popup title | `14px` | `600` (SemiBold) | Inter | `20px` | `0px` |
| Info popup row label | `14px` | `400` | Inter | `20px` | `0px` |
| Info popup row description | `12px` | `400` | Inter | `16px` | `0px` |
| Empty state title | `16px` | `600` (SemiBold) | Inter | `24px` | `0px` |
| Empty state subtitle | `14px` | `400` | Inter | `20px` | `0px` |

---

### Border Radius Table

| Element | border-radius |
|---|---|
| Stat card | `20px` |
| Icon badge (stat cards) | `50%` (`rounded-full`) |
| Icon badge (history items) | `50%` (`rounded-full`) |
| Warning Banner | `12px` (inferred from design) |
| Info Popup card | `12px` |
| Navigation bar | `9999px` (`rounded-full`) |
| Info button (ⓘ) | `9999px` (`rounded-full`) |
| History item | no border-radius (flat row) |

---

### Price/Number Formats

- Positive format: `₴18,450` (₴ prefix + comma thousands separator)
- Negative format: `−₴4,800` (Minus sign as `−` (U+2212), then ₴, then comma-separated amount)
- Advance in history: `−₴5,000` (blue)
- Earned in history: `+₴4,050` (green, explicit plus sign)
- Zero: `₴0` (no comma, default text color)

> ⚠️ Use Ukrainian minus `−` (U+2212), NOT ASCII hyphen `-`.

---

### Card Border Style

**`none`** — Stat cards have a full-border `border border-[rgba(255,255,255,0.08)]` (all 4 sides, 1px, subtle). History items use `border-b` (bottom only) as dividers. No left-only accent border on this screen (unlike W1 Task Cards).

---

### Screen Header Safe Area

**YES** — This is a full-screen TMA. The header must respect `safe-area-inset-top` (Telegram WebApp safe area). Apply `padding-top: env(safe-area-inset-top)` or equivalent to the screen root container.

---

## 13. Proposed Improvements (PENDING APPROVAL)

*Section intentionally empty — improvements will be listed after initial review and only appended upon explicit user approval.*
