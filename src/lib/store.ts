// =====================================================================
// Demo data store — persists in localStorage. Mirrors the leads /
// lead_notes / bookings / settings tables from spec §8. In production
// these are Supabase tables written via server actions.
// =====================================================================
"use client";

import { CategorySlug, SessionItem, SessionPromo, SessionDay, SESSIONS, Service, SERVICES, offeringKind, BookingType, BOOKING_TYPES, TeamMember, TEAM, FOUNDER, PROJECT_TEAMS, ProjectTeam, LEAD_SOURCES } from "./content";
export type { ProjectTeam } from "./content";
import { pushKey } from "./sync";
import { POOL_SEED } from "./poolData";
import { CLIENT_SEED } from "./clientData";

export type { SessionItem, SessionPromo, SessionDay };
export { DEFAULT_REGISTER_FORM, DEFAULT_FEEDBACK_FORM, DAY_ICONS } from "./content";

// Lead statuses double as Kanban columns and are admin-editable (add / rename /
// remove), so the type is an open string. DEFAULT_LEAD_STATUSES is the seed; the
// live list lives in localStorage via getLeadStatuses().
export type LeadStatus = string;
export const DEFAULT_LEAD_STATUSES: string[] = [
  "new",
  "contacted",
  "discovery booked",
  "proposal sent",
  "won",
  "lost",
];
export const LEAD_STATUSES: string[] = DEFAULT_LEAD_STATUSES; // back-compat alias

export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no-show";
// unpaid → submitted (client uploaded proof) → paid (verified by admin) / waived
export type PaymentStatus = "unpaid" | "submitted" | "paid" | "waived";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  categorySlug?: CategorySlug | null;
  serviceId?: string | null;
  message: string;
  source: string; // "how did you hear"
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  agreedToUpdates: boolean;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  author: string;
  note: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  leadId: string | null;
  bookingTypeId: string;
  bookingTypeName: string;
  startsAt: string;
  endsAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  agenda: string;
  meetLink: string;
  status: BookingStatus;
  feeLabel?: string; // e.g. "₱2,500 — payable after confirmation"
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  paymentMethod?: string; // GCash / bank transfer / cash
  paidAt?: string;
  proofUrl?: string; // data: URL of the client's proof-of-payment screenshot
  proofSubmittedAt?: string;
  verifiedBy?: string; // admin who confirmed the payment
  createdAt: string;
}

export type CalendarProvider = "default" | "google" | "microsoft";

export interface Settings {
  workingDays: number[]; // 0=Sun..6=Sat
  startHour: number; // 10
  endHour: number; // 18
  bufferMin: number; // 15
  minNoticeHours: number; // 24
  maxAdvanceDays: number; // 30
  blockedDates: string[]; // specific YYYY-MM-DD days the admin marked off
  paymentInstructions: string;
  // Payment collection (shown to clients on booking; settle before session)
  requirePaymentBeforeSession: boolean;
  payGcashName: string;
  payGcashNumber: string;
  payGcashQr: string; // data: URL of the GCash / e-wallet QR image
  payBankName: string;
  payBankAccountName: string;
  payBankAccountNumber: string;
  notifyEmail: string;
  // Registration confirmation email (sent to a student when they reserve a seat)
  regEmailEnabled: boolean;
  regEmailFromName: string;
  regEmailSubject: string;
  regEmailBody: string;
  // Real delivery via EmailJS (client-side; keys are safe to expose)
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  // Which calendar drives booking availability + event creation.
  calendarProvider: CalendarProvider;
  googleConnected: boolean;
  googleAccount: string;
  microsoftConnected: boolean;
  microsoftAccount: string;
}

export const CALENDAR_LABELS: Record<CalendarProvider, string> = {
  default: "Faelight calendar",
  google: "Google Calendar",
  microsoft: "Microsoft / Teams",
};

// Is the active calendar usable for public booking? The built-in "default"
// calendar always is; a linked provider must actually be connected.
export function calendarReady(s: Settings): boolean {
  if (s.calendarProvider === "google") return s.googleConnected;
  if (s.calendarProvider === "microsoft") return s.microsoftConnected;
  return true; // default
}

export function activeCalendarAccount(s: Settings): string {
  if (s.calendarProvider === "google") return s.googleAccount;
  if (s.calendarProvider === "microsoft") return s.microsoftAccount;
  return "Built-in Faelight calendar";
}

const KEYS = {
  leads: "fae.leads.v1",
  notes: "fae.notes.v1",
  bookings: "fae.bookings.v1",
  settings: "fae.settings.v1",
  services: "fae.services.v1",
  events: "fae.events.v1",
  campaigns: "fae.campaigns.v1",
  social: "fae.social.v1",
  socialPosts: "fae.socialposts.v1",
  promos: "fae.promos.v1",
  videos: "fae.videos.v1",
  intros: "fae.intros.v1",
  automations: "fae.automations.v1",
  reviews: "fae.reviews.v1",
  feedback: "fae.feedback.v1",
  blog: "fae.blog.v1",
  taskStatuses: "fae.taskstatuses.v1",
  projectStatuses: "fae.projectstatuses.v1",
  leadStatuses: "fae.leadstatuses.v1",
  brands: "fae.brands.v1",
  home: "fae.home.v1",
  pool: "fae.pool.v1",
  sessions: "fae.sessions.v1",
  clients: "fae.clients.v1",
  registrations: "fae.registrations.v1",
  tasks: "fae.tasks.v1",
  projects: "fae.projects.v1",
  team: "fae.team.v1",
  meetings: "fae.meetings.v1",
  templates: "fae.templates.v1",
  documents: "fae.documents.v1",
  paymentTerms: "fae.paymentterms.v1",
  invoiceParticulars: "fae.invoiceparticulars.v1",
  bookingTypes: "fae.bookingtypes.v1",
  bookingTypesCustom: "fae.bookingtypescustom.v1",
  publicTeam: "fae.publicteam.v1",
  publicTeamCustom: "fae.publicteamcustom.v1",
  founder: "fae.founder.v1",
  projectTeams: "fae.projectteams.v1",
  leadSources: "fae.leadsources.v1",
  regTiers: "fae.regtiers.v1",
  blogTags: "fae.blogtags.v1",
  brandGroups: "fae.brandgroups.v1",
  activity: "fae.activity.v1",
  notifRead: "fae.notifread.v1",
  customServices: "fae.customservices.v1",
  seeded: "fae.seeded.v1",
};

export const BRAND_GROUPS = [
  "Training & Mentorship",
  "Executive & Admin Support",
  "Operations & Business Systems",
  "Marketing",
];

// Service content overrides (spec §3/§8: services editable from /admin/services).
// In the demo these persist locally; in production they write to Supabase and
// flow through to the public pages + PDFs.
export interface ServiceOverride {
  name?: string;
  priceLabel?: string;
  description?: string;
  bestFor?: string;
  active?: boolean;
  showPrice?: boolean; // default: prices are HIDDEN on the public "What we offer" menu
  archived?: boolean; // hidden from the public menu, still in the active admin list
  deletedAt?: string; // soft-deleted: kept in trash for 7 days, then purged
  purged?: boolean; // seed-service tombstone (permanently removed)
}

export function getServiceOverrides(): Record<string, ServiceOverride> {
  return read<Record<string, ServiceOverride>>(KEYS.services, {});
}
export function saveServiceOverride(id: string, patch: ServiceOverride) {
  const all = getServiceOverrides();
  write(KEYS.services, { ...all, [id]: { ...all[id], ...patch } });
}
export function resetServiceOverrides() {
  write(KEYS.services, {});
}

// --- Custom services + add / archive / soft-delete lifecycle ----------
export const SERVICE_TRASH_DAYS = 7;

export function getCustomServices(): Service[] {
  return read<Service[]>(KEYS.customServices, []);
}
export function addCustomService(
  input: Omit<Service, "id" | "sort" | "priceFrom"> & { priceFrom?: number | null }
): Service {
  const s: Service = { ...input, id: uid("svc-c"), sort: 100, priceFrom: input.priceFrom ?? null };
  write(KEYS.customServices, [...getCustomServices(), s]);
  return s;
}
export function removeCustomService(id: string) {
  write(KEYS.customServices, getCustomServices().filter((s) => s.id !== id));
}

// All services (seed + custom), excluding permanently purged ones.
export function allServices(): Service[] {
  const ov = getServiceOverrides();
  return [...SERVICES, ...getCustomServices()].filter((s) => !ov[s.id]?.purged);
}

export function deleteService(id: string) {
  saveServiceOverride(id, { deletedAt: new Date().toISOString() });
}
export function restoreService(id: string) {
  saveServiceOverride(id, { deletedAt: undefined });
}
export function purgeService(id: string) {
  if (getCustomServices().some((s) => s.id === id)) {
    removeCustomService(id);
    const all = getServiceOverrides();
    delete all[id];
    write(KEYS.services, all);
  } else {
    saveServiceOverride(id, { purged: true, deletedAt: undefined });
  }
}
// Auto-purge anything in trash longer than the retention window.
export function purgeExpiredServices() {
  const ov = getServiceOverrides();
  const cutoff = Date.now() - SERVICE_TRASH_DAYS * 86400000;
  Object.entries(ov).forEach(([id, o]) => {
    if (o.deletedAt && +new Date(o.deletedAt) < cutoff) purgeService(id);
  });
}

// Public menu: seed + custom, minus archived / deleted / inactive / purged.
export function visibleServicesByCategory(slug: CategorySlug): Service[] {
  const ov = getServiceOverrides();
  return allServices()
    .filter((s) => s.categorySlug === slug)
    .filter((s) => {
      const o = ov[s.id] ?? {};
      return !o.deletedAt && !o.archived && o.active !== false;
    })
    .sort((a, b) => a.sort - b.sort);
}

// --- Effective (override-applied) services for the PUBLIC pages/brochures ---
// These merge each admin edit (price label, description, best-for, show/hide)
// onto the seed/custom service, and drop anything archived / trashed / inactive.
// Prices SHOW by default; they're hidden only when explicitly turned off.
export type EffectiveService = Service & { priceShown: boolean };

function mergeService(s: Service, ov: ServiceOverride): EffectiveService {
  return {
    ...s,
    name: ov.name?.trim() ? ov.name.trim() : s.name,
    priceLabel: ov.priceLabel ?? s.priceLabel,
    description: ov.description ?? s.description,
    bestFor: ov.bestFor ?? s.bestFor,
    priceShown: ov.showPrice !== false,
  };
}

export function effectiveServices(): EffectiveService[] {
  const ov = getServiceOverrides();
  return allServices()
    .filter((s) => {
      const o = ov[s.id] ?? {};
      return !o.deletedAt && !o.archived && o.active !== false;
    })
    .map((s) => mergeService(s, ov[s.id] ?? {}))
    .sort((a, b) => a.sort - b.sort);
}
export function effectiveServicesByCategory(slug: CategorySlug): EffectiveService[] {
  return effectiveServices().filter((s) => s.categorySlug === slug);
}
export function effectiveClassOfferings(): EffectiveService[] {
  return effectiveServices().filter((s) => offeringKind(s) === "class");
}
export function effectiveServiceOfferings(): EffectiveService[] {
  return effectiveServices().filter((s) => offeringKind(s) === "service");
}

export const DEFAULT_SETTINGS: Settings = {
  workingDays: [1, 2, 3, 4, 5],
  startHour: 10,
  endHour: 18,
  bufferMin: 15,
  minNoticeHours: 24,
  maxAdvanceDays: 30,
  blockedDates: [],
  paymentInstructions:
    "Please settle your booking fee before your session using the details below, then send your proof of payment to faelightmentoringcircle@gmail.com. Your slot is reserved once payment is confirmed.",
  requirePaymentBeforeSession: true,
  payGcashName: "Maria Castañeda",
  payGcashNumber: "0917 892 1280",
  payGcashQr: "",
  payBankName: "BPI",
  payBankAccountName: "Maria Castañeda",
  payBankAccountNumber: "1234-5678-90",
  notifyEmail: "faelightmentoringcircle@gmail.com",
  regEmailEnabled: true,
  regEmailFromName: "Faelight Business Consultancy",
  regEmailSubject: "You're on the list for {class} ✦",
  regEmailBody:
    "Hi {firstName},\n\n" +
    "Thank you for registering for {class}! We're so happy you're joining us. ✦\n\n" +
    "Here are your details:\n" +
    "• Class: {class}\n" +
    "• Schedule: {date}\n" +
    "• Package: {package}\n" +
    "• Reserved by: {name}\n\n" +
    "Your seat is on hold. Our team will reach out shortly with payment instructions to confirm your slot. If you have any questions, just reply to this email or message us on Messenger.\n\n" +
    "See you in class!\n" +
    "— The Faelight Team\n" +
    "People first. Systems second. Magic throughout.",
  emailjsServiceId: "",
  emailjsTemplateId: "",
  emailjsPublicKey: "",
  calendarProvider: "google", // demo links Google out of the box
  googleConnected: true,
  googleAccount: "maia@faelight.ph",
  microsoftConnected: false,
  microsoftAccount: "",
};

// --- low-level helpers -----------------------------------------------
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  pushKey(key, value); // sync to Supabase when configured (no-op otherwise)
  window.dispatchEvent(new CustomEvent("fae:store"));
}

export function onStoreChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("fae:store", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("fae:store", handler);
    window.removeEventListener("storage", handler);
  };
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// --- Settings --------------------------------------------------------
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) };
}
export function saveSettings(patch: Partial<Settings>) {
  write(KEYS.settings, { ...getSettings(), ...patch });
}

// --- Editable landing (homepage hero + CTAs) -------------------------
export interface HomeContent {
  eyebrow: string;
  titleLine1: string;
  titleAccent: string; // gold second line
  subline: string;
  tagline: string; // cheeky italic line
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  // About-page video / trailer (editable + replaceable from admin)
  aboutVideoUrl: string; // YouTube, Vimeo or direct .mp4 link (empty = placeholder)
  aboutVideoCaption: string;
}

