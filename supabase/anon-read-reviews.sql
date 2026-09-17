-- ============================================================
-- RUN THIS in Supabase → SQL Editor → New query → Run (project: faelightbiz)
--
-- Lets the PUBLIC (anonymous) site read the published testimonials row so real
-- reviews appear on the homepage and /testimonials page for every visitor —
-- not just when signed in as admin.
--
-- Only APPROVED reviews are ever shown (the site filters by status), and a
-- testimonial is public content by design. No secrets live in this row.
-- Additive policy — does not change any existing rule. Safe to run twice.
-- ============================================================
drop policy if exists "anon read reviews" on public.app_state;

create policy "anon read reviews" on public.app_state
  for select
  to anon
  using (key = 'fae.reviews.v1');
