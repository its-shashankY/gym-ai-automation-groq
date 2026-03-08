-- ═══════════════════════════════════════════════════════════════
-- GYM AI AUTOMATION — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Members table
create table if not exists members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text unique not null,
  email         text,
  plan          text default 'basic',   -- basic | standard | premium
  status        text default 'active',  -- active | inactive | expired
  join_date     timestamptz default now(),
  expiry_date   timestamptz,
  last_visit    timestamptz default now(),
  visit_count   int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Leads table
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  phone         text unique not null,
  email         text,
  goal          text,
  budget        text,
  status        text default 'new',  -- new | qualified | trial_booked | converted | lost
  source        text default 'whatsapp',
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid references members(id) on delete set null,
  phone          text,  -- for non-members / leads
  class_type     text,  -- Zumba | Yoga | Cardio | PT | CrossFit
  class_datetime timestamptz,
  summary        text,  -- AI-generated summary
  status         text default 'confirmed',  -- confirmed | pending | cancelled | completed
  reminder_sent  boolean default false,
  created_at     timestamptz default now()
);

-- Conversations table (AI chat history)
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  role        text not null,   -- user | assistant
  message     text not null,
  created_at  timestamptz default now()
);
create index if not exists conv_phone_idx on conversations(phone);
create index if not exists conv_time_idx  on conversations(created_at);

-- Reminders table (log of all automated messages)
create table if not exists reminders (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid references members(id) on delete set null,
  type        text,    -- expiry_7d | expiry_3d | expiry_1d | class_24h | inactive | review
  phone       text,
  message     text,
  status      text default 'sent',  -- sent | failed | skipped
  sent_at     timestamptz default now()
);

-- ── Seed demo data ───────────────────────────────────────────────────
insert into members (name, phone, email, plan, status, expiry_date, visit_count) values
  ('Rahul Sharma',    '+919876543210', 'rahul@email.com',   'premium',  'active',   now() + interval '30 days',  42),
  ('Priya Patel',     '+918765432109', 'priya@email.com',   'standard', 'active',   now() + interval '10 days',  18),
  ('Amit Kumar',      '+917654321098', 'amit@email.com',    'basic',    'active',   now() + interval '3 days',    8),
  ('Sneha Reddy',     '+916543210987', 'sneha@email.com',   'premium',  'inactive', now() - interval '10 days',  31),
  ('Vikram Singh',    '+915432109876', 'vikram@email.com',  'standard', 'active',   now() + interval '45 days',  55)
on conflict (phone) do nothing;

insert into leads (name, phone, goal, status) values
  ('Arjun Mehta',    '+919123456789', 'Weight Loss',      'new'),
  ('Kavya Nair',     '+918012345678', 'Muscle Building',  'qualified'),
  ('Ravi Teja',      '+917901234567', 'General Fitness',  'trial_booked'),
  ('Meena Pillai',   '+916890123456', 'Weight Loss',      'converted')
on conflict (phone) do nothing;

-- ── Enable Row Level Security (optional for demo) ────────────────────
-- alter table members enable row level security;
-- alter table leads enable row level security;
-- For demo, leave RLS disabled so backend can access without JWT

select 'Schema installed successfully! 🎉' as status;
