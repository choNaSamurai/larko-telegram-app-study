# Scenario: SCREEN_W1_MyTasks

## §1. Overview
The "My Tasks" screen is the primary interface for workers in the Larko Telegram Mini App. It provides a vertical feed of orders/tasks assigned to the currently authenticated worker, allowing for filtering by activity status and navigation to task details (Order Hub).

## §2. Actors
- **👷 Worker**: Primary user who views and manages their tasks.
- **👔 Manager/Owner**: Can also view this screen if they have worker assignments in the company.

## §3. Pre-conditions
- User is authenticated via Telegram.
- User is joined to at least one company.
- A company is selected as the active working context.

## §4. Main Flow
1. User opens the Larko Mini App.
2. System identifies the active company context.
3. System fetches the list of active tasks assigned to the user.
4. User views the list of task cards.
5. User can toggle between **Active** and **Completed** tasks.
6. User can tap any task card to navigate to the Order Hub (W2).

## §5. Alternative Flows
- **A1: No Tasks Found**: If the user has no tasks in the current filter, the "Empty State" is shown.
- **A2: Switching Company**: User taps the Company Switcher in the header to change the context. The task list refreshes for the new company.

## §6. Edge Cases
- **Overdue Tasks**: Tasks with a deadline in the past or tomorrow must be visually highlighted.
- **Multiple Companies**: User belongs to 2+ companies; must be able to switch between them seamlessly.
- **Offline Access**: Tasks should be cached for offline viewing if previously loaded.

## §7. UI Elements
- **Company Switcher [figma: 90:8503]**:
    - Type: Dropdown / Menu
    - Label: Current Company Name + Industry Icon
    - States: Default, Open
- **Status Filter [figma: 74:4941]**:
    - Type: Toggle / Segmented Control
    - Options: `active` [default], `completed`
    - Logic: `active` maps to status (New, In Progress, Blocked, In Review). `completed` maps to Done.
- **Task Card [figma: 74:4946]**:
    - Fields:
        - Order Name/Number [figma: 74:4947]
        - Product Type Icon + Label [figma: 74:4948]
        - Client Name (Optional)
        - Quantity / Estimated Hours
        - Deadline [figma: 74:4949]
        - Status Badge
- **Status Badge**:
    - Values: `NEW`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED` (from BRD 2.0.159)
- **Bottom Navigation [figma: 104:5831]**:
    - Tabs: `Tasks` [active], `Balance`, `Profile`.

## §8. Screen States
- **Loading [figma: 74:4931]**: Show skeleton loaders for task cards.
- **Empty-Ever [figma: 74:4839]**:
    - Message: "You have no active orders 🎉" or "No completed orders yet".
- **Error [figma: 83:6262]**:
    - Message: "Failed to load tasks. Please try again."
    - Action: `[Retry]` button.

## §9. Business Rules
- **BRD 2.0.153**: Vertical feed of orders assigned to the worker.
- **BRD 2.0.158**: Deadline highlight in red if deadline is tomorrow or overdue.
- **BRD 2.0.165**: Distinct empty states for active vs completed tabs.

## §10. API Contracts
- **GET /tasks**:
    - Params: `company_id`, `status_group` (active|completed)
    - Response: `Array<Task>`
- **GET /companies**:
    - Response: `Array<Company>`

## §11. Data Models
```typescript
interface Task {
  id: string;
  orderNumber?: string;
  productType: string;
  clientName?: string;
  quantity: number;
  deadline: string; // ISO date
  status: 'NEW' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
}
```

## §12. Open Questions
1. [NON-BLOCKING] Should we implement pull-to-refresh for the task list?
2. [NON-BLOCKING] Is there a maximum number of tasks to load per page (pagination)?

## §13. Proposed Improvements
- Add a search bar for tasks if the list grows large.
- Show a count badge on the "Active" filter tab.
