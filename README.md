# Faelight Business Consultancy — Web App (Demo)

An elegant-but-enchanted marketing site, booking system and internal admin
for **Faelight Business Consultancy** (founder: Maria "Maia" Castañeda).

> *Systems that create freedom. People who can run them.*
> *People first. Systems second. Magic throughout.*

This is a **self-contained demo**. It runs instantly with no accounts, API
keys or cloud services. All data persists in the browser (localStorage), the
booking calendar + availability are realistically **simulated**, and
confirmation "emails" are shown on screen. It's structured (see `src/lib/*`)
so real Supabase / Google Calendar / Resend drop in later without a redesign.

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000** (this repo's dev server runs on **3004**).

- Public site: `/`
- Booking: `/book`
- Admin: `/admin` — demo password **`faelight-demo`**
  (sign in as **Maia** for the admin view, or a teammate for the team view)

To reset all demo data, use **↺ Reset demo data** in the admin sidebar.

---

## What's built (all 4 phases)

### Phase 1 — Foundation & public site
- Design system: deep-forest / twilight-purple / firefly-gold / parchment,
  Fraunces + Inter fonts, star motifs, firefly glows, `prefers-reduced-motion`.
- Landing page (hero, three sub-brands, why-Faelight, founder, how-we-work,
  pricing teaser, "where clients fit", testimonials, CTA).
- Sub-brand pages `/mentoring` `/systems` `/experiences` (double as web brochures).
- `/pricing`, `/about` (founder + full team), `/contact`.
- Inquiry form → creates a lead + captures UTM params; alert simulated.

### Phase 2 — Booking (core feature)
- Multi-step `/book`: booking type → date → live slot → details → confirm.
- **Simulated availability engine** (`src/lib/calendar.ts`) stands in for
  Google Calendar FreeBusy — deterministic busy blocks + real bookings, with
  configurable working hours, buffer, min-notice and max-advance.
- Race handling: re-checks the slot before confirming ("that slot was just
  snapped up"). Google Meet link generated. Degrades to inquiry form if the
  (simulated) Google connection is off.

### Phase 3 — Admin (`/admin`)
- Demo auth with roles: **admin** (Maia, Owner) and **team** (Sassa, Kenny,
  Kits, Dor, Josh). Team can't see Settings.
- Dashboard KPIs + Recharts: new leads, pipeline funnel, leads by sub-brand,
  upcoming bookings, top sources, conversion journey, week/month/quarter filter.
- Leads pipeline (filters, search) + lead detail (status, timestamped notes,
  linked bookings). Bookings management (status, cancel). Services editor
  (persists edits locally). Settings (booking rules, Google connection toggle,
  payment instructions, notify email, team accounts).

### Phase 4 — Brochures & polish
- `/brochures` hub → print-optimised A4 brochures at `/brochure/{slug}` and
  `/brochure/all`, generated from the same content, with a **scannable QR**
  (`src/lib/qr.ts`, dependency-free) to `/book`. Sub-brand pages print cleanly too.
- SEO metadata + OpenGraph per page, SVG favicon, themed 404, fully responsive.

---

## Going live — accounts & env vars

The demo needs none of these. When you're ready for production, copy
`.env.example` → `.env.local` and fill in:

| Service | Vars | Why |
|---|---|---|
| **Supabase** (free) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Postgres + Auth for admin/team; tables per `spec §8`. Swap `src/lib/store.ts` + `src/lib/auth.ts`. |
| **Google Cloud** (free) | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI` | Calendar FreeBusy + event creation. Swap `generateBusyBlocks()` in `src/lib/calendar.ts` for a FreeBusy call. Scopes: `calendar.readonly` + `calendar.events`. |
| **Resend** (free) | `RESEND_API_KEY`, `NOTIFY_EMAIL` | Booking + inquiry emails. Send at the points marked *"Demo note"* in the UI. |

Deploy target: **Vercel** (free tier). `npm run build` passes clean.

---

## Assets to drop in later
Logo + Maia's painterly fae-forest artwork. The hero/section backdrops use
elegant glow/gradient placeholders (`src/components/Motifs.tsx`) built so art
slots in without a redesign.

## Tech
Next.js 14 (App Router, TS) · Tailwind · Recharts · localStorage · zero paid deps.
