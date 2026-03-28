---
template: 04_BRD_MVP
version: 2.7.1
direction: internal
status: DRAFT
created: 2026-03-17
updated: 2026-03-24
author: Product Owner
approved_by: —
jira_epic_key: DC-38
project_slug: larko
---

<!-- ⛔ GUARDRAIL: BRD = BUSINESS ONLY
This document describes WHAT the business needs, not HOW to build it.
DO NOT include: routes, URLs, API endpoints, database column types,
auth mechanisms (HMAC, JWT, OAuth), hosting providers, frameworks,
programming languages, RBAC terminology, UTC/timezone implementation.
IT Department reads this BRD and independently decides all technical details.
Section 8 (IT Questions) may reference tech choices ONLY as business trade-offs. -->

# 📘 BRD — MVP: Larko
**Version:** 2.6.0 | **Date:** 24.03.2026 | **Status:** DRAFT

> **Based on:** `01_Idea_Larko.md` v2.6.0 (internal product, no Proposal needed)
> **Audience:** IT Department | **Note:** IT produces TS from this BRD independently.

---

## 1. Strategic Vision

### Business Goal
Build a **multi-tenant SaaS** for small-business workforce management — time tracking, order management, payroll calculation, materials, clients, and team coordination — delivered as a **Telegram Mini App** (primary interface & standalone MVP) with a **Web Panel** planned for Phase 2 for advanced enterprise management. Target: any company with 3–100 field/workshop workers who currently track time and pay using Excel, paper, or WhatsApp groups.

**Two web properties:**
- **Landing** (`larko.ai`) — marketing site, pricing, SEO content. Managed by Marketing.
- **Web Panel** (`app.larko.ai`) — registration, login. *(Note: Owner dashboard, billing, and settings are now securely embedded into the Telegram Mini App for the MVP launch).*

**Business model:** Freemium SaaS with 4 tiers (Free, Starter, Business, Pro). Revenue via monthly/annual subscriptions.

### Why Now?
- **Validated demand:** Outsource client (WorkTracker) already waiting for similar product. Warm leads in solar panel industry (~100 workers in pipeline).
- **Telegram adoption:** 1B+ MAU globally, 500M+ Mini App users. Zero-install delivery = zero onboarding friction.
- **Market gap:** Existing solutions (Connecteam, Jobber, Clockify) are expensive ($5–15/user/month), Western-focused, and don't leverage Telegram.
- **Low infrastructure cost:** Break-even at just 4 paying customers (~$30/month infrastructure).

### Alignment with Company Direction
- **Own Product:** target → **$900 MRR** within 12 months, first recurring-revenue product for DriveCode.
- **Portfolio showcase:** Demonstrates full DriveCode ecosystem capabilities.
- **B2B lead funnel:** SaaS users become potential custom development clients.

> KPIs & Success Metrics → see Section 7 (detailed).

---

## 2. Visual UX Description *(The "Imagination Click" Test)*

> ℹ️ **Multi-tenant context:** An **Owner** registers an account, then creates one or more **Companies**. Each Company has its own **Manager** (optional — Owner can act as Manager) and **Workers**. All data is strictly isolated between Companies. When a user opens the app, they see only data from their Company.

### 2.0 Self-Service Onboarding (Web)

#### Screen: Landing Page (larko.ai) — separate site
- **What the user sees:** Marketing page with product description, pricing table (4 tiers), demo video. Managed by Marketing team independently.
- **Available actions:**
  - `[Button: Start Free]` → Redirects to `app.larko.ai/register`
  - `[Button: Pricing]` → Scrolls to pricing section
  - `[Button: Sign In]` → Redirects to `app.larko.ai/login`

#### Screen: Login (app.larko.ai)
- **What the user sees:**
  - `[Button: Sign in with Google]`
  - `[Button: Sign in with Apple]`
  - Divider: "— or —"
  - `Email` + `Password` fields
  - `[Button: Sign In]`
  - `[Link: Forgot password?]` → Opens password reset flow
  - `[Link: Don't have an account? Sign up]` → Redirects to registration
- **Password Reset Flow:**
  - Step 1: Enter email → `[Button: Send Reset Link]`
  - Step 2: Email sent with reset link (valid 24h)
  - Step 3: New password form (min 8 chars, confirm) → `[Button: Reset Password]`
  - Step 4: "Password updated! Sign in →"

#### Screen: Registration (app.larko.ai — Step 1 of 4)
- **What the user sees:** Registration options:
  - `[Button: Sign in with Google]` — Google OAuth
  - `[Button: Sign in with Apple]` — Apple Sign In
  - Divider: "— or —"
  - `Email` — required
  - `Password` — required, minimum 8 characters
  - `[Button: Create Account]`
- **Validation:** Email must be valid and unique. Password minimum 8 characters. Social sign-in auto-fills email from provider.
- **State after action:** Account created — user becomes **Owner**. Redirected to Step 2.

#### Screen: Create Company (Step 2 of 4)
- **What the user sees:** Company profile form:
  - `Company Name` — required (e.g., "Solar Solutions LLC")
  - `Base Currency` — **required**, dropdown (USD, EUR, PLN, UAH). Warning: Cannot be changed later.
  - `Industry Type` — **required**, visual selector with icons:
    - 🏭 Manufacturing
    - 🔨 Construction
    - ☀️ Solar / Maintenance
    - 🧹 Cleaning
    - 🔧 Auto Repair
    - 🚚 Delivery
    - ⚙️ Other
  - `Country` — dropdown, auto-detected by browser
  - `[Button: Create Company]`
