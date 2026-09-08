-- ============================================================
-- RUN THIS in Supabase → SQL Editor → New query → Run (project: faelightbiz)
--
-- Lets the PUBLIC (anonymous) site read the business settings row so the
-- registration & booking pages reflect what admin configures:
--   • Pay-now link + real GCash/bank details + QR
--   • EmailJS keys (needed to actually SEND the confirmation email — the send
--     happens client-side on the public page)
--
-- All of these values are client-safe: they're shown on public pages or used
-- by the browser directly. No secret/service-role keys live in settings.
-- Additive policy — does not change any existing rule. Safe to run twice.
-- ============================================================
drop policy if exists "anon read settings" on public.app_state;

create policy "anon read settings" on public.app_state
  for select
  to anon
  using (key = 'fae.settings.v1');
