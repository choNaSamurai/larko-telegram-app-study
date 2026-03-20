# Analysis Report — Security & Architecture

## Security Risk Analysis (TMA)

### 1. `initData` Validation
- **Risk**: Users spoofing Telegram data by passing arbitrary `initData` to the WebApp.
- **Mitigation**: The backend (Supabase functions/Edge Functions) must validate the `initData` hash using the Bot Token. Never trust `initData` sent directly from the client without verification.
- **Mechanism**: Use `hmac-sha256` as per Telegram documentation.

### 2. Role-Based Access Control (RBAC)
- **Risk**: Workers accessing admin financial data or creating orders.
- **Mitigation**: Implement Supabase Row Level Security (RLS) policies based on user roles stored in the `profiles` table.
- **Access Policies**:
  - Workers: Read-only access to their own `orders`, `time_logs`, and `advances`.
  - Admin: Read/Write access to all tables.

## Supabase Architecture

### Database Design
- Relational schema (PostgreSQL) optimized for time-tracking and finance.
- Use of `UUID` for primary keys and `JSONB` for flexible break storage in `time_logs`.
- Enum types for statuses (order_status) and roles (user_role).

### Real-time & Functions
- Enable Supabase Realtime for order status updates.
- Edge Functions for calling Telegram Bot API (notifications).

## Bot Interaction Protocol
- **Flow**: User interacts with bot -> Bot sends button/link to WebApp -> WebApp opens -> WebApp authenticates via `initData` -> WebApp communicates with Supabase.
- **Notifications**: Triggered via Supabase DB Webhooks calling an Edge Function, which then sends messages via the Bot API.