- **Validation:** Company Name is required, Industry Type is required.
- **State after action:** Company created. System auto-populates **niche template** (product types, material types, terminology) based on selected Industry Type (see Business Rule #14). Owner acts as Manager of this Company by default.

#### Screen: Invite Workers (Step 3 of 4)
- **What the user sees:**
  - Unique Telegram invite link for the company (e.g., `t.me/LarkoBot?start=comp_abc123`)
  - `[Button: Copy Link]` → Copies to clipboard
  - `[Button: Send via Telegram]` → Opens Telegram with pre-filled message
  - Instruction text: "Share this link with your team. When they tap it, they'll join your company as Workers."
  - `[Button: Skip, I'll do it later]` → Proceeds to Step 4
- **State after action:** Link is active immediately. Workers who tap it are auto-registered and added to the Company.

#### Screen: Choose Plan (Step 4 of 4)
- **What the user sees:**
  - Pricing comparison card for 4 tiers (Free, Starter, Business, Pro)
  - Current selection: **Free** (pre-selected)
  - `[Button: Continue with Free]` → Goes to dashboard
  - `[Button: Upgrade to Starter — $9/mo]` → Opens payment checkout
  - `[Button: Upgrade to Business — $25/mo]` → Opens payment checkout
  - `[Button: Upgrade to Pro — $49/mo]` → Opens payment checkout
  - Annual billing toggle: "Save 20% with annual billing"
- **State after action:** Plan activated. Redirected to Owner dashboard.

---

### Global Component: Company Switcher (TMA & Web Panel)
- **What it is:** A global context selector allowing users who belong to **more than one company** (in any role) to switch their active working environment.
- **Where it lives:**
  - **TMA:** In the main header (dropdown) or via a dedicated `/switch` route.
  - **Web Panel:** In the top-left header of the sidebar (dropdown below the logo).
- **What the user sees:**
  - List of all companies the user is a member of (as Worker, Manager, or Owner), with industry icon and role badge.
  - Currently active company is highlighted.
  - `[Button: + Create New Company]` *(visible to Owners only)*
  - *(Note: There is no cross-company global dashboard. Each company runs in complete isolation).*
- **Available actions:**
  - `[Tap: Company]` → Switches context to that company. All screens below now show that company's data and the UI matching the user's role in that specific company.
  - `[Button: + Create New Company]` → Opens company creation form.

---

### Role: 👷 Worker (Telegram Mini App)

#### Screen: My Tasks (Home)
- **What the user sees:** Vertical feed of order/task cards assigned to them. Each card shows:
  - Order/task name (number if available)
  - Product/service type (icon + label)
  - Client name (if linked)
  - Quantity or estimated hours
  - Deadline — red highlight if deadline is tomorrow or overdue
  - Status badge: `New` (teal/pale), `In Progress` (yellow), `In Review` (blue), `Done` (green)
  - Notes / Instructions (preview text)
- **Available actions:**
  - `[Tap: Order Card]` → Opens Order Hub (details dashboard)
  - **Bottom Navigation:** `Tasks` · `Balance` · `Profile` (Profile contains Time Off and Settings)
- **Filtering:** Toggle: `Active` (default — New + In Progress + Blocked + In Review) / `Completed` (Done). Only orders assigned to this worker.
- **Empty state:** Active tab: "You have no active orders 🎉" / Completed tab: "No completed orders yet"

---

#### Screen: Order Hub (Details Dashboard)
- **Architecture:** Read-only dashboard (Hub) with data-entry Bottom Sheets (Spokes). Workers view order info and history; actions open Bottom Sheets for time/material entry.
- **What the user sees:**
  - **Block 1 — Order Info (read-only):** Order name, type, client, deadline, status badge, Lead Worker ⭐ (if assigned), Notes/Instructions from Manager.
  - **Block 2 — Team Status** *(visible for all orders)*: Shows all assigned workers with personal completion substatuses (⏳ In Progress / ✅ Done). Lead Worker marked with ⭐ badge. Progress indicator: "[X]/[Y] workers ready". `[Button: ✅ My Part is Done]` — worker signals personal completion. Does NOT change order status. Manager notified: "👷 [Worker] marked their part as done on [Order]. ([X]/[Y] workers ready)".
  - **Block 3 — Time Log History:** List of submitted time logs (e.g., "Today: 8h", "Yesterday: 4.5h"). After submission, entry shows `✅ Submitted` (read-only). `[Button: + Add Time]` → Opens **Add Time Bottom Sheet**.
  - **Block 4 — Materials History** *(if industry uses materials)*: List of materials used on this order (name, quantity, cost). `[Swipe left on own entry]` → Edit, Delete *(only own entries, only before order is Done)*. `[Button: + Add Material]` → Opens **Add Material Bottom Sheet**.
  - **Block 5 — Photo Gallery:** Horizontal scroll of uploaded photo thumbnails (up to 3 per day). `[Button: + Add Photo]` → Opens camera/gallery picker.
  - **Block 6 — Actions:** `[Button: ⚠️ Повідомити про проблему]` → Opens **Report Issue Bottom Sheet** (type selector: 🚧 Blocker/Problem or ⚠️ Correction Request). Visible on all orders except status `Done`.
- **Bottom Sheet: Add Time (Spoke)**
  - `Work Start` field (time selector, HH:MM)
  - Breaks block — pairs of `Break Start` / `Break End` (`+ Add Break` button, up to 5)
  - `Work End` field (time selector)
  - Auto-calculated: **Net Hours Worked** = (Work End − Work Start − total break time)
  - If overtime (>8h/day): highlighted "⏰ Overtime: [X]h at [1.5x/2x] rate"
  - `Units Completed` field *(Per-Unit only)*: "How many units today?". Running total: "You: [X] of [Total Qty]"
  - `[Button: Save Time]` → Saves log, closes sheet, updates Hub. **One submission per day** — after saving, the "+ Add Time" button hides and the entry becomes read-only.
- **Bottom Sheet: Add Material (Spoke)**
  - Material Name (searchable dropdown from catalog)
  - Quantity (number input, must be > 0)
  - Unit cost (read-only, from catalog snapshot)
  - `[Button: Add Material]` → Saves entry, closes sheet, updates Hub.
- **Validation:**
  - If Work End < Work Start, the system interprets the shift as crossing midnight (valid).
  - Break End must be logically after Break Start (accounting for midnight shifts).
  - Breaks must not overlap. Net Hours must be > 0.
  - One time log submission per day per order — after submitting, form becomes read-only. Corrections via dispute workflow.
  - Photo file size limit: 10 MB per photo, 3 photos max per day per order.
  - Material quantity must be > 0.
  - Units Completed must be ≥ 0 (if field visible). Warning if cumulative units across all workers exceed order quantity.
- **State after action:** Log saved, Hub updates. Manager sees the updated record.

---

#### Screen: My Balance
- **What the user sees:** Large number cards:
  - 🟢 **Earned** — total for completed orders and logged hours (including overtime at applicable rate)
  - 🔵 **Advances Received** — total advances issued *(Starter+ plans only)*
  - 🔴 **Remaining** — difference (Earned − Advances). Can be negative (shown in red with "−" sign)
  - **Overtime indicator:** If any overtime hours in current period, shows "⏰ Including [X]h overtime"
- **Below cards:** Scrollable history of earnings and advances:
  - Each row: date, order name, type (earned/advance), amount
  - Filter by: This Week / This Month / All Time
- **Available actions:** View only, no interactive actions.

---

#### Screen: My Absences
- **What the user sees:**
  - Calendar view showing approved/pending absence days
  - List of past and current absence requests (including Type and Reason) with statuses: `Pending` (orange), `Approved` (green), `Rejected` (red)
  - `[Button: + Request Absence]`
- **Available actions:**
  - `[Button: + Request Absence]` → Opens form:
    - `Absence Type` — dropdown: configurable by Manager in Company Settings. Default set: Vacation, Sick Leave, Personal Day, Holiday, Unpaid Leave, Family Leave, Training, Other
    - `Start Date` — date selector
    - `End Date` — date selector (can equal start date for 1-day absence)
    - `Reason` — text, optional
    - `[Button: Submit Request]`
- **Validation:** Start Date ≤ End Date. Cannot request absence for past dates. Cannot overlap with existing approved absences.
- **State after action:** Request created as `Pending`. Manager receives notification. Worker sees request in list.

---

#### Screen: Report Issue (Bottom Sheet → Form)
- **Entry point:** `[⚠️ Повідомити про проблему]` from Order Hub or Balance screen.
- **Step 1 — Type Selector (Bottom Sheet):**
  - `🚧 Блокер / Проблема` — operational issue during work (e.g., missing materials, access denied, broken equipment). Requires manager attention NOW.
  - `⚠️ Запит на корекцію` — formal dispute about pay, hours, or rates.
- **Step 2 — Issue Form (full screen or extended bottom sheet):**
  - `Issue Type` — pre-selected from Step 1. If Blocker: sub-types (Missing Materials, Access Denied, Equipment Issue, Safety Hazard, Other). If Correction: sub-types (Incorrect Hours, Wrong Rate, Missing Payment, Other).
  - `Order` — pre-selected if opened from order context.
  - `Expected Value` — *(Correction only)* what the worker believes the correct amount is.
  - `Description` — text, required, minimum 20 characters.
  - `Attachments` — optional:
    - `[📷 Додати фото]` → Camera/gallery picker. Up to 3 photos, max 10 MB each.
    - `[📎 Додати файл]` → File picker. Up to 2 files, max 25 MB each. Supported: PDF, DOCX, XLSX, JPG, PNG.
  - `[Button: Відправити]`
- **State after action:**
  - **Blocker:** Created as `Active Blocker`. Manager receives HIGH-PRIORITY notification: "🚨 [Worker] reports a blocker on [Order]: [Type]." Blocker visible as yellow badge on M4 Order Details.
  - **Correction:** Created as `Pending Review`. Manager receives notification: "⚠️ [Worker] submitted a correction request for [Order]."

#### Screen: Worker Profile
- **What the user sees:** Personal settings:
  - Avatar, Name, Role, Current Company
  - Application language selector (🇺🇦 / 🇬🇧)
  - App Theme toggle (☀️ Light / 🌙 Dark)
  - `[Link: Time Off]` → Opens Absence requests screen
  - `[Link: Support & FAQ]` → Opens FAQ screen
- **Available actions:** Change language, switch theme, access Time Off and Support.

#### Screen: Support & FAQ
- **What the user sees:** Accordion-style list of common questions (e.g., How payroll works, Dispute process).
- **Available actions:** Read answers, tap to contact Support for unresolved issues.

---

### Role: 👔 Manager (Telegram Mini App)

> Manager manages one Company's operations. Owner acts as Manager for companies without a designated Manager.

#### Screen: Dashboard (Home)
- **What the user sees:** Top section with Quick Stats (Active Orders, Workers Online), followed by a 6-tile grid:
  - 💰 `Finance` *(Starter+ only)*
  - 👤 `Clients` (badge with client count) *(Starter+ only)*
  - 📋 `Materials` (badge if materials pending approval) *(Starter+ only)*
  - 🌴 `Time Off` (badge for pending requests)
  - ⚠️ `Disputes` (badge for pending disputes)
  - ⚙️ `Company Settings`
- **Bottom Navigation:** Fixed bottom nav bar with tabs: `Home`, `Orders`, `Team`, `Profile`.
- **Available actions:** Tap any tile or bottom nav tab to navigate to the corresponding section. Locked tiles for Free plan show lock icon + "Upgrade" label.

---

#### Screen: Create Order
- **What the user sees:** Order creation form:
  - `Order Date` — date selector, default: today
  - `Order Number` — text, optional
  - `Client` — dropdown from client list or `[+ New Client]` inline *(Starter+ only)*
  - `Product/Service Type` — dropdown from catalog (auto-populated by niche template, configurable)
  - `Quantity` — number, minimum 1
  - `Work Start Date` — date selector
  - `Deadline` — date selector
  - `Assign Worker` — dropdown from team list. Can assign multiple workers.
  - `Lead Worker` — *(optional, visible only when 2+ workers assigned)* dropdown from assigned workers. Lead gets additional visibility: can view all workers' time logs on this order and can change order status to Done. See Business Rule #32.
  - `Payment Model` — choice: Per Unit / Per Hour / Per Job (default from niche template)
  - `Notes` — text, optional
  - `[Button: Create Order]`
- **Validation:**
  - Product/Service Type is required
  - Quantity ≥ 1
  - Deadline ≥ Work Start Date
  - At least one Worker is required
- **State after action:** Order created with status `New`. Each assigned worker receives notification: *"📦 New order assigned: [Type × Qty] — due by [Deadline]"*

> **Rate snapshot rule:** When order is created, the current rate for the selected product type is copied and LOCKED to the order. Future rate changes in the catalog do NOT affect this order's rate. See Business Rule #3.

---

#### Screen: Orders List
- **What the user sees:** Scrollable list of all orders with:
  - **Search:** by order name or number
  - **Filters:** Status (All / New / In Progress / Blocked / In Review / Done), Worker, Client *(Starter+)*, Date range
  - **Sort:** by date (newest first), deadline (soonest first), status
  - Each order shows: name, type, quantity, worker(s) with completion progress *(if multi-worker, e.g., [2/5 ✅])*, client, deadline, status, total cost-to-date
- **Available actions:**
  - `[Tap: Order]` → Order details with edit capability, material log, time logs from workers
  - `[Button: Change Status]` → New → In Progress → (auto: Blocked if blocker reported) → (auto: In Review when all workers done) → Done (with confirmation)
  - `[Swipe left]` → Quick actions: Duplicate, Delete (with confirmation)

---

#### Screen: Order Details (Manager View)
- **What the user sees:**
  - All order info (same as worker Hub view) + Work Start Date + Quantity
  - **Worker completion tracker** *(visible for all orders)*: visual indicator showing "[X]/[Y] workers marked as done". Each worker row shows ⏳ or ✅ status. Lead Worker marked with ⭐.
  - **Time logs from all assigned workers** — table: date, worker name, start, end, breaks, net hours, units completed *(Per-Unit only)*, cost
  - **Filter: by Worker** — dropdown to filter time logs, photos, and materials by specific worker
  - **Overtime flag** per log entry (if net hours >8)
  - **Materials log** — table: material name, quantity, unit cost, total, added by (worker name), date *(Starter+)*
  - **Photos** — gallery of all uploaded photos from all workers. **Filter: by Worker** toggle to view photos from specific worker.
  - **Cost summary:** Total labor cost + Total material cost = Grand Total. *(Multi-worker: per-worker breakdown shown)*
  - **Issue alerts** — yellow banner for active Blockers (🚧), red banner for pending Corrections (⚠️). Shows count and latest issue summary.
- **Available actions:**
  - `[Button: Edit Order]` → Modify order details (except locked rate)
  - `[Button: View Issues]` → Opens filtered issue review (Blockers + Corrections for this order). Manager can view attached photos/files, respond, approve or reject.
  - `[Button: Change Status → Done]` → For **Per-Job multi-worker orders**: opens Payment Split modal before closing:
    - Worker list with editable participation % (default: equal split)
    - Auto-calculated amount per worker: `% × Total Job Rate`
    - Total must equal 100%. `[Button: Confirm & Close Order]`
    - For single-worker Per-Job orders: 100% auto-applied, no modal shown

---

#### Screen: Team (Workers List)
- **What the user sees:** List of all workers in this Company:
  - Worker name, role indicator (Worker/Manager)
  - Active orders count
  - Status: Active / Invited (not yet joined)
  - Total hours this week
  - **Worker group** badge *(Business+ only)*
- **Available actions:**
  - `[Tap: Worker]` → Opens Worker Card
  - `[Button: + Invite Worker]` → Shows Telegram invite link + share options
  - `[Button: Promote to Manager]` → Changes worker to Manager role (with confirmation) *(Owner only)*
  - `[Swipe left: Deactivate]` → Confirmation: "Deactivate [Name]? They will lose access but their data is preserved." → Worker status → Deactivated. See Business Rule #26.

---

#### Screen: Worker Card
- **What the user sees:**
  - Worker name, Telegram nickname, role
  - Count of active orders
  - Absence calendar (upcoming approved absences highlighted)
  - Work history table (date, order, net hours, overtime hours)
  - Financial summary (earned / advances / remaining) *(Starter+)*
  - Rate history (current rate + past rates with dates of change)
- **Available actions:**
  - `[Button: Issue Advance]` → Enter amount in a popup *(Starter+)*
  - `[Button: Edit Rate]` → Change worker's rate(s). Shows warning: "New rate will apply to future orders only."
  - `[Button: Review Absences]` → Pending absence requests for this worker

---

#### Screen: Client List *(Starter+ only)*
- **What the user sees:** Scrollable list of all clients:
  - Client name
  - Contact info (phone, email — if provided)
  - Number of linked orders (total / active)
  - Total revenue generated by this client
- **Available actions:**
  - `[Tap: Client]` → Opens Client Card
  - `[Button: + New Client]` → Opens client creation form

#### Screen: Client Card *(Starter+ only)*
- **What the user sees:**
  - Client name, contact person, phone, email, address (all optional except name)
  - Notes field (free text)
  - Order history: list of all orders linked to this client (dates, status, amounts)
  - Financial summary: total billed, total labor cost, total material cost
- **Available actions:**
  - `[Button: Edit]` → Modify client details
  - `[Button: + New Order for Client]` → Pre-fills client in order creation
  - `[Button: Delete Client]` → Only if no active orders linked (with confirmation)

---

#### Screen: Materials Catalog *(Starter+ only)*
- **What the user sees:** List of material types configured for this Company (pre-populated by niche template):
  - Material name, default unit, default price per unit
  - `[Button: + Add Material Type]`
- **Available actions:**
  - `[Tap: Material]` → Edit name, unit, default price
  - `[Button: + Add Material Type]` → Popup: Name + Unit + Default Price
  - `[Delete]` → Soft-delete (with confirmation, hidden from selectors but preserved in historical records)

---

#### WP9 — Global Overview Dashboard (Owner only)
- 2 stat cards (Total Workers across account, Active Orders) with trend indicators
- Action Required alert banner (pending absences, overdue orders, pending disputes)
- Company cards grid: name, industry badge, worker usage progress bar, payable amount in local currency
- *(No global financial totals to avoid cross-currency aggregation errors)*

---

#### Screen: Finance Dashboard *(Starter+ only)*
- **What the user sees:**
  - Total earned wages for selected period (regular + overtime separately)
  - Total advances issued
  - Total remaining payable
  - Total material costs
  - Per-worker breakdown table: name, regular hours, overtime hours, earned (regular), earned (overtime), advances, remaining
- **Available actions:**
  - `[Filter: Period]` → Week / Month / All Time / Custom date range
  - `[Tap: Worker Row]` → Navigate to worker card
  - `[Button: Export CSV]` *(Business+ only)* → Downloads data as CSV file
  - `[Button: Export Excel]` *(Business+ only)* → Downloads data as Excel file

---

#### Screen: Issue Review (Blockers & Corrections)
- **What the user sees:** Combined list of Blockers and Correction Requests:
  - **Filter tabs:** `All` · `🚧 Blockers` · `⚠️ Corrections` · `Resolved`
  - Each issue card: Worker name, order name, issue type (Blocker / Correction), sub-type, date submitted, priority badge
  - Description from worker
  - **Attachments gallery:** Thumbnails of attached photos (tappable for full-screen view) + file links (tappable to download/preview)
  - *(Correction only)* Current system value vs worker's claimed value
- **Available actions:**
  - `[Button: ✅ Вирішено / Approve]` → For Corrections: adjusts record. For Blockers: marks as resolved. Worker notified.
  - `[Button: ❌ Reject]` → Reject with mandatory comment. Worker notified.
  - `[Button: 💬 Ask for Details]` → Comment + optional photo/file attachment from manager. Status → "Needs Clarification". Worker notified.

---

#### Screen: Absence Management
- **What the user sees:** Calendar view showing all workers' absences (color-coded by type):
  - Pending requests listed below calendar
  - Each row: Worker name, type, dates, reason
- **Available actions:**
  - `[Button: ✅ Approve]` → Worker notified.
  - `[Button: ❌ Reject]` → Reject with comment. Worker notified.

---

#### Screen: Company Settings
- **What the user sees:** Configuration sections:
  - **Product/Service Types:** List of types with rates (pre-populated from niche template, editable)
  - **Material Types:** Link to Materials Catalog *(Starter+)*
  - **Absence Types:** Toggle switches for available absence types. Default set: Vacation, Sick Leave, Personal Day, Holiday, Unpaid Leave, Family Leave, Training, Other. Manager can enable/disable types relevant to their company.
  - **Industry Type:** Current selection, ability to change (warning: resets template data with confirmation)
  - **Company Profile:** Company name, country
  - **Overtime Rules:**
    - Daily threshold (default: 8 hours)
    - Weekly threshold (default: 40 hours)
    - Overtime multiplier: 1.5x (default) or 2x
  - **Working Hours:** Default work start/end times for notifications
  - **Worker Groups:** Create/manage groups for organizing workers *(Business+ only)*
  - **Delete Company:** `[Button: Delete Company]` *(Owner only)* → See Business Rule #27

#### Screen: Manager Profile
- **What the user sees:** Personal settings:
  - Avatar, Name, attached Telegram account
  - Application language selector (🇺🇦 / 🇬🇧) (stored per account, applies to all interfaces)
- **Available actions:** Change language, unlink Telegram context.

#### Screen: Support & FAQ (Manager)
- **What the user sees:** Accordion-style list of Manager-specific FAQs (e.g., subscription logic, adding workers).
- **Available actions:** Read answers, tap to contact Support.

#### Screen: Subscription & Billing (Manager & Owner in TMA)
- **What the user sees:**
  - Current plan: Free / Starter / Business / Pro
  - Plan limits: Companies [used]/[limit], Workers [used]/[limit], Managers [used]/[limit]
  - **Usage meter:** Visual bar showing usage vs limits
  - If not on highest plan: prominent `[Button: Upgrade]`
  - If paid: plan details, next billing date, payment method
- **Available actions:**
  - `[Button: Upgrade]` / `[Button: Change Plan]` → Opens checkout via Telegram Stars / Stripe
  - `[Button: Manage Billing]` → Opens secure Stripe Portal

---

### Role: 👑 Owner (Telegram Mini App)

> Owner has ALL Manager capabilities for any Company, PLUS the following account-level screens directly in the TMA.

#### Screen: M1 Dashboard — Owner State (Extended)
- **What the user sees:** Same as Manager M1 Dashboard for the selected company, PLUS Owner-specific additions:
  - **Stats Section:** Active Workers · Active Orders · Payable this period *(all per-company only, no cross-company aggregation)*.
  - **📊 Statistics Tile** (Owner-exclusive): "View advanced analytics for [Company Name]" → Opens Company Statistics (O2).
  - **Alerts:** Pending absences, pending disputes, overdue orders *(for current company only)*.
- **Available actions:**
  - Tap `📊 Statistics` tile → Company Statistics (O2)
  - `[Company Switcher]` button in header → G1/O1 Switcher to change active company
  - All standard Manager actions (Create Order, View Orders, etc.)

> **Architectural Rule:** All data shown on M1 Owner State is strictly scoped to the currently selected company. There is no cross-company aggregation anywhere in the TMA.

#### Screen: Company Statistics (O2) *(Owner-only, Starter+ plan required)*
- **What the user sees:** Advanced analytical screen for the selected company's performance:
  - **Financial Health:** Revenue vs Costs charts, Profit Margin by period.
  - **Team Performance:** Top performing workers, overtime trends, attendance/absence rates.
  - **Order Efficiency:** Average completion time, orders completed vs delayed by period.
  - **Plan Gate (Free plan):** Teaser card "Upgrade to Starter to unlock advanced company analytics." + `[Upgrade]` → M16.
- **Available actions:**
  - Toggle date ranges (Week, Month, Quarter, Year).
  - Export partial reports (PDF generated via bot).

---

#### Screen: KPI Analytics Dashboard (Web Panel, Business+ only)
- **What the user sees:** Interactive charts and reports:
  - **Workers performance:** Hours logged per worker (bar chart), overtime distribution
  - **Orders analytics:** Completion rate trends, average order duration, orders by type
  - **Financial trends:** Revenue over time, labor costs, material costs
  - **Comparison:** This month vs last month, this week vs last week
  - **Filters:** By company, by date range, by worker group
- **Available actions:**
  - `[Filter]` → Select company, date range, worker group
  - `[Export]` → CSV or Excel download *(Business+ only)*

---

#### Screen: Audit Trail (Web Panel, Pro only)
- **What the user sees:** Chronological log of all changes:
  - Who changed what, when, old value → new value
  - Filterable by: company, user, action type, date range
  - Actions tracked: rate changes, order edits, role changes, status changes, dispute resolutions
- **Available actions:** View only. Searchable and filterable.

---

#### Screen: Billing & Subscription (Web Panel - *Migrated to TMA*)
- *(Feature moved natively to TMA for MVP to enable standalone operation)*

---

#### Screen: API Management (Web Panel, Pro only)
- **What the user sees:**
  - API key (masked, with copy button)
  - Usage statistics (requests today / this month)
  - API documentation link
  - `[Button: Regenerate Key]` (with confirmation)
- **Available actions:**
  - Copy API key
  - View usage
  - Regenerate key

---

#### Screen: Account Settings (Web Panel)
- **What the user sees:**
  - **Profile:** Full name (editable), email (editable with re-verification)
  - **Auth methods:** Shows linked sign-in methods (Email/Password, Google, Apple):
    - `[Button: Link Google]` / `[Button: Unlink Google]`
    - `[Button: Link Apple]` / `[Button: Unlink Apple]`
    - `[Button: Change Password]` (if email/password auth active)
    - At least one auth method must remain linked (cannot unlink the last one)
  - **Language:** Ukrainian 🇺🇦 / English 🇬🇧 selector
  - **Danger zone:**
    - `[Button: Delete Account]` → Confirmation: "This will permanently delete your account, ALL companies, and all data. Type 'DELETE' to confirm." → Requires re-authentication. See Business Rule #28.

---

### Motivational Notifications (System → Owner/Manager)

The system proactively sends value-demonstration messages via Telegram:

| Notification | When | Example Message |
|:-------------|:-----|:----------------|
| **Monthly savings report** | End of billing month | "📊 This month Larko saved you ~8 hours of payroll work and tracked [X] orders across [Y] workers!" |
| **Weekly team summary** | Every Monday at 9:00 | "📋 Last week: [X] orders completed, [Y] hours tracked across [Z] workers" |
| **Milestone celebration** | First 10/50/100 orders | "🎉 Congratulations! Your team just completed the 100th order on Larko!" |
| **Growth comparison** | Monthly, if data available | "📈 Your team is 12% more productive than last month!" |
| **Feature discovery** | After 14 days of usage | "💡 Did you know? You can track materials per order. Try it in Settings → Materials!" |
| **Upgrade nudge** | When at 80%+ of plan limits | "⚠️ You have 9/10 workers. Need more? Upgrade to Business →" |

*(Motivational notifications require Starter+ plan)*

---

## 3. Business Data Schema

### Accounts (Owner Registration)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| email | Email | Signup form | Login, billing contact |
| full_name | Full Name | Signup form | Account identification |
| subscription_plan | Current Plan | System | Controls feature access and limits |
| trial_used | Free Trial Used | System | Anti-fraud: prevents trial cycling |

### Companies

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Company Name | Owner input | Company identity |
| industry_type | Industry Type | Owner selection (required) | Auto-configures niche template (terminology + modules) |
| base_currency | Base Currency | Owner selection (required) | Defined at creation, dictates all financial data. Immutable. |
| country | Country | Owner input (auto-detected) | Drives overtime law defaults |
| invite_code | Invite Code | System-generated | Unique Telegram join link per company |
| owner | Owner | System | Links company to its account |

### Users (Workers, Managers, Owners)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| full_name | Full Name | User input or Telegram profile | Identification |
| telegram_id | Telegram ID | Telegram auth | Contact identity + notification channel |
| email | Email | Signup form (Owner only) | Web panel login |
| role | Role | Owner assigns (or auto) | Access level: Worker, Manager, Owner |
| company | Company | Join link context | Data isolation boundary |
| status | Status | System | Active / Invited / Deactivated |
| worker_group | Worker Group | Manager assigns | Team organization *(Business+)* |

### Orders

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| order_number | Order Number | Manager input (optional) | External ID |
| order_date | Order Date | Manager input | Creation date |
| product_type | Product/Service Type | Dropdown (from niche template) | Categorization + cost calculation |
| quantity | Quantity | Manager input | Work volume |
| work_start_date | Work Start Date | Calendar | When work begins |
| deadline | Deadline | Calendar | Deadline control |
| assigned_workers | Assigned Workers | Multi-select | Responsible workers |
| lead_worker | Lead Worker | Manager selection (optional) | Designated coordinator for multi-worker orders. Can view all time logs and change status to Done. See Rule #32 |
| client | Client | Dropdown (optional, Starter+) | Links order to customer |
| status | Status | System + manual | Pipeline: New → In Progress ↔ Blocked → In Review → Done |
| payment_model | Payment Model | Manager selection | Per-unit / Per-hour / Per-job (default from template) |
| unit_rate | Rate Snapshot | Copied from catalog at creation | Locked at creation time |
| notes | Notes | Manager/Worker input | Additional context |

### Time Logs

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| log_date | Date | System (today) | Calendar day |
| work_start | Work Start | Worker input | Start of workday |
| work_end | Work End | Worker input | End of workday |
| breaks | Breaks | Worker input | Array of start/end pairs |
| net_hours | Net Hours | Auto-calculated | (End − Start − Breaks) |
| overtime_hours | Overtime Hours | Auto-calculated | Hours exceeding daily threshold |
| order | Linked Order | Navigation context | Links time to order |
| worker | Worker | Auth context | Who logged |
| units_completed | Units Completed | Worker input (Per-Unit only) | How many units this worker completed today. Used for Per-Unit payroll calculation. See Rule #31 |
| worker_done | My Part Done | Worker toggle | Worker signals personal completion on multi-worker orders. Does not affect order status directly. See Rule #31 |
| sync_status | Sync Status | System | Synced / Pending (for offline queue) |

### Materials Used (per order, Starter+)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| material_type | Material | Dropdown from catalog | What was used |
| quantity | Quantity Used | Worker/Manager input | How much |
| unit_cost | Unit Cost | From catalog (editable) | Cost per unit |
| total_cost | Total Cost | Auto-calculated | qty × unit_cost |
| added_by | Added By | Auth context | Accountability |
| date_added | Date | System | When logged |

### Clients (Starter+)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Client Name | Manager input | Identification |
| contact_person | Contact Person | Optional | Primary contact |
| phone | Phone | Optional | Contact channel |
| email | Email | Optional | Contact channel |
| address | Address | Optional | Location reference |
| notes | Notes | Optional | Free-text context |

### Advances (Starter+)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| amount | Advance Amount | Manager input | Reduces balance |
| date | Issue Date | System | Chronology |
| worker | Worker | Context | Links to worker |
| note | Comment | Manager input (optional) | Context |

### Product/Service Types (Catalog Constructor)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Type Name (Task Template) | Niche template / Manager | Defines the work to be done |
| pricing_schema | Pricing Model (JSONB) | Manager (Constructor) | Single Unit, Time-Based (w/ Overtime), Composite (Combo), or Fixed |
| default_rate | Base Rate | Manager input | Auto-populates rate on orders based on pricing schema |
| status | Archive Status | System (Soft delete) | Hides from new orders but preserves historical data |

*(Note: The `pricing_schema` allows Managers to build specific task templates. For example, setting up a "Night Shift" service that defaults to 12 hours with a specific overtime rate, or a "Tile Laying" service that combines m² and running meter metrics into one order form).*

### Material Types (Catalog, Starter+)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Material Name | Niche template or Manager input | Identification |
| unit | Unit of Measurement | Manager input | "kg", "pieces", "liters" |
| default_price | Default Unit Price | Manager input | Auto-populates on order |

### Rate History

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| worker | Worker | Context | Whose rate changed |
| rate_type | Rate Type | System | Hourly / Per-unit / Per-job |
| old_value | Previous Rate | Snapshot | Audit trail |
| new_value | New Rate | Manager input | Current rate |
| changed_date | Date | System | When changed |
| changed_by | Changed By | Auth context | Accountability |

### Absence Requests

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| worker | Worker | Auth context | Who is requesting |
| type | Absence Type | Worker selection | Vacation / Sick / Personal / Holiday |
| start_date | Start Date | Worker input | First day |
| end_date | End Date | Worker input | Last day |
| reason | Reason | Optional | Context |
| status | Status | System + Manager | Pending → Approved / Rejected |
| reviewed_by | Reviewed By | Manager action | Who decided |
| review_comment | Review Comment | Manager input | Why rejected |

### Disputes

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| worker | Worker | Auth context | Who disputes |
| order | Order | Worker selection | What is disputed |
| dispute_type | Type | Worker selection | Hours / Rate / Payment / Other |
| expected_value | Expected Value | Worker input | Worker's claim |
| description | Description | Worker input | Explanation |
| status | Status | System + Manager | Pending → Approved / Rejected / Clarification |
| resolution_comment | Resolution | Manager input | Decision explanation |

### Subscriptions

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| account | Account | System | Which Owner |
| plan | Plan Name | System | Free / Starter / Business / Pro |
| billing_cycle | Billing Cycle | Owner selection | Monthly / Annual |
| status | Status | Billing webhook | Active / Cancelled / Past Due / Paused |
| current_period_end | Period End | Billing webhook | When access expires |
| company_limit | Company Limit | Plan definition | Max companies allowed |
| worker_limit | Worker Limit | Plan definition | Max total workers |
| manager_limit | Manager Limit | Plan definition | Max managers (excl. Owner) |

### Niche Templates (System-managed)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| industry_type | Industry | DriveCode (Super Admin) | Which industry this template serves |
| product_types | Default Product Types | Template definition | Auto-created on company setup |
| material_types | Default Material Types | Template definition | Auto-created on company setup |
| default_pay_model | Default Payment Model | Template definition | Per-unit / Per-hour / Per-job |
| terminology_map | Display Labels | Template definition | Maps generic terms to industry-specific |

### Worker Groups (Business+)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| name | Group Name | Manager input | Team organization |
| company | Company | Context | Which company |
| workers | Members | Manager assigns | Group membership |
| color | Group Color | Manager selection | Visual identification |



### Photos (per order per day)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| order | Order | Navigation context | Which order |
| worker | Uploaded By | Auth context | Who uploaded |
| file_reference | File | System (storage) | Link to stored photo |
| thumbnail | Thumbnail | System (auto-generated) | Quick preview |
| file_size | File Size | System | Enforce 10 MB limit |
| upload_date | Upload Date | System | Chronology |
| sync_status | Sync Status | System | Synced / Pending (offline queue) |

### Audit Log (Pro)

| Field | Business Label | Source | Business Value |
|:------|:---------------|:-------|:---------------|
| action_type | Action | System | What changed (rate_change, order_edit, role_change, etc.) |
| entity_type | Entity | System | Which entity (order, worker, rate, etc.) |
| entity_id | Entity ID | System | Which record |
| actor | Who | Auth context | Who made the change |
| old_value | Previous Value | Snapshot | Before state |
| new_value | New Value | Snapshot | After state |
| timestamp | When | System | When the change occurred |
| company | Company | Context | Which company |

---

## 4. Status Workflows

### 4.1 Order Status Flow

```text
New → In Progress ↔ Blocked → In Review → Done
                ↘ Dispute (non-blocking) ↗
```

| Status | Who Changes | Trigger | Notification |
|:-------|:------------|:--------|:-------------|
| `New` | System | Manager creates order | Workers: "📦 New order: [Type × Qty] — due [Deadline]" |
| `In Progress` | Worker / Manager | Worker clicks 'Start Work'; or auto on first log; or auto when Blocker resolved | — |
| `Blocked` | System | Auto when worker reports a Blocker | Manager: "🚨 Order [Name] is blocked: [Blocker Type]" |
| `In Review` | System | All workers mark "My Part is Done" | Manager: "👀 Order [Name] is ready for review" |
| `Dispute` | Worker | Worker files a correction request *(does NOT change order status — runs in parallel)* | Manager: "⚠️ [Worker] disputes [Order]" |
| `Done` | Manager or Lead Worker | Manual closure; amounts locked. Lead Worker (if designated) can also close. See Rule #32 | Workers: "✅ Order [Name] closed. Earned: [X]" |

#### 4.1b Worker Completion Signal (Multi-Worker Orders)

When multiple workers are assigned to one order, each worker can independently signal completion of their personal part:

| Action | Who | Trigger | Notification |
|:-------|:----|:--------|:-------------|
| Mark my part done | Worker | Taps "✅ My Part is Done" | Manager: "👷 [Worker] marked their part as done on [Order]. ([X]/[Y] workers ready)" |
| All workers done | System | All assigned workers marked done | Manager: "🎉 All [Y] workers finished on [Order]. Ready to close?" |

> This does NOT auto-close the order. Manager (or Lead Worker) must manually set status to `Done`.

### 4.2 Deadline Alert Logic

```
≤ 1 day remaining → yellow badge "Deadline Soon"
Overdue            → red badge "Overdue"
```

### 4.3 Absence Request Flow

```
Pending → Approved / Rejected
```

| Status | Who Changes | Trigger | Notification |
|:-------|:------------|:--------|:-------------|
| `Pending` | System | Worker submits | Manager: "📋 [Worker] requested [Type] for [Dates]" |
| `Approved` | Manager | Approves | Worker: "✅ Your [Type] for [Dates] was approved" |
| `Rejected` | Manager | Rejects with comment | Worker: "❌ Your [Type] declined. Reason: [comment]" |

### 4.4 Dispute Flow

```
Pending Review → Approved / Rejected / Needs Clarification
```

| Status | Who Changes | Trigger | Notification |
|:-------|:------------|:--------|:-------------|
| `Pending Review` | System | Worker submits | Manager: "⚠️ [Worker] disputes [Order]" |
| `Approved` | Manager | Approves correction | Worker: "✅ Correction approved" |
| `Rejected` | Manager | Rejects with reason | Worker: "❌ Correction declined. Reason: [comment]" |
| `Needs Clarification` | Manager | Asks for details | Worker: "💬 Manager needs more info" |

### 4.5 Subscription Status Flow

```
Free → Active (any paid plan)
Active → Cancelled (at period end)
       → Past Due (payment failed)
       → Paused (Owner requested)
Cancelled → Active (re-subscribe)
          → Data Deleted (after 90 days)
```

### 4.6 Company Creation Flow

```
Owner → Create Company → Select Industry → Select Currency → Niche Template Applied → Invite Workers
```

### 4.7 Worker Join Flow

```
Invite Link (Telegram) → Open Bot → Telegram Auth → Name Confirmation → Active in Company
```

| Step | What Happens | Notification |
|:-----|:-------------|:-------------|
| Worker taps link | Telegram opens Larko bot | — |
| Auth | Telegram ID captured automatically | — |
| Name confirmation | Worker confirms/edits display name | — |
| Joined | Worker status → Active, added to Company | Manager: "👋 [Name] joined your team" |

### 4.8 Subscription & Billing — Role Responsibilities

**Manager can via M16:** View current plan + usage meters, initiate plan upgrade, view invoice history.
**Owner can via M16:** All Manager capabilities + execute plan downgrade, cancel subscription, manage payment method.

> **Rule:** Downgrade resolution (choosing which workers/companies to deactivate) and subscription cancellation are reserved for Owners only. Manager-triggered upgrade requests may proceed automatically if the Owner's payment method is on file.

### 4.9 Downgrade Flow *(Owner only)*

```
Owner selects lower plan → System checks limits → Over-limit resources identified → Owner resolves excess
```

| Step | What Happens | Notification |
|:-----|:-------------|:-------------|
| Plan change | Owner selects lower tier in M16 | — |
| Limit check | System identifies over-limit workers/companies/managers | — |
| Owner resolves | UI forces Owner to deactivate excess workers/companies | — |
| Applied | Plan downgraded at end of current billing period | Email: "Your plan will change to [Plan] on [Date]" |

---

## 5. Communication Strategy

### 5.1 Operational Notifications (Telegram)


| Event | Recipient | Message | Timing |
|:------|:---------|:--------|:-------|
| New order created | Worker(s) | "📦 New order: [Type × Qty] — due [Deadline]" | Immediate |
| Advance issued | Worker | "💸 Advance: [Amount]. Remaining: [Y]" | Immediate |
| Order completed | Worker(s) | "✅ Order [Name] closed. Earned: [X]" | Immediate |
| Deadline tomorrow | Worker + Manager | "⏰ Due tomorrow: [Type × Qty]" | 09:00 day before |
| Overdue | Manager | "🔴 Overdue: [Type × Qty], Worker: [Name]" | 09:00 next day |
| Absence request | Manager | "📋 [Worker] requested [Type] for [Dates]" | Immediate |
| Absence decision | Worker | "✅/❌ Your [Type] approved/declined" | Immediate |
| Dispute submitted | Manager | "⚠️ [Worker] correction request for [Order]" | Immediate |
| Dispute resolved | Worker | "✅/❌ Correction approved/declined" | Immediate |
| Overtime alert | Manager | "⏰ [Worker] overtime on [Order]: [X]h" | On time log submit |
| Worker joined | Manager | "👋 [Name] joined your team" | Immediate |
| Worker part done | Manager + Lead Worker | "👷 [Worker] marked their part as done on [Order]. ([X]/[Y] workers ready)" | Immediate |
| All workers done | Manager | "🎉 All [Y] workers finished on [Order]. Ready to close?" | Immediate |
| Worker submitted log *(Lead)* | Lead Worker | "📝 [Worker] submitted today's log on [Order]: [X]h" | On time log submit |
| Absence approved + active orders | Manager | "⚠️ [Worker] has [X] active orders during absence [Dates]" | On absence approval |
| Offline sync complete | Worker | "✅ [X] pending logs synced successfully" | On reconnect |
| Offline sync failed | Worker | "⚠️ Log for [Order] on [Date] failed: [reason]" | On reconnect |
| Worker deactivated | Worker | "Your access to [Company] has been removed" | Immediate |
| Worker deactivated | Manager | "[Worker Name] has been deactivated" | Immediate |
| Ledger adjustment | Worker | "💸 Manual balance adjustment: [Amount]. Reason: [comment]" | Immediate |

### 5.2 Motivational Notifications (Telegram → Owner/Manager, Starter+)

| Event | Timing | Message |
|:------|:-------|:-------|
| Monthly value report | Last day of month | "📊 This month: [X] orders, [Y] hours tracked" |
| Weekly summary | Monday 9:00 | "📋 Last week: [X] orders, [Y] hours, [Z] workers" |
| Milestone | When reached | "🎉 100th order completed!" |
| Upgrade nudge | At 80%+ of limits | "⚠️ 14/15 workers. Need more? →" |
| Feature discovery | After 14 days | "💡 Try tracking materials per order →" |

### 5.3 Subscription Notifications (Email + Telegram)

| Event | Channel | Message |
|:------|:--------|:-------|
| Welcome | Email + TG | "Welcome to Larko!" |
| Payment received | Email | Invoice/receipt |
| Payment failed | Email + TG | "⚠️ Payment failed. Update card." |
| Subscription cancelled | Email | "Your data is safe for 90 days." |
| Post-cancel day 3 | TG | "Your data is still safe. Come back!" |
| Post-cancel day 80 | Email | "⚠️ Data deleted in 10 days." |

---

## 6. Business Rules

### Payments & Payroll

1. **Pricing Models (Constructor):**
   - **4 Core Models:** Single Unit, Time-Based (w/ Overtime logic), Composite/Combo (multiple metrics like m² + linear meter), and Fixed (per project).
   - **Company Base Currency:** The Owner explicitly selects the Base Currency (e.g., USD, EUR, PLN, UAH) during Company creation. All financial data for that company is tied to this currency. It cannot be changed after the first order is created.

2. **Rate Locking (Snapshot Rule):** Unit rate copied from catalog at order creation. Future rate changes do NOT affect existing orders.

3. **Rate History:** Every rate change recorded with timestamp and author. Never modified or deleted.

4. **Overtime Calculation:**
   - **Global (Company Level):** Thresholds (default 8h/day, 40h/week) and multiplier (1.5x/2x) are configured per company in Settings.
   - **Custom (Task Level):** Managers can override the global overtime rules inside the Order Type Constructor (e.g., setting a specific 12h shift limit for a "Night Guard" task template).
   - Overtime is shown separately in Balance and Finance Dashboard.

5. **Negative Balance Allowed:** Advance can exceed earned amount. "Remaining" can be negative.

### Time Tracking

6. **One Time Log Per Day Per Order:** After submission — read-only. Corrections via dispute workflow.

7. **Break Limit:** Maximum 5 break entries per day.

### Access Control

8. **Role Hierarchy:**
   - **Worker** — own orders, own time log, own balance, absences, disputes
   - **Manager** — all Worker + manage company operations (orders, team, rates, advances, clients, absences, disputes)
   - **Owner** — all Manager capabilities for any company + create/delete companies, assign managers, subscription/billing management *(with exclusive control over downgrade and cancellation)*, per-company advanced statistics (O2, Starter+), analytics *(Business+)*, audit trail *(Pro)*
   - **Super Admin** — platform-level access to any account. No UI in MVP.

9. **Owner-as-Manager:** If a Company has no designated Manager, the Owner automatically acts as Manager. Owner can designate any Worker as Manager. A Company can have multiple Managers, up to the total limit defined by the Company's subscription plan.

10. **Data Isolation (Multi-tenancy):** All data strictly isolated by Company. A user in Company A can never see data from Company B. There is no global cross-company data aggregation; if an Owner wants to view metrics, they must switch context to that specific Company.

### Subscription & Billing

11. **Plan Limits (Per Company):**
    *Note: Subscriptions are purchased per-company, not per-account. An Owner must purchase separate plans for each company they own.*

    | Limit | Free | Starter ($9/mo) | Business ($25/mo) | Pro ($49/mo) |
    |:------|:-----|:----------------|:------------------|:-------------|
    | Workers (total) | 5 | 15 | 50 | 100 |
    | Managers (excl. Owner) | 0 | 2 | 5 | Unlimited |
    | History retention | 7 days | 90 days | 1 year | Unlimited |
    | Clients per company | 5 | 20 | Unlimited | Unlimited |
    | Photo storage | 100 MB | 1 GB | 10 GB | 50 GB |
    | Monthly | $0 | $9 | $25 | $49 |
    | Annual (20% off) | — | $86/yr | $240/yr | $470/yr |

    When a limit is reached: "You've reached the [limit type] for your plan. Upgrade to [next plan] →"

12. **Subscription Lifecycle (Cancellation):**
    - Cancellation: exit survey → pause offer → downgrade offer → confirmation
    - Access continues until end of paid period
    - Data retained 90 days after expiry. Soft-deleted after 90 days.
    - Financial/payroll records retained 1 year (legal compliance).
    - Re-subscribe within 90 days: full data restoration, no new trial.
    - Re-subscribe after 90 days: data recovery best-effort, no trial.
    - Anti-fraud: `trial_used` flag reserved for future promotional trials (e.g., "14-day Pro trial"). Free plan is **permanent**, not a trial.
    - Anti-fraud: Rate-limit account creation to prevent multi-account free-tier abuse.
    - On downgrade: Workers above limit become "inactive" (read-only). Owner chooses who stays active. See §4.8 Downgrade Flow.

### Content & Catalog

13. **Product Type Deletion Guard:** Cannot delete if used in `New` or `In Progress` orders. Types with only `Done` orders can be archived.

14. **Niche Templates System:**
    - 6 pre-built industry templates + 1 blank ("Other"):

    | Industry | Default Products (examples) | Default Materials (examples) | Default Pay Model |
    |:---------|:------------------------|:-------------------------|:-----------------|
    | 🏭 Manufacturing | Furniture, Metal works, Textile, Assembly | Wood, Metal, Fabric, Screws, Glue | Per Unit |
    | 🔨 Construction | Foundation, Walls, Roofing, Finishing | Cement, Bricks, Sand, Rebar, Paint | Per Hour |
    | ☀️ Solar | Installation, Maintenance, Inspection | Panels, Connectors, Wiring, Brackets | Per Job |
    | 🧹 Cleaning | Regular, Deep clean, Window, Carpet | Detergent, Mops, Sponges, Gloves | Per Hour |
    | 🔧 Auto Repair | Diagnostics, Engine, Bodywork, Tires | Oil, Filters, Brake pads, Plugs | Per Job |
    | 🚚 Delivery | Local, Express, Scheduled, Return | Fuel, Packaging, Labels | Per Delivery |
    | ⚙️ Other | *(blank — Owner sets up manually)* | *(blank)* | Per Hour |

    - Templates are strictly pre-filled data (catalogs) to speed up onboarding.
    - Templates are **starting points** — Manager can add, remove, rename all types after creation.
    - DriveCode (Super Admin) maintains global template library.
    - Changing Industry Type resets template (with confirmation). Does NOT delete existing orders/data.

15. **Generic Terminology (Universal Strategy):** Regardless of the chosen industry template, the system uses a strictly unified UX terminology to reduce cognitive load and simplify frontend translations:
    - **"Order" (Замовлення)** — applies to projects, shifts, runs, service calls.
    - **"Product" (Виріб/Робота)** — applies to tasks, route types, construction stages.
    - **"Unit" (Одиниця)** — applies to hours, items, pieces, properties.

16. **Material Type Deletion Guard:** Soft-deleted — hidden from new entries, preserved in records.

### Photos

17. **Photo Upload Rules:** Max 3 per order per day per worker. Max 10 MB per photo. Thumbnails auto-generated. Visible to all users with order access. **Photos cannot be uploaded to orders with status Done.**

18. *(Reserved — Comments feature removed from MVP scope)*

### Time Display

19. **Time Display & Night Shifts:** Organization's local timezone (determined by country at onboarding). "One time log per day" is evaluated as one continuous shift. A shift can cross midnight (e.g., `Work Start` 22:00, `Work End` 06:00). In this case, the `Work End` explicitly represents the following calendar day. The system logically assigns the shift to the calendar date of the `Work Start`.

### Worker Groups (Business+)

21. **Worker Groups:** Manager can create named groups to organize workers within a company (e.g., "Team A", "Night Shift", "Electricians"). Groups are for organizational purposes — filtering orders, viewing dashboard by group. Workers can belong to multiple groups.

### Data Export (Business+)

22. **Export Rules:** Finance dashboard data can be exported as CSV or Excel. Exports include: worker hours, overtime, earnings, advances, materials. Filtered by date range. One export at a time (no scheduled exports in MVP).

### Audit Trail (Pro)

23. **Audit Trail:** All mutations logged: rate changes, order edits, role changes, status changes, dispute resolutions. Includes: who, when, old value, new value. Retained for the life of the account. Read-only — cannot be edited or deleted.

### API Access (Pro)

24. **API Access:** Owners on Pro plan get an API key for programmatic access to their data. Read-only in MVP (orders, time logs, workers, financials). Rate limited. Key can be regenerated (old key immediately invalidated).

### Auth & Account

25. **Auth Methods:**
    - Three sign-in options: Email/Password, Google, Apple.
    - User can link multiple auth methods to one account (e.g., sign up with Google, later add password).
    - If same email exists across methods — accounts are auto-linked (single account, multiple sign-in options).
    - At least one auth method must remain active (cannot unlink the last method).
    - Password requirements: minimum 8 characters.

26. **Worker Lifecycle (Deactivation):**
    - Manager or Owner can deactivate a Worker.
    - Deactivating a worker automatically **unassigns** them from all their `In Progress`, `In Review`, or `New` orders. If an order becomes empty as a result, it reverts to `New` (Unassigned) and warns the Manager.
    - Deactivated worker **loses access** to the Telegram Mini App for this Company entirely. They cannot view old orders or file disputes via the app. (Any outstanding issues must be resolved completely outside the app).
    - All historical data (time logs, orders, earnings, materials) is **preserved**.
    - Deactivated worker can be **re-activated** by Owner/Manager — regains access with full history.
    - If Worker belongs to multiple companies, deactivation is per-company only.
    - Notification sent to Worker: "Your access to [Company] has been removed."

### Company Lifecycle

27. **Company Deletion:**
    - Only Owner can delete a Company.
    - Requires confirmation: "Delete [Company Name]? This will remove all orders, time logs, and worker associations. Type company name to confirm."
    - All Workers in that Company are removed (notified: "[Company] has been closed").
    - All orders, time logs, materials, clients data **permanently deleted** after 30-day grace period.
    - During grace period: Company shows as "Scheduled for deletion" — Owner can cancel.
    - Financial/payroll records retained 1 year (legal compliance), then deleted.
    - Does NOT affect other Companies under the same Account.

28. **Account Deletion (GDPR):**
    - Owner can delete their entire account from Account Settings.
    - Requires re-authentication + typing "DELETE" as confirmation.
    - All Companies under this account are deleted (same cascade as Rule #27).
    - Subscription cancelled immediately (no refund for remaining period).
    - Data permanently deleted within 30 days.
    - Financial/payroll records retained 1 year (legal compliance).
    - Email address freed for re-registration after deletion.

### Localization

29. **Language (i18n):**
    - MVP supports two languages: Ukrainian 🇺🇦 and English 🇬🇧.
    - Default language: detected from browser/Telegram locale.
    - User can override in Settings. Stored per account.
    - Applies to all interfaces (Telegram Mini App + Web Panel).
    - Notification messages sent in user's selected language.
    - Telegram as notification center: all operational, motivational, and subscription notifications are delivered via Telegram chat — no separate in-app notification inbox in MVP (Telegram chat history serves this purpose).

### Orders (Clarification)

30. **Order Reassignment:** Manager can change assigned workers on an existing order via Edit Order. Existing time logs from previously assigned workers are **preserved** — they remain as historical records. Unassigned workers retain a read-only historical view of the order in their "My Balance" tab specifically to allow them to file a Dispute if they were underpaid for the hours they did log. Newly assigned workers see the order from the reassignment date forward. **At least one worker must remain assigned at all times.** To remove the last worker, Manager must reassign to another worker first.

### Multi-Worker Orders

31. **Multi-Worker Payroll Split:**
    - **Per-hour:** Each worker is paid for their **own** logged hours × their personal rate. No splitting needed — each worker's time log is independent.
    - **Per-unit:** Each worker enters `units_completed` in their daily Time Log. Payroll = worker's units × unit rate. Validation: system warns (but does not block) if total units across all workers exceed order quantity.
    - **Per-job:** Manager specifies participation percentage for each worker at order closure via Payment Split modal (default: equal split). The modal MUST list *all* workers who ever logged time or were assigned historically, not just currently active assignees. Total must equal 100%. For single-worker Per-Job orders: 100% auto-applied, no modal shown.
    - Workers on the same order may have **different rates** if their personal rate differs.

32. **Lead Worker (optional):**
    - Manager can designate one assigned worker as **Lead** (⭐ badge) when creating or editing an order.
    - Lead Worker additional permissions *(within this order only)*:
      - Can view time logs of all workers on this order
      - Can change order status to `Done` (normally Manager-only)
      - Receives notifications when other workers submit their daily log or mark their part as done
    - If no Lead is designated — behavior unchanged (Manager controls everything).
    - Lead does NOT have Manager-level permissions (no rate editing, no advances, no team management).
    - **If Lead Worker is removed from order** (via reassignment, Rule #30): `lead_worker` field is automatically cleared. Manager must designate a new Lead or leave empty.

33. **Material Accountability:**
    - Every material entry is linked to the worker who added it (`added_by` field — already in schema).
    - Manager view shows materials grouped or filterable by worker to identify and resolve duplicates.
    - Manager can edit or delete any material entry. Workers can only edit their own entries (before order is Done).
    - **Crucial:** Material costs do NOT affect the Worker's personal payroll balance. They are strictly tracked as business expenses for the Company.

34. **Material Cost Snapshot:** When a worker adds a material to an order, the `unit_cost` is copied from the catalog and **locked to that entry**. Future catalog price changes do NOT affect existing material records (same principle as Rate Locking, Rule #2).

35. **Post-Done Locking & Adjustments:** After an order status is changed to `Done`:

### Data Traceability

36. **Logical Data Parity:** Any specialized data collected from a user (e.g., *Notes* in Create Order, *Reasons* in Absence Requests, *Description* in Disputes, *Lead Worker* assignments) MUST be visibly mapped to the corresponding review and details screens for all relevant roles. Data entered in a form must never be "hidden" from the UI downstream.
    - Time logs — read-only (already enforced by Rule #6)
    - Materials — read-only (no add/edit/delete)
    - Photos — read-only (no new uploads, Rule #17)
    - **Corrections:** Since "Done" is final, if a payroll error is discovered (e.g., wrong percentage split), the Owner can issue a manual "Ledger Adjustment" (+/- amount) directly to the worker's balance to fix it, leaving the original "Done" order locked to preserve the audit trail.
    - Status — cannot revert (Done is final)
    - Comments — **can still be added** by Manager (for post-completion notes)
    - Order details (name, notes) — Manager can edit for record-keeping

---

## 7. KPIs & Success Metrics *(detailed)*

### Product Metrics

| KPI | How Measured | Goal (30 days) | Goal (90 days) |
|:----|:-------------|:---------------|:---------------|
| Registered Accounts | Count in system | ≥ 10 | ≥ 50 |
| Active Companies | ≥ 3 orders/week | ≥ 5 | ≥ 25 |
| Paid Subscribers (any tier) | Count | ≥ 4 | ≥ 15 |
| Free-to-Paid Conversion | Paid / Total | ≥ 15% | ≥ 20% |
| MRR | Sum of subscriptions | ≥ $36 | ≥ $200 |
| Worker Adoption Rate | Workers ≥3 logs/week per active company | ≥ 70% | ≥ 85% |
| Daily Active Workers | Workers who logged today | ≥ 20 | ≥ 100 |
| Time Log Coverage | % working days with logs | ≥ 60% | ≥ 80% |
| Order Completion Rate | Done / (Total − New) | ≥ 70% | ≥ 85% |
| Multi-company Owners | Owners with 2+ companies | ≥ 2 | ≥ 10 |

### Business Impact Metrics

| KPI | How Measured | Goal (30 days) | Goal (90 days) |
|:----|:-------------|:---------------|:---------------|
| Admin Time Saved | Survey | −40% | −70% |
| Payroll Accuracy | Disputes per 100 orders | < 5% | < 2% |
| Churn Rate | Inactive >30 days / Total | < 20% | < 15% |
| NPS | In-app survey (Owner) | ≥ 30 | ≥ 50 |
| International Sign-ups | % outside Ukraine | ≥ 10% | ≥ 20% |
| ARPU | MRR / Paid subscribers | ≥ $9 | ≥ $15 |

---

## 8. Clarifying Questions for IT


2. **Multi-company data isolation:** With one Owner accessing multiple companies, how should data isolation be enforced — at query level or at a deeper layer?

3. **Niche template management:** Should templates be stored as system configuration (seeded at deploy) or as editable records that Super Admin manages via database?

4. **Real-time updates:** Should order status changes and notifications use real-time (push/websocket) or pull-on-refresh for MVP?

5. **Photo compression:** Auto-compress before upload? How to handle HEIC from iPhones?

6. **Invite link expiration:** Should company invite links expire? Permanent with revoke option?

7. **API rate limits (Pro):** What rate limits for the read-only API? Per minute? Per day?

8. **Export file size:** For large companies (50+ workers, 1 year history), what's the maximum export file size before we need pagination or async generation?

9. **Audit trail storage:** For Pro plans with unlimited history, what's the projected storage growth? Should old audit entries be archived?

---

## 9. Out of Scope *(for this BRD)*

- 📍 **GPS / Geofencing clock-in**
- 📱 **Native Mobile App** (iOS/Android)
- 🔔 **SMS Notifications**
- 🏷 **QR Code Clock-in**
- 🔄 **Recurring Tasks / Order Templates**
- 🏅 **Penalty / Bonus System**
- 🛠 **Super Admin Panel** (DriveCode internal — manual DB access in MVP)
- 📸 **Before/After Photo Comparison**
- 📦 **Advanced Inventory Management** — stock levels, reorder points
- 🧾 **Advanced Client Management** — invoicing, B2B portal
- 🔐 **SSO / SAML**
- 🏷 **White-label Branding**
- 🤖 **AI-powered Features** — shift optimization, demand prediction
- 🇷🇺 **Russian Language**
- 🌍 **PPP / Regional Pricing** — purchasing power parity adjustments
- 📊 **Scheduled Reports** — auto-generated weekly/monthly email reports
- 📱 **Mobile push notifications** — outside Telegram
- 🔄 **Write API** — Pro API is read-only in MVP
- 👥 **Multiple Roles** — A user holding different roles across different companies (e.g., Owner in Company A, Worker in Company B) is **supported**.
- 🚪 **Worker Self-Removal** — voluntary "Leave Company" action by Worker (currently only Manager/Owner can deactivate)
- ⏰ **Cross-order hours validation** — warning if total daily hours across all orders exceed 24h

---

## 10. Handoff Checklist
- [ ] Approved by CEO
- [x] All 10 BRD sections completed
- [ ] Synced to Supabase Storage
- [x] Jira Epic: [DC-38](https://drivecodeteam.atlassian.net/browse/DC-38)
- [ ] Jira Stories created from BRD features
- [ ] IT Lead confirmed receipt

---
*Document generated from template `04_brd_mvp_template.md` | Brain OS v6.0*
*Source: `01_Idea_Larko.md` v2.3.0 (internal product, 18.03.2026)*
*Brain OS delivers BRD. IT Department writes TS and implements independently.*

---

## 11. UI Microcopy (Web Panel MVP)

> This section provides the exact text copies for the Web Panel/Admin interface.

### 11.1 Global Navigation & Layout
* **Logo:** Larko Admin
* **Company Switcher (Top Left):** Dropdown allowing users to switch active context. Owner sees `[+ Create New Company]` here.
* **Sidebar Menu Items:** Dashboard, Analytics (KPIs), Audit Trail [PRO], Billing, Developer API [PRO], Settings.
* **User Dropdown (Top Right):** My Profile, Switch Themes (Dark/Light), Sign Out.

### 11.2 Dashboard (Company Overview)
* **Page Title:** Company Dashboard
* **Subtitle:** Operating metrics for [Company Name]
* **Stat Cards:**
  * Total Workers: Number
  * Active Orders: Number
* **Alerts Section Title:** Action Required
  * [Yellow Badge] Pending absence requests
  * [Red Badge] Overdue orders

### 11.3 KPI Analytics Dashboard
* **Page Title:** Performance Analytics
* **Date Picker Default:** "Last 30 Days"
* **Filters:** Select Worker Group
* **Chart 1: Worker Performance**
  * Title: Hours Logged
  * Legend: Regular Hours, Overtime
* **Chart 2: Financial Trends**
  * Title: Cost Breakdown
  * Legend: Labor Costs, Material Costs
* **Button:** Export Report (CSV / Excel)

### 11.4 Audit Trail (Pro)
* **Page Title:** Security Audit Trail
* **Subtitle:** Track every change made across your organizations.
* **Table Columns:** Date & Time, Actor, Action Type, Entity, Details.
* **Empty State:** No audit logs found for the selected period.

### 11.5 Billing & Subscription
* **Page Title:** Billing & Plans
* **Current Plan Section:**
  * Title: Current Plan
  * Badge: [Starter / Business / Pro]
  * Usage Summary: "You are using [X] of [L] worker seats."
  * **Button:** Change Plan
  * **Button:** Cancel Subscription
* **Invoices Section:**
  * Title: Payment History
  * Columns: Date, Amount, Status (Paid/Failed), Invoice (Download PDF)
  * Empty State: No previous invoices available.

### 11.6 API Management (Pro)
* **Page Title:** Developer API
* **Subtitle:** Manage API keys for external integrations.
* **API Key Box:**
  * Label: Primary Sandbox Key
  * Value: `sk_live_*******************` [Copy Icon]
  * **Warning Text:** Keep this key secret. Do not expose it in client-side code.
* **Button:** Regenerate Key -> Confirmation Modal: "Are you sure? Old integrations will immediately break."

### 11.7 Account Settings
* **Page Title:** Personal Profile
* **Section: General Info**
  * Field: Full Name, Email Address. Button: Save Changes.
* **Section: Connected Accounts**
  * Google: "Connected" -> Button: Unlink Google
  * Apple: "Not Connected" -> Button: Link Apple
* **Section: Danger Zone**
  * Title: Delete Account
  * Text: Permanently delete your account and all associated company data. This action cannot be undone.
  * Button: Delete Account
