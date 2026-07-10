-- ============================================================
-- Joseph Group HSE Portal — Supabase setup (fresh project)
-- Run this once in your NEW Supabase project's SQL Editor
-- ============================================================

-- Shared table used by all three apps (Joseph Group, JGM, JA Installation).
-- Each app prefixes its keys ("jg:", "jgm:", "ja:") so they never collide.
create table if not exists kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- Allow the app's public anon key to read/write.
alter table kv_store enable row level security;

drop policy if exists "public read" on kv_store;
create policy "public read" on kv_store for select using (true);

drop policy if exists "public write" on kv_store;
create policy "public write" on kv_store for insert with check (true);

drop policy if exists "public update" on kv_store;
create policy "public update" on kv_store for update using (true);

drop policy if exists "public delete" on kv_store;
create policy "public delete" on kv_store for delete using (true);

-- That's it — no data migration needed since this is a brand new project.
-- Check it worked any time with:
-- select key, updated_at from kv_store order by updated_at desc;