export const DEFAULT_HOME: HomeContent = {
  eyebrow: "Business Consultancy · Philippines",
  titleLine1: "Helping people become more capable.",
  titleAccent: "Helping businesses become easier to run.",
  subline:
    "Systems that create freedom. People who can run them. People first. Systems second. Magic throughout.",
  tagline:
    "For businesses whose operations are held together by vibes, memory and seventeen tabs.",
  ctaPrimaryLabel: "Book a Discovery Call",
  ctaPrimaryHref: "/book",
  ctaSecondaryLabel: "Explore what we do",
  ctaSecondaryHref: "/classes",
  aboutVideoUrl: "",
  aboutVideoCaption: "Watch: the Faelight story",
};

export function getHomeContent(): HomeContent {
  return { ...DEFAULT_HOME, ...read<Partial<HomeContent>>(KEYS.home, {}) };
}
export function saveHomeContent(patch: Partial<HomeContent>) {
  write(KEYS.home, { ...getHomeContent(), ...patch });
}
export function resetHomeContent() {
  write(KEYS.home, {});
}

// --- Faelight Pool (VA talent pool) ----------------------------------
export interface PoolVA {
  id: string;
  name: string;
  photo?: string; // profile photo (data URL)
  niche: string[];
  cv: string; // resume / CV link
  website: string;
  email: string;
  phone: string;
  deployedTo: string;
  deployment: string;
  status: string;
  projects: string[];
  notes: string;
  batch: string;
  active: boolean; // active in the pool
  archived: boolean; // hidden from the public pool
}

export function getPoolVAs(): PoolVA[] {
  const existing = read<PoolVA[] | null>(KEYS.pool, null);
  if (existing) return existing;
  const seeded: PoolVA[] = POOL_SEED.map((v) => ({ ...v, archived: false }));
  write(KEYS.pool, seeded);
  return seeded;
}

// Public pool: not archived (optionally only active could be required).
export function getPublicPool(): PoolVA[] {
  return getPoolVAs().filter((v) => !v.archived);
}

export function addPoolVA(input: Omit<PoolVA, "id" | "archived">): PoolVA {
  const va: PoolVA = { ...input, id: uid("va"), archived: false };
  write(KEYS.pool, [va, ...getPoolVAs()]);
  return va;
}

export function updatePoolVA(id: string, patch: Partial<PoolVA>) {
  write(
    KEYS.pool,
    getPoolVAs().map((v) => (v.id === id ? { ...v, ...patch } : v))
  );
}

export function archivePoolVA(id: string, archived = true) {
  updatePoolVA(id, { archived });
}

export function removePoolVA(id: string) {
  write(
    KEYS.pool,
    getPoolVAs().filter((v) => v.id !== id)
  );
}

// --- Classes & Webinar sessions (admin-manageable) -------------------
export function getSessions(): SessionItem[] {
  const existing = read<SessionItem[] | null>(KEYS.sessions, null);
  if (existing) return existing;
  write(KEYS.sessions, SESSIONS);
  return SESSIONS;
}
export function getUpcomingSessions(): SessionItem[] {
  return getSessions().filter((s) => s.status === "upcoming");
}
export function getPastSessions(): SessionItem[] {
  return getSessions().filter((s) => s.status === "past");
}
export function addSession(input: Omit<SessionItem, "id">): SessionItem {
  const s: SessionItem = { ...input, id: uid("ses") };
  write(KEYS.sessions, [...getSessions(), s]);
  return s;
}
export function updateSession(id: string, patch: Partial<SessionItem>) {
  write(
    KEYS.sessions,
    getSessions().map((s) => (s.id === id ? { ...s, ...patch } : s))
  );
}
export function removeSession(id: string) {
  write(
    KEYS.sessions,
    getSessions().filter((s) => s.id !== id)
  );
}
export function getSession(id: string): SessionItem | undefined {
  return getSessions().find((s) => s.id === id);
}

/** The clean public URL slug for a session — its custom slug, else derived from the title. */
export function sessionSlug(s: SessionItem): string {
  return s.slug && s.slug.trim() ? slugify(s.slug) : slugify(s.title);
}

/** The public registration link for a session — clean /register/<slug> path. */
export function sessionRegisterPath(s: SessionItem): string {
  return `/register/${sessionSlug(s)}`;
}

/** Resolve a session from a URL token that may be a slug OR a raw session id (back-compat). */
export function getSessionBySlug(token: string): SessionItem | undefined {
  const t = token.trim().toLowerCase();
  const all = getSessions();
  return all.find((s) => sessionSlug(s) === t) ?? all.find((s) => s.id === token);
}

