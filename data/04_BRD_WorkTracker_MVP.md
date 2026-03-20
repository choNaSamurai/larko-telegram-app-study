---
template: 04_BRD_MVP
version: 1.0.0
direction: outsource
status: DRAFT
created: 2026-03-13
updated: 2026-03-13
author: Product Owner
approved_by: —
jira_epic_key: DC-14
project_slug: worktracker
---

# 📘 BRD — MVP: WorkTracker
**Version:** 1.0.0 | **Date:** 13.03.2026 | **Status:** DRAFT

> **Based on:** `02_Proposal_WorkTracker_v2.md` (v2.0)
> **Audience:** IT Department | **Note:** IT produces TS from this BRD independently.

---

## 1. Strategic Vision

### Business Goal
Replace manual tracking (Excel / paper) in a manufacturing workshop with an automated order management and time-tracking system delivered as a **Telegram Mini App**. The admin sees real-time status (what's done, who worked how many hours, how much is owed to each worker), while workers log their time with a single tap.

### Why Now?
- Client already has a ~10-person team struggling with concurrent Excel edits and manual payroll calculation (~2–4 hrs/week).
- Telegram is the team's primary communication channel — zero onboarding friction.
- No separate registration — user taps one button in Telegram and they're in.

### Alignment with Company Direction
- **Outsource:** target → client satisfaction, Phase 2 upsell (web panel, KPI analytics, automated payments, native mobile app).
- **Revenue:** $800 for MVP, Phase 2 potential ≈ $1500–3000.
- **Portfolio:** first Telegram Mini App case for manufacturing — marketing asset.

> KPIs & Success Metrics → see Section 7 (detailed).

---

## 2. Visual UX Description *(The "Imagination Click" Test)*

### Role: Worker

#### Screen: My Tasks (Home)
- **What the user sees:** Vertical feed of order cards. Each card shows:
  - Order name (number if available)
  - Product type (icon + label)
  - Quantity
  - Deadline — red highlight if deadline is tomorrow or overdue
  - Status badge: `New` (blue), `In Progress` (yellow), `Done` (green)
- **Available actions:**
  - `[Tap: Order Card]` → Opens order details with time logging
  - `[Button: My Balance]` → Opens personal financial balance
- **Filtering:** Only orders assigned to this worker with status `New` or `In Progress`.
- **Empty state:** "You have no active orders 🎉"

---

#### Screen: Order Details / Daily Time Log
- **What the user sees:**
  - **Header:** Order name, product type, deadline, status
  - **Section "Today's Log":**
    - `Work Start` field (time selector, HH:MM)
    - Breaks block — pairs of `Break Start` / `Break End` (`+ Add Break` button, up to 5)
    - `Work End` field (time selector)
    - Auto-calculated display: **Net Hours Worked** = (Work End − Work Start − total break time)
  - **Large green button:** `Submit Workday`
- **Available actions:**
  - Set work start time (default: current time)
  - Add break entries (up to 5 per day)
  - `[Button: Submit Workday]` → Saves today's log
- **Validation:**
  - Work Start must be before Work End
  - Break End must be after Break Start
  - Breaks must not overlap
  - Net Hours must be > 0
  - One submission per day — after submitting, the form becomes read-only
- **State after action:** Log saved, button shows `✅ Submitted`, admin sees the updated record.

---

#### Screen: My Balance
- **What the user sees:** Three large number cards:
  - 🟢 **Earned** — total for completed orders and logged hours
  - 🔵 **Advances Received** — total advances issued
  - 🔴 **Remaining** — difference (Earned − Advances). Can be negative (shown in red with "−" sign)
- **Available actions:** View only, no interactive actions.

---

### Role: Admin

#### Screen: Main Menu
- **What the user sees:** Four large tile buttons:
  - 📦 `New Order`
  - 🔧 `In Progress` (badge with count of active orders)
  - 👥 `Team (Workers)` (badge with worker count)
  - 💰 `Finance`
- **Available actions:** Tap any tile to navigate to the corresponding section.

---

#### Screen: New Order
- **What the user sees:** Order creation form:
  - `Order Date` — date selector, default: today
  - `Order Number` — text, optional
  - `Product Type` — dropdown from catalog (~10 types, configurable by admin)
  - `Quantity` — number, minimum 1
  - `Work Start Date` — date selector
  - `Deadline` — date selector
  - `Assign Worker` — dropdown from team list
  - `Payment Model` — choice: Per Unit / Per Hour (default: Per Unit)
  - `Notes` — text, optional
- **Available actions:**
  - `[Button: Create Order]` → Validate, save, notify worker
  - `[Button: Cancel]` → Return to main menu
- **Validation:**
  - Product Type is required
  - Quantity ≥ 1
  - Deadline ≥ Work Start Date
  - Worker is required
- **State after action:** Order created with status `New`. Worker receives notification: *"📦 New order assigned: [Type × Qty] — due by [Deadline]"*

---

#### Screen: Orders List (In Progress)
- **What the user sees:** List of all orders with filters:
  - Status filter: All / New / In Progress / Done
  - Worker filter: dropdown
  - Each order shows: name, type, quantity, worker, deadline, status
- **Available actions:**
  - `[Tap: Order]` → Order details with edit capability
  - `[Button: Change Status]` → New → In Progress → Done
- **State after action:** Status update saved immediately.

---

#### Screen: Worker Card
- **What the user sees:**
  - Worker name, Telegram nickname
  - Count of active orders
  - Work history table (date, order, net hours)
  - Financial summary (earned / advances / remaining)
- **Available actions:**
  - `[Button: Issue Advance]` → Enter amount in a popup
  - `[Button: Edit Rate]` → Change worker's hourly rate in a popup
- **Validation:** Advance amount > 0
- **State after action:** Advance recorded, balance recalculated. Worker receives notification: *"💸 You received an advance of [X] UAH. Your remaining balance has changed."*

---

#### Screen: Finance Dashboard
- **What the user sees:**
  - Total earned wages for the selected period
  - Total advances issued
  - Total remaining payable
  - Per-worker breakdown table: name, earned, advances, remaining
- **Available actions:**
  - `[Filter: Period]` → Week / Month / All Time
  - `[Tap: Worker Row]` → Navigate to worker card

---

#### Screen: Product Types & Rates Settings
- **What the user sees:**
  - List of product types (name, unit rate)
  - `+ Add Type` button
- **Available actions:**
  - `[Button: + Add Type]` → Popup: Name + Rate
  - `[Tap: Existing Type]` → Edit name / rate
  - `[Delete Icon]` → Delete type (with confirmation)
- **Validation:**
  - Name is required and must be unique
  - Rate ≥ 0
  - Cannot delete a type used in active orders (status `New` or `In Progress`)
- **State after action:** Changes apply immediately. Existing orders keep their original rate (rate is locked at order creation time).

---

## 3. Business Data Schema
*What data we collect and its business value. NO technical types — business analysis only.*

### Orders

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| order_number | Order Number | Admin input (optional) | External ID for linking to paper documents |
| order_date | Order Date | Admin input | Date the order was received from end client |
| product_type | Product Type | Dropdown selection | Categorization for analytics and cost calculation |
| quantity | Quantity | Admin input | Work volume, basis for per-unit pay (qty × rate) |
| work_start_date | Work Start Date | Calendar | When worker received the order |
| deadline | Deadline | Calendar | Deadline control; highlighted red when overdue |
| assigned_worker | Assigned Worker | Dropdown selection | Responsible worker |
| status | Status | System + manual | Pipeline control: New → In Progress → Done |
| payment_model | Payment Model | Admin selection | Per-unit or per-hour — locked at creation |
| unit_rate | Unit Rate | Copied from product catalog | Pay calculation; catalog changes do NOT affect existing orders |

### Time Logs

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| log_date | Date | System (today) | Ties to calendar day |
| work_start | Work Start | Worker input | Start of workday |
| work_end | Work End | Worker input | End of workday |
| breaks | Breaks (array of pairs) | Worker input | Time deducted (lunch, etc.) |
| net_hours | Net Hours | Auto-calculated | Basis for hourly pay |
| order | Linked Order | Navigation context | Links logged time to specific order |

### Workers

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| full_name | Full Name | Admin input | Worker identification |
| telegram_nickname | Telegram Nickname | Telegram profile | Contact identity + notification channel |
| role | Role | Admin assigns | Access level: admin or worker |
| hourly_rate | Hourly Rate | Admin input (optional) | Alternative pay model (hours × rate) |

### Advances

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| amount | Advance Amount | Admin input | Reduces remaining balance |
| date | Issue Date | System | Payment chronology |
| worker | Worker | Card context | Links advance to specific worker |
| note | Comment | Admin input (optional) | Context (e.g., "for materials") |

### Product Types

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Type Name | Admin input | Order categorization |
| unit_rate | Unit Rate | Admin input | Auto-populates rate when creating orders |

---

## 4. Status Workflow

### Order Status Flow

```
New → In Progress → Done
```

| Status | Who Changes | Trigger Condition | Notification |
|:-------|:------------|:------------------|:-------------|
| `New` | System | Admin creates an order | Notification to worker: "📦 New order assigned" |
| `In Progress` | Admin | Manual status change; or auto when worker submits first time log | — |
| `Done` | Admin | Manual closure; final amount locked | Notification to worker: "✅ Order [Name] closed. Earned: [X] UAH" |

### Deadline Alert Logic

```
≤ 1 day remaining → yellow badge "Deadline Soon"
Overdue            → red badge "Overdue"
```

---

## 5. Communication Strategy

| Event | Channel | Recipient | Message Content | Delay |
|:------|:--------|:---------|:----------------|:------|
| New order created | Telegram notification | Worker | "📦 New order assigned: [Type × Qty] — due by [Deadline]" | Immediate |
| Advance issued | Telegram notification | Worker | "💸 You received an advance of [X] UAH. Remaining: [Y] UAH" | Immediate |
| Order completed | Telegram notification | Worker | "✅ Order [Name] closed. Earned: [X] UAH" | Immediate |
| Deadline in 1 day | Telegram notification | Worker + Admin | "⏰ Due tomorrow: [Type × Qty]" | Auto at 09:00 the day before deadline |
| Overdue | Telegram notification | Admin | "🔴 Overdue: [Type × Qty], Worker: [Name]" | Auto at 09:00 next day |

---

## 6. Business Rules

1. **Dual Payment Model:** Two pay models, selected per order at creation:
   - **Per-unit:** `Quantity × Unit Rate` (default for production orders)
   - **Per-hour:** `Net Hours × Hourly Rate` (for tasks without fixed quantity)
   - Model is locked at order creation and cannot be changed afterward.

2. **Rate Locking:** When creating an order, the unit rate is copied from the product type catalog. Subsequent catalog rate changes do **NOT** affect existing orders.

3. **Negative Balance Allowed:** An advance can exceed earned amount. The "Remaining" balance can be negative — meaning the worker has received more than earned (advance against future work).

4. **One Submission Per Day:** A worker can submit a daily time log only once per day. After submission — read-only. Admin can manually adjust if needed.

5. **Access Control:**
   - **Admin** — full access: orders, finance, team management, settings.
   - **Worker** — restricted: own orders only, own time log, own balance.
   - Admin adds workers through the app interface.

6. **Authentication:** Through Telegram — no separate login or password required. The user's identity is determined automatically by Telegram.

7. **Product Type Deletion Guard:** A product type cannot be deleted if it is used in any order with status `New` or `In Progress`.

8. **Time Display:** All times shown in Kyiv timezone (the team's local time).

---

## 7. KPIs & Success Metrics *(detailed)*

| KPI | How Measured | Goal (30 days) | Goal (90 days) |
|:----|:-------------|:---------------|:---------------|
| Adoption Rate | % of team actively using (≥3 days/week) | ≥ 80% (8/10) | 100% |
| Timekeeping Coverage | % of working days with submitted time logs | ≥ 70% | ≥ 90% |
| Order Processing | Orders in system vs real orders | ≥ 90% | 100% |
| Admin Time Saved | Time spent on payroll (admin self-assessment) | −50% (~4h/wk → ~2h) | −80%+ |
| Data Accuracy | Payroll discrepancies (complaints/corrections) | ≤ 2/month | ≤ 1/month |
| Client NPS | Client satisfaction (admin feedback) | ≥ 7/10 | ≥ 8/10 |
| Phase 2 Upsell | Client requests additional features | — | ≥ 1 Phase 2 request |

---

## 8. Clarifying Questions for IT
*Questions that arose during BRD creation and need IT Lead's answer before TS starts.*

1. **Max breaks per day:** BRD specifies up to 5 break entries per day — confirm or adjust.
2. **Payment model field:** Should payment model (per-unit / per-hour) be set at the order level, or at the product type level?
3. **Auto-transition to "In Progress":** Should the status change automatically when the worker submits their first time log, or should it always be manual by admin?

---

## 9. Out of Scope *(for this BRD)*
*Features explicitly excluded from this BRD. Planned for future BRD documents.*

- 🖥 **Admin Web Panel (desktop)** — analytics + Excel export *(planned in `05_BRD_WorkTracker_WebPanel.md`)*
- 📊 **KPI Analytics** — worker efficiency, systematic delay tracking *(planned in `05_BRD_WorkTracker_Analytics.md`)*
- 💳 **Card Payments (LiqPay)** — automated payouts *(planned in `05_BRD_WorkTracker_Payments.md`)*
- 📱 **Native Mobile App (iOS / Android)** *(planned in `05_BRD_WorkTracker_MobileApp.md`)*
- 🏅 **Penalties / Bonuses** — motivation/retention system
- 📊 **Data Export** — CSV/Excel report downloads
- 🔔 **Extended Notifications** — daily admin summary digest

---

## 10. Handoff Checklist
- [ ] Approved by CEO / Client
- [ ] All 8 BRD sections completed
- [ ] Synced to Supabase `documents` table (status: `approved`)
- [ ] Vectorized in `document_vectors` via `vector-knowledge-sync` skill
- [ ] Jira Epic created (Product Owner via Jira MCP)
- [ ] IT Lead confirmed receipt

---
*Document generated from template `04_brd_mvp_template.md` | Brain OS v6.0*
*Source: `02_Proposal_WorkTracker_v2.md` (v2.0, 13.03.2026)*
*Brain OS delivers BRD. IT Department writes TS and implements independently.*
