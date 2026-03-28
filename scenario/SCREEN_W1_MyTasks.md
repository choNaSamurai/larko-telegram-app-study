# scenario/SCREEN_W1_MyTasks.md

# 👷 Screen: My Tasks (W1)

**Screen ID**: `W1`  
**Role**: `Worker`  
**Figma Node**: `77:5261` (Section: W1: Мої замовлення)  
**BRD Reference**: `Section 150 - 152 (My Tasks)`  
**Route**: `/tasks` (Home)

---

## 1. Goal
Provide the Worker with a clear, real-time feed of their assigned tasks and orders, allowing them to track progress, see deadlines, and navigate to the Order Hub for data entry.

---

## 2. Actors
- **Worker**: Primary user who views and executes tasks.

---

## 3. Main Flow (Happy Path)
1. Worker opens the Telegram Mini App (TMA).
2. The system loads the **My Tasks (W1)** screen by default.
3. System fetches "Active" tasks from the backend.
4. Worker sees the vertical feed of tasks sorted by deadline (urgency).
5. Worker taps on a **Task Card** [figma: 74:4574] to navigate to the **Order Hub (W2)**.

---

## 4. Alternate Flows & Edge Cases
### A. Filter: Completed Tasks
1. Worker toggles the **Switcher** [figma: 109:7890] to "Completed".
2. System fetches tasks with status `DONE`.
3. Feed updates with historical data.

### B. Deadline Urgency
1. If a task's deadline is **today**, **tomorrow**, or **overdue**, the deadline label [figma: 74:4588] is highlighted in **red**. (BRD 158)

### C. Company Switching
1. Worker uses the **Header Switcher** [figma: 109:7890] to change the active company.
2. The screen refreshes all data scoped to the new company.

---

## 5. Navigation
- **Incoming**: From Splash screen (auto) or via Bottom Navigation "Tasks".
- **Outgoing**:
  - `Task Card Tap` -> `/tasks/:id` (Order Hub W2).
  - `Bottom Nav` -> `/balance` (W3) or `/profile` (W4).

---

## 6. Functional Requirements (Acceptance Criteria)
### AC 1: Task Feed (List View)
- [ ] Display a vertical scrollable list of tasks.
- [ ] Handle pagination if the list is long (BRD alignment).
- [ ] Display "Active" tasks by default (Statuses: `NEW`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`).

### AC 2: Task Card Details [figma: 74:4574]
- [ ] **Order Name/Number**: Display name and number (if available). [figma: 74:4577]
- [ ] **Type**: Icon and label for product/service type.
- [ ] **Company/Client**: Display the client name. [figma: 192:6201]
- [ ] **Address**: Display site address. [figma: 192:6207]
- [ ] **Status Badge**: Display color-coded status (e.g., Success for Done, Warning for In Progress). [figma: 110:8336]
- [ ] **Notes**: Preview first 2 lines of instructions. [figma: 111:8631]
- [ ] **Deadline**: Display date. Apply red text if the date is $\le$ (Today + 1 day). [figma: 74:4588]
- [ ] **Financials**: Display earned amount for this task. [figma: 74:4597]

### AC 3: Filtering [figma: 109:7890]
- [ ] Implement a switcher/tab for `Active` and `Completed`.
- [ ] **Programmatic Enum**: `filter` values: `['active', 'completed']`, default: `'active'`.

### AC 4: Screen States [figma: 83:6218]
- [ ] **Loading**: Show skeleton screen (skeleton cards). [figma: 74:4885]
- [ ] **Empty (Active)**: Visual illustration + "Немає активних завдань 🎉". [figma: 74:4850]
- [ ] **Empty (Completed)**: Visual illustration + "No completed orders yet".
- [ ] **Error**: Show error message + "Спробувати знову" button. [figma: 83:6231]

---

## 7. UI Elements & Components
- **Container**: `div.px-4` [figma: 110:8257]
- **Filter Bar**: `Component 14` [figma: 109:7890] (Switcher)
- **OrderCard**: `Card 1` [figma: 74:4574] (Reusable component)
- **StatusBadge**: `span.text-l-status-success` [figma: 110:8336]
- **DeadlineLabel**: `span` [figma: 74:4587]
- **AvatarStack**: `Frame 21` [figma: 112:9100] (Icons of assigned workers)

---

## 8. Status Definitions (BRD Mapping)
| Status | Code Value | Color (UX) | Description |
|:-------|:-----------|:-----------|:------------|
| New | `NEW` | Teal/Pale | Not yet started |
| In Progress | `IN_PROGRESS` | Yellow | Work active |
| In Review | `IN_REVIEW` | Blue | Worker marked "Done", Manager reviewing |
| Done | `DONE` | Green | Task finalized and closed |
| Blocked | `BLOCKED` | Red/Yellow | Operational issue reported (BRD 248) |

---

## 9. API Contract Requirements
- **Endpoint**: `GET /api/tasks`
- **Query Params**:
  - `status_category`: `active` or `completed`
  - `company_id`: `string` (Current context)
- **Response Shape**:
  ```typescript
  interface Task {
    id: string;
    order_number?: string;
    product_type: string;
    client_name: string;
    address: string;
    deadline: ISO8601;
    status: 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
    notes_preview: string;
    earned_amount: number;
    worker_avatars: string[];
    is_urgent: boolean; // Computed or derived
  }
  ```

---

## 10. i18n Considerations
- Labels for "Update", "Try Again", "No active tasks", "Active", "Completed".
- Status labels translation.
- Date formatting (Ukrainian locale by default).

---

## 11. Open Questions
1. [NON-BLOCKING] Should we support pull-to-refresh for the task feed? (UX Best Practice for TMA).
2. [NON-BLOCKING] If there are 100+ tasks, do we implement infinite scroll or standard pagination?
3. [BLOCKING] How do we handle the "Lead Worker" (BRD 293/636) badge visibility on this card if relevant?

---

## 12. Proposed Improvements
1. **Offline Mode**: Cache the "Active" tasks list in local storage so the screen opens instantly even with poor connectivity.
2. **Push Notifications**: Deep link from a Telegram notification (New Task) directly to W1 or W2.
