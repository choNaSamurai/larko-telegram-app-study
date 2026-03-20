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

1. **Authentication**:
   - WebApp sends `window.Telegram.WebApp.initData` to Supabase Edge Function `/auth`.
   - Edge Function validates the hash using `BOT_TOKEN`.
   - If valid, Edge Function provides a Supabase JWT mapped to the user's `telegram_id` in `profiles`.

2. **Navigation**:
   - `admin` role navigates to `/admin` dashboard.
   - `worker` role navigates to `/worker/tasks`.

3. **Notifications (Outbound)**:
   - Supabase Webhook on `orders` (insert) -> Edge Function -> Telegram Bot API (`sendMessage`) to `assigned_worker_id`'s `telegram_id`.
   - Similarly for `advances` and `deadline` alerts (scheduled via Cron/pg_cron or external scheduler).

4. **Real-time**:
   - App subscribes to Supabase Realtime for `orders` and `time_logs` to ensure immediate UI feedback when statuses change.
