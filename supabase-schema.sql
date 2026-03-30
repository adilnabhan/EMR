-- Hospital ERP Supabase Schema
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============ PATIENTS ============
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER DEFAULT 0,
  aadhaar TEXT DEFAULT '',
  blood_group TEXT DEFAULT '',
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ROOMS ============
CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_day INTEGER NOT NULL DEFAULT 2000,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied'))
);

-- Insert 9 default rooms
INSERT INTO rooms (name, price_per_day, status) VALUES
  ('Room 101', 2000, 'available'),
  ('Room 102', 2000, 'available'),
  ('Room 103', 2500, 'available'),
  ('Room 201', 3000, 'available'),
  ('Room 202', 3000, 'available'),
  ('Room 203', 3500, 'available'),
  ('Room 301', 4000, 'available'),
  ('Room 302', 4500, 'available'),
  ('Room 303', 5000, 'available');

-- ============ BOOKINGS ============
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE SET NULL,
  room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
  days INTEGER NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL DEFAULT 0,
  advance NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TREATMENTS ============
CREATE TABLE IF NOT EXISTS treatments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE
);

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'advance' CHECK (type IN ('advance', 'final')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ LEADS ============
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  enquiry TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'follow-up', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ EMPLOYEES ============
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ROW LEVEL SECURITY (optional, disable for now) ============
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (for dev)
CREATE POLICY "Allow all on patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on treatments" ON treatments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
