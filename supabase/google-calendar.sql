-- ============================================================
-- RUN THIS in Supabase → SQL Editor → New query → Run (project: faelightbiz)
--
-- Stores the Google Calendar connection (a single row). The refresh token is a
-- secret: RLS is ON with NO policies, so the browser (anon/authenticated) can
-- NEVER read it — only the server's service-role key can. Safe to run twice.
-- ============================================================
create table if not exists public.google_integration (
  id            text primary key default 'default',
  refresh_token text not null,
  email         text,
  calendar_id   text not null default 'primary',
  updated_at    timestamptz not null default now()
);

alter table public.google_integration enable row level security;
-- (No policies on purpose — only the service-role key bypasses RLS.)
