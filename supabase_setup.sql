-- ============================================================
-- Joseph Group HSE Portal — Supabase setup
-- Run this ONCE in your existing PTWA Supabase project's SQL Editor.
--
-- Safe to run even though PTWA's tables already exist in this
-- project — every statement below uses "if not exists" / "on
-- conflict do nothing", so it will not touch or duplicate any of
-- your existing PTWA data. It only ADDS the one new table that
-- Joseph Group Inspections, JGM, and JPTS need.
-- ============================================================

-- ---------------------------------------------------------------
-- PART 1 — shared key/value table used by:
--   Joseph Group Inspections (keys prefixed "jg:")
--   JGM                       (keys prefixed "jgm:")
--   JPTS / JA Installation    (keys prefixed "ja:")
-- ---------------------------------------------------------------
create table if not exists kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table kv_store enable row level security;

drop policy if exists "public read" on kv_store;
create policy "public read" on kv_store for select using (true);

drop policy if exists "public write" on kv_store;
create policy "public write" on kv_store for insert with check (true);

drop policy if exists "public update" on kv_store;
create policy "public update" on kv_store for update using (true);

drop policy if exists "public delete" on kv_store;
create policy "public delete" on kv_store for delete using (true);

-- ---------------------------------------------------------------
-- PART 2 — PTWA's tables (included here so a brand-new project
-- can be set up with ONE script too). If you're running this in
-- your existing PTWA project, everything below already exists and
-- these statements will simply do nothing.
-- ---------------------------------------------------------------
create extension if not exists "uuid-ossp";

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

alter table permits enable row level security;
alter table permit_attachments enable row level security;
alter table permit_counter enable row level security;

-- PTWA no longer uses Supabase Auth (see PART 3 note below for why) — it
-- uses a fixed department password checked inside the app, same as JGM
-- and JA Installation. Data access uses the shared anon key, so these
-- policies are open, matching kv_store's policies above.
drop policy if exists "HSE full access - permits" on permits;
drop policy if exists "Open access - permits" on permits;
create policy "Open access - permits"
on permits for all
using (true)
with check (true);

drop policy if exists "HSE full access - attachments" on permit_attachments;
drop policy if exists "Open access - attachments" on permit_attachments;
create policy "Open access - attachments"
on permit_attachments for all
using (true)
with check (true);

drop policy if exists "HSE full access - counter" on permit_counter;
drop policy if exists "Open access - counter" on permit_counter;
create policy "Open access - counter"
on permit_counter for all
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('ptw-attachments', 'ptw-attachments', false)
on conflict (id) do nothing;

drop policy if exists "HSE read attachments" on storage.objects;
drop policy if exists "Open read attachments" on storage.objects;
create policy "Open read attachments"
on storage.objects for select
using (bucket_id = 'ptw-attachments');

drop policy if exists "HSE upload attachments" on storage.objects;
drop policy if exists "Open upload attachments" on storage.objects;
create policy "Open upload attachments"
on storage.objects for insert
with check (bucket_id = 'ptw-attachments');

drop policy if exists "HSE delete attachments" on storage.objects;
drop policy if exists "Open delete attachments" on storage.objects;
create policy "Open delete attachments"
on storage.objects for delete
using (bucket_id = 'ptw-attachments');

-- ---------------------------------------------------------------
-- PART 3 — REMOVED. This used to create/reset a Supabase Auth user
-- (hse@josephgroup.app) directly in auth.users so PTWA could log in
-- with password 2526. That's exactly what kept breaking: every time
-- PTWA pointed at a different Supabase project, that user didn't
-- exist there, so login failed with "Incorrect password, or unable
-- to reach the server." PTWA's password is now checked inside the
-- app itself (like JGM/JA Installation), so no database user is
-- needed at all — it will work in any Supabase project as long as
-- PART 1 and PART 2 above have been run in it.
-- ---------------------------------------------------------------

-- ============================================================
-- Done. Check it worked any time with:
-- select key from kv_store order by updated_at desc limit 10;
-- select permit_no, status from permits order by created_at desc limit 10;
-- ============================================================
