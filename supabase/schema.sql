-- Faelight Business Consultancy — Supabase schema
-- Run this in Supabase → SQL Editor → New query → Run.
--
-- The app stores each data set (clients, invoices, tasks, team, settings, …)
-- as one JSON row here, keyed by its store key (e.g. "fae.clients.v1").
-- Row-Level Security ensures only signed-in team members can read/write.

create table if not exists public.app_state (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- Only authenticated (signed-in) users may read or write the shared data.
drop policy if exists "authenticated read"   on public.app_state;
drop policy if exists "authenticated insert" on public.app_state;
drop policy if exists "authenticated update" on public.app_state;
drop policy if exists "authenticated delete" on public.app_state;

create policy "authenticated read"   on public.app_state for select using (auth.uid() is not null);
create policy "authenticated insert" on public.app_state for insert with check (auth.uid() is not null);
create policy "authenticated update" on public.app_state for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete" on public.app_state for delete using (auth.uid() is not null);

-- Keep updated_at fresh on every write.
create or replace function public.touch_app_state() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_state_touch on public.app_state;
create trigger app_state_touch before update on public.app_state
  for each row execute function public.touch_app_state();

-- Optional: live multi-user sync (teammates see each other's changes in real time).
alter publication supabase_realtime add table public.app_state;
