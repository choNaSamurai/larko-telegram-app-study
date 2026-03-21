---
document_id: DC-38_design_brief
project: larko
type: design_brief
status: draft
version: "1.0"
author: Design Director (AI)
date: "2026-03-17"
epic: DC-38
style: "Seamless Harmony + Deep Mode"
---

# рџЋЁ Design Brief вЂ” Larko MVP

> **Style:** Seamless Harmony + Deep Mode
> **Platforms:** Telegram Mini App (TMA) В· Web Panel В· Landing Page
> **Roles:** Worker В· Manager В· Owner В· Super Admin
> **Source:** [BRD v1.0](https://lzevsvpqeislsivdnzgt.supabase.co/storage/v1/object/public/docs/larko/04_BRD_Larko_MVP.md) (APPROVED)

---

## 1. Visual Philosophy

**"Simple as a calculator. Smooth as water. Dark as a pro tool."**

Larko serves blue-collar SMB owners (35вЂ“50 y.o.) and their field workers, but it brings the premium "Silicon Valley" aesthetic to their pockets. They work with dirty hands, in sunlight, wearing gloves. The interface must be:

- **Readable at arm's length** вЂ” large type, high contrast
- **Tappable with gloves** вЂ” minimum 48px touch targets
- **Instant to understand** вЂ” zero learning curve, icon + label always
- **Dark by default** вЂ” saves battery in the field, reduces glare on sunny jobsites
- **Calm, not chaotic** вЂ” rounded corners, sleek neutral accents, quiet micro-copy

### Design Principles

| # | Principle | Implementation |
|:--|:----------|:---------------|
| 1 | **Glove-friendly** | Min touch target 48Г—48px. 12px gaps between tappables |
| 2 | **One-glance clarity** | Status = color + icon + label. Never color alone |
| 3 | **Progressive disclosure** | Show essential info first, details on tap |
| 4 | **Telegram-native feel** | Follow Telegram Mini App design patterns, respect theme variables |
| 5 | **Encouraging tone** | Empty states with friendly copy, success animations on submit |

---

## 2. Design Tokens

### 2.1 Color Palette вЂ” Deep Mode

Larko's palette completely abandons generic "SaaS Blue". It uses Deep Obsidian for OLED power saving and extreme contrast, paired with **Neon Volt** вЂ” a color borrowed from actual physical blue-collar environments (safety vests, laser levels, industrial tools).

> вљ пёЏ **CRITICAL IMPLEMENTATION RULES FOR NEON VOLT (`#D4FF00`)**:
> 1. **The 10% Rule (Dark Mode):** Neon Volt must NOT exceed 10% of the screen's visual weight. Use it EXCLUSIVELY for the primary CTA (e.g., "Clock In"), active states, and small badges. Backgrounds and large typography must remain monochrome (Obsidian/Slate). Overuse will cause severe eye strain.
> 2. **Legibility Hazard (Light Mode):** Neon Volt on White (`#FFFFFF`) fails WCAG contrast. In Light Mode, primary buttons must be Pure Black (`#090A0C`) with Neon Volt used strictly as a border, hover effect, or micro-accent.

| Token | Hex | Usage |
|:------|:----|:------|
| `--bg-primary` | `#000000` | Pure Black (OLED battery saving) |
| `--bg-secondary` | `#111318` | Elevated cards, surfaces |
| `--bg-tertiary` | `#1A1D24` | Input fields, dropdowns |
| `--border-default` | `#262B36` | Borders, dividers |
| `--border-focus` | `#D4FF00` | Focused inputs |
| `--text-primary` | `#F8FAFC` | Headings, primary text |
| `--text-secondary` | `#94A3B8` | Labels, helper text |
| `--text-muted` | `#475569` | Placeholders, disabled |
| `--accent-primary` | `#D4FF00` | **Neon Volt** вЂ” Primary buttons, links, active states |

### 2.2 Semantic Colors

| Token | Hex | Lightness | Usage |
|:------|:----|:----------|:------|
| `--status-success` | `#00E676` | Bright Green | Completed orders, approved absences |
| `--status-warning` | `#FFAB00` | Bright Amber | In-progress orders, pending requests |
| `--status-error` | `#FF3D71` | Bright Rose | Overdue elements, disputes, errors |
| `--status-info` | `#00B8D9` | Bright Cyan | Informational badges |
| `--status-pending` | `#FB923C` | Orange вЂ” Pending review |
| `--overtime` | `#F59E0B` | Overtime indicator |
| `--earned` | `#34D399` | Earned money |
| `--advance` | `#60A5FA` | Advances |
| `--remaining-negative` | `#F87171` | Negative remaining balance |

### 2.2 Typography

| Token | Font | Size | Weight | Usage |
|:------|:-----|:-----|:-------|:------|
| `--title-xl` | Inter | 28px | 700 | Dashboard big numbers |
| `--title-lg` | Inter | 22px | 600 | Screen titles |
| `--title-md` | Inter | 18px | 600 | Section headers |
| `--body` | Inter | 16px | 400 | Body text |
| `--body-sm` | Inter | 14px | 400 | Secondary info, timestamps |
| `--caption` | Inter | 12px | 500 | Badges, labels |
| `--mono` | JetBrains Mono | 16px | 500 | Money amounts, hours, numbers |

> **Why Inter?** Highly legible, perfectly neutral, premium tech aesthetic. Matches "Seamless Harmony" direction.
> **Why JetBrains Mono for numbers?** Tabular figures, clear distinction between 0/O and 1/l. Critical for money and time values.

### 2.3 Spacing & Radius

| Token | Value | Usage |
|:------|:------|:------|
| `--space-xs` | 4px | Inline gaps |
| `--space-sm` | 8px | Tight padding |
| `--space-md` | 12px | Card inner padding |
| `--space-lg` | 16px | Section gaps |
| `--space-xl` | 24px | Screen padding |
| `--space-xxl` | 32px | Between major sections |
| `--radius-sm` | 8px | Small chips, badges |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards |
| `--radius-xl` | 20px | Modals, bottom sheets |

### 2.4 Elevation (Dark Mode Surfaces)

| Level | Background | Border | Usage |
|:------|:-----------|:-------|:------|
| 0 | `--bg-primary` | none | Page background |
| 1 | `--bg-secondary` | `--border-default` 1px | Cards, list items |
| 2 | `--bg-tertiary` | `--border-default` 1px | Inputs, dropdowns, nested elements |
| 3 | `#2A2E3D` | none | Modals, bottom sheets, overlays |

---

## 3. Component Inventory

### 3.1 Buttons

| Variant | Style | Usage |
|:--------|:------|:------|
| **Primary** | `--accent-primary` bg, white text, `--radius-md`, h=48px | Main actions (Submit, Create, Save) |
| **Secondary** | Transparent bg, `--accent-primary` border + text, h=48px | Cancel, secondary actions |
| **Destructive** | `--status-error` bg, white text | Delete, Reject |
| **Ghost** | No bg/border, `--accent-primary` text | Tertiary links, "Add Break" |
| **Tile** | `--bg-secondary` bg, icon + label stacked, 1:1 aspect ratio | Manager main menu grid |

### 3.2 Cards

| Variant | Content | Usage |
|:--------|:--------|:------|
| **Order Card** | Title В· Type icon В· Client В· Qty В· Deadline В· Status badge | Worker task feed, Manager orders list |
| **Stat Card** | Emoji + Label above, Big number (mono font), subtitle below | Balance view, Finance dashboard, Manager overview |
| **Worker Card** | Avatar circle В· Name В· Active orders count В· Hours badge | Team list |
| **Client Card** | Name В· Contact В· Orders count В· Revenue | Client list |
| **Notification Card** | Icon В· Message В· Timestamp В· Action button (optional) | Motivational notifications |

### 3.3 Status Badges

| Status | Color | Icon | Label |
|:-------|:------|:-----|:------|
| New | `--status-new` | в—‹ | New |
| In Progress | `--status-progress` | в—” | In Progress |
| Done | `--status-done` | вњ“ | Done |
| Pending | `--status-pending` | в—· | Pending |
| Approved | `--status-done` | вњ“ | Approved |
| Rejected | `--status-error` | вњ• | Rejected |
| Overdue | `--status-error` | вљ  | Overdue |

### 3.4 Form Elements

| Element | Spec |
|:--------|:-----|
| **Text Input** | h=48px, `--bg-tertiary`, `--radius-md`, `--text-primary`, placeholder `--text-muted` |
| **Time Selector** | Scroll wheels (HH:MM), large digits, haptic feedback |
| **Date Selector** | Calendar popup, current day highlighted with accent |
| **Dropdown** | Bottom sheet on mobile, popover on web. List items h=48px |
| **Toggle** | 24px height, accent color when on |
| **Photo Picker** | Grid thumbnails (80Г—80px), `+` button with camera icon |

### 3.5 Navigation

| Platform | Element | Spec |
|:---------|:--------|:-----|
| **TMA Worker** | Bottom Tab Bar | 3 tabs: Tasks В· Balance В· Absences |
| **TMA Manager** | Tile Grid + Back Header | 6 tiles on main menu, navigation stack with back arrow |
| **TMA Manager** | Tab Bar + Dashboard | Manager tabs + Dashboard tab as first item |
| **Web Panel** | Sidebar + Top Bar | Collapsible sidebar with icons + labels |

---

## 4. Screen Inventory

### 4.0 Landing Page (Web вЂ” larko.app)

| Screen | Route | Purpose |
|:-------|:------|:--------|
| Landing Page | `/` | Marketing page, pricing, CTA |

**Key elements:** Hero with abstract fluid visual + product tagline В· Feature grid (6 features with sleek icons) В· Pricing table (Free vs Starter vs Business vs Pro) В· Demo video embed В· Footer with links

**UI States:**
- Default: Full marketing page
- Mobile: Responsive, stacked layout

---

### 4.1 Onboarding (Web)

| Screen | Route | Purpose |
|:-------|:------|:--------|
| Registration | `/signup` | Email + Password |
| Create Organization | `/onboard/company` | Company name + Industry selector |
| Invite Workers | `/onboard/invite` | Telegram invite link + share |

**Key elements:**
- **Industry Selector:** 7 visual tiles (icon + label) in a 2-column grid. Selected tile gets accent border + checkmark. Icons: рџЏ­ рџ”Ё вЂпёЏ рџ§№ рџ”§ рџљљ вљ™пёЏ
- **Invite Link Card:** Dark card with monospaced link, Copy + Share buttons
- **Progress indicator:** 3-step dot stepper at top

**UI States per screen:**

| State | Registration | Create Org | Invite |
|:------|:-------------|:-----------|:-------|
| Default | Empty form | Empty form | Link generated |
| Loading | Button spinner | Button spinner | вЂ” |
| Error | Field-level red text | Field-level red text | вЂ” |
| Success | в†’ redirect | в†’ redirect | Link copied toast |

---

### 4.2 Worker вЂ” Telegram Mini App

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| W1 | My Tasks (Home) | `/worker` | Active order feed |
| W2 | Order Details / Time Log | `/worker/order/:id` | Log hours, materials, photos, comments |
| W3 | My Balance | `/worker/balance` | Earnings, advances, remaining |
| W4 | My Absences | `/worker/absences` | Request & view absences |
| W5 | Request Absence Form | `/worker/absences/new` | Create absence request |
| W6 | Dispute Form | `/worker/dispute/new` | Report correction |

#### W1 вЂ” My Tasks

**Layout:** Vertical scroll feed of Order Cards. Bottom Tab Bar (Tasks В· Balance В· Absences).

**Order Card anatomy:**
```
в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ
в”‚ вЂпёЏ Solar Panel Install    [New] в”‚
в”‚ Client: ABC Corp                в”‚
в”‚ Qty: 12 units В· Due: Mar 20    в”‚
в”‚ вљ пёЏ Due tomorrow                в”‚
в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”
```

**UI States:**
- Default: List of cards
- Empty: Illustration + "You have no active orders рџЋ‰"
- Loading: 3 skeleton cards

#### W2 вЂ” Order Details / Daily Time Log

**Layout:** Scrollable single-page form. Sections: Header в†’ Time Log в†’ Materials в†’ Photos в†’ Comments в†’ Submit.

**Key interactions:**
- Time selectors: Scroll-wheel style (large, glove-friendly)
- "Add Break" adds a pair of time selectors (max 5)
- Auto-calculated "Net Hours" updates in real-time
- Overtime badge appears when >8h
- Submit button: Full-width, h=56px, green (`--status-done`)
- After submit: form becomes read-only, button shows "вњ… Submitted"

**UI States:**
- Default: Empty time form
- Filled: Times entered, net hours calculated
- Overtime: Yellow banner "вЏ° Overtime: 2.5h at 1.5x rate"
- Submitted: Read-only, green checkmark
- Error: Red field borders + error messages

#### W3 вЂ” My Balance

**Layout:** 3 Stat Cards in a row в†’ Scrollable history list with filters.

**Stat Cards:**
- рџџў Earned: `$2,340` (mono font, green)
- рџ”µ Advances: `$800` (mono font, blue)
- рџ”ґ Remaining: `$1,540` (mono font, green if positive / red if negative)
- вЏ° Overtime indicator below if applicable

**History list:** Date В· Order name В· Type badge (Earned/Advance) В· Amount

**UI States:**
- Default: Cards + history
- Empty: "No earnings yet. Complete your first order!"
- Negative balance: Remaining card turns red

#### W4 вЂ” My Absences

**Layout:** Mini calendar (month view, colored dots on absence days) в†’ List of requests with status badges.

**UI States:**
- Default: Calendar + list
- Empty: "No absence requests. Need a day off? рџ‘‡" + CTA button

#### W5 вЂ” Request Absence Form

**Fields:** Absence Type (dropdown) В· Start Date В· End Date В· Reason (optional textarea)
**Submit:** Primary button, full-width

#### W6 вЂ” Dispute Form

**Fields:** Dispute Type (dropdown) В· Order (pre-selected) В· Expected Value В· Description (min 20 chars, character counter)
**Submit:** Primary button "Submit Dispute"

---

### 4.3 Manager вЂ” Telegram Mini App

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| A1 | Main Menu | `/manager` | 6-tile navigation grid |
| A2 | Orders List | `/manager/orders` | All orders with filters |
| A3 | Create Order | `/manager/orders/new` | Order creation form |
| A4 | Order Details | `/manager/orders/:id` | Full order view with logs |
| A5 | Team List | `/manager/team` | Workers overview |
| A6 | Worker Card | `/manager/team/:id` | Individual worker details |
| A7 | Client List | `/manager/clients` | Client management |
| A8 | Client Card | `/manager/clients/:id` | Client details + history |
| A9 | Materials Catalog | `/manager/materials` | Material types |
| A10 | Finance Dashboard | `/manager/finance` | Financial overview |
| A11 | Dispute Review | `/manager/disputes` | Pending disputes |
| M12 | Absence Management | `/manager/absences` | Team absence calendar |
| M13 | Settings | `/manager/settings` | Company configuration |

#### A1 вЂ” Main Menu

**Layout:** 2Г—3 tile grid. Each tile: icon + label + badge count.

```
в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ  в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ
в”‚   рџ“¦ 12  в”‚  в”‚   рџ‘Ґ 8   в”‚
в”‚  Orders  в”‚  в”‚   Team   в”‚
в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤  в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤
в”‚   рџ’°     в”‚  в”‚   рџ‘¤ 15  в”‚
в”‚ Finance  в”‚  в”‚ Clients  в”‚
в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤  в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤
в”‚   рџ“‹     в”‚  в”‚   вљ™пёЏ     в”‚
в”‚Materials в”‚  в”‚ Settings в”‚
в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”  в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”
```

**Tile style:** `--bg-secondary`, `--radius-lg`, icon 32px, label `--body`, badge accent circle top-right.

#### A3 вЂ” Create Order

**Form fields (in order):**
1. Order Date (date selector, default: today)
2. Order Number (optional text)
3. Client (dropdown + "New Client" inline)
4. Product/Service Type (dropdown from catalog)
5. Quantity (number stepper, min 1)
6. Work Start Date (date selector)
7. Deadline (date selector)
8. Assign Workers (multi-select chips)
9. Payment Model (3-option segmented control: Per Unit / Per Hour / Per Job)
10. Notes (textarea, optional)

**Submit:** Primary button "Create Order"

#### A10 вЂ” Finance Dashboard

**Layout:** Period filter bar в†’ 4 Stat Cards в†’ Per-worker breakdown table.

**Stat Cards:** Total Earned (regular + overtime split) В· Total Advances В· Total Remaining В· Total Material Costs

**Worker Table:** Name В· Regular h В· Overtime h В· Earned В· Advances В· Remaining
- Row tap в†’ navigate to Worker Card
- Export button: greyed out with "Coming Soon" label

#### A13 вЂ” Settings

**Sections (accordion-style):**
- Product/Service Types (list + add)
- Material Types (в†’ Materials Catalog)
- Industry Type (selector with warning)
- Organization Profile
- Billing (в†’ web panel link)
- Overtime Rules (thresholds + multiplier)
- Working Hours (default start/end)

---

### 4.4 Manager вЂ” Telegram Mini App

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| M1 | Company Overview | `/manager` | Real-time dashboard |

**Layout:** Scrollable dashboard of metric sections.

**Sections:**
1. **Today's Activity** вЂ” 3 stat cards (Workers active, Active orders, Completed today)
2. **This Week** вЂ” 3 stat cards (Total hours, Overtime hours, Orders completed)
3. **Financial Quick View** вЂ” 3 stat cards (Payable, Advances, Material costs)
4. **Alerts** вЂ” Badge list (Pending absences, Pending disputes, Overdue orders)
5. **[Button: Open Web Panel]** вЂ” Full-width secondary button

Each stat card taps through to the relevant manager screen.

---

### 4.5 Manager вЂ” Web Panel

| # | Screen | Route | Purpose |
|:--|:-------|:------|:--------|
| WP1 | Billing & Subscription | `/panel/billing` | Plan management |

**Layout:** Sidebar navigation + Content area.

**Content:**
- Current plan card (Free в†’ upgrade CTA / Starter в†’ details)
- Worker usage meter (visual progress bar)
- Invoice history table (date, amount, status, download)
- Action buttons: Upgrade / Change Plan / Cancel / Update Payment

---

## 5. Navigation Flows

### 5.1 Worker Flow
```
My Tasks (Home) в”Ђв”¬в”Ђв†’ Order Details / Time Log
                 в”‚     в””в”Ђв”Ђ Dispute Form
                 в”њв”Ђв†’ My Balance
                 в”‚     в””в”Ђв”Ђ Dispute Form
                 в””в”Ђв†’ My Absences
                       в””в”Ђв”Ђ Request Absence Form
```

### 5.2 Manager Flow
```
Main Menu в”Ђв”¬в”Ђв†’ Orders в”Ђв”¬в”Ђв†’ Create Order
           в”‚           в””в”Ђв†’ Order Details в†’ Dispute Review
           в”њв”Ђв†’ Team в”Ђв”Ђв”Ђв”Ђв”Ђ в†’ Worker Card в†’ Issue Advance
           в”њв”Ђв†’ Finance
           в”њв”Ђв†’ Clients в”Ђв”Ђв†’ Client Card в†’ New Order (pre-filled)
           в”њв”Ђв†’ Materials
           в””в”Ђв†’ Settings
```

### 5.3 Manager Flow
```
Company Overview (Dashboard)
  в”њв”Ђв”Ђ Taps metric в†’ corresponding Manager screen
  в””в”Ђв”Ђ "Open Web Panel" в†’ Browser в†’ Billing & Subscription
```

---

## 6. Responsive Behavior

| Breakpoint | Target | Layout |
|:-----------|:-------|:-------|
| `< 480px` | Telegram Mini App | Single column, bottom tabs, full-width cards |
| `480вЂ“768px` | Tablet TMA / Small web | 2-column grids where applicable |
| `768вЂ“1280px` | Web Panel | Sidebar (240px) + content area |
| `> 1280px` | Web Panel wide | Sidebar + centered content (max-width: 960px) |

---

## 7. Telegram Mini App Integration

| Feature | Spec |
|:--------|:-----|
| **Theme** | Use `Telegram.WebApp.themeParams` for automatic dark/light detection. Override with our dark tokens |
| **Header** | Use Telegram's native back button (`BackButton.show()`) |
| **Haptics** | `HapticFeedback.impactOccurred('medium')` on submit, time entry |
| **Main Button** | Use `MainButton` for primary actions where possible |
| **Popup** | Use `Telegram.WebApp.showPopup()` for confirmations |
| **Safe Area** | Respect `viewportStableHeight` for bottom elements |

---

## 8. Accessibility (WCAG AA)

| Requirement | Implementation |
|:------------|:---------------|
| Contrast ratio в‰Ґ 4.5:1 for text | `#F0F0F5` on `#0F1117` = **15.8:1** вњ“ |
| Contrast ratio в‰Ґ 3:1 for large text | All headings meet this вњ“ |
| Touch targets в‰Ґ 48Г—48px | All buttons and tappables |
| Color not sole indicator | Status = color + icon + text label |
| Focus indicators | `--border-focus` ring on inputs |
| Motion | `prefers-reduced-motion` respected |

---

## 9. Micro-interactions & Animations

| Interaction | Animation | Duration |
|:------------|:----------|:---------|
| Screen transition | Slide left/right (stack) | 250ms ease-out |
| Card appear | Fade up + scale(0.98в†’1) | 200ms |
| Submit success | Button в†’ checkmark morph + confetti particles | 400ms |
| Status change | Badge color cross-fade | 150ms |
| Pull to refresh | Custom spinner (brand accent) | native |
| Number update | Count-up animation | 300ms |
| Tab switch | Underline slide | 200ms |
| Error shake | Horizontal shake (3px, 3 cycles) | 300ms |

---

## 10. Iconography

**Style:** Rounded filled icons (Material Symbols Rounded, weight 400, grade 0, optical size 24)

**Custom icons needed:**
- Larko logo / app icon
- Industry type icons (7): Manufacturing, Construction, Solar, Cleaning, Auto Repair, Delivery, Other
- Payment model icons (3): Per Unit, Per Hour, Per Job
- Empty state illustrations (4): No tasks, No earnings, No absences, No clients

---

## 11. Next Steps

| # | Action | Owner | Deliverable |
|:--|:-------|:------|:------------|
| 1 | **Review & Approve** this brief | CEO | Approved brief |
| 2 | Create UIKit (design system tokens as code) | IT / Design | `uikit.yaml` |
| 3 | Generate Figma wireframes for Worker screens | Design Director | Figma file link |
| 4 | Generate Figma wireframes for Manager screens | Design Director | Figma file link |
| 5 | Landing page design | Design Director | Figma/HTML |
| 6 | Logo & app icon design | Design Director | SVG assets |

---

> **Gate:** This brief requires CEO / Design Director approval before handoff to IT for implementation.