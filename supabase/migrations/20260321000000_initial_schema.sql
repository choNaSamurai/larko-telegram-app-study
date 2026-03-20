-- Initial Migration: WorkTracker Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'worker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order Status Enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('new', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Model Enum
DO $$ BEGIN
    CREATE TYPE payment_model AS ENUM ('per_unit', 'per_hour');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'worker',
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Types Table
CREATE TABLE IF NOT EXISTS product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    unit_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
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
    unit_rate NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Logs Table
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE,
    work_start TIME NOT NULL,
    work_end TIME NOT NULL,
    breaks JSONB DEFAULT '[]'::jsonb,
    net_hours NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT one_log_per_day_per_order UNIQUE (order_id, log_date)
);

-- Advances Table
CREATE TABLE IF NOT EXISTS advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Draft)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Further detailed policies will be implemented during the execution stage.
