# Strategy Plan — Database & Interaction Protocol

## Database Schema (SQL Migration Draft)

```sql
-- Role Enum
CREATE TYPE user_role AS ENUM ('admin', 'worker');

-- Order Status Enum
CREATE TYPE order_status AS ENUM ('new', 'in_progress', 'done');

-- Payment Model Enum
CREATE TYPE payment_model AS ENUM ('per_unit', 'per_hour');

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'worker',
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Types Catalog
CREATE TABLE product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    unit_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    product_type_id UUID REFERENCES product_types(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    work_start_date DATE,
    deadline DATE,
    assigned_worker_id UUID REFERENCES profiles(id),
    status order_status DEFAULT 'new',
    payment_model payment_model DEFAULT 'per_unit',
    unit_rate NUMERIC(10, 2), -- Snapshot of product_type.unit_rate at creation
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Logs Table
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    log_date DATE DEFAULT CURRENT_DATE,
    work_start TIME NOT NULL,
    work_end TIME NOT NULL,
    breaks JSONB DEFAULT '[]'::jsonb, -- Array of {start, end}
    net_hours NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT one_log_per_day_per_order UNIQUE (order_id, log_date)
);

-- Advances Table
CREATE TABLE advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES profiles(id),
    amount NUMERIC(10, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Bot/WebApp Interaction Protocol

### 1. Authentication & Security
- **Current (Local)**:
    - Identify user via `window.Telegram.WebApp.initDataUnsafe.user.id`.
    - Match ID against `localStorage` profiles.
- **Target (Secure)**:
    - WebApp sends `window.Telegram.WebApp.initData` to backend.
    - Backend validates `hash` using `HMAC-SHA256` with `BOT_TOKEN`.
    - Map verified `telegram_id` to Supabase JWT.

### 2. Interaction Protocol
- **UX Integration**:
    - **Haptic Feedback**: Trigger `impactOccurred` or `notificationOccurred` via `Telegram.WebApp.HapticFeedback` on:
        - Successful data submission (Log/Order).
        - Status changes.
        - Tab navigation.
    - **Main Button**: Map `Telegram.WebApp.MainButton` to primary actions (Submit, Create) for a consistent TMA feel.

- **Data Stability & Performance**:
    - **Caching (React Query)**: Wrap `dataService` calls in `useQuery`/`useMutation`. Use `staleTime` to reduce unnecessary local/remote reads.
    - **Error Boundaries**: Wrap role-specific dashboards in React Error Boundaries to prevent total app failure on storage corruption.

### 3. Notifications (Outbound)
- **Status Update**: Triggered on `orders.status` change -> Notify worker.
- **Finance**: Notify worker on `advances` entry.
- **Alerts**: Deadline reminders (scheduled).
