-- ============================================================
-- RUN THIS in Supabase → SQL Editor → New query → Run
-- (project: faelightbiz). It creates the public sign-up inbox
-- so website registrations/bookings/feedback/inquiries reach
-- the admin. Safe to run more than once.
-- ============================================================
create table if not exists public.public_submissions (
  id          text primary key,
  kind        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.public_submissions enable row level security;

drop policy if exists "public insert"        on public.public_submissions;
drop policy if exists "authenticated read"   on public.public_submissions;
drop policy if exists "authenticated delete" on public.public_submissions;

create policy "public insert" on public.public_submissions
  for insert to anon, authenticated with check (true);
create policy "authenticated read" on public.public_submissions
  for select using (auth.uid() is not null);
create policy "authenticated delete" on public.public_submissions
  for delete using (auth.uid() is not null);
