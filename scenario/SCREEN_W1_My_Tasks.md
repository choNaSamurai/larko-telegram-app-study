# SCREEN_W1_My_Tasks — System Analyst Scenario

## 1. Screen Overview
This screen is the primary home interface for the Worker role in the Larko Telegram Mini App. It provides a vertical feed of active and completed orders assigned specifically to the authenticated worker. Its purpose is to give the worker a quick overview of their current workload, deadlines, and basic task details, acting as the starting point for daily operations.

## 1.1 Figma Designs
- **Screen (Primary)**: [W1-screen-primary](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4556&m=dev), [W1-screen-secondary](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=194-6622&m=dev)
- **Loading State**: [W1-loading-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4885&m=dev), [W1-loading-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4931&m=dev)
- **Empty State**: [W1-empty-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4795&m=dev), [W1-empty-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=74-4839&m=dev)
- **Error State**: [W1-error-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6218&m=dev), [W1-error-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=83-6262&m=dev)
- **Company Switcher**: [Switcher-1](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=90-8571&m=dev), [Switcher-2](https://www.figma.com/design/woOZkYwuAowPdLzmi4LgXG/Larko-Design?node-id=90-8503&m=dev)

## 2. Actors
- **Worker**: The primary user who views and interacts with their tasks.
- **System**: The backend that provides the order data and manages status updates.
- **Telegram/TMA Platform**: The host environment for the application.

## 3. Entry Conditions (Pre-conditions)
- User must be authenticated in Telegram.
- User must be registered in the Larko system as a Worker (or Manager/Owner acting as a worker).
- User must be a member of at least one active company.

## 4. Main Flow (Happy Path)
1. Worker opens the Telegram Mini App.
2. System identifies the user and their active company context.
3. System fetches the list of active orders assigned to this worker.
4. Screen displays a vertical feed of Order Cards (Card 1, 4, 8, etc.) within the "Active" filter (default).
5. Worker scrolls through the tasks to view names, company info, addresses, and deadlines.
6. Worker can tap an Order Card to navigate to the Order Hub (W2) for detailed log entry.

## 5. Alternative Flows
- **5.1 Switch to Completed Tasks**: User taps the filter (Active/Completed) to view orders they have already finished.
- **5.2 Multiple Companies**: If a worker belongs to multiple companies, they use the Company Switcher in the header to change the context and view tasks for a different employer.
- **5.3 No Active Tasks**: If no orders are assigned, the system displays the "Empty State" (W1-screen-empty).

## 6. Edge Cases & Error States
- **6.1 Data Load Failure**: If the API call fails (timeout/network), show the "Error State" (W1-error) with a "Try Again" button.
- **6.2 Overdue Tasks**: If a task deadline is overdue or for "tomorrow", the deadline text/icon is highlighted (BRD requirement, though Figma shows generic teal/white status).
- **6.3 Unauthorized Access**: If the user's role was changed to Deactivated, they lose access to this screen immediately.

## 7. UI Elements & States
| Element | Type | States | Behavior | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Header** | Component | Default | Shows "Мої замовлення" and Company Switcher | N/A |
| **Filter Tabs** | Tab Bar | Active, Completed | Filters the list by order status | N/A |
| **Order Card** | Component | Default, Pressed | Displays task summary; Tap to open details | N/A |
| **Status Badge** | Badge | Success, Warning, Info, Blocked | High-level status indicator (New, In Progress, etc.) | N/A |
| **Deadline** | Label | Normal, Overdue (Red) | Shows "До [Date]" | N/A |
| **Notes Preview** | Text Block | Default | Preview of manager instructions | N/A |
| **Main Button** | Button | Default | "Open" or "Add Log" action | N/A |
| **Bottom Navigation** | Nav Bar | Tasks (Active) | Standard TMA navigation (Tasks, Balance, Profile) | N/A |

## 8. Screen States
| State | Trigger | Visual Behavior |
| :--- | :--- | :--- |
| **Loading** | On screen entry | Shows 3 pulsing skeleton cards (W1-loading) |
| **Empty** | No orders found | Shows illustration + "Немає активних завдань 🎉" (W1-screen-empty) |
| **Error** | API failure | Shows error icon + "Помилка завантаження" + "Спробувати знову" (W1-error) |
| **Populated** | Data received | Displays the feed of Order Cards (W1-screen-primary) |

## 9. Business Rules
- **Rule #1 (BRD 2.0.150)**: Worker sees only orders assigned specifically to them.
- **Rule #2 (BRD 2.0.158)**: Deadline must be highlighted in red if tomorrow or overdue.
- **Rule #3 (BRD 2.0.164)**: Default view is "Active" orders.
- **Rule #4**: Order cost displayed on the card is locked at creation (Rate Snapshot rule).

## 10. Integrations & API Contracts
| Endpoint | Method | Request | Response | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET /worker/orders` | GET | `companyId`, `filter: active|completed` | List of Order objects | 401, 403, 500 |

## 11. Non-Functional Requirements
- **Performance**: Feed should load within <2s on 4G connection.
- **Offline**: Support basic offline caching (view last loaded list) with "Offline" indicator.
- **Accessibility**: Touch targets for cards and buttons must be >= 48px.

## 12. Open Questions
- Should the "Completed" filter show orders completed within a certain timeframe (e.g., last 30 days) or all time?
- Are the "Routes" (solar:route-bold) icons supposed to open Google/Apple Maps immediately or just provide the address?
- Does the "Add" button (on Card 4 in dark theme) open the Add Time bottom sheet directly or go to the Hub first?

## 13. Proposed Improvements (PENDING APPROVAL)
- [ ] Add a "Quick Log" button to the card to allow 8h entry without opening the Hub.
- [ ] Add a search bar to filter tasks by name/client directly on the feed.
