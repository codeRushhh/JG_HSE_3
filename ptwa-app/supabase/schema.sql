-- ============================================================
-- Joseph Group PTWA — Supabase schema (Phase 2)
-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------
-- 1. Race-safe sequential permit numbering (JG-HSE-PTW-001, 002, ...)
--    A single-row counter table + function so two devices submitting
--    at the same moment can never receive the same number.
-- ---------------------------------------------------------------
create table if not exists permit_counter (
  id int primary key default 1,
  value int not null default 0,
  constraint single_row check (id = 1)
);
insert into permit_counter (id, value) values (1, 0) on conflict (id) do nothing;

create or replace function next_permit_no()
returns int
language sql
security definer
as $$
  update permit_counter set value = value + 1 where id = 1 returning value;
$$;

-- ---------------------------------------------------------------
-- 2. Core permits table — mirrors every field on the PTW form + Register
-- ---------------------------------------------------------------
create table if not exists permits (
  id uuid primary key default uuid_generate_v4(),
  permit_no text unique not null,
  permit_type text not null,
  other_type_spec text,
  job_start_date date,
  job_start_time time,
  expiry_date date,
  expiry_time time,
  building text,
  floor text,
  area text,
  description text,
  company_name text,
  company_contact text,
  company_email text,
  company_address text,
  applicant_name text,
  applicant_contact text,
  applicant_email text,
  receiver_name text,
  receiver_contact text,
  receiver_email text,
  num_workers int,
  num_supervisors int,
  hazards_identified boolean,
  hazards jsonb not null default '[]',
  controls jsonb not null default '[]',
  ppe jsonb not null default '[]',
  applicant_sign_name text,
  applicant_sign_date date,
  issuer_name text,
  issuer_sign_name text,
  issuer_contact text,
  issuer_comments text,
  status text not null default 'Active',
  close_out_at timestamptz,
  closed_by text,
  remarks text,
  verified_by text,
  suspension_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_permits_status on permits(status);
create index if not exists idx_permits_type on permits(permit_type);
create index if not exists idx_permits_created on permits(created_at desc);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_permits_updated_at on permits;
create trigger trg_permits_updated_at
before update on permits
for each row execute function set_updated_at();

-- ---------------------------------------------------------------
-- 3. Attachment metadata — the actual files live in Storage bucket
--    'ptw-attachments'; this table just indexes them per permit.
-- ---------------------------------------------------------------
create table if not exists permit_attachments (
  id uuid primary key default uuid_generate_v4(),
  permit_id uuid references permits(id) on delete cascade,
  name text not null,
  category text,
  file_type text,
  size int,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_attachments_permit on permit_attachments(permit_id);

-- ---------------------------------------------------------------
-- 4. Row Level Security
--    Single HSE login → one authenticated Supabase Auth user.
--    Any authenticated session gets full access; anonymous gets none.
-- ---------------------------------------------------------------
alter table permits enable row level security;
alter table permit_attachments enable row level security;
alter table permit_counter enable row level security;

create policy "HSE full access - permits"
on permits for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "HSE full access - attachments"
on permit_attachments for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "HSE full access - counter"
on permit_counter for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------
-- 5. Storage bucket for attached documents / photos
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ptw-attachments', 'ptw-attachments', false)
on conflict (id) do nothing;

create policy "HSE read attachments"
on storage.objects for select
using (bucket_id = 'ptw-attachments' and auth.role() = 'authenticated');

create policy "HSE upload attachments"
on storage.objects for insert
with check (bucket_id = 'ptw-attachments' and auth.role() = 'authenticated');

create policy "HSE delete attachments"
on storage.objects for delete
using (bucket_id = 'ptw-attachments' and auth.role() = 'authenticated');

-- ============================================================
-- Done. Next steps (see README.md "Phase 2 — Supabase" section):
--   1. Authentication → Users → Add user
--        email:    hse@josephgroup.app
--        password: 2526
--        (auto-confirm the email)
--   2. Project Settings → API → copy the Project URL and anon public key
--   3. Add them as Netlify environment variables:
--        VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
-- ============================================================
