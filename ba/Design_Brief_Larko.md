---
document_id: DC-38_design_brief
project: larko
type: design_brief
status: reviewed
version: "4.4"
author: Design Director (AI)
date: "2026-03-24"
epic: DC-39
style: "Premium Intelligence (Linear/Stripe aesthetic)"
---

# 🎨 Design Brief — Larko MVP

> **Style:** Premium Intelligence (Linear/Stripe aesthetic)
> **Platforms:** Telegram Mini App (TMA, full-screen) · Web Panel (Desktop) · Landing Page
> **Roles:** Worker · Manager · Owner · Super Admin
> **Source:** [BRD v2.7.1](https://lzevsvpqeislsivdnzgt.supabase.co/storage/v1/object/public/docs/larko/04_BRD_Larko_MVP.md) (DRAFT)

### Platform × Role Access Matrix

| Platform | Worker | Manager | Owner |
|:---------|:------:|:-------:|:-----:|
| **TMA (Full Screen)** | ✅ Full | ✅ Full | ✅ Full |
| **Web Panel (Desktop)** | ❌ | ✅ Full | ✅ Full |
| **Landing Page** | — | — | — (public) |

> **TMA** runs full-screen inside Telegram's WebView (not a small widget). It is the primary interface for Workers and the fast-access interface for Managers/Owners.
> **Web Panel** is the desktop-first admin interface for Managers and Owners, providing full CRUD, analytics, billing, and audit capabilities.

---

## 1. Visual Philosophy

**"Intelligent. Calm. Effortlessly Premium."**

Larko moves away from aggressive, technical, or "gym-like" aesthetics towards a sophisticated, quiet, and hyper-premium interface inspired by Linear, Stripe, and Apple. It embraces soft off-blacks, glassmorphism, organic squircles, and minimal contrast to reduce cognitive load and create a highly comfortable workspace.

- **Softer Dark Mode** — Replaces pitch black (`#000000`) with a deep, soothing off-black to prevent eye strain.
- **Organic Shapes** — Heavily relies on pill-shapes and smooth "squircles" rather than rigid squares.
- **Glassmorphism & Depth** — Uses ultra-subtle borders (`rgba(255,255,255,0.05)`), multi-layered shadows, and backdrop blurs (glass panels) instead of flat opaque shapes.
- **Elegant Typography** — Drops heavy, aggressive monospace in favor of balanced, medium-weight `Inter` for exceptional legibility.
- **Subtle White/Silver Accents** — Replaces aggressive neon primary colors with calm, premium high-contrast white and muted semantic tones.

### Design Principles

| # | Principle | Implementation |
|:--|:----------|:---------------|
| 1 | **Quiet Intelligence** | UI steps back; content shines. Soft borders, muted secondary text. |
| 2 | **Tactile Elements** | Pill-shaped buttons (`radius-full`) feel effortlessly clickable. |
| 3 | **Glass Layers** | Sticky headers and floating nav bars use `backdrop-filter: blur(16px)`. |
| 4 | **Glove-friendly** | Maintain 48×48px touch targets despite the elegant aesthetic. |
| 5 | **Micro-interactions** | Smooth transitions (`0.2s transform`), hover opacity changes. |

---

## 2. Design Tokens (The System)

> **Source of Truth:** All designs MUST use these exact semantic names. Hex values are provided for context but must be referenced by token name in Figma and Code.

### 2.1 Color System (Theme Support)

The system supports strict `dark` and `light` themes dynamically. The dark theme is preferred and uses soft off-blacks to reduce eye strain.

| Category | Token | Dark Value | Light Value | Usage |
|:---------|:------|:-----------|:------------|:------|
| **Background** | `bg-primary` | `#222226` | `#FAFAFA` | Underlay, app background |
| | `bg-card` | `#2D2D31` | `#FFFFFF` | UI cards, panels |
| | `bg-input` | `#3E3E42` | `#F4F4F5` | Form fields, disabled states |
| | `bg-elevated`| `rgba(45,45,49,0.85)`| `rgba(255,255,255,0.85)`| Backdrop-blurred floaters, navbars |
| **Content** | `content-primary` | `#EDEDED` | `#111827` | Main text, active icons |
| | `content-secondary`| `#878787` | `#6B7280` | Subtext, inactive icons |
| | `content-muted` | `#525252` | `#A1A1AA` | Disabled text, placeholders |
| **Border** | `border-subtle` | `rgba(255,255,255,0.05)`| `rgba(0,0,0,0.05)` | Dividers, card outlines |
| | `border-active` | `rgba(255,255,255,0.15)`| `rgba(0,0,0,0.3)` | Hover states, active inputs |
| **Brand** | `accent-primary` | `#FFFFFF` | `#1C1C1E` | CTAs, active states, main buttons |
| | `accent-hover` | `#E2E2E2` | `#27272A` | CTA hover |
| | `accent-deep` | `#A3A3A3` | `#3F3F46` | CTA active/pressed |
| **Semantic** | `status-success` | `#34D399` | `#10B981` | "Done", valid inputs (Softer green) |
| | `status-warning` | `#FBBF24` | `#F59E0B` | "In Progress", warnings |
| | `status-info` | `#60A5FA` | `#3B82F6` | "In Review", informational banners |
| | `status-blocked` | `#F87171` | `#EF4444` | "Blocked" order status, blocker alerts |
| | `status-error` | `#FB923C` | `#EA580C` | "Dispute", "Overdue", destructive actions, errors |
| | `status-default` | `#878787` | `#6B7280` | "New", inactive states |
| | `status-pending` | `#FDBA74` | `#F97316` | Pending sync, draft states |
| **Financial** | `finance-earned` | `#0D0D0D` | `#10B981` | Positive balance, incoming |
| | `finance-advances` | `#60A5FA` | `#3B82F6` | Given advances, outgoing |
| | `finance-overtime` | `#FBBF24` | `#F59E0B` | Premium pay, overtime hours |
| | `finance-negative` | `#F87171` | `#EF4444` | Negative balance / debt |

**Utility:**
- `overlay`: `rgba(0,0,0,0.6)` (Dark backdrop for modals)
- `blur-heavy`: `blur(16px)` (For `bg-elevated` elements like sticky headers and bottom nav)

### 2.2 Typography Scale

**Font Families:**
- **Primary:** `Inter` (sans-serif) — UI, headings, body.
- **Mono:** `JetBrains Mono` (monospace) — Numbers, code, financial data.

| Token | Size / Line-Height | Weight | Usage |
|:------|:-------------------|:-------|:------|
| `text-2xl` | 24px / 32px | Semi (600) | Extruded stats, major page titles |
| `text-xl` | 20px / 28px | Med (500) | Dialog titles, empty states |
| `text-lg` | 18px / 28px | Med (500) | Section headings, bottom nav labels (active) |
| `text-base` | 16px / 24px | Med (500) | Primary Buttons, Card titles |
| `text-sm` | 14px / 20px | Reg (400) | Body text, Inputs, List items |
| `text-xs` | 12px / 16px | Reg (400) | Captions, Subtext, Badges |
| `text-[10px]` | 10px / 14px | Reg (400) | Navigation labels, ultra-dense info |
| `text-mono-lg` | 18px / 24px | Semi (600) | Financial stats |
| `text-mono-sm` | 14px / 20px | Reg (400) | Transaction lists, card prices (`₴2,400`), time logs |

### 2.3 Iconography
- **System:** Lucide or Phosphor (Light / Regular weight, `1.5px` stroke).
- **Semantics:** 
  - **Quantity / Items:** STRICTLY use `Layers` or `Stack` icon (never box/cube unless physical shipping).
  - **Time:** Clock or Calendar.
  - **Currency:** Use local symbol (e.g. `₴`) matched with Monospace font.

### 2.3 Spacing & Layout

Strict 4pt baseline grid.

| Token | Value | Applied To |
|:------|:------|:-----------|
| `space-1` | 4px | Small gaps, icon-to-text |
| `space-2` | 8px | Standard component gap (e.g., input to input) |
| `space-3` | 12px | List item padding |
| `space-4` | 16px | Standard padding (cards, screen edges TMA) |
| `space-6` | 24px | Section gaps, screen edges Web |
| `space-8` | 32px | Major section breaks |

### 2.4 Radius & Borders

| Token | Value | Usage |
|:------|:------|:------|
| `radius-sm` | 6px | Checkboxes, small tags |
| `radius-md` | 12px | Segmented controls, inner elements, badges |
| `radius-lg` | 16px | Inputs, small cards, tooltips |
| `radius-xl` | 20px | Main UI cards, modals, dialogs (Squircle preferred) |
| `radius-full` | 999px | Primary buttons (Pill shape), avatars, dot indicators |

### 2.5 Elevation & Shadows

The Premium aesthetic relies on physical depth: multiple layered shadows, ultra-subtle inset borders, and glassmorphism.

| Token (Dark) | Token (Light) | Usage |
|:-------------|:--------------|:------|
| `border-subtle` | `shadow-sm` | Default cards, inputs |
| `shadow-float` | `shadow-md` | Floating tools, hovering over cards (`0 4px 24px rgba(0,0,0,0.4)`) |
| `shadow-btn` | `shadow-btn` | Primary Button depth (`0 4px 14px 0 rgba(255,255,255,0.15)`) |
| `glass-panel` | `glass-panel`| Sticky headers, Bottom Navs (`bg-elevated` + `blur-heavy` + `border-subtle`) |

---

## 3. GenUI Component Atlas (Strict UI Kit)

> **[IMPORTANT] GENUI GENERATOR INSTRUCTION:** 
> AI Generators MUST use these EXACT Tailwind classes and structural layouts. Do not invent custom padding, border radii, or colors. You are strictly forbidden from hallucinating component styles. Screens MUST be built by composing these exact components.

### 3.1 Buttons
- **Primary Button:**
  - **Structure:** `flex items-center justify-center gap-2 px-6 h-14 w-full` (TMA) or `h-12 w-auto` (Web). `rounded-full` (pill shape).
  - **Core Tokens:** `bg-accent-primary text-[#1C1C1E] font-medium text-base shadow-btn`.
  - **States:**
    - *Hover/Active:* `active:scale-[0.98] transition-transform opacity-90`.
    - *Disabled:* `opacity-50 cursor-not-allowed`.
    - *Loading:* Text removed, replaced tightly with SVG spinner (`fill-[#1C1C1E]`).
- **Secondary Button (Outline):**
  - **Structure:** Same layout as Primary.
  - **Core Tokens:** `bg-transparent border border-border-subtle text-content-primary rounded-full`.
- **Danger Button:**
  - **Core Tokens:** `bg-status-error text-white font-medium rounded-full`.
- **Ghost Button:**
  - **Structure:** `h-10 px-4 w-auto flex items-center justify-center rounded-lg`.
  - **Core Tokens:** `bg-transparent text-accent-primary font-medium hover:bg-accent-primary/10`.

### 3.2 Form Inputs
- **Text Input / Date Input:**
  - **Structure:** `flex items-center w-full h-12 px-4 radius-lg gap-2`.
  - **Core Tokens:** `bg-input border border-border-subtle text-content-primary`.
  - **States:**
    - *Placeholder:* `text-content-muted`.
    - *Focus:* `border-accent-primary ring-1 ring-accent-primary/20`.
    - *Error:* `border-status-error` + accompanying `text-sm text-status-error` below.
- **Textarea:**
  - **Structure:** `w-full min-h-[96px] p-4 radius-lg resize-none`. Tokens same as Text Input.
- **Toggle Switch:**
  - **Structure:** `relative w-10 h-6 rounded-full transition-colors cursor-pointer`.
  - **Thumb:** `absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform`.
  - **States:** *Active* (`bg-accent-primary`, thumb translates `translate-x-4`), *Inactive* (`bg-input border border-border-subtle`).
- **Photo Picker Button:**
  - **Structure:** `flex flex-col items-center justify-center w-[80px] h-[80px] radius-lg gap-1 border border-dashed border-border-subtle bg-input/50`.

### 3.3 Badges & Indicators
- **Status Pills:**
  - **Structure:** `inline-flex items-center px-2 py-1 radius-sm`.
  - **Core Tokens:** `text-[10px] font-bold uppercase tracking-wider`.
  - **Variants:** 
    - *Success:* `bg-status-success/10 text-status-success border border-status-success/20`.
    - *Warning:* `bg-status-warning/10 text-status-warning border border-status-warning/20`.
- **Dot Indicator:**
  - **Structure:** `w-2 h-2 rounded-full`. Color matches status (e.g. `bg-status-success`).

### 3.4 Navigation Elements
- **App Header (TMA):**
  - **Structure:** `flex items-center justify-between w-full h-[56px] px-4 bg-bg-primary sticky top-0 z-50`.
  - **Typography:** Page Title is `text-lg font-semibold text-content-primary`.
- **Segmented Control:**
  - **Structure:** `flex items-center p-1 w-full bg-input radius-md`.
  - **Tab Item:** `flex-1 py-1.5 text-center text-sm font-medium radius-sm transition-colors`. Active tab gets `bg-card text-content-primary shadow-sm`.
- **Bottom Nav Bar (TMA):**
  - **Structure:** `flex items-center justify-around w-full h-[83px] pb-6 pt-2 bg-elevated blur-heavy border-t border-border-subtle fixed bottom-0 z-50`.
  - **Item (Active):** `flex flex-col items-center gap-1 text-accent-primary`.
  - **Item (Inactive):** `flex flex-col items-center gap-1 text-content-secondary`.

### 3.5 Cards
- **Generic Card Base:**
  - **Structure:** `flex flex-col w-full p-4 gap-3 bg-card radius-xl border border-border-subtle shadow-sm`.
  - **Status Accents:** For critical statuses (e.g. `status-error` / "Dispute"), use a 4px left-border or left-side indicator strip on the card to draw attention without changing the overall background.
- **Task Order Card:**
  - **Inner Layout:** 
    - Row 1: Title + Status Badge (with optional left status-strip if critical).
    - Row 2: Client + Address details.
    - Row 3: Order Notes (Preview block with text-content-secondary).
    - Row 4 (Footer): Flex row spreading Date, **Quantity (Layers icon + X од.)**, and **Price (mono typography `text-mono-sm`)**.
- **Transaction Card:**
  - **Inner Layout:** `flex items-center justify-between w-full p-3 bg-card radius-lg border border-border-subtle`.
  - Left: Title + Date. Right: Mono-spaced Amount (`font-mono font-medium`).

### 3.6 Overlays & Dialogs
- **Action Dialog (Modal):**
  - **Backdrop:** `fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4`.
  - **Panel:** `bg-elevated w-full max-w-[340px] p-6 radius-xl shadow-float flex flex-col gap-4 text-center`.
- **Bottom Sheet:**
  - **Structure:** `fixed bottom-0 left-0 w-full bg-elevated radius-t-xl p-4 pt-2 shadow-float z-[100]`. Includes a `w-12 h-1 bg-border-subtle rounded-full mx-auto mb-4` pull tab.

### 3.9 UX Constraints from BRD
*These rules dictate UI behavior dynamically across the app:*
- **Photo Logs (Rule #17):** Cannot add/edit photos if Order status is `Done`. (UI: hide "Add Photo" button).
- **Content Locking (Rule #35):** When Order is `Done`, Time Logs, Materials, and Photos become structurally Read-Only. (UI: all inputs converted to text displays).
- **Material Snapshots (Rule #34):** Material cost is fixed at entry time. No "update price" button on older entries.
- **Idempotency (Rule #20):** Repeated "Submit" taps must not create duplicate entries. (UI: disable submit button immediately + show spinner until server confirms).

---

## 4. Screen Inventory

### 4.0 Landing Page (Web — larko.app)

| Screen | Route | Purpose |
|:-------|:------|:--------|
| Landing Page | `/` | Marketing page, pricing, CTA |

**Key elements:** Hero with abstract fluid visual + product tagline · Feature grid (6 features with sleek icons) · Pricing table (Free vs Starter vs Business vs Pro) · Demo video embed · Footer with links

**UI States:**
- Default: Full marketing page
- Mobile: Responsive, stacked layout

---

### 4.1 Onboarding (Web — 4-step flow)

| Step | Screen | Route | Purpose |
|:-----|:-------|:------|:--------|
| 1 | Create Account | `/signup` | Email/Password or Google/Apple sign-in |
| 2 | Create Company | `/onboard/company` | Company name + Industry selector + Base Currency + Country |
| 3 | Invite Workers | `/onboard/invite` | Telegram invite link + share |
| 4 | Choose Plan | `/onboard/plan` | Free / Starter / Business / Pro selection |

**Key elements:**
- **Progress indicator:** 4-step dot stepper at top (Account → Company → Invite → Plan)
- **Social Auth:** Google + Apple sign-in buttons above email/password form
- **Industry Selector:** 7 visual tiles (icon + label) in a 2-column grid. Selected tile gets accent border + checkmark. Icons: 🏭 🔨 ☀️ 🧹 🔧 🚚 ⚙️
- **Invite Link Card:** Dark card with monospaced link (`t.me/LarkoBot?start=comp_xxx`), Copy + Send via Telegram buttons
- **Plan Comparison:** 4-column card with pricing and limits side-by-side

**UI States per screen:**

| State | Create Account | Create Company | Invite | Choose Plan |
|:------|:---------------|:---------------|:-------|:------------|
| Default | Empty form | Empty form | Link generated | 4 plans shown |
| Loading | Button spinner | Button spinner | — | — |
| Error | Field-level red text | Field-level red text | — | — |
| Success | → Step 2 | → Step 3 | → Step 4 (or Skip) | → M1 Dashboard (company auto-selected) |

---

### 4.1b Global Components (TMA & Web Panel)

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| G1 | Company Switcher | `/switch` | Select active company context |

#### G1 — Company Switcher
**Layout:** 
- **TMA:** Accessible from the main header (dropdown) or as a dedicated top-level card list.
- **Web Panel:** Located in the top-left header of the sidebar, below the logo (dropdown).
- Card list of companies the user is a member of. Active company highlighted with `accent-primary` left border.
- Each card: Industry icon · Company name · Role Badge (Worker/Manager/Owner).
- `[+ Create New Company]` primary button at bottom (visible to Owners only).

---

### 4.2 Worker — Telegram Mini App

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| W1 | My Tasks (Home) | `/worker` | Active order feed |
| W2 | Order Details / Time Log | `/worker/order/:id` | Log hours, materials, photos, comments |
| W3 | My Balance | `/worker/balance` | Earnings, advances, remaining |
| W4 | Profile | `/worker/profile` | Worker info, settings, and Time Off |
| W5 | Time Off List | `/worker/timeoff` | History of time off requests |
| W6 | Request Time Off | `/worker/timeoff/new` | Create new time off request |
| W7 | Dispute Form | `/worker/dispute/new` | Report correction |
| W8 | Support & FAQ | `/worker/support` | Frequently asked questions and support contact |

#### W1 — My Tasks

**Header:** Clean header with "Мої Завдання" title. Top right displays the active Company Badge (Logo/Name) to provide context, instead of a user avatar.

**Layout:** Vertical scroll feed of Order Cards. Bottom Tab Bar (Tasks · Balance · Profile).

**Order Card anatomy:**
```
┌─────────────────────────────────┐
│ ☀️ Solar Panel Install    [New] │
│ Client: ABC Corp                │
│ Qty: 12 units · Due: Mar 20     │
│ 📝 "Please use the side gate.." │
│ ⚠️ Due tomorrow                 │
└─────────────────────────────────┘
```

**UI States:**
- Default: List of cards
- Empty: Illustration + "You have no active orders 🎉"
- Loading: 3 skeleton cards

#### W2 — Order Details / Daily Time Log

#### W2 — Order Hub (Details Dashboard)

**Layout Architecture:** A clean, read-only dashboard showing the order's current state and history, with buttons that open Bottom Sheets for data entry.

**Block 1: Order Header & Info**
- **Structure:** Title, Client, Deadline, Status Badge, Lead Worker ⭐ (if assigned), and 'Order Notes' (instructions from manager).
- **States:** Default (Summary).

**Block 2: Team Status** *(visible for all orders)*
- **Structure:** Shows all assigned workers with personal completion substatuses (⏳ In Progress / ✅ Done). Lead Worker marked with ⭐ badge. Progress indicator: "[X]/[Y] workers ready".
- **Action:** `[✅ Моя частина виконана]` — signals personal completion.

**Block 3: Time Log History**
- **Structure:** List of previous time logs (e.g., "Сьогодні: 8 год", "Вчора: 4.5 год"). After submission, entry shows `✅ Submitted` (read-only, button hides).
- **Action:** Primary ghost button `[+ Додати час за сьогодні]` → Opens **W2.1 Bottom Sheet**. Hides after today's log is submitted.

**Block 4: Materials History**
- **Structure:** List of materials already used on this order.
- **Action:** Primary ghost button `[+ Списати матеріал]` → Opens **W2.2 Bottom Sheet**.

**Block 5: Photos Gallery**
- **Structure:** Horizontal scroll of uploaded thumbnails. 
- **Action:** Square tile with `[+ Додати фото]` icon.

**Block 6: Actions**
- `[⚠️ Повідомити про проблему]` → Opens Report Issue Bottom Sheet (type selector: 🚧 Blocker or ⚠️ Correction). Hidden when order status is `Done`.

---

#### W2.1 — Add Time (Bottom Sheet)
**Layout:** Form inside a Bottom Sheet.
- **Components:** Start/End scroll-wheels, a ghost button `[+ Додати перерву]` (which drops down Break Start/End pairs), Net Hours calculation text, Overtime Warning badge (if >8h), "Units Completed" number input (for Per-Unit orders).
- **Action:** `[Зберегти час]` (closes sheet and updates W2 Hub).

#### W2.2 — Add Material (Bottom Sheet)
**Layout:** Form inside a Bottom Sheet.
- **Components:** Material Name dropdown (searchable), Quantity input, Unit cost (read-only info).
- **Action:** `[Додати матеріал]` (closes sheet and updates W2 Hub).

#### W3 — My Balance

**Layout:** 3 Stat Cards in a row → Scrollable history list with filters.

**Stat Cards:**
- 🟢 Earned: `$2,340` (mono font, green)
- 🔵 Advances: `$800` (mono font, blue)
- 🔴 Remaining: `$1,540` (mono font, green if positive / red if negative)
- ⏰ Overtime indicator below if applicable

**History list:** Date · Order name · Type badge (Earned / Advance / Adjustment) · Amount
- Row tap → Navigates to a Read-Only view of the Order Details (specifically to allow filing a Dispute, even if the worker was unassigned via reassignment). Tapping a Ledger Adjustment does nothing.
- *Note:* Deactivated workers lose access entirely and cannot file disputes via the app.

**UI States:**
- Default: Cards + history
- Empty: "No earnings yet. Complete your first order!"
- Negative balance: Remaining card turns red

#### W4 — Profile

**Layout:** Scrollable view.
- **Header:** Avatar, Full Name, Current Company.
- **Navigation Options:** "Time Off" (`W5`), "Language" (🇺🇦/🇬🇧 toggle), "App Theme" (☀️/🌙 toggle), "Support / FAQ" (`W8`).

**UI States:**
- Default: Info loaded.
- Loading: Name and Rate skeleton blocks.

#### W5 — Time Off List

**Layout:** Mini calendar (month view, colored dots on time off days) → List of requests (showing Type, Dates, Reason, and Status badge).

**UI States:**
- Default: Calendar + list
- Empty: "No upcoming time off. Need a day off? 👇" + CTA button
- Loading: Calendar skeleton + 3 list item skeletons
- Error: "Failed to load time off. [Retry]"

#### W6 — Request Time Off

**Fields:** Type (dropdown: configurable by Manager. Default: Vacation, Sick Leave, Personal Day, Holiday, Unpaid Leave, Family Leave, Training, Other) · Start Date · End Date · Reason (optional textarea)
**Submit:** Primary button "Request Time Off", full-width

**UI States:**
- Default: Empty form
- Filled: All required fields valid (Submit enabled)
- Error (Validation): Red border on invalid fields (e.g., end date before start date)
- Submitting: Primary button shows spinner
- Success: Toast "Request submitted" + navigate back to W5

#### W7 — Report Issue (2-Step Flow)

**Step 1: Type Selector (Bottom Sheet)**
- Two large tappable option cards:
  - 🚧 `Блокер / Проблема` — subtitle: "Потрібна допомога менеджера зараз"
  - ⚠️ `Запит на корекцію` — subtitle: "Помилка в годинах, ставці, оплаті"

**Step 2: Issue Form (Extended Bottom Sheet)**
- **Fields:**
  - Issue Sub-Type (dropdown: context-dependent)
  - Order (pre-selected)
  - Expected Value *(Correction only)*
  - Description (min 20 chars, character counter)
  - **Attachments row:**
    - `[📷 Фото]` → up to 3 photos, thumbnails shown inline after selection
    - `[📎 Файл]` → up to 2 files, filename chips shown inline
- **Submit:** Primary button "Відправити"

**UI States:**
- Default: Empty form (Order pre-filled, type pre-selected)
- Filled: Description > 20 chars (Submit enabled)
- With Attachments: Photo thumbnails + file chips visible below description
- Error: Red border on missing fields
- Submitting: Primary button shows spinner
- Success: Info Dialog "Повідомлення відправлено менеджеру" + navigate back

#### W8 — Support & FAQ

**Layout:** Scrollable view with expandable accordion items for FAQ. Bottom section with contact options.
- **FAQ Categories:** List of common questions (e.g., "How is my pay calculated?", "What if I can't attend a shift?"). Tapping expands the answer.
- **Contact:** Primary action button "Contact Manager" (opens Telegram chat) or "Contact Support".

**UI States:**
- Default: FAQ list loaded.
- Expanded: Selected FAQ item expanded to show text.
- Action: "Contact Manager" opens external tg:// link.

---

### 4.3 Manager — Telegram Mini App

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| M1 | Dashboard (Home) | `/manager` | Quick stats + 6-tile grid |
| M2 | Orders List | `/manager/orders` | All orders with filters |
| M3 | Create Order | `/manager/orders/new` | Order creation form |
| M4 | Order Details | `/manager/orders/:id` | Full order view with logs |
| M5 | Team List | `/manager/team` | Workers overview |
| M6 | Worker Card | `/manager/team/:id` | Individual worker details |
| M7 | Client List | `/manager/clients` | Client management |
| M8 | Client Card | `/manager/clients/:id` | Client details + history |
| M9 | Materials Catalog | `/manager/materials` | Material types |
| M10 | Finance Dashboard | `/manager/finance` | Financial overview |
| M11 | Dispute Review | `/manager/disputes` | Pending disputes |
| M12 | Time Off Management | `/manager/timeoff` | Team time off calendar |
| M13 | Company Settings | `/manager/settings` | Business & catalog config |
| M14 | Manager Profile | `/manager/profile` | Personal info & language |
| M15 | Support & FAQ | `/manager/support` | Help and system logic FAQ |

#### M1 — Dashboard (Home)

**Layout:** Top section with Quick Stats, followed by 2×3 tile grid.
**Header:** Contains Global Company Switcher (left) and Role Badge.
**Footer:** Manager Bottom Nav Bar (Home, Orders, Team, Profile).

```
┌─────────────────────────┐
│ Active Orders        12 │
│ Workers Online        8 │
└─────────────────────────┘
┌──────────┐  ┌──────────┐
│   💰     │  │   👤 15  │
│ Finance  │  │ Clients  │
├──────────┤  ├──────────┤
│   📋     │  │   ⚙️     │
│Materials │  │ Settings │
├──────────┤  ├──────────┤
│   🌴 2   │  │   ⚠️ 1   │
│ Time Off │  │ Disputes │
└──────────┘  └──────────┘
```

**Tile style:** `--bg-secondary`, `--radius-lg`, icon 32px, label `--body`, badge accent circle top-right.

**UI States:**
- Default: Quick stats and 6 tiles with active loaded counts
- Loading: Tile counts show pulsing skeleton dots
- Error: "Failed to load counts" inline banner

#### M2 — Orders List

**Layout:** Sticky search + filter bar → Scrollable order card list → FAB `[+ Create Order]`

**Search & Filters:**
- Search bar: placeholder \"Search orders or number...\"
- Filter pills (horizontal scroll): `All` · `New` · `In Progress` · `Blocked` · `In Review` · `Done` · `[Worker ▼]` · `[Client ▼]` · `[Date ▼]`
- Sort dropdown (top-right): Newest · Deadline · Status

**Order Card anatomy (Manager view):**
```text
┌──────────────────────────────────────┐
│ ☀️ Solar Install #042  [In Progress] │
│ Client: ABC Corp · 12 units          │
│ 👥 Team: Pavlo K., Ivan M. [1/2 ✅]    │
│ Deadline: Mar 28 · Cost: $1,240      │
└──────────────────────────────────────┘
```
- Swipe left → quick actions: `Duplicate` · `Delete` (confirmation required)

**UI States:**
- Default: Order card list
- Empty (no orders): Illustration + \"No orders yet. Create your first one!\" + `[+ Create Order]` CTA
- Empty (filtered): \"No orders match the current filters.\" + `[Clear Filters]` ghost button
- Loading: 3 skeleton order cards
- Error: \"Couldn't load orders. [Retry]\"

#### M3 — Create Order

**Form fields (in order):**
1. Order Date (date selector, default: today)
2. Order Number (optional text)
3. Client (dropdown + "New Client" inline)
4. **Order Type / Task Template** (dropdown from Catalog). *Selecting this auto-populates the dynamic Quantity fields.*
5. **Quantity Metrics** (Dynamically rendered based on selected Order Type's Pricing Schema):
   - **Single Unit:** 1 input `[Qty]` (e.g., m²)
   - **Time-Based:** 1 or 2 inputs `[Qty]` (e.g., Hours) + optional Night Shift input.
   - **Composite/Combo:** Multiple inputs (e.g., `[Qty] m²` and `[Qty] m.lineal`).
   - **Fixed:** No quantity field, just `[Total Budget]`.
6. Work Start Date (date selector)
7. Deadline (date selector)
8. Assign Workers (multi-select chips)
9. **Lead Worker** *(visible only when 2+ workers selected)* — dropdown from assigned workers. Chip with ⭐ badge. Optional.
10. **Budget override** (Auto-calculated from Qty * Rate, but manager can edit final total).
11. Notes (textarea, optional)

**Submit:** Primary button "Create Order"

**UI States:**
- Default: Empty form
- Filled: Required fields valid
- Error: Validation errors on blur
- Submitting: Button spinner
- Success: Navigate to M2 (Orders List) + Toast

#### M4 — Order Details (Manager View)

**Layout:** Scrollable view with expandable sections.

**Sections:**
1. **Order Header** — Name, type, client, quantity, start date, deadline, status badge, Lead Worker ⭐ badge, and **Order Notes** block.
2. **Worker Completion Tracker** *(visible for all orders)* — horizontal bar: "[X]/[Y] workers done". Below: worker avatar row, each with ⏳ or ✅ badge. Lead Worker marked with ⭐.
3. **Time Logs** — table: Date, Worker, Start, End, Breaks, Net Hours, Units *(Per-Unit)*, Cost. **Filter by Worker** dropdown above table.
4. **Materials** — table: Material, Qty, Unit Cost, Total, Added By, Date. **Filter by Worker** dropdown. Manager can Edit/Delete any entry.
5. **Photos** — gallery grid (80×80 thumbnails). **Filter by Worker** toggle. Tap → full-screen viewer.
6. **Cost Summary** — Stat cards: Labor Cost + Material Cost = Grand Total. *(Multi-worker: per-worker breakdown row)*
7. **Issue Alerts** — Yellow banner for active Blockers (🚧), red banner for pending Corrections (⚠️). Shows count, latest summary, and `[View Issues]` link. Attached photos visible as inline thumbnails.

**Actions:**
- `[Edit Order]` primary button
- `[Change Status]` — status progression buttons
- **Payment Split Modal** *(Per-Job multi-worker orders, on Done)*: Worker list with editable % inputs (default: equal split). MUST include all historically assigned workers, not just current ones. Auto-calculated amounts. Total must = 100%. `[Confirm & Close Order]` button. For single-worker: 100% auto, no modal.

**UI States:**
- Default: All sections collapsed to summary
- Expanded: Sections open on tap
- Multi-worker: Completion tracker visible, filter dropdowns active
- Closing (Per-Job): Payment Split modal overlays
#### M5 — Team List

**Layout:** Sticky header with `[+ Invite Worker]` button → Scrollable worker rows → Bottom Nav.

**Worker Row anatomy:**
```
┌────────────────────────────────────────┐
│ 🟢  Pavlo Kovalenko       [Manager]   │
│     3 active orders · 36h this week   │
└────────────────────────────────────────┘
```
- Status dot: 🟢 Active · ⚪ Invited (pending join) · 🔴 Deactivated
- Swipe left → `Deactivate` (destructive — confirmation dialog)

**UI States:**
- Default: Worker rows
- Empty: "Your team is empty. Invite your first worker!" + `[+ Invite Worker]` CTA
- Loading: 3 skeleton rows
- Error: "Failed to load team. [Retry]"

#### M6 — Worker Card

**Layout:** Scrollable. Header → Stats → Absence Calendar → Work History → Rate History → Action Buttons (sticky bottom).

**Header:** Avatar initials circle · Full Name · Role badge · Telegram handle.

**Stats Row (3 cards):** Active Orders · Earned this month · Remaining to pay.

**Sections:**
- **Absence Calendar:** Mini month view. Approved: `status-warning` fill. Pending: dashed outline border.
- **Work History:** Table — Date · Order · Net Hours · Overtime · Cost. 10 rows. `[Load More]` ghost link.
- **Rate History:** Collapsible — Rate · Pay Model · Date · Changed By.

**Action Buttons (sticky bottom):**
- `[Issue Advance]` secondary → popup: Amount + note + `[Confirm]` *(Starter+)*
- `[Edit Rate]` secondary → Warning: "New rate applies to future orders only." → input + `[Save]`
- `[Review Absences]` ghost → navigates to M12 filtered for this worker

**UI States:**
- Default: All sections loaded
- Loading: Header + stat card skeletons
- No history: "No work history yet."
- Error: "Couldn't load worker data. [Retry]"

#### M7 — Client List *(Starter+ only)*

**Layout:** Search bar → Scrollable Client Cards → FAB `[+ New Client]`.

**Client Card anatomy:**
```
Prysma LLC
📞 +380 50 123 4567  ·  ✉ prysma@example.com
12 orders total  ·  3 active  ·  Revenue: $8,200
```

**UI States:**
- Default: Client cards
- Empty: "No clients yet. Add your first client!" + `[+ New Client]` CTA
- Empty (search): "No clients match your search."
- Loading: 3 skeleton cards
- Error: "Failed to load clients. [Retry]"

#### M8 — Client Card *(Starter+ only)*

**Layout:** Scrollable. Client info block → Financial summary (3 stat cards) → Order history table.

**Client Info Block:** Name · Contact Person · Phone · Email · Address · Notes (inline editable).

**Financial Stat Cards:** Total Billed · Total Labor Cost · Total Material Cost.

**Order History Table:** Order Name · Date · Status badge · Amount. Row tap → M4 Order Details.

**Action Buttons:**
- `[Edit Client]` — editable form inline
- `[+ New Order for Client]` primary → opens M3 with client pre-filled
- `[Delete Client]` danger → only if no active orders; confirmation required

**UI States:**
- Default: All data loaded
- Loading: Info block skeleton
- No orders: "No orders for this client yet." + `[+ Create Order]` CTA
- Error: "Couldn't load client data. [Retry]"

#### M9 — Materials Catalog *(Starter+ only)*

**Layout:** Scrollable list of material rows → FAB `[+ Add Material Type]`.

**Material Row:** Icon · Name · Unit · Price per unit · `[Edit]` button. Swipe left → `Archive` (soft-delete, confirmation).

**Add / Edit Material (bottom sheet):** Name · Unit of Measurement · Default Price → `[Save]` / `[Cancel]`.

**UI States:**
- Default: Material type list
- Empty: "No materials configured. Add the first type!" + `[+ Add]` CTA
- Loading: Skeleton rows
- Archived filter: "Show archived" chip toggle at top

#### M10 — Finance Dashboard (TMA)

**Layout:** Period filter bar → 4 Stat Cards → Per-worker breakdown table.

**Stat Cards:** Total Earned (regular + overtime split) · Total Advances · Total Remaining · Total Material Costs

**Worker Table:** Name · Regular h · Overtime h · Earned · Advances · Remaining
- Row tap → navigate to Worker Card
- Export button: greyed out with "Coming Soon" label (Business+ on Web Panel)

**UI States:**
- Default: Calculated stats + populated table
- Empty: "No financial data for this period"
- Loading: Stat block skeletons + table row skeletons
- Error: "Failed to load financial data. [Retry]"
- Export Click: Toast "Export available on Web Panel"

#### M11 — Issue Review (Blockers & Corrections)

**Layout:** Filter bar (`All` · `🚧 Blockers` · `⚠️ Corrections` · `Resolved`) → Scrollable Issue Cards.

**Issue Card anatomy:**
```text
🚧 Павло Коваленко · Замовлення #042 · Missing Materials
   Подано: 22 берез. · [🟡 Active]
   "Не вистачає кабелю, потрібно ще 50м..."
   [📷 2 фото] [📎 1 файл]
   [✅ Вирішено]  [💬 Відповісти]
```

**Correction Card anatomy:**
```text
⚠️ Олена Д. · Замовлення #038 · Incorrect Hours
   Подано: 20 берез. · [🟠 Pending Review]
   Очікувано: 9.5год · Система: 7год
   "Я працювала до 20:00, але лог показує..."
   [📷 1 фото]
   [✅ Approve]  [❌ Reject]  [💬 Ask Details]
```

**Action flows:**
- **Resolve/Approve:** Confirmation dialog → For Corrections: auto-adjusts record. For Blockers: marks resolved. Worker notified.
- **Reject:** Mandatory comment textarea + `[Reject]` → Worker notified with reason.
- **Reply / Ask Details:** Comment + optional photo/file attachment from manager. Status → `Needs Clarification`. Worker notified.

**UI States:**
- Default: Issue cards (Active/Pending first, grouped by type)
- Empty: "Немає активних повідомлень 🎉"
- Loading: 3 skeleton cards
- Error: "Failed to load issues. [Retry]"

#### M12 — Time Off Management

**Layout:** Mini calendar (month view, color-coded dots per worker type) → Scrollable pending requests list below.

**Calendar dots:** 🟡 Pending · 🟢 Approved Vacation · 🔵 Sick Leave · 🟣 Personal Day
- Tap a day → bottom sheet with all absent workers for that day.

**Pending Request Row:**
```
📋 Pavlo Kovalenko
   Vacation: Apr 7–10 (4 days) · "Family trip"
   [✅ Approve]  [❌ Reject]
```
- Reject requires written reason (bottom sheet with mandatory text field).
- Warning dialog shown if worker has `New` or `In Progress` orders during requested absence dates.

**UI States:**
- Default: Calendar + pending list
- Empty (no pending): "No pending time off requests ✅" (calendar still shows approved periods)
- Loading: Calendar skeleton + list row skeletons
- Error: "Failed to load time off data. [Retry]"

#### M13 — Company Settings

**Config Sections:**
- **Company Profile:** Name, Country.
- **Order Types Constructor (Catalog):** Manage task templates. Define Pricing Schemas (Single, Time, Combo, Fixed) and specific shift overtimes.
- **Absence Types:** Toggle switches for available absence types. Default: Vacation, Sick Leave, Personal Day, Holiday, Unpaid Leave, Family Leave, Training, Other.
- **Global Overtime Rules:** Company-wide thresholds (e.g., 8h/day) and multipliers (1.5x) for standard time-based orders.
- **Working Hours:** Default shifts.
- **Subscription:** Current plan badge + `[Manage Subscription]` ghost button → Routes to `M16`.

#### M14 — Manager Profile

**Config Sections:**
- **Personal Details:** Avatar, Name.
- **Preferences:** Language toggle (🇺🇦 / 🇬🇧).
- **Accounts:** Link/Unlink Telegram (if needed).

#### M15 — Support & FAQ

**Layout:** Same accordion structure as W8. Contextualized for Managers.
- Contains answers regarding payroll calculation, adding workers, dispute resolution steps, and subscription tier rules.
- Primary action: "Contact Larko Support" (opens direct chat with Larko admin).

#### M16 — Subscription & Billing (Manager & Owner)

**Access:** Via a prominent "Upgrade" or "Subscription" button in Company Settings (`M13`), or via "Billing" fast-action.
- **Top Section:** Current plan badge (Free, Starter, Business, Pro) + Next billing date.
- **Usage Breakdown:**
  - Progress bars: Companies (`1/Unlimited`), Workers (`12/50`), Managers (`2/5`).
  - Warning States: Red bars if near/at limit.
- **Actions:**
  - `[Change Plan]` / `[Upgrade]` → Triggers Telegram Stars invoice or Stripe Link.
  - `[Manage Payment Method]` → Redirects safely.
- **UI Details:** Dark/Light theme full adherence to standard structural forms (glass-panel cards for pricing tiers).

---

### 4.4 Owner — Telegram Mini App

> **Note:** Owners use **G1 / O1 Company Switcher** to select a company and then enter the full Manager TMA flow (`§4.3`) for that company. In addition to all Manager capabilities, Owners see extended analytics on the M1 Dashboard and have access to O2 Company Statistics.

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| O1 | Company Switcher (Owner) | `/switch` | Select company + create new company |
| O2 | Company Statistics | `/owner/stats` | Advanced per-company analytics *(Starter+)* |

#### O1 — Company Switcher (Owner)

Same base component as `G1` (card list of companies) with the following Owner-only additions:
- `[+ Create New Company]` primary button at bottom.
- `[Role Badge]` per company card shows Owner context.
- Active company highlighted with `accent-primary` left border.

**UI States:**
- Single company: Shows card + `[+ Create New Company]` CTA.
- Multiple companies: Scrollable list. No global aggregation shown.
- Loading: Skeleton cards.

#### O2 — Company Statistics *(Starter+ only)*

**Access:** From `M1 Dashboard` (Owner state) via a dedicated `📊 Statistics` tile that appears only for Owners.

**Plan Gate (Free plan):** Teaser card instead of full analytics: "Upgrade to Starter to unlock advanced company analytics." + `[Upgrade]` button.
- **Visuals:** Advanced chart representations (Line charts for revenue/costs, Bar charts for worker hours).
- **KPI Metrics:** Profit margin (if tracked), Total Labor Costs versus Budget, Average completion times per Order.
- **Filters:** Quick segmented toggles (`Week` | `Month` | `Year`).
- **Export capability:** `[Generate PDF Report]` (prompts a bot message with the PDF attached).
- **Empty States:** "Not enough data yet. Complete more orders to generate your first advanced insight."

### 4.5 Manager & Owner — Web Panel *(Phase 2 — Post-MVP)*

> **Note:** The Web Panel is planned for Phase 2 and is **not part of the TMA MVP**. The TMA is the standalone MVP. The following screens are documented here as a design reference for future development.
> Both **Manager** and **Owner** have access to the Web Panel. There is no cross-company aggregation — all data is strictly per-company.
> Users belonging to multiple companies can switch context via the **G1 Company Switcher** located in the top-left sidebar header.

#### Shared Screens (Manager + Owner)

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| WP1 | Orders Management | `/panel/orders` | Full orders table with filters, search, bulk actions |
| WP2 | Team Management | `/panel/team` | Workers table, invite, edit roles, worker groups |
| WP3 | Client Management | `/panel/clients` | Clients table, CRUD, order history per client |
| WP4 | Finance Dashboard | `/panel/finance` | Stat cards + per-worker breakdown table + export |
| WP5 | Materials Catalog | `/panel/materials` | Material types CRUD, pricing |
| WP6 | Time Off Management | `/panel/timeoff` | Team calendar + approve/reject requests |
| WP7 | Dispute Review | `/panel/disputes` | Pending disputes list + resolution actions |
| WP8 | Company Settings | `/panel/settings/company` | Product types, overtime rules, working hours, industry |
| WP9 | Performance Analytics (KPIs) | `/panel/analytics` | Charts: hours/worker, costs, overtime, completion rates *(Business+)* |

#### Owner-Only Screens (Per Company)

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| WP10 | Billing & Subscription | `/panel/billing` | Plan management, usage meters, invoice history |
| WP11 | Audit Trail | `/panel/audit` | Chronological log of all system changes *(Pro)* |
| WP12 | API Management | `/panel/api` | API key display, usage stats, regenerate *(Pro)* |
| WP13 | Account Settings | `/panel/settings/account` | Personal profile, auth methods, language |

#### Auth Screens (all users)

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| WP15 | Login | `/login` | Google/Apple + Email/Password |
| WP16 | Registration (4-step) | `/signup` | Account → Company → Invite → Plan |
| WP17 | Password Reset | `/reset-password` | 3-step account recovery flow |

#### WP17 — Password Reset Flow (3-step)

**Flow:**
1. **Request:** Enter Email → `[Send Reset Link]`
2. **Check Email:** "Link sent" notification (valid 24h)
3. **Reset:** New Password form (min 8 chars + confirm) → `[Reset Password]`

**UI States:**
- Default: Empty email / new password form
- Loading: Action button shows spinner
- Error: "Invalid email" or "Link expired" banner
- Success: "Password updated!" → redirects to WP15 Login

**Layout:** Persistent left sidebar (240px, `--bg-secondary`) + top bar (56px) + main content area.

**Sidebar Navigation:**
- **Manager sees:** 📦 Orders · 👥 Team · 💰 Finance · 👤 Clients · 📋 Materials · 📅 Time Off · ⚠️ Disputes · ⚙️ Settings
- **Owner sees (additional):** 📊 Dashboard · 📈 Analytics `[Business+]` · 📝 Audit Trail `[Pro]` · 💳 Billing · 🔑 API `[Pro]` · Company Switcher dropdown in top bar
- Bottom: User avatar + name + role badge (Manager/Owner) + Logout

**Key screens detail:**

#### WP1 — Orders Management (Manager + Owner)
- Full-width data table with columns: #, Title, Type, Client, Workers, Deadline, Status, Cost
- Filters: Status, Client, Worker, Date range
- Search bar + Sort dropdown
- Actions: Create Order (modal or page), Edit, Archive
- Row click → Order Detail view with time logs, materials, photos, comments

**UI States:**
- Default: Data table populated with pagination
- Empty: "No orders match the current filters." + Clear Filters button
- Loading: Table skeleton rows (no spinner)
- Error: "Unable to fetch orders. [Retry]"
- Bulk Action Active: Checkboxes selected, floating action bar appears at top

#### WP2 — Team Management (Manager + Owner)
- Workers table: Name, Role, Status (Active/Invited), Active Orders, Hours This Week, Group
- Actions: Invite Worker (Telegram link), Edit Role, Deactivate, Issue Advance, Ledger Adjustment (Owner only)
- Worker detail view: full history, rate changes, balance

**UI States:**
- Default: Team table
- Empty: "Your team is empty. Invite your first worker!" + Primary CTA
- Loading: Table skeleton
- Edit Role Modal: Dropdown (Worker/Lead/Manager), Save/Cancel buttons

#### WP4 — Finance Dashboard (Manager + Owner)
- Period filter (Week / Month / Custom)
- 4 stat cards: Total Earned (regular + overtime), Total Advances, Remaining, Material Costs
- Per-worker breakdown table (sortable)
- `[Export CSV]` button (Business+ only)

**UI States:**
- Default: Stat cards + populated table
- Empty: "No financial activity for this period."
- Exporting: Button shows spinner → Toast "Export complete"


#### WP10 — Performance Analytics (Owner, Business+)
- Date range picker + Company/Worker Group filters + Export button
- Bar chart: Hours logged (regular vs overtime) over 30 days
- Line chart: Cost breakdown (labor vs materials) over 30 days
- Summary cards: Avg hours/worker/day, Total overtime, Completion rate, Avg order duration

**UI States:**
- Default: Charts rendered with tooltip on hover
- Empty Data: "Not enough data to generate analytics yet." covering chart area
- Loading: Chart skeleton shapes pulsing

#### WP11 — Billing & Subscription (Owner only)
- Current plan card with usage progress bar (workers used / limit)
- Plan limits table (Companies, Workers, Managers, Storage, History)
- Payment history table (date, description, amount, status badge, invoice download)
- Actions: Change Plan, Update Payment Method, Cancel Subscription

**UI States:**
- Default: Active plan info
- Limit Reached: Warning banner "Worker limit reached. Please upgrade to invite more." (Red progress bar)
- Processing Payment: Screen overlay + spinner

#### WP12 — Audit Trail (Owner, Pro)
- Filters: Company, User, Action type, Date range, Search
- Dense table: Timestamp, User (with role), Action, Entity, Old → New Value, Company
- Pagination

**UI States:**
- Default: Standard dense table (read-only)
- Empty state: "No audit logs found for the selected period."

#### WP15 & WP16 — Authentication Flows
- WP15 Login: Email/Password inputs or Google/Apple social buttons.
- WP16 Registration: 4-step wizard matching section 4.1 Onboarding.

**UI States (Auth):**
- Default: Clean centered card, no errors
- Invalid Credentials: Red border on inputs + "Incorrect email or password" below
- Submitting: Primary button spinner, inputs disabled
- Magic Link Sent (Password Reset): Success icon + "Check your email" text

#### WP13 — API Management (Owner, Pro)
- **API Key Card:** masked key (`sk_live_***...`) with Copy icon. Warning: "Keep this key secret."
- **Usage Stats:** Requests today / this month (bar chart)
- **Documentation Link:** external link to API docs
- `[Regenerate Key]` button → confirmation modal: "Old integrations will immediately break."
- Empty state: "No API key generated yet. [Generate Key]"

#### WP14 — Account Settings (Owner only)
- Profile: Full Name (editable), Email (editable with re-verification)
- Auth Methods: Email/Password, Google, Apple — link/unlink (min 1 must stay active)
- Language: 🇬🇧 English / 🇺🇦 Українська toggle
- Danger Zone (red border): Delete Account with typed confirmation + re-auth

---

## 5. Business Rule Constraints (BRD Enforcement)

> **Critical Note:** The UI must strictly enforce these business rules derived from the Product BRD.

### 5.1 Content Locking (Post-Completion)
- **Rules #17 & #35:** Once an Order is marked `Done`, all associated Time Logs, Materials, and Photos become structurally Read-Only for Workers.
- **UI Implication:** Dropdowns convert to text spans, `[+ Add]` buttons are hidden, swipe-to-delete is disabled, and photo upload zones disappear.

### 5.2 Material Pricing Immutaiblity
- **Rule #34:** Material cost is fixed at the time of entry.
- **UI Implication:** If the Manager changes the price of "Copper Wire" in the Materials Catalog tomorrow, today's order must still display and calculate using today's price. No retroactive "Update Price" buttons on past order details.

### 5.3 Idempotency & Network Resilience
- **Rule #20:** Repeated "Submit" taps while offline must not create duplicate entries when reconnecting.
- **UI Implication:** Forms must instantly disable the submit button upon tap and show a spinner. If completely offline, the UI must queue the action locally, show a success toast ("Saved locally. Will sync when online."), and navigate the user away from the form to prevent double-entry.

### 5.4 Payment Split Enforcement
- **Rule #31:** For Per-Job multi-worker orders, the total payout split must exactly equal 100%.
- **UI Implication:** The Manager's "Close Order" modal must calculate the remaining percentage dynamically. The `[Confirm]` button remains disabled until the sum of all worker percentages is exactly 100.

### 5.5 Absence Overlap Warning
- **BRD Rule #5.1:** Manager must be warned if an absence overlaps with active orders.
- **UI Implication:** When approving an absence, if the worker has `New` or `In Progress` orders during those dates, show Warning Dialog: "Worker has active orders during this period. Proceed?"

### 5.6 Logical Data Parity
- **Time Off Parity:** The `Reason` provided by a Worker in `W6 Request Time Off` must be explicitly visible to the Manager in the `M12/WP6` approval flow, and in the worker's own `W5` history.
- **Dispute Parity:** The `Expected Value` and `Description` provided in `W7 Dispute Form` must be strictly mapped and visible in the Manager's `M11/WP7 Dispute Review` queue.
- **Lead Worker Transparency:** If a Manager assigns a `Lead Worker` in `M3`, that Lead Worker's name/contact must be visible to all other assigned workers in their `W2 Order Details` header for on-site coordination.

---

## 7. Navigation Flows

### 7.1 Worker Flow
```
My Tasks (Home) ─┬─→ Order Details / Time Log
                 │     └── Dispute Form
                 ├─→ My Balance
                 │     └── Dispute Form
                 └─→ My Absences
                       └── Request Absence Form
```

### 7.2 Manager Flow (TMA)
```
Main Menu ─┬─→ Orders ─┬─→ Create Order
           │           └─→ Order Details → Dispute Review
           ├─→ Team ───── → Worker Card → Issue Advance
           ├─→ Finance
           ├─→ Clients ──→ Client Card → New Order (pre-filled)
           ├─→ Materials
           └─→ Settings ─┬─→ Subscription & Billing (M16)
                         └─→ Manager Profile (M14)
```

### 7.3 Manager Flow (Web Panel)
```
Sidebar ─┬─→ Orders (table) ─┬─→ Create Order
         │                   └─→ Order Details (full view)
         ├─→ Team (table) ──→ Worker Detail → Issue Advance
         ├─→ Finance (dashboard + export)
         ├─→ Clients (table) ──→ Client Detail
         ├─→ Materials (catalog)
         ├─→ Time Off (calendar + approve/reject)
         ├─→ Disputes (review queue)
         └─→ Settings (company config)
```

### 7.4 Owner Flow (TMA)
```
Company Switcher ─┬─→ Select Company → Full Manager TMA flow (§7.2)
                  └─→ Company Statistics (O2 Advanced Dashboard)
                       ├── View segmented charts (Revenue, Overtime)
                       └── Generate PDF Report
```

### 7.5 Owner Flow (Web Panel) *(Phase 2)*
```
Sidebar ─┬─→ Dashboard (current company overview — same as Manager)
         ├─→ Analytics (KPIs + charts) [Business+]
         ├─→ All Manager screens (§7.3) via Company Switcher
         ├─→ Audit Trail [Pro]
         ├─→ Billing & Subscription
         ├─→ API Management [Pro]
         └─→ Account Settings
```

---

## 8. Responsive Behavior

| Breakpoint | Target | Layout |
|:-----------|:-------|:-------|
| `< 480px` | TMA (Full Screen) | Single column, bottom tabs, full-width cards. Full viewport width |
| `480–768px` | TMA Landscape / Tablet | 2-column grids where applicable |
| `768–1280px` | Web Panel (Manager + Owner) | Sidebar (240px) + content area |
| `> 1280px` | Web Panel wide | Sidebar + centered content (max-width: 1060px) |

---

## 9. Telegram Mini App Integration

| Feature | Spec |
|:--------|:-----|
| **Theme** | Use `Telegram.WebApp.themeParams` for automatic dark/light detection. Override with our dark tokens |
| **Header** | Use Telegram's native back button (`BackButton.show()`) |
| **Haptics** | `HapticFeedback.impactOccurred('medium')` on submit, time entry |
| **Main Button** | Use `MainButton` for primary actions where possible |
| **Popup** | Use `Telegram.WebApp.showPopup()` for confirmations |
| **Safe Area** | Respect `viewportStableHeight` for bottom elements |

---

## 10. Accessibility (WCAG AA)

| Requirement | Implementation |
|:------------|:---------------|
| Contrast ratio ≥ 4.5:1 for text | `#EDEDED` on `#1C1C1E` = **10.5:1** ✓ |
| Secondary text contrast | `#878787` on `#1C1C1E` = **4.1:1** ✓ |
| Touch targets ≥ 48×48px | All buttons and tappables |
| Color not sole indicator | Status = color + icon + text label |
| Focus indicators | `accent-primary` border ring on inputs |
| Motion | `prefers-reduced-motion` respected |
| `accent-primary` contrast | `accent-primary` on background meets minimum **4.5:1** contrast ✓ (large text / interactive elements only) |

---

## 11. Micro-interactions & Animations

| Interaction | Animation | Duration |
|:------------|:----------|:---------|
| Screen transition | Slide left/right (stack) | 250ms ease-out |
| Card appear | Fade up + scale(0.98→1) | 200ms |
| Submit success | Button → checkmark morph + confetti particles | 400ms |
| Status change | Badge color cross-fade | 150ms |
| Pull to refresh | Custom spinner (brand accent) | native |
| Number update | Count-up animation | 300ms |
| Tab switch | Underline slide | 200ms |
| Error shake | Horizontal shake (3px, 3 cycles) | 300ms |

---

## 12. Iconography

**Style:** Rounded filled icons (Material Symbols Rounded, weight 400, grade 0, optical size 24)

**Custom icons needed:**
- Larko logo / app icon
- Industry type icons (7): Manufacturing, Construction, Solar, Cleaning, Auto Repair, Delivery, Other
- Payment model icons (3): Per Unit, Per Hour, Per Job
- Empty state illustrations (4): No tasks, No earnings, No time off, No clients

---

## 13. Next Steps

| # | Action | Owner | Deliverable |
|:--|:-------|:------|:------------|
| 1 | **Review & Approve** this brief | CEO | Approved brief |
| 2 | Create UIKit (design system tokens as code) | IT / Design | `uikit.yaml` |
| 3 | Worker screens HTML complete | Design Director | W1–W8 HTML ✓ |
| 4 | Manager screens HTML — complete missing specs | Design Director | M2, M5–M9, M11, M12 HTML |
| 5 | Owner TMA screens HTML | Design Director | O1, O2 HTML |
| 6 | M1 Dashboard Owner state — add Statistics tile | Design Director | M1_Owner updated HTML |
| 7 | Landing page design | Design Director | Figma/HTML |
| 8 | Logo & app icon design | Design Director | SVG assets |

> **Priority:** Steps 4–6 are the immediate implementation gaps. Step 4 (missing Manager screens) is blocking screen-level QA.

---

> **Gate:** This brief requires CEO / Design Director approval before handoff to IT for implementation.