// ---- Derived session display / seats / pricing ----------------------
function fmtDay(ymdStr: string): string {
  // "2026-09-14" -> "Sept 14, 2026" (no Date.now dependence)
  const [y, m, d] = ymdStr.split("-").map(Number);
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  if (!y || !m || !d) return ymdStr;
  return `${MON[m - 1]} ${d}, ${y}`;
}
function fmt12h(hhmm: string): string {
  const [h, mm] = hhmm.split(":").map(Number);
  if (isNaN(h)) return hhmm;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return mm ? `${h12}:${String(mm).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
}
/** Human date/time text — built from structured fields, else the free-text `date`. */
export function sessionDateText(s: SessionItem): string {
  if (!s.startDate) return s.date;
  const [sy, sm] = s.startDate.split("-").map(Number);
  const sd = s.startDate.split("-").map(Number)[2];
  let datePart: string;
  if (s.endDate && s.endDate !== s.startDate) {
    const [ey, em, ed] = s.endDate.split("-").map(Number);
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    datePart =
      sy === ey && sm === em
        ? `${MON[sm - 1]} ${sd}–${ed}, ${sy}` // same month
        : `${MON[sm - 1]} ${sd} – ${MON[em - 1]} ${ed}, ${ey}`;
  } else {
    datePart = fmtDay(s.startDate);
  }
  const timePart =
    s.startTime && s.endTime
      ? ` · ${fmt12h(s.startTime)}–${fmt12h(s.endTime)}`
      : s.startTime
      ? ` · ${fmt12h(s.startTime)}`
      : "";
  return datePart + timePart;
}
export function seatsLeft(s: SessionItem): number | null {
  if (typeof s.seatsTotal !== "number") return null;
  return Math.max(0, s.seatsTotal - (s.seatsTaken ?? 0));
}
/** Seats/availability label — built from seat counts, else the free-text `detail`. */
export function sessionSeatText(s: SessionItem): string {
  const left = seatsLeft(s);
  if (left === null) return s.detail ?? (s.kind === "webinar" ? "Free live webinar" : "Registration open");
  if (left === 0) return "Sold out";
  return `${left} of ${s.seatsTotal} seats left`;
}
export function isSoldOut(s: SessionItem): boolean {
  return seatsLeft(s) === 0;
}

export interface PromoResult {
  ok: boolean;
  code: string;
  label?: string;
  discount: number; // peso amount off
  final: number; // final price
  reason?: string;
}
/**
 * Validate a promo code against a session (per-session promos first, then
 * global active promos) and compute the discounted price.
 */
export function applyPromoToSession(s: SessionItem, rawCode: string, baseOverride?: number): PromoResult {
  const base = baseOverride ?? s.price ?? 0;
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, code, discount: 0, final: base, reason: "Enter a code." };
  if (base <= 0) return { ok: false, code, discount: 0, final: 0, reason: "This session is free." };

  // 1) Per-session codes
  const local = (s.promos ?? []).find((p) => p.code.trim().toUpperCase() === code && p.active !== false);
  if (local) {
    const discount = local.kind === "percent" ? Math.round(base * (local.value / 100)) : Math.min(base, local.value);
    return { ok: true, code, label: local.label ?? local.code, discount, final: Math.max(0, base - discount) };
  }
  // 2) Global active promos (Marketing → Promotions). Parse "15% off" / "₱500 off".
  const global = getActivePromos().find((p) => p.code.trim().toUpperCase() === code);
  if (global) {
    const pct = global.discount.match(/(\d+(?:\.\d+)?)\s*%/);
    const amt = global.discount.replace(/,/g, "").match(/₱\s?(\d+(?:\.\d+)?)/);
    let discount = 0;
    if (pct) discount = Math.round(base * (Number(pct[1]) / 100));
    else if (amt) discount = Math.min(base, Number(amt[1]));
    if (discount > 0)
      return { ok: true, code, label: global.title || global.code, discount, final: Math.max(0, base - discount) };
    return { ok: false, code, discount: 0, final: base, reason: "This code isn't valid for a class fee." };
  }
  return { ok: false, code, discount: 0, final: base, reason: "That code isn't recognized or has expired." };
}

// --- Registration confirmation email ---------------------------------
export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

export interface ComposedEmail {
  to: string;
  from: string;
  subject: string;
  body: string;
}

/** Build the confirmation email for a registration from the admin-editable template. */
export function composeRegistrationEmail(args: {
  to: string;
  name: string;
  session: SessionItem;
  packageLabel: string;
  price?: number;
}): ComposedEmail {
  const s = getSettings();
  const priceText =
    typeof args.price === "number" && args.price > 0
      ? `₱${args.price.toLocaleString("en-PH")}`
      : "Free";
  const vars: Record<string, string> = {
    name: args.name,
    firstName: args.name.split(" ")[0] || args.name,
    class: args.session.title,
    date: sessionDateText(args.session),
    package: args.packageLabel,
    price: priceText,
    host: args.session.host,
    studio: s.regEmailFromName,
  };
  return {
    to: args.to,
    from: s.regEmailFromName,
    subject: renderTemplate(s.regEmailSubject, vars),
    body: renderTemplate(s.regEmailBody, vars),
  };
}

/** True when EmailJS keys are set, so emails really land in the student's inbox. */
export function emailDeliveryReady(s: Settings = getSettings()): boolean {
  return !!(s.emailjsServiceId && s.emailjsTemplateId && s.emailjsPublicKey);
}

export type EmailDelivery = "delivered" | "logged" | "disabled" | "failed";
export interface SendResult {
  email: ComposedEmail | null;
  delivery: EmailDelivery;
}

/**
 * Send the confirmation email, auto-filled with THIS person's details.
 * If EmailJS keys are configured in Settings, it is delivered to the student's
 * real inbox; otherwise it is composed + logged so admin can see it went out.
 */
export async function sendRegistrationEmail(args: {
  to: string;
  name: string;
  session: SessionItem;
  packageLabel: string;
  price?: number;
}): Promise<SendResult> {
  const s = getSettings();
  if (!s.regEmailEnabled) return { email: null, delivery: "disabled" };
  const email = composeRegistrationEmail(args);
  logActivity("event", `Confirmation email → ${args.to}`, email.subject, "/admin/registrations");

  if (!emailDeliveryReady(s)) return { email, delivery: "logged" };

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: s.emailjsServiceId,
        template_id: s.emailjsTemplateId,
        user_id: s.emailjsPublicKey,
        template_params: {
          to_email: email.to,
          to_name: args.name,
          from_name: email.from,
          subject: email.subject,
          message: email.body,
          reply_to: s.notifyEmail,
        },
      }),
    });
    return { email, delivery: res.ok ? "delivered" : "failed" };
  } catch {
    return { email, delivery: "failed" };
  }
}

// --- Session feedback (collected on-site, reviewed in admin) ----------
export const FEEDBACK_CLASSES = [
  "Foundations VA",
  "EVA Master Class",
  "1-on-1 Training",
  "Mindset Training Classes",
  "Application Classes",
  "Other",
];
export interface Feedback {
  id: string;
  name: string;
  email: string;
  classTaken: string; // one of FEEDBACK_CLASSES (or a session title)
  batch: string;
  rating: number; // 1–5
  liked: string; // what they enjoyed / learned
  improve: string; // suggestions
  canShare: boolean; // may we use as a testimonial
  featured: boolean; // admin flagged it
  archived: boolean;
  createdAt: string;
}

const FEEDBACK_SEED: Feedback[] = [
  { id: "fb-01", name: "Sheryll Navalta", email: "", classTaken: "Foundations VA", batch: "3", rating: 5, liked: "The first-week playbook made everything click. Coach Maia is so encouraging.", improve: "Maybe a longer Q&A at the end.", canShare: true, featured: true, archived: false, createdAt: daysAgo(9) },
  { id: "fb-02", name: "Dan Vincent", email: "", classTaken: "EVA Master Class", batch: "3", rating: 5, liked: "Stakeholder communication module was gold. Very practical.", improve: "", canShare: true, featured: false, archived: false, createdAt: daysAgo(6) },
  { id: "fb-03", name: "Risa", email: "", classTaken: "Foundations VA", batch: "3", rating: 4, liked: "Loved the warm community and the templates.", improve: "More real client examples please.", canShare: false, featured: false, archived: false, createdAt: daysAgo(4) },
];

export function getFeedback(): Feedback[] {
  const existing = read<Feedback[] | null>(KEYS.feedback, null);
  if (existing) return existing;
  write(KEYS.feedback, FEEDBACK_SEED);
  return FEEDBACK_SEED;
}
export function addFeedback(input: Omit<Feedback, "id" | "createdAt" | "archived" | "featured"> & { featured?: boolean; archived?: boolean }): Feedback {
  const f: Feedback = { ...input, featured: input.featured ?? false, archived: input.archived ?? false, id: uid("fb"), createdAt: new Date().toISOString() };
  write(KEYS.feedback, [f, ...getFeedback()]);
  return f;
}
export function updateFeedback(id: string, patch: Partial<Feedback>) {
  write(KEYS.feedback, getFeedback().map((f) => (f.id === id ? { ...f, ...patch } : f)));
}
export function removeFeedback(id: string) {
  write(KEYS.feedback, getFeedback().filter((f) => f.id !== id));
}
export function feedbackAverage(): number {
  const list = getFeedback().filter((f) => !f.archived);
  if (!list.length) return 0;
  return Math.round((list.reduce((s, f) => s + f.rating, 0) / list.length) * 10) / 10;
}

// --- Client List & Contacts (admin-only) -----------------------------
export interface ClientContact {
  id: string;
  name: string;
  logo?: string; // company logo (data URL)
  company: string;
  role: string;
  email: string;
  phone: string;
  bizPhone: string;
  country: string;
  industry: string;
  leadSource: string;
  website: string;
  whois: string;
  contractSigned: boolean;
  signedDocUrl: string;
  contractorDoc: string;
  projects: string[];
  archived: boolean;
}

export function getClients(): ClientContact[] {
  const existing = read<ClientContact[] | null>(KEYS.clients, null);
  if (existing) return existing;
  const seeded: ClientContact[] = CLIENT_SEED.map((c) => ({ ...c, archived: false }));
  write(KEYS.clients, seeded);
  return seeded;
}
export function addClient(input: Omit<ClientContact, "id" | "archived">): ClientContact {
  const c: ClientContact = { ...input, id: uid("cl"), archived: false };
  write(KEYS.clients, [c, ...getClients()]);
  return c;
}
export function updateClient(id: string, patch: Partial<ClientContact>) {
  write(
    KEYS.clients,
    getClients().map((c) => (c.id === id ? { ...c, ...patch } : c))
  );
}
export function archiveClient(id: string, archived = true) {
  updateClient(id, { archived });
}
export function removeClient(id: string) {
  write(
    KEYS.clients,
    getClients().filter((c) => c.id !== id)
  );
}

// --- Registrations (class enrollees + service availments) ------------
// One list for everyone who registered for a class/webinar or availed a
// service. The "Foundations Class enrollees" view is just this list
// filtered by item. Archived rows are the history.
export type RegType = "class" | "webinar" | "service";
export type RegStatus = "registered" | "paid" | "completed" | "cancelled";

export interface Registration {
  id: string;
  name: string;
  email: string;
  item: string; // "Foundations Class", "Notion Consultation", …
  type: RegType;
  batch: string; // classes only
  tier: string; // Scholar / VIP / Regular
  amountPaid: string;
  paymentMethod: string;
  datePaid: string;
  status: RegStatus;
  leadFrom: string;
  niche: string;
  notes: string;
  archived: boolean;
  createdAt: string;
  viaWebsite?: boolean; // true when the sign-up came from the public website form
}

const REGISTRATION_SEED: Registration[] = [
  { id: "reg-01", name: "AJ Obien", email: "", item: "Foundations Class", type: "class", batch: "3", tier: "Scholar", amountPaid: "0", paymentMethod: "via Maia", datePaid: "", status: "registered", leadFrom: "Personal", niche: "Undergrad", notes: "Maia's nephew", archived: false, createdAt: daysAgo(20) },
  { id: "reg-07", name: "Virgil Alvarez", email: "iambordo@gmail.com", item: "Systems Audit", type: "service", batch: "", tier: "", amountPaid: "₱7,500", paymentMethod: "GCash", datePaid: daysAgo(6), status: "paid", leadFrom: "Referral", niche: "Food & Beverage", notes: "", archived: false, createdAt: daysAgo(8) },
];

export function getRegistrations(): Registration[] {
  const existing = read<Registration[] | null>(KEYS.registrations, null);
  if (existing) return existing;
  write(KEYS.registrations, REGISTRATION_SEED);
  return REGISTRATION_SEED;
}
export function addRegistration(input: Omit<Registration, "id" | "createdAt" | "archived"> & { archived?: boolean }): Registration {
  const r: Registration = { ...input, id: uid("reg"), archived: input.archived ?? false, createdAt: new Date().toISOString() };
  write(KEYS.registrations, [r, ...getRegistrations()]);
  return r;
}
export function updateRegistration(id: string, patch: Partial<Registration>) {
  write(KEYS.registrations, getRegistrations().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}
export function archiveRegistration(id: string, archived = true) {
  updateRegistration(id, { archived });
}
export function removeRegistration(id: string) {
  write(KEYS.registrations, getRegistrations().filter((r) => r.id !== id));
}

// --- Meetings (upcoming & past, with join link) ----------------------
export type MeetingType = "internal" | "client" | "partner";
export interface Meeting {
  id: string;
  title: string;
  datetime: string; // ISO
  attendees: string;
  meetingUrl: string; // Zoom / Meet / Teams
  type: MeetingType;
  notes: string;
  archived: boolean;
}
const MEETING_SEED: Meeting[] = [
  { id: "mtg-01", title: "Kick off — Faelight Mentoring Circle", datetime: "2026-08-25T10:00", attendees: "Maia, Team", meetingUrl: "https://us02web.zoom.us/j/000", type: "internal", notes: "", archived: false },
  { id: "mtg-02", title: "Miraceti X Faelight — Jechris Olaya", datetime: "2026-08-27T14:00", attendees: "Maia, Jechris Olaya", meetingUrl: "https://us02web.zoom.us/j/111", type: "client", notes: "MiraCeti Digital Agency", archived: false },
  { id: "mtg-03", title: "NSP x Faelight — Nevin", datetime: "2026-07-29T19:05", attendees: "Maia, Nevin", meetingUrl: "https://meet.google.com/aaa-bbbb-ccc", type: "partner", notes: "NSP Architecture", archived: false },
  { id: "mtg-04", title: "Weekly team sync", datetime: "2026-07-23T12:23", attendees: "Full team", meetingUrl: "https://meet.google.com/ddd-eeee-fff", type: "internal", notes: "", archived: false },
];
export function getMeetings(): Meeting[] {
  const existing = read<Meeting[] | null>(KEYS.meetings, null);
  if (existing) return existing;
  write(KEYS.meetings, MEETING_SEED);
  return MEETING_SEED;
}
export function addMeeting(input: Omit<Meeting, "id" | "archived"> & { archived?: boolean }): Meeting {
  const m: Meeting = { ...input, id: uid("mtg"), archived: input.archived ?? false };
  write(KEYS.meetings, [m, ...getMeetings()]);
  return m;
}
export function updateMeeting(id: string, patch: Partial<Meeting>) {
  write(KEYS.meetings, getMeetings().map((m) => (m.id === id ? { ...m, ...patch } : m)));
}
export function removeMeeting(id: string) {
  write(KEYS.meetings, getMeetings().filter((m) => m.id !== id));
}

// --- Templates + Documents (contracts, invoices; save-as-draft) ------
// "design" templates hold an uploaded Canva/PDF/image export and/or a Canva
// link, so existing brand designs can be reused as-is (not text-filled).
export type TemplateKind = "contract" | "invoice" | "design" | "other";
export interface DocTemplate {
  id: string;
  name: string;
  kind: TemplateKind;
  body: string; // supports {{placeholder}} tokens (text templates)
  createdAt: string;
  archived: boolean;
  // Design attachments (optional)
  fileUrl?: string;   // uploaded data URL (PDF / PNG / JPG)
  fileName?: string;  // original file name
  fileType?: string;  // MIME type
  canvaUrl?: string;  // link to open/duplicate in Canva
}
export interface DocRecord {
  id: string;
  templateId: string | null;
  name: string;
  kind: TemplateKind;
  body: string;
  status: "draft" | "final" | "sent";
  updatedAt: string;
  clientEmail?: string;
  sentTo?: string;
  sentAt?: string;
  // Uploaded file (a finished invoice/contract PDF or image kept on record)
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  // Structured invoice fields (used when kind === "invoice")
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  billTo?: string;
  billCompany?: string;
  billEmail?: string;
  billAddress?: string;
  amount?: string; // display total (kept in sync with the line items)
  manualAmount?: number; // for uploaded/file invoices with no line items
  items?: InvoiceItem[];
  discount?: number; // peso amount taken off the subtotal
  taxPct?: number; // optional % applied after discount
  terms?: string; // payment terms / notes shown on the invoice
  paid?: boolean;
  paidAt?: string;
  archived?: boolean;
}
export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}
const TEMPLATE_SEED: DocTemplate[] = [
  {
    id: "tpl-contract",
    name: "Service Agreement",
    kind: "contract",
    body:
      "SERVICE AGREEMENT\n\nThis agreement is between Faelight Business Consultancy and {{client_name}} ({{company}}), dated {{date}}.\n\nScope: {{scope}}\nFee: {{amount}}\nPayment terms: {{terms}}\n\nSigned,\n{{client_name}}\nMaria Castañeda — Faelight",
    createdAt: daysAgo(30),
    archived: false,
  },
  {
    id: "tpl-invoice",
    name: "Invoice",
    kind: "invoice",
    body:
      "INVOICE #{{invoice_no}}\nDate: {{date}}\n\nBill to: {{client_name}} ({{company}})\n\nDescription: {{description}}\nAmount due: {{amount}}\nDue date: {{due_date}}\n\nPay to: {{payment_details}}\nThank you — Faelight Business Consultancy",
    createdAt: daysAgo(30),
    archived: false,
  },
  {
    id: "tpl-canva-proposal",
    name: "Proposal Deck (Canva)",
    kind: "design",
    body: "Branded proposal deck. Duplicate in Canva, swap client name, scope and pricing, then export to PDF.",
    canvaUrl: "https://www.canva.com/",
    createdAt: daysAgo(20),
    archived: false,
  },
];
// A curated library of professionally-written starter templates the team can
// add with one click (works even after the seed has run).
export const READY_MADE_TEMPLATES: { name: string; kind: TemplateKind; body: string; canvaUrl?: string }[] = [
  {
    name: "Project Proposal",
    kind: "other",
    body: "PROJECT PROPOSAL\nPrepared for {{client_name}} ({{company}}) · {{date}}\n\n1. OVERVIEW\n{{overview}}\n\n2. GOALS\n{{goals}}\n\n3. SCOPE OF WORK\n{{scope}}\n\n4. TIMELINE\n{{timeline}}\n\n5. INVESTMENT\n{{amount}}\n\n6. NEXT STEPS\nReply to accept and we'll send the agreement + first invoice.\n\nWith care,\nMaria Castañeda — Faelight Business Consultancy",
  },
  {
    name: "Statement of Work (SOW)",
    kind: "contract",
    body: "STATEMENT OF WORK\nClient: {{client_name}} ({{company}})\nEffective date: {{date}}\n\nDELIVERABLES\n{{deliverables}}\n\nMILESTONES & DATES\n{{milestones}}\n\nFEES & SCHEDULE\n{{amount}} — {{terms}}\n\nOUT OF SCOPE\n{{out_of_scope}}\n\nApproved by:\n{{client_name}} ___________  Date ______\nFaelight ___________  Date ______",
  },
  {
    name: "Non-Disclosure Agreement (NDA)",
    kind: "contract",
    body: "MUTUAL NON-DISCLOSURE AGREEMENT\n\nBetween Faelight Business Consultancy and {{client_name}} ({{company}}), dated {{date}}.\n\n1. Both parties may share confidential information for the purpose of {{purpose}}.\n2. Confidential information will not be disclosed to third parties.\n3. This agreement remains in effect for {{duration}}.\n\nSigned,\n{{client_name}} ___________\nMaria Castañeda — Faelight ___________",
  },
  {
    name: "Official Receipt",
    kind: "invoice",
    body: "OFFICIAL RECEIPT #{{receipt_no}}\nDate: {{date}}\n\nReceived from: {{client_name}} ({{company}})\nThe sum of: {{amount}}\nFor: {{description}}\nPayment method: {{method}}\n\nReceived by: Faelight Business Consultancy\nThank you for your business ✦",
  },
  {
    name: "Payment Reminder",
    kind: "invoice",
    body: "PAYMENT REMINDER\n\nHi {{client_name}},\n\nA friendly reminder that invoice #{{invoice_no}} for {{amount}} was due on {{due_date}}.\n\nYou can settle via: {{payment_details}}\n\nIf you've already paid, please ignore this note. Thank you!\nFaelight Business Consultancy",
  },
  {
    name: "Welcome / Onboarding Letter",
    kind: "other",
    body: "WELCOME TO FAELIGHT ✦\n\nHi {{client_name}},\n\nWe're delighted to be working with {{company}}! Here's what happens next:\n\n1. Kickoff call: {{kickoff_date}}\n2. Your point of contact: {{contact}}\n3. What we'll need from you: {{requirements}}\n\nPeople first. Systems second. Magic throughout.\nMaria & the Faelight team",
  },
  {
    name: "VA Placement Agreement",
    kind: "contract",
    body: "VIRTUAL ASSISTANT PLACEMENT AGREEMENT\n\nClient: {{client_name}} ({{company}})\nVA placed: {{va_name}}\nStart date: {{date}}\n\nEngagement: {{hours}} per week · {{rate}}\nScope: {{scope}}\nPayment terms: {{terms}}\n\nFaelight facilitates placement, onboarding and support.\n\nSigned,\n{{client_name}} ___________\nFaelight ___________",
  },
  {
    name: "Monthly Retainer Agreement",
    kind: "contract",
    body: "MONTHLY RETAINER AGREEMENT\n\nBetween Faelight and {{client_name}} ({{company}}), starting {{date}}.\n\nRetainer: {{amount}} / month\nIncluded: {{included}}\nTerm: {{term}} (auto-renews unless cancelled with {{notice}} notice)\nBilling: on the {{billing_day}} of each month\n\nSigned,\n{{client_name}} ___________\nMaria Castañeda — Faelight ___________",
  },
  {
    name: "Social Media Post Pack (Canva)",
    kind: "design",
    body: "A set of branded social templates (feed + stories). Duplicate in Canva, drop in the caption and export.",
    canvaUrl: "https://www.canva.com/",
  },
];

export function getTemplates(): DocTemplate[] {
  const existing = read<DocTemplate[] | null>(KEYS.templates, null);
  if (existing) return existing;
  write(KEYS.templates, TEMPLATE_SEED);
  return TEMPLATE_SEED;
}
// Insert a ready-made template (skips if the same name already exists).
export function installReadyMadeTemplate(name: string): DocTemplate | undefined {
  const lib = READY_MADE_TEMPLATES.find((t) => t.name === name);
  if (!lib) return;
  const current = getTemplates();
  if (current.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
  return addTemplate({ name: lib.name, kind: lib.kind, body: lib.body, canvaUrl: lib.canvaUrl });
}
export function addTemplate(input: Omit<DocTemplate, "id" | "createdAt" | "archived"> & { archived?: boolean }): DocTemplate {
  const t: DocTemplate = { ...input, id: uid("tpl"), createdAt: new Date().toISOString(), archived: input.archived ?? false };
  write(KEYS.templates, [t, ...getTemplates()]);
  return t;
}
export function updateTemplate(id: string, patch: Partial<DocTemplate>) {
  write(KEYS.templates, getTemplates().map((t) => (t.id === id ? { ...t, ...patch } : t)));
}
export function removeTemplate(id: string) {
  write(KEYS.templates, getTemplates().filter((t) => t.id !== id));
}
export function getDocuments(): DocRecord[] {
  return read<DocRecord[]>(KEYS.documents, []).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}
// Create a draft from a template (or blank). Auto-saved as draft.
export function createDraftFromTemplate(t: DocTemplate): DocRecord {
  const d: DocRecord = { id: uid("doc"), templateId: t.id, name: `${t.name} — draft`, kind: t.kind, body: t.body, status: "draft", updatedAt: new Date().toISOString() };
  write(KEYS.documents, [d, ...getDocuments()]);
  return d;
}
export function saveDocument(id: string, patch: Partial<DocRecord>) {
  write(KEYS.documents, getDocuments().map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)));
}
export function addBlankDocument(kind: TemplateKind): DocRecord {
  const d: DocRecord = { id: uid("doc"), templateId: null, name: "Untitled draft", kind, body: "", status: "draft", updatedAt: new Date().toISOString() };
  write(KEYS.documents, [d, ...getDocuments()]);
  return d;
}
// Store an uploaded file (finished invoice/contract PDF or image) as a document.
export function addUploadedDocument(input: {
  name: string; kind: TemplateKind; fileUrl: string; fileName: string; fileType: string;
}): DocRecord {
  const d: DocRecord = {
    id: uid("doc"), templateId: null, name: input.name, kind: input.kind, body: "",
    status: "final", updatedAt: new Date().toISOString(),
    fileUrl: input.fileUrl, fileName: input.fileName, fileType: input.fileType,
  };
  write(KEYS.documents, [d, ...getDocuments()]);
  logActivity("activity", `${input.kind === "invoice" ? "Invoice" : "Document"} uploaded`, input.name, "/admin/templates");
  return d;
}
// Simulated send: marks the document sent and logs the activity. In production
// this renders a PDF and emails it via Resend/your mail service.
export function sendDocument(id: string, email: string): DocRecord | undefined {
  const now = new Date().toISOString();
  write(KEYS.documents, getDocuments().map((d) => (d.id === id ? { ...d, status: "sent", clientEmail: email, sentTo: email, sentAt: now, updatedAt: now } : d)));
  const doc = getDocuments().find((d) => d.id === id);
  if (doc) logActivity("activity", `${doc.kind === "invoice" ? "Invoice" : "Document"} sent`, `${doc.name} → ${email}`, "/admin/templates");
  return doc;
}
export function removeDocument(id: string) {
  write(KEYS.documents, getDocuments().filter((d) => d.id !== id));
}
// Invoice-only helpers ------------------------------------------------------
export function getInvoices(): DocRecord[] {
  return getDocuments().filter((d) => d.kind === "invoice");
}
export function archiveDocument(id: string, archived: boolean) {
  saveDocument(id, { archived });
}
export function markInvoicePaid(id: string, paid: boolean) {
  saveDocument(id, { paid, paidAt: paid ? new Date().toISOString() : undefined });
  const inv = getDocuments().find((d) => d.id === id);
  if (inv) logActivity("payment", paid ? "Invoice marked paid" : "Invoice marked unpaid", `${inv.name}${inv.amount ? ` · ${inv.amount}` : ""}`, "/admin/invoices");
}
/** Best-effort numeric value of an amount string like "₱10,000" → 10000. */
export function parseAmount(amount?: string): number {
  if (!amount) return 0;
  const n = Number(String(amount).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
export function formatPeso(n: number): string {
  return `₱${(Number.isFinite(n) ? n : 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function invoiceSubtotal(items?: InvoiceItem[]): number {
  return (items ?? []).reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
}
export function invoiceTotal(d: Pick<DocRecord, "items" | "discount" | "taxPct">): number {
  const sub = invoiceSubtotal(d.items);
  const afterDisc = Math.max(0, sub - (Number(d.discount) || 0));
  const tax = afterDisc * ((Number(d.taxPct) || 0) / 100);
  return afterDisc + tax;
}
/**
 * The amount to show for an invoice: line-item total when there are items,
 * otherwise the manually-entered amount (used for uploaded PDF/file invoices).
 */
export function effectiveTotal(d: DocRecord): number {
  if (d.items && d.items.length) return invoiceTotal(d);
  if (typeof d.manualAmount === "number" && Number.isFinite(d.manualAmount)) return d.manualAmount;
  return parseAmount(d.amount);
}
/** Next sequential invoice number like INV-0007 based on existing invoices. */
export function nextInvoiceNo(): string {
  const nums = getInvoices()
    .map((d) => Number(String(d.invoiceNo || "").replace(/[^0-9]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-${String(next).padStart(4, "0")}`;
}
// Managed payment-term options (editable dropdown on the invoice editor) -----
export const DEFAULT_PAYMENT_TERMS: string[] = [
  "Due on receipt",
  "Net 7 days",
  "Net 15 days",
  "Net 30 days",
  "50% downpayment, 50% on completion",
  "Full payment before start",
];
export function getPaymentTerms(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_PAYMENT_TERMS];
  seedIfMissing(KEYS.paymentTerms, () => [...DEFAULT_PAYMENT_TERMS]);
  const list = read<string[]>(KEYS.paymentTerms, [...DEFAULT_PAYMENT_TERMS]);
  return list.length ? list : [...DEFAULT_PAYMENT_TERMS];
}
export function setPaymentTerms(list: string[]) {
  const clean = Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));
  write(KEYS.paymentTerms, clean.length ? clean : [...DEFAULT_PAYMENT_TERMS]);
}
export function addPaymentTerm(name: string) {
  const n = name.trim();
  if (!n) return;
  const cur = getPaymentTerms();
  if (!cur.includes(n)) setPaymentTerms([...cur, n]);
}
export function renamePaymentTerm(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n) return;
  setPaymentTerms(getPaymentTerms().map((s) => (s === oldName ? n : s)));
}
export function removePaymentTerm(name: string) {
  setPaymentTerms(getPaymentTerms().filter((s) => s !== name));
}

// Reusable, editable Particulars (Page 2) template. Supports {{placeholders}}
// that are filled from the invoice when inserted.
export const DEFAULT_INVOICE_PARTICULARS = `Payment Terms
Due upon receipt. Payment is required to proceed with and complete the expanded project modules.

Invoice Note
This invoice covers the balance for Project Variation – Phase 1, including the implementation of the branded client portal, progress tracking, S-curve and progress charts, site photo documentation, payment status, and report engine, now live and ready for demonstration.

Final implementation and end-user training upon completion and handover of the system will be provided at no additional charge, as previously agreed.

Project Account Summary
Original package: PHP 150,000
Deposit received: PHP 20,000 — August 08, 2026
Amount due on this invoice: {{amount_due}}
Original project balance due at final handover: PHP 65,000.00
Final implementation and end-user training / Bug fixes: COMPLIMENTARY

Post-Implementation Support
As part of the project handover, Faelight Business Consultancy will provide six (6) months of complimentary post-implementation support beginning from the date of final system deployment and acceptance.
This support period will cover:
• Bug testing and correction of system issues
• Minor workflow adjustments
• Minor database, dashboard, or system improvements
• Troubleshooting related to the implemented solution
• Reasonable technical guidance and clarification for the team

This complimentary support is intended to ensure the system remains stable and can be refined based on actual day-to-day use following implementation.

After the six-month complimentary support period, {{company}} may opt to continue ongoing system support under a PHP 10,000 monthly retainer, covering bug testing, troubleshooting, maintenance, and reasonable minor improvements.

Major enhancements, new modules, significant workflow redesigns, integrations, or additional development outside the existing project scope will be assessed and quoted separately prior to commencement.`;

export function getInvoiceParticularsTemplate(): string {
  if (typeof window === "undefined") return DEFAULT_INVOICE_PARTICULARS;
  return read<string>(KEYS.invoiceParticulars, DEFAULT_INVOICE_PARTICULARS);
}
export function setInvoiceParticularsTemplate(text: string) {
  write(KEYS.invoiceParticulars, text);
}
/** Fill {{placeholders}} in a particulars template from an invoice. */
export function renderInvoiceParticulars(tpl: string, d: DocRecord): string {
  const company = d.billCompany?.trim() || d.billTo?.trim() || "the Client";
  return tpl
    .replace(/\{\{\s*company\s*\}\}/gi, company)
    .replace(/\{\{\s*amount_due\s*\}\}/gi, formatPeso(invoiceTotal(d)))
    .replace(/\{\{\s*invoice_no\s*\}\}/gi, d.invoiceNo || "")
    .replace(/\{\{\s*date\s*\}\}/gi, d.invoiceDate || "");
}

// --- Booking types (discovery call etc.) — editable from admin -------------
export interface BookingTypeOverride {
  name?: string; durationMin?: number; feeLabel?: string; description?: string;
  active?: boolean; showFee?: boolean; deleted?: boolean;
}
export function getBookingTypeOverrides(): Record<string, BookingTypeOverride> {
  return read<Record<string, BookingTypeOverride>>(KEYS.bookingTypes, {});
}
export function saveBookingTypeOverride(id: string, patch: BookingTypeOverride) {
  const all = getBookingTypeOverrides();
  write(KEYS.bookingTypes, { ...all, [id]: { ...all[id], ...patch } });
}
export function getCustomBookingTypes(): BookingType[] {
  return read<BookingType[]>(KEYS.bookingTypesCustom, []);
}
export function addBookingType(input: Omit<BookingType, "id">): BookingType {
  const bt: BookingType = { ...input, id: uid("bt-c") };
  write(KEYS.bookingTypesCustom, [...getCustomBookingTypes(), bt]);
  return bt;
}
export function removeBookingType(id: string) {
  if (getCustomBookingTypes().some((b) => b.id === id)) {
    write(KEYS.bookingTypesCustom, getCustomBookingTypes().filter((b) => b.id !== id));
  } else {
    saveBookingTypeOverride(id, { deleted: true });
  }
}
/** Effective booking types = seed + custom, with admin edits applied, minus deleted. */
export function getBookingTypes(includeInactive = false): BookingType[] {
  const ov = getBookingTypeOverrides();
  return [...BOOKING_TYPES, ...getCustomBookingTypes()]
    .filter((b) => !ov[b.id]?.deleted)
    .map((b) => {
      const o = ov[b.id] ?? {};
      return {
        ...b,
        name: o.name ?? b.name,
        durationMin: o.durationMin ?? b.durationMin,
        feeLabel: o.feeLabel ?? b.feeLabel,
        description: o.description ?? b.description,
        active: o.active ?? b.active,
        showFee: o.showFee ?? b.showFee ?? true,
      };
    })
    .filter((b) => includeInactive || b.active);
}

// --- Public "About page" team (the "people behind the magic" section) ------
// Editable from admin → Faelight Team → Website team. Seed = TEAM (content.ts);
// admin edits are stored as overrides, plus any custom-added members, minus
// deleted, ordered. Photos are stored as data URLs (or a URL/path).
export interface PublicTeamOverride {
  name?: string; role?: string; blurb?: string; photo?: string;
  hidden?: boolean; deleted?: boolean; order?: number;
}
export interface EffectiveTeamMember extends TeamMember { hidden: boolean; order: number; }

export function getPublicTeamOverrides(): Record<string, PublicTeamOverride> {
  return read<Record<string, PublicTeamOverride>>(KEYS.publicTeam, {});
}
export function savePublicTeamMember(id: string, patch: PublicTeamOverride) {
  const all = getPublicTeamOverrides();
  write(KEYS.publicTeam, { ...all, [id]: { ...all[id], ...patch } });
}
export function getCustomPublicTeam(): TeamMember[] {
  return read<TeamMember[]>(KEYS.publicTeamCustom, []);
}
export function addPublicTeamMember(input: Omit<TeamMember, "id">): TeamMember {
  const m: TeamMember = { ...input, id: uid("tm-c") };
  write(KEYS.publicTeamCustom, [...getCustomPublicTeam(), m]);
  return m;
}
export function updatePublicTeamCustom(id: string, patch: Partial<TeamMember>) {
  write(KEYS.publicTeamCustom, getCustomPublicTeam().map((m) => (m.id === id ? { ...m, ...patch } : m)));
}
export function removePublicTeamMember(id: string) {
  if (getCustomPublicTeam().some((m) => m.id === id)) {
    write(KEYS.publicTeamCustom, getCustomPublicTeam().filter((m) => m.id !== id));
  } else {
    savePublicTeamMember(id, { deleted: true });
  }
}
export function isCustomTeamMember(id: string): boolean {
  return getCustomPublicTeam().some((m) => m.id === id);
}
/** Effective public team = seed + custom, overrides applied, minus deleted,
 *  ordered. Pass true to include hidden members (for the admin editor). */
export function getEffectiveTeam(includeHidden = false): EffectiveTeamMember[] {
  const ov = getPublicTeamOverrides();
  const custom = getCustomPublicTeam();
  const merged: EffectiveTeamMember[] = [...TEAM, ...custom]
    .filter((m) => !ov[m.id]?.deleted)
    .map((m, i) => {
      const o = ov[m.id] ?? {};
      return {
        id: m.id,
        name: o.name ?? m.name,
        role: o.role ?? m.role,
        blurb: o.blurb ?? m.blurb,
        photo: o.photo ?? m.photo,
        hidden: o.hidden ?? false,
        order: o.order ?? i,
      };
    });
  merged.sort((a, b) => a.order - b.order);
  return includeHidden ? merged : merged.filter((m) => !m.hidden);
}
/** Persist a new display order (array of ids, top → bottom). */
export function reorderPublicTeam(orderedIds: string[]) {
  const all = getPublicTeamOverrides();
  const next = { ...all };
  orderedIds.forEach((id, i) => { next[id] = { ...next[id], order: i }; });
  write(KEYS.publicTeam, next);
}

// --- Founder (public About-page bio/stats) — admin-editable ----------------
export interface FounderInfo {
  name: string; title: string; role: string; bio: string;
  stats: { value: string; label: string }[];
  personal: string[];
}
export function getFounder(): FounderInfo {
  return { ...(FOUNDER as FounderInfo), ...read<Partial<FounderInfo>>(KEYS.founder, {}) };
}
export function saveFounder(patch: Partial<FounderInfo>) {
  write(KEYS.founder, { ...getFounder(), ...patch });
}

// --- Project teams (public About-page section) — admin-editable ------------
export function getProjectTeams(): ProjectTeam[] {
  const existing = read<ProjectTeam[] | null>(KEYS.projectTeams, null);
  return existing ?? PROJECT_TEAMS;
}
export function saveProjectTeams(list: ProjectTeam[]) {
  write(KEYS.projectTeams, list);
}
export function addProjectTeam(input: Omit<ProjectTeam, "id">): ProjectTeam {
  const t: ProjectTeam = { ...input, id: uid("pt-c") };
  saveProjectTeams([...getProjectTeams(), t]);
  return t;
}
export function updateProjectTeam(id: string, patch: Partial<ProjectTeam>) {
  saveProjectTeams(getProjectTeams().map((t) => (t.id === id ? { ...t, ...patch } : t)));
}
export function removeProjectTeam(id: string) {
  saveProjectTeams(getProjectTeams().filter((t) => t.id !== id));
}

// --- Generic admin-managed option lists (simple editable string lists) -----
export const DEFAULT_REG_TIERS = ["Regular", "VIP", "Scholar"];
function getManagedList(key: string, seed: readonly string[]): string[] {
  if (typeof window === "undefined") return [...seed];
  seedIfMissing(key, () => [...seed]);
  const list = read<string[]>(key, [...seed]);
  return list.length ? list : [...seed];
}
function setManagedList(key: string, list: string[]) {
  write(key, Array.from(new Set(list.map((s) => s.trim()).filter(Boolean))));
}
export const getLeadSourceOptions = () => getManagedList(KEYS.leadSources, LEAD_SOURCES);
export const setLeadSourceOptions = (list: string[]) => setManagedList(KEYS.leadSources, list);
export const getRegTierOptions = () => getManagedList(KEYS.regTiers, DEFAULT_REG_TIERS);
export const setRegTierOptions = (list: string[]) => setManagedList(KEYS.regTiers, list);
export const getBlogTagOptions = () => getManagedList(KEYS.blogTags, BLOG_TAGS);
export const setBlogTagOptions = (list: string[]) => setManagedList(KEYS.blogTags, list);
export const getBrandGroupOptions = () => getManagedList(KEYS.brandGroups, BRAND_GROUPS);
export const setBrandGroupOptions = (list: string[]) => setManagedList(KEYS.brandGroups, list);

/** Create a fresh invoice draft with one blank line item, ready to edit. */
export function addInvoice(): DocRecord {
  const today = new Date().toISOString().slice(0, 10);
  const d: DocRecord = {
    id: uid("doc"), templateId: null, name: "New invoice", kind: "invoice", body: "",
    status: "draft", updatedAt: new Date().toISOString(),
    invoiceNo: nextInvoiceNo(), invoiceDate: today, dueDate: "",
    billTo: "", items: [{ description: "", qty: 1, unitPrice: 0 }],
    discount: 0, taxPct: 0, terms: DEFAULT_PAYMENT_TERMS[0],
    amount: formatPeso(0),
  };
  write(KEYS.documents, [d, ...getDocuments()]);
  return d;
}
// Duplicate any document (uploaded file or text) into a fresh editable draft —
// keeps the file, invoice fields and body, resets status + send history so you
// can tweak and save a new copy quickly.
export function duplicateDocument(id: string): DocRecord | undefined {
  const src = getDocuments().find((d) => d.id === id);
  if (!src) return undefined;
  const copy: DocRecord = {
    ...src,
    id: uid("doc"),
    name: `${src.name} (copy)`,
    status: "draft",
    updatedAt: new Date().toISOString(),
    clientEmail: undefined,
    sentTo: undefined,
    sentAt: undefined,
  };
  write(KEYS.documents, [copy, ...getDocuments()]);
  logActivity("activity", `${src.kind === "invoice" ? "Invoice" : "Document"} duplicated`, copy.name, "/admin/templates");
  return copy;
}

// --- Projects (roll up their tasks by name) --------------------------
// Project statuses are user-manageable (add / rename / remove), so the type is
// an open string. DEFAULT_PROJECT_STATUSES is the seed; the live list lives in
// localStorage via getProjectStatuses().
export type ProjectStatus = string;
export const DEFAULT_PROJECT_STATUSES: string[] = ["Planning", "Active", "On hold", "Done"];
export const PROJECT_STATUSES: string[] = DEFAULT_PROJECT_STATUSES; // back-compat alias
export function getProjectStatuses(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_PROJECT_STATUSES];
  seedIfMissing(KEYS.projectStatuses, () => [...DEFAULT_PROJECT_STATUSES]);
  const list = read<string[]>(KEYS.projectStatuses, [...DEFAULT_PROJECT_STATUSES]);
  return list.length ? list : [...DEFAULT_PROJECT_STATUSES];
}
export function setProjectStatuses(list: string[]) {
  const clean = Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));
  write(KEYS.projectStatuses, clean.length ? clean : [...DEFAULT_PROJECT_STATUSES]);
}
export function addProjectStatus(name: string) {
  const n = name.trim();
  if (!n) return;
  const cur = getProjectStatuses();
  if (!cur.includes(n)) setProjectStatuses([...cur, n]);
}
export function renameProjectStatus(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n) return;
  setProjectStatuses(getProjectStatuses().map((s) => (s === oldName ? n : s)));
  // Move any projects on the old status to the new name.
  write(KEYS.projects, getProjects().map((p) => (p.status === oldName ? { ...p, status: n } : p)));
}
export function removeProjectStatus(name: string) {
  const cur = getProjectStatuses();
  if (cur.length <= 1) return;
  const fallback = cur.find((s) => s !== name) ?? DEFAULT_PROJECT_STATUSES[0];
  setProjectStatuses(cur.filter((s) => s !== name));
  write(KEYS.projects, getProjects().map((p) => (p.status === name ? { ...p, status: fallback } : p)));
}
export interface Project {
  id: string;
  name: string;
  client: string;
  owner: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  notes: string;
  archived: boolean;
}
const PROJECT_SEED: Project[] = [
  { id: "prj-01", name: "Faelight Experiences", client: "Krille Lannon — DC Creative", owner: "Dor", status: "Active", startDate: "", targetDate: "2026-08-15", notes: "", archived: false },
  { id: "prj-02", name: "Faelight Systems", client: "Faelight", owner: "Berly", status: "Active", startDate: "", targetDate: "", notes: "", archived: false },
  { id: "prj-03", name: "Faelight Mentorship Circle", client: "Faelight", owner: "Maia", status: "Active", startDate: "", targetDate: "", notes: "", archived: false },
  { id: "prj-04", name: "Faelight Business Consultancy", client: "Faelight", owner: "Maia", status: "Active", startDate: "", targetDate: "", notes: "", archived: false },
  { id: "prj-05", name: "SMART VA Pathway", client: "Faelight", owner: "Kits", status: "Active", startDate: "", targetDate: "", notes: "", archived: false },
  { id: "prj-06", name: "Video Sonic", client: "Video Sonic", owner: "Maia", status: "Planning", startDate: "", targetDate: "2026-08-11", notes: "", archived: false },
  { id: "prj-07", name: "Clara's Kitchen Ops OS", client: "Clara's Kitchen", owner: "Berly", status: "Active", startDate: "", targetDate: "", notes: "", archived: false },
  { id: "prj-08", name: "Renee CRM rebuild", client: "Renee Consulting", owner: "Kenny", status: "On hold", startDate: "", targetDate: "", notes: "", archived: false },
];
export function getProjects(): Project[] {
  const existing = read<Project[] | null>(KEYS.projects, null);
  if (existing) return existing;
  write(KEYS.projects, PROJECT_SEED);
  return PROJECT_SEED;
}
// Roll up the tasks that belong to a project (matched by project name).
export function projectTaskStats(name: string): { total: number; done: number } {
  const ts = getTasks().filter((t) => !t.archived && t.project === name);
  return { total: ts.length, done: ts.filter((t) => t.status === "Done").length };
}
export function addProject(input: Omit<Project, "id" | "archived"> & { archived?: boolean }): Project {
  const p: Project = { ...input, id: uid("prj"), archived: input.archived ?? false };
  write(KEYS.projects, [p, ...getProjects()]);
  return p;
}
export function updateProject(id: string, patch: Partial<Project>) {
  write(KEYS.projects, getProjects().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function archiveProject(id: string, archived = true) {
  updateProject(id, { archived });
}
export function removeProject(id: string) {
  write(KEYS.projects, getProjects().filter((p) => p.id !== id));
}

// --- Faelight Team (internal team directory) -------------------------
export interface TeamMemberRecord {
  id: string;
  name: string; // nickname / display
  fullName: string;
  role: string; // Role in Faelight
  discord: string;
  department: string;
  email: string;
  phone: string;
  birthday: string;
  notes: string;
  active: boolean;
  archived: boolean;
}

const TEAM_SEED: TeamMemberRecord[] = [
  { id: "tm-maia", name: "Maia", fullName: "Maria Castañeda", role: "Founder · Fairy VA Mentor", discord: "marikit", department: "Executive, Business Consultancy, Systems, Mentorship, Experiences", email: "maiaacastaneda@gmail.com", phone: "+63 917 892 1280", birthday: "February 13, 1980", notes: "", active: true, archived: false },
  { id: "tm-sassa", name: "Sassa", fullName: "Elyssa Perez", role: "EVA", discord: "", department: "Marketing, Executive, Business Consultancy, Systems", email: "", phone: "", birthday: "", notes: "Sassa now very busy", active: false, archived: false },
  { id: "tm-kenny", name: "Kenny", fullName: "Ronachai Chen", role: "Operations Manager", discord: "", department: "Experiences, Executive, Operations", email: "", phone: "", birthday: "", notes: "", active: true, archived: false },
  { id: "tm-kits", name: "Kits", fullName: "Michelle Diesto", role: "Marketing Manager", discord: "", department: "Marketing", email: "", phone: "", birthday: "", notes: "Deployed in Uncapped", active: true, archived: false },
  { id: "tm-dor", name: "Dor", fullName: "Dorwin Diesto", role: "Resident Game Master · Admin", discord: "", department: "Admin, Experiences", email: "", phone: "", birthday: "", notes: "", active: false, archived: false },
  { id: "tm-josh", name: "Josh", fullName: "Joshua Dimalanta", role: "Admin / EVA", discord: "", department: "Marketing, Experiences, Mentorship, Systems", email: "", phone: "", birthday: "", notes: "", active: false, archived: false },
  { id: "tm-berly", name: "Berly", fullName: "Berly Dimalanta", role: "Systems", discord: "", department: "Systems", email: "", phone: "", birthday: "", notes: "", active: false, archived: false },
  { id: "tm-aj", name: "AJ", fullName: "Alton Joshua Obien", role: "Systems Assistant (Notion)", discord: "", department: "Systems", email: "", phone: "", birthday: "", notes: "", active: false, archived: false },
];

export function getTeam(): TeamMemberRecord[] {
  const existing = read<TeamMemberRecord[] | null>(KEYS.team, null);
  if (existing) return existing;
  write(KEYS.team, TEAM_SEED);
  return TEAM_SEED;
}
export function addTeamMember(input: Omit<TeamMemberRecord, "id" | "archived"> & { archived?: boolean }): TeamMemberRecord {
  const m: TeamMemberRecord = { ...input, id: uid("tm"), archived: input.archived ?? false };
  write(KEYS.team, [...getTeam(), m]);
  return m;
}
export function updateTeamMember(id: string, patch: Partial<TeamMemberRecord>) {
  write(KEYS.team, getTeam().map((m) => (m.id === id ? { ...m, ...patch } : m)));
}
export function archiveTeamMember(id: string, archived = true) {
  updateTeamMember(id, { archived });
}
export function removeTeamMember(id: string) {
  write(KEYS.team, getTeam().filter((m) => m.id !== id));
}

// --- Tasks (assignable, with notification + email on assignment) -----
// Statuses double as Kanban stages and are admin-editable (add / rename /
// remove / reorder), so the type is an open string. DEFAULT_TASK_STATUSES is
// the seed; the live list lives in localStorage via getTaskStatuses().
export type TaskStatus = string;
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export const DEFAULT_TASK_STATUSES: string[] = ["Not started", "In progress", "Follow up", "To Review", "On Hold", "Approved", "Done"];
// Back-compat alias (static default list). Prefer getTaskStatuses() for the live list.
export const TASK_STATUSES: string[] = DEFAULT_TASK_STATUSES;
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export function getTaskStatuses(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_TASK_STATUSES];
  seedIfMissing(KEYS.taskStatuses, () => [...DEFAULT_TASK_STATUSES]);
  const list = read<string[]>(KEYS.taskStatuses, [...DEFAULT_TASK_STATUSES]);
  return list.length ? list : [...DEFAULT_TASK_STATUSES];
}
export function setTaskStatuses(list: string[]) {
  const clean = list.map((s) => s.trim()).filter(Boolean);
  write(KEYS.taskStatuses, clean.length ? clean : [...DEFAULT_TASK_STATUSES]);
}
export function addTaskStatus(name: string) {
  const n = name.trim();
  if (!n) return;
  const cur = getTaskStatuses();
  if (cur.some((s) => s.toLowerCase() === n.toLowerCase())) return;
  setTaskStatuses([...cur, n]);
}
export function renameTaskStatus(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n || n === oldName) return;
  setTaskStatuses(getTaskStatuses().map((s) => (s === oldName ? n : s)));
  // migrate existing tasks to the new label
  write(KEYS.tasks, read<Task[]>(KEYS.tasks, []).map((t) => (t.status === oldName ? { ...t, status: n } : t)));
}
export function removeTaskStatus(name: string) {
  const cur = getTaskStatuses();
  if (cur.length <= 1) return; // never remove the last stage
  const fallback = cur.find((s) => s !== name) ?? DEFAULT_TASK_STATUSES[0];
  setTaskStatuses(cur.filter((s) => s !== name));
  write(KEYS.tasks, read<Task[]>(KEYS.tasks, []).map((t) => (t.status === name ? { ...t, status: fallback } : t)));
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignees: string[];
  dueDate: string;
  priority: TaskPriority;
  project: string;
  clientList: string;
  status: TaskStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  archived: boolean;
}

const TASK_SEED: Task[] = [
  { id: "task-01", title: "Faelight Experiences Teaser", description: "", assignees: ["Dor"], dueDate: "2026-08-11", priority: "High", project: "Faelight Experiences", clientList: "Krille Lannon — DC Creative", status: "To Review", createdBy: "Maia", createdAt: daysAgo(2), archived: false },
  { id: "task-02", title: "Video Sonic Build", description: "", assignees: ["Maia"], dueDate: "2026-08-11", priority: "Urgent", project: "Faelight Systems", clientList: "Video Sonic", status: "Approved", createdBy: "Maia", createdAt: daysAgo(3), archived: false },
  { id: "task-03", title: "Create Proposal — Vibrant Dreams", description: "Proposal for 2-pax Notion class", assignees: ["Elyssa"], dueDate: "2026-08-10", priority: "Urgent", project: "Faelight Mentorship Circle", clientList: "Vibrant Dreams", status: "In progress", createdBy: "Maia", createdAt: daysAgo(4), archived: false },
  { id: "task-04", title: "SMM for Faelight", description: "", assignees: ["Kits"], dueDate: "", priority: "Medium", project: "Faelight Business Consultancy", clientList: "", status: "In progress", createdBy: "Maia", createdAt: daysAgo(5), archived: false },
  { id: "task-05", title: "Faelight Notion", description: "", assignees: ["Elyssa"], dueDate: "2026-08-04", priority: "High", project: "Faelight Business Consultancy", clientList: "faelight", status: "In progress", createdBy: "Maia", createdAt: daysAgo(6), archived: false },
  { id: "task-06", title: "Website faelight", description: "", assignees: ["Berly"], dueDate: "", priority: "High", project: "Faelight Business Consultancy", clientList: "faelight", status: "In progress", createdBy: "Maia", createdAt: daysAgo(7), archived: false },
  { id: "task-07", title: "Faelight Marketing", description: "", assignees: ["Josh"], dueDate: "", priority: "Medium", project: "Faelight Business Consultancy", clientList: "faelight", status: "In progress", createdBy: "Maia", createdAt: daysAgo(7), archived: false },
  { id: "task-08", title: "Posters for SMART VA", description: "", assignees: ["Kits"], dueDate: "2026-07-31", priority: "High", project: "SMART VA Pathway", clientList: "SMART VA Pathway", status: "In progress", createdBy: "Maia", createdAt: daysAgo(9), archived: false },
  { id: "task-09", title: "Certificates for Batch 3 and 4", description: "", assignees: ["Dor"], dueDate: "2026-07-29", priority: "Medium", project: "Faelight Mentorship Circle", clientList: "faelight", status: "In progress", createdBy: "Maia", createdAt: daysAgo(9), archived: false },
  { id: "task-10", title: "Need to send Miraceti Client Intake", description: "", assignees: ["Maia"], dueDate: "2026-07-28", priority: "High", project: "Faelight Mentorship Circle", clientList: "MiraCeti Guides Inc", status: "Done", createdBy: "Maia", createdAt: daysAgo(11), archived: false },
];

export function getTasks(): Task[] {
  const existing = read<Task[] | null>(KEYS.tasks, null);
  if (existing) return existing;
  write(KEYS.tasks, TASK_SEED);
  return TASK_SEED;
}
// Assignment → in-system notification + (simulated) email, deep-linking to the task.
function notifyAssignment(t: Task, assignee: string) {
  if (!assignee) return;
  logActivity("task", `Task assigned to ${assignee}`, `${t.title} · email sent`, `/admin/tasks?task=${t.id}`);
}
export function addTask(input: Omit<Task, "id" | "createdAt" | "archived"> & { archived?: boolean }): Task {
  const t: Task = { ...input, id: uid("task"), archived: input.archived ?? false, createdAt: new Date().toISOString() };
  write(KEYS.tasks, [t, ...getTasks()]);
  t.assignees.forEach((a) => notifyAssignment(t, a));
  return t;
}
export function updateTask(id: string, patch: Partial<Task>) {
  const before = getTasks().find((x) => x.id === id);
  const beforeAssignees = before?.assignees ?? [];
  write(KEYS.tasks, getTasks().map((x) => (x.id === id ? { ...x, ...patch } : x)));
  if (patch.assignees) {
    const after = getTasks().find((x) => x.id === id);
    if (after) patch.assignees.filter((a) => !beforeAssignees.includes(a)).forEach((a) => notifyAssignment(after, a));
  }
}
export function archiveTask(id: string, archived = true) {
  updateTask(id, { archived });
}
export function removeTask(id: string) {
  write(KEYS.tasks, getTasks().filter((t) => t.id !== id));
}

// --- Activity log + Notifications ------------------------------------
export type NotifKind = "payment" | "booking" | "event" | "review" | "pool" | "activity" | "task";

export interface ActivityEntry {
  id: string;
  kind: NotifKind;
  title: string;
  detail: string;
  ts: string;
  href?: string;
}
export type NotifGroup = "booking" | "review" | "payment" | "class" | "webinar" | "other";
export interface Notification {
  id: string;
  kind: NotifKind;
  group: NotifGroup;
  title: string;
  detail: string;
  ts?: string;
  href: string;
}

export function getActivity(): ActivityEntry[] {
  return read<ActivityEntry[]>(KEYS.activity, []);
}
// Log a lightweight activity event (e.g. a public pool visit). Capped list.
export function logActivity(kind: NotifKind, title: string, detail: string, href = "/admin") {
  const entry: ActivityEntry = {
    id: uid("act"),
    kind,
    title,
    detail,
    ts: new Date().toISOString(),
    href,
  };
  write(KEYS.activity, [entry, ...getActivity()].slice(0, 50));
}

export function getNotifications(): Notification[] {
  const out: Notification[] = [];

  // Reviews / testimonials awaiting approval
  getReviews()
    .filter((r) => r.status === "pending")
    .forEach((r) =>
      out.push({
        id: `n-rev-${r.id}`,
        kind: "review",
        group: "review",
        title: "New review awaiting approval",
        detail: `${r.author}${r.rating ? ` — ${r.rating}★` : ""}`,
        ts: r.createdAt,
        href: "/admin/reviews",
      })
    );

  // Bookings + payments
  getBookings().forEach((b) => {
    if (b.proofSubmittedAt && b.paymentStatus === "submitted") {
      out.push({
        id: `n-pay-${b.id}`,
        kind: "payment",
        group: "payment",
        title: "Payment proof submitted",
        detail: `${b.clientName}${b.feeLabel ? ` · ${b.feeLabel}` : ""}`,
        ts: b.proofSubmittedAt,
        href: "/admin/payments",
      });
    } else if (b.paidAt && b.paymentStatus === "paid") {
      out.push({
        id: `n-paid-${b.id}`,
        kind: "payment",
        group: "payment",
        title: "Payment received",
        detail: b.clientName,
        ts: b.paidAt,
        href: "/admin/payments",
      });
    }
    out.push({
      id: `n-book-${b.id}`,
      kind: "booking",
      group: "booking",
      title: "Booking",
      detail: `${b.clientName} · ${b.bookingTypeName}`,
      ts: b.createdAt,
      href: "/admin/bookings",
    });
  });

  // Upcoming classes / webinars / events (informational)
  getUpcomingSessions().forEach((s) =>
    out.push({
      id: `n-ses-${s.id}`,
      kind: "event",
      group: s.kind === "webinar" ? "webinar" : "class",
      title: `Upcoming ${s.kind}`,
      detail: `${s.title} · ${s.date}`,
      href: "/admin/sessions",
    })
  );

  // Activity log (pool visits, tasks, etc.)
  getActivity().forEach((a) =>
    out.push({ id: a.id, kind: a.kind, group: "other", title: a.title, detail: a.detail, ts: a.ts, href: a.href ?? "/admin" })
  );

  out.sort((a, b) => (b.ts ? +new Date(b.ts) : 0) - (a.ts ? +new Date(a.ts) : 0));
  return out.slice(0, 40);
}

export function getNotifReadAt(): number {
  return read<number>(KEYS.notifRead, 0);
}
export function markNotificationsRead() {
  write(KEYS.notifRead, Date.now());
}
export function unreadNotifications(): number {
  const readAt = getNotifReadAt();
  return getNotifications().filter((n) => n.ts && +new Date(n.ts) > readAt).length;
}

// --- Leads -----------------------------------------------------------
export function getLeads(): Lead[] {
  ensureSeed();
  return read<Lead[]>(KEYS.leads, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

export function addLead(
  input: Omit<Lead, "id" | "createdAt" | "status"> & { status?: LeadStatus }
): Lead {
  const lead: Lead = {
    ...input,
    id: uid("lead"),
    status: input.status ?? "new",
    createdAt: new Date().toISOString(),
  };
  const all = read<Lead[]>(KEYS.leads, []);
  write(KEYS.leads, [lead, ...all]);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>) {
  const all = read<Lead[]>(KEYS.leads, []);
  write(
    KEYS.leads,
    all.map((l) => (l.id === id ? { ...l, ...patch } : l))
  );
}

export function removeLead(id: string) {
  write(KEYS.leads, read<Lead[]>(KEYS.leads, []).filter((l) => l.id !== id));
}

export function getLead(id: string): Lead | undefined {
  return getLeads().find((l) => l.id === id);
}

// --- Lead statuses (Kanban columns) — admin-editable (add/rename/remove) ----
export function getLeadStatuses(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_LEAD_STATUSES];
  seedIfMissing(KEYS.leadStatuses, () => [...DEFAULT_LEAD_STATUSES]);
  const list = read<string[]>(KEYS.leadStatuses, [...DEFAULT_LEAD_STATUSES]);
  return list.length ? list : [...DEFAULT_LEAD_STATUSES];
}
export function setLeadStatuses(list: string[]) {
  const clean = Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));
  write(KEYS.leadStatuses, clean.length ? clean : [...DEFAULT_LEAD_STATUSES]);
}
export function addLeadStatus(name: string) {
  const n = name.trim();
  if (!n) return;
  const cur = getLeadStatuses();
  if (!cur.includes(n)) setLeadStatuses([...cur, n]);
}
export function renameLeadStatus(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n) return;
  setLeadStatuses(getLeadStatuses().map((s) => (s === oldName ? n : s)));
  write(KEYS.leads, read<Lead[]>(KEYS.leads, []).map((l) => (l.status === oldName ? { ...l, status: n } : l)));
}
export function removeLeadStatus(name: string) {
  const cur = getLeadStatuses();
  if (cur.length <= 1) return;
  const fallback = cur.find((s) => s !== name) ?? DEFAULT_LEAD_STATUSES[0];
  setLeadStatuses(cur.filter((s) => s !== name));
  write(KEYS.leads, read<Lead[]>(KEYS.leads, []).map((l) => (l.status === name ? { ...l, status: fallback } : l)));
}

// --- Notes -----------------------------------------------------------
export function getNotes(leadId: string): LeadNote[] {
  return read<LeadNote[]>(KEYS.notes, [])
    .filter((n) => n.leadId === leadId)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}
export function addNote(leadId: string, author: string, note: string): LeadNote {
  const n: LeadNote = {
    id: uid("note"),
    leadId,
    author,
    note,
    createdAt: new Date().toISOString(),
  };
  write(KEYS.notes, [...read<LeadNote[]>(KEYS.notes, []), n]);
  return n;
}

// --- Bookings --------------------------------------------------------
export function getBookings(): Booking[] {
  ensureSeed();
  return read<Booking[]>(KEYS.bookings, []).sort(
    (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)
  );
}

export function addBooking(
  input: Omit<Booking, "id" | "createdAt" | "status" | "meetLink"> & {
    status?: BookingStatus;
  }
): Booking {
  const booking: Booking = {
    ...input,
    id: uid("bk"),
    status: input.status ?? "confirmed",
    paymentStatus: input.paymentStatus ?? "unpaid",
    meetLink: conferenceLink(getSettings().calendarProvider),
    createdAt: new Date().toISOString(),
  };
  write(KEYS.bookings, [...read<Booking[]>(KEYS.bookings, []), booking]);
  // Booking blocks the calendar on the linked/default provider too (sync).
  return booking;
}

// Video-conferencing link that matches the active calendar provider.
function conferenceLink(provider: CalendarProvider): string {
  const chunk = (n: number) => Math.random().toString(36).slice(2, 2 + n);
  if (provider === "microsoft")
    return `https://teams.microsoft.com/l/meetup-join/${chunk(8)}-${chunk(4)}`;
  if (provider === "google")
    return `https://meet.google.com/${chunk(3)}-${chunk(4)}-${chunk(3)}`;
  return `https://meet.faelight.ph/${chunk(6)}`; // built-in room
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  const all = read<Booking[]>(KEYS.bookings, []);
  write(
    KEYS.bookings,
    all.map((b) => (b.id === id ? { ...b, ...patch } : b))
  );
}

// --- Calendar events (personal holds + synced external events) -------
// One shared collection is the source of truth. Each event is tagged with
// the calendar it came from, which is what makes sync bidirectional:
// an "app" hold shows on the linked calendar; a synced "google"/"microsoft"
// event shows in the app. All of them block public booking availability.
export type EventSource = "app" | "google" | "microsoft";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD (local)
  startMin: number; // minutes from midnight; 0 + endMin 1440 = all day
  endMin: number;
  title: string;
  source: EventSource;
  allDay: boolean;
}

// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString()).
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function getEvents(): CalendarEvent[] {
  ensureSeed();
  return read<CalendarEvent[]>(KEYS.events, []);
}
export function getEventsForDate(date: Date): CalendarEvent[] {
  const key = ymd(date);
  return getEvents()
    .filter((e) => e.date === key)
    .sort((a, b) => a.startMin - b.startMin);
}
export function addEvent(input: Omit<CalendarEvent, "id">): CalendarEvent {
  const ev: CalendarEvent = { ...input, id: uid("ev") };
  write(KEYS.events, [...read<CalendarEvent[]>(KEYS.events, []), ev]);
  return ev;
}
export function removeEvent(id: string) {
  write(
    KEYS.events,
    read<CalendarEvent[]>(KEYS.events, []).filter((e) => e.id !== id)
  );
}

// --- Blocked dates + weekends ----------------------------------------
export function isDateBlocked(s: Settings, date: Date): boolean {
  return s.blockedDates.includes(ymd(date));
}
export function toggleBlockedDate(date: Date) {
  const s = getSettings();
  const key = ymd(date);
  const blocked = s.blockedDates.includes(key)
    ? s.blockedDates.filter((d) => d !== key)
    : [...s.blockedDates, key];
  saveSettings({ blockedDates: blocked });
}

// =====================================================================
// Marketing — email campaigns, social accounts, videos & short intros.
// Managed by Kits (marketing) & Josh (SEO/web). In production, campaigns
// send via an email service (Resend/Mailchimp); here they're simulated.
// =====================================================================
export type CampaignStatus = "draft" | "scheduled" | "sent";

export interface Campaign {
  id: string;
  subject: string;
  body: string;
  audience: "all" | CategorySlug;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount?: number;
  author: string;
  createdAt: string;
}

export interface SocialAccount {
  platform: string; // key
  label: string;
  handle: string;
  url: string;
  connected: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  description: string;
  kind: "intro" | "promo" | "testimonial" | "other";
  createdAt: string;
}

export interface IntroItem {
  id: string;
  title: string;
  text: string;
}

// --- Social content calendar (plan & schedule posts) -----------------
export type SocialPostStatus = "draft" | "scheduled" | "posted";
export const SOCIAL_PLATFORMS = ["facebook", "instagram", "linkedin", "tiktok", "youtube"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export interface SocialPost {
  id: string;
  platforms: string[];
  caption: string;
  link?: string;
  mediaUrl?: string;   // data URL or link (thumbnail/preview)
  scheduledAt: string; // ISO
  status: SocialPostStatus;
  createdAt: string;
}

// --- Promotions / offers (codes shown in campaigns & on the site) ----
export interface Promo {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;      // e.g. "15% off" or "₱500 off"
  validFrom?: string;    // YYYY-MM-DD
  validTo?: string;      // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

// Number of contacts who opted into updates (the mailing list).
export function subscriberCount(): number {
  return getLeads().filter((l) => l.agreedToUpdates).length;
}
export function subscribers(): Lead[] {
  return getLeads().filter((l) => l.agreedToUpdates);
}

// --- Campaigns -------------------------------------------------------
export function getCampaigns(): Campaign[] {
  ensureSeed();
  seedIfMissing(KEYS.campaigns, seedCampaigns);
  return read<Campaign[]>(KEYS.campaigns, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}
export function addCampaign(
  input: Omit<Campaign, "id" | "createdAt" | "status"> & { status?: CampaignStatus }
): Campaign {
  const c: Campaign = {
    ...input,
    id: uid("cmp"),
    status: input.status ?? "draft",
    createdAt: new Date().toISOString(),
  };
  write(KEYS.campaigns, [c, ...read<Campaign[]>(KEYS.campaigns, [])]);
  return c;
}
export function updateCampaign(id: string, patch: Partial<Campaign>) {
  write(
    KEYS.campaigns,
    read<Campaign[]>(KEYS.campaigns, []).map((c) => (c.id === id ? { ...c, ...patch } : c))
  );
}
export function removeCampaign(id: string) {
  write(KEYS.campaigns, read<Campaign[]>(KEYS.campaigns, []).filter((c) => c.id !== id));
}

// Recipients on the list matching a campaign's audience.
export function campaignRecipientCount(audience: "all" | CategorySlug): number {
  const subs = subscribers();
  return audience === "all" ? subs.length : subs.filter((l) => l.categorySlug === audience).length;
}

// "Automation": send any scheduled campaign whose time has arrived. In
// production a cron/queue does this server-side; here it runs whenever the
// app is open (marketing page polls it). Returns how many were sent.
export function runDueCampaigns(): number {
  if (typeof window === "undefined") return 0;
  const now = Date.now();
  const all = read<Campaign[]>(KEYS.campaigns, []);
  let count = 0;
  const next = all.map((c) => {
    if (c.status === "scheduled" && c.scheduledAt && new Date(c.scheduledAt).getTime() <= now) {
      count++;
      return {
        ...c,
        status: "sent" as CampaignStatus,
        sentAt: new Date().toISOString(),
        recipientCount: campaignRecipientCount(c.audience),
      };
    }
    return c;
  });
  if (count > 0) write(KEYS.campaigns, next);
  return count;
}

// --- Automations (standing rules) ------------------------------------
export interface Automations {
  autoWelcome: boolean; // welcome email to every new subscriber
  monthlyDigest: boolean; // monthly newsletter reminder
}
const DEFAULT_AUTOMATIONS: Automations = { autoWelcome: true, monthlyDigest: false };
export function getAutomations(): Automations {
  return { ...DEFAULT_AUTOMATIONS, ...read<Partial<Automations>>(KEYS.automations, {}) };
}
export function saveAutomations(patch: Partial<Automations>) {
  write(KEYS.automations, { ...getAutomations(), ...patch });
}

// --- Social accounts -------------------------------------------------
const DEFAULT_SOCIAL: SocialAccount[] = [
  { platform: "facebook", label: "Facebook", handle: "@FaelightBusinessConsultancy", url: "https://facebook.com/FaelightBusinessConsultancy", connected: true },
  { platform: "instagram", label: "Instagram", handle: "@faelight", url: "https://instagram.com/faelight", connected: true },
  { platform: "linkedin", label: "LinkedIn", handle: "Faelight Business Consultancy", url: "", connected: false },
  { platform: "tiktok", label: "TikTok", handle: "@faelight", url: "", connected: false },
  { platform: "youtube", label: "YouTube", handle: "Faelight", url: "", connected: false },
];
export function getSocialAccounts(): SocialAccount[] {
  const stored = read<SocialAccount[]>(KEYS.social, []);
  // merge defaults with stored overrides by platform
  return DEFAULT_SOCIAL.map((d) => ({ ...d, ...stored.find((s) => s.platform === d.platform) }));
}
export function saveSocialAccount(platform: string, patch: Partial<SocialAccount>) {
  const all = getSocialAccounts().map((s) =>
    s.platform === platform ? { ...s, ...patch } : s
  );
  write(KEYS.social, all);
}

// --- Videos ----------------------------------------------------------
export function getVideos(): VideoItem[] {
  ensureSeed();
  seedIfMissing(KEYS.videos, seedVideos);
  return read<VideoItem[]>(KEYS.videos, []);
}
export function addVideo(input: Omit<VideoItem, "id" | "createdAt">): VideoItem {
  const v: VideoItem = { ...input, id: uid("vid"), createdAt: new Date().toISOString() };
  write(KEYS.videos, [v, ...read<VideoItem[]>(KEYS.videos, [])]);
  return v;
}
export function removeVideo(id: string) {
  write(KEYS.videos, read<VideoItem[]>(KEYS.videos, []).filter((v) => v.id !== id));
}

// --- Short intros ----------------------------------------------------
export function getIntros(): IntroItem[] {
  ensureSeed();
  seedIfMissing(KEYS.intros, seedIntros);
  return read<IntroItem[]>(KEYS.intros, []);
}
export function addIntro(input: Omit<IntroItem, "id">): IntroItem {
  const i: IntroItem = { ...input, id: uid("intro") };
  write(KEYS.intros, [i, ...read<IntroItem[]>(KEYS.intros, [])]);
  return i;
}
export function updateIntro(id: string, patch: Partial<IntroItem>) {
  write(KEYS.intros, read<IntroItem[]>(KEYS.intros, []).map((i) => (i.id === id ? { ...i, ...patch } : i)));
}
export function removeIntro(id: string) {
  write(KEYS.intros, read<IntroItem[]>(KEYS.intros, []).filter((i) => i.id !== id));
}

// --- Social content calendar -----------------------------------------
function seedSocialPosts(): SocialPost[] {
  return [
    { id: uid("post"), platforms: ["instagram", "facebook"], caption: "New Foundations Class cohort opens this week — 24 seats. Tag a friend who's ready to start their VA journey ✦", link: "/classes", scheduledAt: daysFromNow(1), status: "scheduled", createdAt: daysAgo(1) },
    { id: uid("post"), platforms: ["linkedin"], caption: "People first. Systems second. Why we design operations around the humans who run them — new on the Faelight blog.", link: "/blog", scheduledAt: daysFromNow(3), status: "scheduled", createdAt: daysAgo(1) },
    { id: uid("post"), platforms: ["tiktok", "instagram"], caption: "60-second tour of the operations workspace we build for clients 👀", scheduledAt: daysAgo(2), status: "posted", createdAt: daysAgo(5) },
  ];
}
export function getSocialPosts(): SocialPost[] {
  ensureSeed();
  seedIfMissing(KEYS.socialPosts, seedSocialPosts);
  return read<SocialPost[]>(KEYS.socialPosts, []).sort(
    (a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)
  );
}
export function addSocialPost(input: Omit<SocialPost, "id" | "createdAt">): SocialPost {
  const p: SocialPost = { ...input, id: uid("post"), createdAt: new Date().toISOString() };
  write(KEYS.socialPosts, [p, ...read<SocialPost[]>(KEYS.socialPosts, [])]);
  return p;
}
export function updateSocialPost(id: string, patch: Partial<SocialPost>) {
  write(KEYS.socialPosts, read<SocialPost[]>(KEYS.socialPosts, []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function removeSocialPost(id: string) {
  write(KEYS.socialPosts, read<SocialPost[]>(KEYS.socialPosts, []).filter((p) => p.id !== id));
}

// --- Promotions / offers ---------------------------------------------
function seedPromos(): Promo[] {
  return [
    { id: uid("promo"), code: "EARLYBIRD", title: "Foundations early-bird", description: "Bonus 1:1 onboarding call for early enrolees of the next Foundations cohort.", discount: "Free onboarding call", validTo: ymdFromNow(30), active: true, createdAt: daysAgo(3) },
    { id: uid("promo"), code: "SYSTEMS15", title: "Systems build intro offer", description: "15% off the first month of any new Systems engagement booked this quarter.", discount: "15% off", validTo: ymdFromNow(60), active: true, createdAt: daysAgo(10) },
  ];
}
export function getPromos(): Promo[] {
  ensureSeed();
  seedIfMissing(KEYS.promos, seedPromos);
  return read<Promo[]>(KEYS.promos, []).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
export function getActivePromos(): Promo[] {
  const today = ymd(new Date());
  return getPromos().filter((p) => p.active && (!p.validTo || p.validTo >= today) && (!p.validFrom || p.validFrom <= today));
}
export function addPromo(input: Omit<Promo, "id" | "createdAt">): Promo {
  const p: Promo = { ...input, id: uid("promo"), createdAt: new Date().toISOString() };
  write(KEYS.promos, [p, ...read<Promo[]>(KEYS.promos, [])]);
  return p;
}
export function updatePromo(id: string, patch: Partial<Promo>) {
  write(KEYS.promos, read<Promo[]>(KEYS.promos, []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function removePromo(id: string) {
  write(KEYS.promos, read<Promo[]>(KEYS.promos, []).filter((p) => p.id !== id));
}

// --- Reviews / testimonials (admin-moderated) ------------------------
export type ReviewStatus = "pending" | "approved" | "rejected";
export interface Review {
  id: string;
  author: string;
  roleCompany: string;
  quote: string;
  categorySlug?: CategorySlug | null;
  rating?: number; // 1–5
  status: ReviewStatus;
  createdAt: string;
  /** Optional video testimonial — a YouTube/Vimeo/direct-file link, or an uploaded data URL. */
  videoUrl?: string;
}

export function getReviews(): Review[] {
  ensureSeed();
  seedIfMissing(KEYS.reviews, seedReviews);
  return read<Review[]>(KEYS.reviews, []).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}
export function getApprovedReviews(): Review[] {
  return getReviews().filter((r) => r.status === "approved");
}
export function addReview(
  input: Omit<Review, "id" | "createdAt" | "status"> & { status?: ReviewStatus }
): Review {
  const r: Review = {
    ...input,
    id: uid("rev"),
    status: input.status ?? "pending",
    createdAt: new Date().toISOString(),
  };
  write(KEYS.reviews, [r, ...read<Review[]>(KEYS.reviews, [])]);
  return r;
}
export function updateReview(id: string, patch: Partial<Review>) {
  write(KEYS.reviews, read<Review[]>(KEYS.reviews, []).map((r) => (r.id === id ? { ...r, ...patch } : r)));
}
export function removeReview(id: string) {
  write(KEYS.reviews, read<Review[]>(KEYS.reviews, []).filter((r) => r.id !== id));
}

// --- Blog / Insights (admin-managed) ---------------------------------
export type BlogStatus = "draft" | "published";
export const BLOG_TAGS = ["Insights", "Systems", "VA Career", "Community", "News", "Guide"] as const;
// Open string so blog tags can be admin-managed (add/remove); BLOG_TAGS is the seed.
export type BlogTag = string;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;        // plain text / light markdown (paragraphs split on blank lines)
  coverImage?: string; // data URL or external link
  author: string;
  tag: BlogTag;
  readMins: number;
  status: BlogStatus;
  publishedAt: string; // ISO
  createdAt: string;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || "post";
}

function seedBlog(): BlogPost[] {
  const mk = (
    title: string, tag: BlogTag, excerpt: string, body: string, daysAgoN: number, readMins: number
  ): BlogPost => ({
    id: uid("post"),
    title,
    slug: slugify(title),
    excerpt,
    body,
    author: "Maria “Maia” Castañeda",
    tag,
    readMins,
    status: "published",
    publishedAt: daysAgo(daysAgoN),
    createdAt: daysAgo(daysAgoN),
  });
  return [
    mk(
      "People first, systems second: why we build in that order",
      "Insights",
      "The fastest way to break a good team is to hand them a system nobody helped design. Here's the order we actually build in — and why.",
      "Most operations problems aren't tooling problems. They're clarity problems wearing a tooling costume.\n\nWhen we start with the people — what they already know, where the work really snags, what they're quietly working around — the system almost designs itself. We map the real workflow before we touch a single app.\n\nThen the systems layer is small, obvious, and used. People first. Systems second. Magic throughout.",
      4, 4,
    ),
    mk(
      "From underpaid VA to confident operator: a 90-day path",
      "VA Career",
      "You're rarely starting from zero. Here's how we help virtual assistants translate what they already do into work they can charge for.",
      "A mother managing a household already understands coordination. A career shifter already has experience. An underpaid VA already has skills.\n\nWhat's usually missing is the language to name it and the confidence to price it. Over 90 days we build a portfolio from real tasks, a small set of repeatable systems, and the vocabulary to explain the value in a client call.\n\nThe result isn't a certificate. It's a person who can walk into a discovery call and hold their own.",
      12, 5,
    ),
    mk(
      "The operations workspace we build for clients",
      "Systems",
      "Dashboards, SOPs, portals and light automation — in one calm workspace a team can actually run without you.",
      "A good operations workspace does three quiet things: it shows the state of the work, it holds the how, and it removes the copy-paste.\n\nWe build the dashboard first so the team can see reality. Then the SOPs so the how lives somewhere other than one person's head. Then a thin layer of automation for the parts nobody should be doing by hand.\n\nNo 17 tabs. No tribal knowledge. Just a system the team trusts.",
      20, 3,
    ),
  ];
}

export function getBlogPosts(): BlogPost[] {
  ensureSeed();
  seedIfMissing(KEYS.blog, seedBlog);
  return read<BlogPost[]>(KEYS.blog, []).sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
}
export function getPublishedPosts(): BlogPost[] {
  return getBlogPosts().filter((p) => p.status === "published");
}
export function getPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}
export function addBlogPost(
  input: Omit<BlogPost, "id" | "createdAt" | "slug"> & { slug?: string }
): BlogPost {
  const existing = read<BlogPost[]>(KEYS.blog, []);
  let slug = input.slug?.trim() || slugify(input.title);
  // ensure unique slug
  if (existing.some((p) => p.slug === slug)) slug = `${slug}-${existing.length + 1}`;
  const p: BlogPost = {
    ...input,
    slug,
    id: uid("post"),
    createdAt: new Date().toISOString(),
  };
  write(KEYS.blog, [p, ...existing]);
  logActivity("activity", `Blog post ${input.status === "published" ? "published" : "drafted"}`, input.title, `/blog`);
  return p;
}
export function updateBlogPost(id: string, patch: Partial<BlogPost>) {
  write(KEYS.blog, read<BlogPost[]>(KEYS.blog, []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function removeBlogPost(id: string) {
  write(KEYS.blog, read<BlogPost[]>(KEYS.blog, []).filter((p) => p.id !== id));
}

// --- Brands / clients we support (admin-managed) ---------------------
export interface Brand {
  id: string;
  name: string;
  group: string; // one of BRAND_GROUPS
  logoUrl?: string; // URL or data: URI (uploaded)
  active: boolean;
  createdAt: string;
}

export function getBrands(): Brand[] {
  ensureSeed();
  seedIfMissing(KEYS.brands, seedBrands);
  return read<Brand[]>(KEYS.brands, []);
}
export function getActiveBrands(): Brand[] {
  return getBrands().filter((b) => b.active);
}
export function addBrand(input: Omit<Brand, "id" | "createdAt" | "active"> & { active?: boolean }): Brand {
  const b: Brand = { ...input, id: uid("brand"), active: input.active ?? true, createdAt: new Date().toISOString() };
  write(KEYS.brands, [...read<Brand[]>(KEYS.brands, []), b]);
  return b;
}
export function updateBrand(id: string, patch: Partial<Brand>) {
  write(KEYS.brands, read<Brand[]>(KEYS.brands, []).map((b) => (b.id === id ? { ...b, ...patch } : b)));
}
export function removeBrand(id: string) {
  write(KEYS.brands, read<Brand[]>(KEYS.brands, []).filter((b) => b.id !== id));
}

export function resetDemo() {
  if (typeof window === "undefined") return;
  [
    KEYS.leads, KEYS.notes, KEYS.bookings, KEYS.settings, KEYS.services,
    KEYS.events, KEYS.campaigns, KEYS.social, KEYS.videos, KEYS.intros,
    KEYS.automations, KEYS.reviews, KEYS.brands, KEYS.seeded,
  ].forEach((k) => localStorage.removeItem(k));
  ensureSeed(true);
  window.dispatchEvent(new CustomEvent("fae:store"));
}

// --- Seed ------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (n % 6), (n * 7) % 60, 0, 0);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10 + (n % 5), (n * 11) % 60, 0, 0);
  return d.toISOString();
}
function ymdFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return ymd(d);
}

function ensureSeed(force = false) {
  if (typeof window === "undefined") return;
  if (!force && localStorage.getItem(KEYS.seeded)) return;

  const seedLeads: Lead[] = [
    {
      id: "lead-seed-1",
      name: "Andrea Villaruz",
      email: "andrea.v@example.com",
      phone: "+63 917 111 2233",
      company: "Bloom & Co (café)",
      categorySlug: "systems",
      serviceId: "svc-discovery",
      message:
        "Our operations are held together by three group chats and my memory. Help.",
      source: "Facebook",
      utmSource: "facebook",
      utmMedium: "social",
      utmCampaign: "systems-launch",
      agreedToUpdates: true,
      status: "discovery booked",
      createdAt: daysAgo(2),
    },
    {
      id: "lead-seed-2",
      name: "Mark Delos Reyes",
      email: "mark.dr@example.com",
      phone: "+63 918 445 8890",
      company: "",
      categorySlug: "mentoring",
      serviceId: "svc-smart",
      message: "Career shifter here — want to become a VA. Where do I start?",
      source: "Referral from a friend",
      utmSource: "referral",
      utmMedium: "word-of-mouth",
      utmCampaign: "",
      agreedToUpdates: true,
      status: "contacted",
      createdAt: daysAgo(4),
    },
    {
      id: "lead-seed-3",
      name: "Grace Tanaka",
      email: "grace.t@example.com",
      phone: "",
      company: "Kaizen Remote Ltd",
      categorySlug: "experiences",
      serviceId: "svc-virtual-team",
      message:
        "Distributed team of 22 across 3 timezones. We need connection before year-end.",
      source: "LinkedIn",
      utmSource: "linkedin",
      utmMedium: "social",
      utmCampaign: "",
      agreedToUpdates: false,
      status: "proposal sent",
      createdAt: daysAgo(6),
    },
    {
      id: "lead-seed-4",
      name: "Bianca Ocampo",
      email: "bianca.o@example.com",
      phone: "+63 906 220 7781",
      company: "Ocampo Dental",
      categorySlug: "systems",
      serviceId: "svc-sop",
      message: "Onboarding new staff is chaos. Need SOPs and handover docs.",
      source: "Google search",
      utmSource: "google",
      utmMedium: "organic",
      utmCampaign: "",
      agreedToUpdates: true,
      status: "won",
      createdAt: daysAgo(11),
    },
    {
      id: "lead-seed-5",
      name: "Paolo Mendoza",
      email: "paolo.m@example.com",
      phone: "",
      company: "",
      categorySlug: "mentoring",
      serviceId: "svc-leadership",
      message: "Senior VA wanting to move into an EVA / team lead role.",
      source: "Instagram",
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "leadership",
      agreedToUpdates: true,
      status: "new",
      createdAt: daysAgo(1),
    },
    {
      id: "lead-seed-6",
      name: "Reina Salazar",
      email: "reina.s@example.com",
      phone: "+63 915 778 1122",
      company: "Salazar Realty",
      categorySlug: "systems",
      serviceId: "svc-notion-build",
      message: "Everything lives in my head. I want a Notion workspace for the team.",
      source: "A Faelight class or event",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      agreedToUpdates: true,
      status: "new",
      createdAt: daysAgo(0),
    },
    {
      id: "lead-seed-7",
      name: "Tim Ferrer",
      email: "tim.f@example.com",
      phone: "",
      company: "Ferrer Logistics",
      categorySlug: "systems",
      serviceId: "svc-audit",
      message: "Not sure this is the right time for us, budget is tight.",
      source: "Google search",
      utmSource: "google",
      utmMedium: "organic",
      utmCampaign: "",
      agreedToUpdates: false,
      status: "lost",
      createdAt: daysAgo(18),
    },
  ];

  const seedNotes: LeadNote[] = [
    {
      id: "note-seed-1",
      leadId: "lead-seed-1",
      author: "Kenny",
      note: "Booked her discovery call for this week. Very warm lead.",
      createdAt: daysAgo(2),
    },
    {
      id: "note-seed-2",
      leadId: "lead-seed-3",
      author: "Maia",
      note: "Sent proposal for a half-day experience + follow-up virtual session.",
      createdAt: daysAgo(3),
    },
    {
      id: "note-seed-3",
      leadId: "lead-seed-4",
      author: "Sassa",
      note: "Signed! SOP package kicks off next week. 🎉",
      createdAt: daysAgo(9),
    },
  ];

  // Bookings (and therefore Payments, which are derived from bookings) start
  // empty for go-live — no seeded demo bookings/payments.
  const seedBookings: Booking[] = [];

  // A couple of calendar events — one personal hold (app), one synced in
  // from the linked calendar (google) — to show two-way sync.
  const evDay = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return ymd(d);
  };
  const seedEvents: CalendarEvent[] = [
    {
      id: "ev-seed-1",
      date: evDay(2),
      startMin: 10 * 60,
      endMin: 11 * 60,
      title: "Deep work — no meetings",
      source: "app",
      allDay: false,
    },
    {
      id: "ev-seed-2",
      date: evDay(4),
      startMin: 15 * 60,
      endMin: 16 * 60 + 30,
      title: "Client call (from Google)",
      source: "google",
      allDay: false,
    },
  ];

  write(KEYS.leads, seedLeads);
  write(KEYS.notes, seedNotes);
  write(KEYS.bookings, seedBookings);
  write(KEYS.events, seedEvents);
  localStorage.setItem(KEYS.seeded, "1");
}

// Marketing collections seed on first access (so they also populate for
// sessions seeded before marketing existed). Reset clears them → reseed.
function seedCampaigns(): Campaign[] {
  return [
    {
      id: "cmp-seed-1",
      subject: "✦ Welcome to the Faelight circle",
      body: "Hi there — thanks for joining us. Here's what to expect: occasional tips on systems and VA skills, first dibs on classes, and the odd bit of Faelight magic. People first. Systems second. Magic throughout.",
      audience: "all", status: "sent", sentAt: daysAgo(10), recipientCount: 4,
      author: "Kits", createdAt: daysAgo(11),
    },
    {
      id: "cmp-seed-2",
      subject: "New Foundations cohort opening soon",
      body: "Our next small-cohort Foundations Class is opening for enrolment. Reply to reserve a seat — spaces are limited because people are not sardines.",
      audience: "mentoring", status: "draft", author: "Kits", createdAt: daysAgo(1),
    },
    {
      id: "cmp-seed-3",
      subject: "This month at Faelight ✦",
      body: "A little roundup of what's new — classes, tips and a peek behind the scenes.",
      audience: "all", status: "scheduled", scheduledAt: futureISO(3, 9),
      author: "Kits", createdAt: daysAgo(0),
    },
  ];
}
function futureISO(dayOffset: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
function seedVideos(): VideoItem[] {
  return [
    { id: "vid-seed-1", title: "Meet Faelight — 60-second intro", url: "https://youtu.be/faelight-intro", description: "A short brand intro: who we are and how we help people and businesses.", kind: "intro", createdAt: daysAgo(20) },
    { id: "vid-seed-2", title: "What is the Mentoring Circle?", url: "https://youtu.be/faelight-mentoring", description: "Kits walks through the VA training pathway in 90 seconds.", kind: "promo", createdAt: daysAgo(6) },
  ];
}
function seedIntros(): IntroItem[] {
  return [
    { id: "intro-seed-1", title: "One-liner", text: "Helping people become more capable. Helping businesses become easier to run." },
    { id: "intro-seed-2", title: "Short bio (social)", text: "Faelight is a Philippine business consultancy: VA mentoring, operations systems and virtual experiences — with a little magic. People first. Systems second. Magic throughout." },
    { id: "intro-seed-3", title: "Elevator pitch", text: "For businesses whose operations are held together by vibes, memory and seventeen tabs — we build systems that create freedom, and the people who can run them." },
  ];
}
function seedReviews(): Review[] {
  return [
    { id: "rev-seed-1", author: "Andrea V.", roleCompany: "Operations Lead, remote team", quote: "Faelight untangled a year of scattered tools into one calm system my team can actually run without me.", categorySlug: "systems", rating: 5, status: "approved", createdAt: daysAgo(14) },
    { id: "rev-seed-2", author: "Mark D.", roleCompany: "Foundations Class graduate", quote: "I came in unsure I could be a VA and left with a portfolio, real tools and the confidence to land my first client.", categorySlug: "mentoring", rating: 5, status: "approved", createdAt: daysAgo(20) },
    { id: "rev-seed-3", author: "Grace T.", roleCompany: "Women's community organiser", quote: "Our virtual experience felt warm, story-led and genuinely fun — people are still talking about it.", categorySlug: "experiences", rating: 5, status: "approved", createdAt: daysAgo(9) },
    { id: "rev-seed-4", author: "Bianca O.", roleCompany: "Ocampo Dental", quote: "The SOPs Faelight built made onboarding new staff painless. Wish we'd done it a year ago!", categorySlug: "systems", rating: 5, status: "pending", createdAt: daysAgo(2) },
    { id: "rev-seed-5", author: "Paolo M.", roleCompany: "Senior VA", quote: "The leadership class pushed me to own my work. Landed an EVA role two months later.", categorySlug: "mentoring", rating: 4, status: "pending", createdAt: daysAgo(1) },
  ];
}

function seedBrands(): Brand[] {
  const groups: Record<string, string[]> = {
    "Training & Mentorship": ["Remoworks International", "UnCapped Potential", "Zolomon AI", "YourPockerPH", "Cebuana", "DC Creative", "dela Cruz & Cruz Law Offices", "Elyxion", "NZM", "Patricia Yap Consultancy", "Raebert Santos", "Hannah KC"],
    "Executive & Admin Support": ["Snapsil Systems", "TXM", "BNI"],
    "Operations & Business Systems": ["Flawless Aesthetics Clinic", "Steps2Life Health", "Ultra Manpower", "Renee Consulting", "SpeechCoach"],
    "Marketing": ["Clara's Kitchen", "Mean Bean Coffee Co.", "The Oil Temple", "Studio D Papeterie", "5MD Design Pty Ltd"],
  };
  const out: Brand[] = [];
  Object.entries(groups).forEach(([group, names]) => {
    names.forEach((name, i) => {
      out.push({ id: `brand-${group.slice(0, 3).toLowerCase()}-${i}`, name, group, active: true, createdAt: new Date().toISOString() });
    });
  });
  return out;
}

function seedIfMissing<T>(key: string, factory: () => T[]) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(key) === null) write(key, factory());
}
