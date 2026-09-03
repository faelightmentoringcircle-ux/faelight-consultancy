// =====================================================================
// Faelight — seed content (mirrors the Supabase schema in spec §8/§9).
// This is the single source of truth for the demo. In production these
// rows live in Postgres and are editable from /admin/services.
// =====================================================================

export type CategorySlug = "mentoring" | "systems" | "experiences";

export interface ServiceCategory {
  id: string;
  slug: CategorySlug;
  name: string;
  tagline: string;
  audience: string;
  description: string;
  accent: string; // tailwind text color token base
  sort: number;
}

export interface Service {
  id: string;
  categorySlug: CategorySlug;
  name: string;
  description: string;
  priceLabel: string;
  priceFrom: number | null;
  bestFor: string;
  isBookable: boolean;
  sort: number;
}

export interface BookingType {
  id: string;
  name: string;
  durationMin: number;
  description: string;
  feeLabel: string;
  active: boolean;
  showFee?: boolean; // whether the fee label is shown publicly (default true)
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  blurb: string;
  photo?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  roleCompany: string;
  quote: string;
  categorySlug: CategorySlug | null;
}

// --- Brand copy -------------------------------------------------------
export const BRAND = {
  name: "Faelight Business Consultancy",
  tagline: "Helping people become more capable. Helping businesses become easier to run.",
  subline: "Systems that create freedom. People who can run them.",
  ethos: "People first. Systems second. Magic throughout.",
  cheeky:
    "For businesses whose operations are held together by vibes, memory and seventeen tabs.",
  closer: "Let's build the next right step — with a little Faelight magic.",
  footerStrip:
    "FAELIGHT BUSINESS CONSULTANCY • MENTORING CIRCLE • SYSTEMS • EXPERIENCES",
  pricingDisclaimer:
    "Final pricing depends on scope, audience and delivery needs.",
};

export const CONTACT = {
  name: "Maria Castañeda",
  email: "faelightmentoringcircle@gmail.com",
  phone: "+63 917 892 1280",
};

// --- Categories -------------------------------------------------------
export const CATEGORIES: ServiceCategory[] = [
  {
    id: "cat-mentoring",
    slug: "mentoring",
    name: "Mentoring Circle",
    tagline: "For learners & teams who want to grow.",
    audience: "For learners & teams",
    description:
      "VA training, career readiness and professional development in small cohorts — because people are not sardines.",
    accent: "twilight",
    sort: 1,
  },
  {
    id: "cat-systems",
    slug: "systems",
    name: "Systems",
    tagline: "For businesses & founders who need calm operations.",
    audience: "For businesses & founders",
    description:
      "Operations, SOPs, Notion workspaces and dashboards for founders who need operations to stop living in their head.",
    accent: "forest",
    sort: 2,
  },
  {
    id: "cat-experiences",
    slug: "experiences",
    name: "Experiences",
    tagline: "For communities & remote teams who want connection.",
    audience: "For communities & remote teams",
    description:
      "Virtual team-building, story-led workshops and custom online events with facilitation, visuals and flow.",
    accent: "firefly",
    sort: 3,
  },
];

export const categoryBySlug = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)!;

// --- Services (pricing menu, spec §9) --------------------------------
export const SERVICES: Service[] = [
  // Mentoring Circle
  {
    id: "svc-found-reg",
    categorySlug: "mentoring",
    name: "Foundations Class — Regular",
    description: "Days 1–2: Tools + VA introduction. The starting line for new VAs.",
    priceLabel: "₱2,000",
    priceFrom: 2000,
    bestFor: "Beginners, career shifters, junior VAs",
    isBookable: false,
    sort: 1,
  },
  {
    id: "svc-found-vip",
    categorySlug: "mentoring",
    name: "Foundations Class — VIP",
    description: "The Foundations experience with added 1:1 guidance and priority support.",
    priceLabel: "₱5,000",
    priceFrom: 5000,
    bestFor: "Learners who want closer mentorship",
    isBookable: false,
    sort: 2,
  },
  {
    id: "svc-smart",
    categorySlug: "mentoring",
    name: "SMART VA Pathway",
    description: "A structured pathway that builds work-ready VA skills end to end.",
    priceLabel: "₱6,500",
    priceFrom: 6500,
    bestFor: "VAs serious about landing and keeping clients",
    isBookable: false,
    sort: 3,
  },
  {
    id: "svc-leadership",
    categorySlug: "mentoring",
    name: "Leadership / EVA Classes",
    description:
      "Executive-VA judgment, stakeholder communication, remote leadership and SOP discipline.",
    priceLabel: "from ₱5,000",
    priceFrom: 5000,
    bestFor: "Experienced VAs stepping into ownership",
    isBookable: false,
    sort: 4,
  },
  {
    id: "svc-bespoke",
    categorySlug: "mentoring",
    name: "1:1 Bespoke Session",
    description: "Private coaching shaped entirely around your goals.",
    priceLabel: "from ₱10,000",
    priceFrom: 10000,
    bestFor: "Individuals wanting focused, tailored growth",
    isBookable: true,
    sort: 5,
  },
  {
    id: "svc-team-workshop",
    categorySlug: "mentoring",
    name: "Team Workshop",
    description: "A facilitated skills workshop designed around your team's real work.",
    priceLabel: "from ₱15,000",
    priceFrom: 15000,
    bestFor: "Teams that need a shared skills baseline",
    isBookable: false,
    sort: 6,
  },
  {
    id: "svc-custom-program",
    categorySlug: "mentoring",
    name: "Custom Program",
    description: "A bespoke multi-session program built for your organisation.",
    priceLabel: "from ₱25,000",
    priceFrom: 25000,
    bestFor: "Organisations building a full training pathway",
    isBookable: false,
    sort: 7,
  },

  // Systems
  {
    id: "svc-discovery",
    categorySlug: "systems",
    name: "Discovery Consultation",
    description: "A focused session to clarify the need, the mess and the next right step.",
    priceLabel: "₱2,500",
    priceFrom: 2500,
    bestFor: "Founders unsure where to start",
    isBookable: true,
    sort: 1,
  },
  {
    id: "svc-audit",
    categorySlug: "systems",
    name: "Systems Audit",
    description: "A structured review of your tools, processes and bottlenecks with a roadmap.",
    priceLabel: "from ₱7,500",
    priceFrom: 7500,
    bestFor: "Teams whose tools exist but aren't structured",
    isBookable: false,
    sort: 2,
  },
  {
    id: "svc-notion-build",
    categorySlug: "systems",
    name: "Custom Notion / System Build",
    description: "A tailored Notion workspace or system built around your real use case.",
    priceLabel: "from ₱30,000",
    priceFrom: 30000,
    bestFor: "Founders ready to get operations out of their head",
    isBookable: false,
    sort: 3,
  },
  {
    id: "svc-sop",
    categorySlug: "systems",
    name: "SOP / Ops Package",
    description: "Documented processes, SOPs and handover docs your team can actually run.",
    priceLabel: "from ₱30,000",
    priceFrom: 30000,
    bestFor: "Businesses with no SOPs or handover docs",
    isBookable: false,
    sort: 4,
  },
  {
    id: "svc-retainer",
    categorySlug: "systems",
    name: "Retainer Support",
    description: "Ongoing systems support to keep everything maintained and evolving.",
    priceLabel: "from ₱12,000/month",
    priceFrom: 12000,
    bestFor: "Teams wanting a steady operations partner",
    isBookable: false,
    sort: 5,
  },
  {
    id: "svc-notion-basic",
    categorySlug: "systems",
    name: "Notion Training — Basic",
    description: "Get confident with Notion fundamentals for everyday work.",
    priceLabel: "₱4,000",
    priceFrom: 4000,
    bestFor: "Individuals new to Notion",
    isBookable: false,
    sort: 6,
  },
  {
    id: "svc-notion-adv",
    categorySlug: "systems",
    name: "Notion Training — Advanced",
    description: "Databases, relations and dashboards for power users.",
    priceLabel: "₱8,000",
    priceFrom: 8000,
    bestFor: "Users ready to build real systems in Notion",
    isBookable: false,
    sort: 7,
  },
  {
    id: "svc-notion-corp",
    categorySlug: "systems",
    name: "Notion Corporate Group Training",
    description: "Team-wide Notion training tailored to your workspace and workflows.",
    priceLabel: "from ₱15,000",
    priceFrom: 15000,
    bestFor: "Teams standardising on Notion",
    isBookable: false,
    sort: 8,
  },
  {
    id: "svc-notion-consult",
    categorySlug: "systems",
    name: "Notion Consultation",
    description: "A working session to untangle or plan your Notion setup.",
    priceLabel: "₱2,500",
    priceFrom: 2500,
    bestFor: "Anyone stuck on how to structure Notion",
    isBookable: true,
    sort: 9,
  },

  // Experiences
  {
    id: "svc-virtual-team",
    categorySlug: "experiences",
    name: "Virtual Team Experience",
    description: "A facilitated virtual team-building session that actually connects people.",
    priceLabel: "from ₱15,000",
    priceFrom: 15000,
    bestFor: "Remote teams needing connection",
    isBookable: false,
    sort: 1,
  },
  {
    id: "svc-half-day",
    categorySlug: "experiences",
    name: "Half-Day Experience",
    description: "A longer, story-led session with facilitation, visuals and flow.",
    priceLabel: "from ₱25,000",
    priceFrom: 25000,
    bestFor: "Teams wanting a deeper shared experience",
    isBookable: false,
    sort: 2,
  },
  {
    id: "svc-custom-event",
    categorySlug: "experiences",
    name: "Custom Themed Event",
    description: "A fully custom online event designed around your theme and community.",
    priceLabel: "from ₱40,000",
    priceFrom: 40000,
    bestFor: "Communities and companies marking a moment",
    isBookable: false,
    sort: 3,
  },
];

export const servicesByCategory = (slug: CategorySlug) =>
  SERVICES.filter((s) => s.categorySlug === slug).sort((a, b) => a.sort - b.sort);

export const bookableServices = () => SERVICES.filter((s) => s.isBookable);

// --- Classes vs Services split (scheduled group learning vs 1:1/consulting) ---
export type OfferingKind = "class" | "service";

// Group-learning / scheduled programs are "Classes"; everything else
// (1:1 sessions, consulting, builds, experiences) are "Services".
const CLASS_IDS = new Set<string>([
  "svc-found-reg",
  "svc-found-vip",
  "svc-smart",
  "svc-leadership",
  "svc-team-workshop",
  "svc-custom-program",
  "svc-notion-basic",
  "svc-notion-adv",
  "svc-notion-corp",
]);

export const offeringKind = (s: Service): OfferingKind =>
  CLASS_IDS.has(s.id) ? "class" : "service";

export const classOfferings = () =>
  SERVICES.filter((s) => offeringKind(s) === "class").sort((a, b) => a.sort - b.sort);

export const serviceOfferings = () =>
  SERVICES.filter((s) => offeringKind(s) === "service").sort((a, b) => a.sort - b.sort);

export const categoryName = (slug: CategorySlug) => categoryBySlug(slug).name;

// External system links (PLACEHOLDERS — swap for the real URLs when ready).
// SMART VA links out to the separate Faelight VA training system; Experience
// links to the external events/experience platform.
export const SMART_VA_URL = "#"; // TODO: set the real SMART VA system URL
export const EXPERIENCE_URL = "#"; // TODO: set the real Experience platform URL
export const SMART_VA_SERVICE_ID = "svc-smart";

// --- Booking types (spec §5) -----------------------------------------
export const BOOKING_TYPES: BookingType[] = [
  {
    id: "bt-discovery",
    name: "Discovery Consultation",
    durationMin: 60,
    description:
      "A focused call to clarify the need, the mess and the ideal outcome — then map the next right step.",
    feeLabel: "₱2,500 — payable after confirmation",
    active: true,
  },
  {
    id: "bt-notion",
    name: "Notion Consultation",
    durationMin: 60,
    description:
      "A working session to untangle, plan or level up your Notion workspace.",
    feeLabel: "₱2,500 — payable after confirmation",
    active: true,
  },
  {
    id: "bt-coaching",
    name: "Coaching / 1:1 Session",
    durationMin: 60,
    description:
      "Private mentoring shaped around your goals — career, skills or leadership.",
    feeLabel: "from ₱10,000 — payable after confirmation",
    active: true,
  },
];

// --- Founder & team (spec §9) ----------------------------------------
export const FOUNDER = {
  name: 'Maria "Maia" Castañeda',
  title: "Founder of Faelight",
  role: "Business Systems & Operations Consultant • VA Coach & Business Skills Trainer",
  stats: [
    { value: "20+", label: "years executive administration" },
    { value: "10", label: "years virtual assistance" },
    { value: "500+", label: "VAs trained" },
  ],
  bio: "Experience across Filipino, Japanese, American and Australian work environments. Credible and human — because Faelight is built from lived experience, not generic templates.",
  personal: ["Artist", "Fur mom", "Gamer", "D&D nerd", "Systems goblin"],
};

export const TEAM: TeamMember[] = [
  {
    id: "tm-sassa",
    name: "Sassa",
    role: "Executive VA / anchor support",
    blurb: "Keeps the day-to-day steady and the clients cared for.",
    photo: "/brand/team/sassa.jpg",
  },
  {
    id: "tm-kenny",
    name: "Kenny",
    role: "Operations, scheduling & founder wellbeing",
    blurb: "Guards the calendar and the human behind it.",
    photo: "/brand/team/kenny.jpg",
  },
  {
    id: "tm-kits",
    name: "Kits",
    role: "Social media & marketing support",
    blurb: "Tells the Faelight story and tracks where it lands.",
    photo: "/brand/team/kits.jpg",
  },
  {
    id: "tm-dor",
    name: "Dor",
    role: "Admin support & experience facilitation",
    blurb: "Runs the details and helps experiences feel effortless.",
    photo: "/brand/team/dor.jpg",
  },
  {
    id: "tm-josh",
    name: "Josh",
    role: "SEO & Web · Client Relations",
    blurb: "Keeps Faelight visible online and looks after client relations.",
  },
  {
    id: "tm-berly",
    name: "Berly",
    role: "Systems & Process Support",
    blurb: "Keeps the systems and processes humming behind the scenes.",
  },
  {
    id: "tm-aj",
    name: "AJ",
    role: "Team member", // TODO: update AJ's role once details are provided
    blurb: "Profile coming soon — details to follow.",
  },
  {
    id: "tm-project",
    name: "Project teams",
    role: "Systems, finance & specialist mentors",
    blurb: "Specialist hands brought in as each engagement needs.",
  },
];

// --- Rich content per sub-brand (fix-lists / build-lists) -------------
export const MENTORING_BUILDS = [
  "VA role clarity & mindset reset",
  "Core remote-work tools — Google Workspace, email, calendar, task boards, file systems",
  "Client updates, EOD reports & communication habits",
  "Résumé, profile, portfolio & interview prep",
  "Onboarding awareness",
];

export const LEADERSHIP_THEMES = [
  "Executive VA judgment & ownership",
  "Client communication & stakeholder updates",
  "Calendar, inbox & priority management",
  "Team coordination & remote leadership",
  "Operations thinking & SOP discipline",
  "Self-leadership, boundaries & sustainable performance",
];

export const SYSTEMS_FIXES = [
  "Scattered tasks, files and responsibilities",
  "No SOPs or handover docs",
  "Manual reports & admin bottlenecks",
  "Messy onboarding & handoffs",
  "Tools that exist but aren't structured",
  "Founders who need operations to stop living in their head",
];

export const SYSTEMS_CORE = [
  "Operations consultations",
  "Systems audits",
  "Process design & SOPs",
  "Notion workspaces & dashboards",
  "CRM & knowledge-base structure",
  "Ongoing systems support",
];

export const EXPERIENCES_CREATE = [
  "Virtual team-building sessions",
  "Story-led community workshops",
  "Women-focused confidence & career sessions",
  "Themed learning experiences",
  "Custom online events with facilitation, visuals and flow",
];

// --- How we work (spec §9) -------------------------------------------
export const PROCESS = [
  {
    step: "01",
    name: "Discover",
    detail: "Clarify the need, audience, constraints and ideal outcome.",
  },
  {
    step: "02",
    name: "Design",
    detail: "Create the training, system or experience flow around the real use case.",
  },
  {
    step: "03",
    name: "Deliver",
    detail: "Facilitate, build or train with practical outputs and feedback.",
  },
  {
    step: "04",
    name: "Support",
    detail: "Hand off next steps, documentation and optional continued support.",
  },
];

// --- Where clients usually fit (spec §9) -----------------------------
export const CLIENT_FIT = [
  {
    need: "My team needs skills.",
    answer: "Start with Training",
    slug: "mentoring" as CategorySlug,
  },
  {
    need: "My operations are messy.",
    answer: "Start with Systems",
    slug: "systems" as CategorySlug,
  },
  {
    need: "My team needs connection.",
    answer: "Start with Experiences",
    slug: "experiences" as CategorySlug,
  },
  {
    need: "We need a full pathway.",
    answer: "Blend all three",
    slug: null,
  },
];

// --- Testimonials (placeholders, clearly marked in UI) ---------------
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    author: "Placeholder — client name",
    roleCompany: "Operations Lead, remote team",
    quote:
      "Faelight untangled a year of scattered tools into one calm system my team can actually run without me.",
    categorySlug: "systems",
  },
  {
    id: "test-2",
    author: "Placeholder — learner name",
    roleCompany: "Foundations Class graduate",
    quote:
      "I came in unsure I could be a VA and left with a portfolio, real tools and the confidence to land my first client.",
    categorySlug: "mentoring",
  },
  {
    id: "test-3",
    author: "Placeholder — community lead",
    roleCompany: "Women's community organiser",
    quote:
      "Our virtual experience felt warm, story-led and genuinely fun — people are still talking about it.",
    categorySlug: "experiences",
  },
];

// --- Clients & brands we support (from the deck) ---------------------
export interface ClientGroup {
  title: string;
  glyph: string;
  clients: string[];
}

export const CLIENT_GROUPS: ClientGroup[] = [
  {
    title: "Training & Mentorship",
    glyph: "❦",
    clients: [
      "Remoworks International",
      "UnCapped Potential",
      "Zolomon AI",
      "YourPockerPH",
      "Cebuana",
      "DC Creative",
      "dela Cruz & Cruz Law Offices",
      "Elyxion",
      "NZM",
      "Patricia Yap Consultancy",
      "Raebert Santos",
      "Hannah KC",
    ],
  },
  {
    title: "Executive & Admin Support",
    glyph: "✒",
    clients: ["Snapsil Systems", "TXM", "BNI"],
  },
  {
    title: "Operations & Business Systems",
    glyph: "⚙",
    clients: [
      "Flawless Aesthetics Clinic",
      "Steps2Life Health",
      "Ultra Manpower",
      "Renee Consulting",
      "SpeechCoach",
    ],
  },
  {
    title: "Marketing",
    glyph: "✧",
    clients: [
      "Clara's Kitchen",
      "Mean Bean Coffee Co.",
      "The Oil Temple",
      "Studio D Papeterie",
      "5MD Design Pty Ltd",
    ],
  },
];

export const CLIENTS_TAGLINE = "Guided by purpose. Elevated by magic.";

// --- What we build with individuals (deck slide) ---------------------
export const WHAT_WE_BUILD_INDIVIDUALS = {
  intro: "Not just tools. Capability that survives real work.",
  pillars: [
    { name: "Tools", glyph: "✶", detail: "Google Workspace, Notion, Canva, AI-enabled workflows and digital platforms." },
    { name: "Work", glyph: "⚙", detail: "Organization, follow-through, task management and remote-work behavior." },
    { name: "Communication", glyph: "❖", detail: "Client updates, meetings, interviews, professional English and confidence." },
    { name: "Self", glyph: "✧", detail: "Role direction, ownership, leadership and sustainable growth mindset." },
  ],
  closer: "Learn it → Practice it → Prove it → Use it",
};

// --- What we build with clients (deck slide) -------------------------
export const WHAT_WE_BUILD_CLIENTS = {
  intro:
    "Not just deliverables. Capability, structure and experiences that keep working after we leave.",
  pillars: [
    {
      name: "Clarity",
      glyph: "✶",
      detail:
        "We make the messy visible. Role clarity, workflow mapping, operational audits, priorities, responsibilities and identifying where things are falling through the cracks.",
    },
    {
      name: "Systems",
      glyph: "⚙",
      detail:
        "We turn the way you work into something repeatable. SOPs, Notion workspaces, dashboards, CRM structures, task management, documentation, handoffs and practical workflows.",
    },
    {
      name: "Capability",
      glyph: "❖",
      detail:
        "We help your people actually use what we build. Team training, VA/EA development, onboarding, communication standards, executive support practices, ownership and accountability.",
    },
    {
      name: "Experience",
      glyph: "✧",
      detail:
        "We design how people experience your business. Client journeys, workshops, team experiences, community programs, touchpoints, communication and thoughtful service design.",
    },
  ],
  closer: "We find the gaps. We build what's missing. We equip the people. We help it last.",
};

// =====================================================================
// Phase 2 — Core structure content (sessions, opportunities, news,
// polls, project teams). Sample data for the demo; in production these
// live in the database and are managed from /admin.
// =====================================================================

// --- Classes & Webinar sessions --------------------------------------

// Google Forms the studio actually uses (can be overridden per session).
export const DEFAULT_REGISTER_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSd6dR9zuvi-lm07F9SijKML5oChBWobvqWStP6zHji6B87z0A/viewform?usp=header";
export const DEFAULT_FEEDBACK_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSdMrRZSuJeoyaXU7eiVUSD_CpfbC-9H1t-xzJbKbt7hZzGGIA/viewform?usp=header";

// One day (or module) of a class's curriculum.
export interface SessionDay {
  title: string; // "Foundations"
  detail: string; // "VA mindset, client expectations & core skills"
  icon?: string; // emoji shown on the site strip
  image?: string; // uploaded photo (data URL) — shown instead of the icon
}

// Icon choices for a curriculum day (admin picker).
export const DAY_ICONS = ["🏛️", "⚙️", "🎯", "💼", "👑", "📇", "📚", "🚀", "🧭", "💡", "🏆", "✦"];

// Per-session discount codes students can redeem at registration.
export interface SessionPromo {
  code: string;
  label?: string;
  kind: "percent" | "amount";
  value: number; // percent (0–100) or peso amount
  active?: boolean;
}

export interface SessionItem {
  id: string;
  title: string;
  kind: "class" | "webinar";
  date: string; // display text (auto-built from the fields below when set)
  host: string;
  blurb: string;
  status: "upcoming" | "past";
  detail?: string; // seats / "Free live webinar" etc. (auto-built from seats)
  registerUrl?: string;
  replayUrl?: string;
  meetingUrl?: string; // Zoom / Meet link sent to registrants
  // Structured scheduling
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (multi-day range)
  startTime?: string; // "18:00"
  endTime?: string; // "21:00"
  // Seats
  seatsTotal?: number;
  seatsTaken?: number;
  // Pricing & discounts
  price?: number; // PHP; 0 / undefined = free (this is the Regular price)
  vipPrice?: number; // PHP; optional VIP-tier price shown on the VIP package button
  promos?: SessionPromo[];
  // Curriculum ("what you'll get") — day-by-day; length = number of days
  curriculum?: SessionDay[];
  perks?: string[]; // extra inclusions / "VIP includes" bullets
  posterUrl?: string; // promotional poster/banner image (data URL) shown on /register
  // Coach / host profile (shown on the registration hero)
  hostPhoto?: string; // data URL
  hostRole?: string; // "Founder · Fairy VA Mentor"
  hostBio?: string; // short bio
  // External forms
  registerFormUrl?: string; // Google Form for sign-ups
  feedbackFormUrl?: string; // Google Form for feedback (past sessions)
  // Clean public link — /register/<slug>. Optional; auto-derived from the title when blank.
  slug?: string;
}

export const SESSIONS: SessionItem[] = [
  {
    id: "ses-found-jul",
    title: "Foundations Class — July Cohort",
    kind: "class",
    date: "Sept 14–17, 2026 · 6–9 PM",
    host: 'Maria "Maia" Castañeda',
    blurb: "Two-day starting line for new VAs — tools, mindset and the first-week playbook.",
    status: "upcoming",
    detail: "8 of 24 seats left",
    startDate: "2026-09-14",
    endDate: "2026-09-17",
    startTime: "18:00",
    endTime: "21:00",
    seatsTotal: 24,
    seatsTaken: 16,
    price: 2500,
    vipPrice: 3500,
    promos: [
      { code: "EARLYBIRD", label: "Early bird", kind: "percent", value: 15, active: true },
      { code: "SCHOLAR500", label: "Scholarship", kind: "amount", value: 500, active: true },
    ],
    curriculum: [
      { title: "Foundations", detail: "VA mindset, client expectations & core skills.", icon: "🏛️" },
      { title: "Real Execution", detail: "Tools, systems & real-life scenarios.", icon: "⚙️" },
      { title: "Positioning", detail: "Profile, proposals & confidence.", icon: "🎯" },
      { title: "Proof & Application", detail: "Portfolio building & guided applications.", icon: "💼" },
    ],
    perks: [
      "VIP: interview practice",
      "VIP: portfolio review",
      "VIP: individual coaching",
      "Certificate of completion",
      "Access to the Faelight community",
    ],
    hostPhoto: "/brand/maia-portrait.jpg",
    hostRole: "Founder of Faelight · VA Coach & Business Skills Trainer",
    hostBio: "20+ years in executive administration and 500+ VAs trained across Filipino, Japanese, American and Australian work environments. Credible and human — Faelight is built from lived experience, not generic templates.",
    registerFormUrl: DEFAULT_REGISTER_FORM,
    slug: "foundations",
    registerUrl: "/register/foundations",
  },
  {
    id: "ses-notion-webinar",
    title: "Notion for Teams — Free Webinar",
    kind: "webinar",
    date: "Thu · Jun 26, 2026 · 7:00 PM",
    host: "Berly",
    blurb: "A live walk-through of building a calm, usable team workspace in Notion.",
    status: "upcoming",
    detail: "Free live webinar",
    startDate: "2026-06-26",
    startTime: "19:00",
    endTime: "20:30",
    price: 0,
    registerFormUrl: DEFAULT_REGISTER_FORM,
    slug: "notion",
    registerUrl: "/register/notion",
  },
  {
    id: "ses-eva-master",
    title: "Executive VA Masterclass",
    kind: "class",
    date: "Sat · Jul 19, 2026 · 2:00 PM",
    host: "Coach Maia",
    blurb: "Judgment, stakeholder communication and SOP discipline for experienced VAs.",
    status: "upcoming",
    detail: "Registration open",
    startDate: "2026-07-19",
    startTime: "14:00",
    endTime: "17:00",
    seatsTotal: 20,
    seatsTaken: 4,
    price: 3500,
    vipPrice: 4500,
    promos: [{ code: "EARLYBIRD", label: "Early bird", kind: "percent", value: 15, active: true }],
    registerFormUrl: DEFAULT_REGISTER_FORM,
    slug: "eva",
    registerUrl: "/register/eva",
  },
  {
    id: "ses-first-client",
    title: "Landing Your First VA Client",
    kind: "webinar",
    date: "Jun 7, 2026",
    host: "Coach Maia",
    blurb: "How new VAs find, pitch and keep their first paying client.",
    status: "past",
    detail: "Replay available",
    replayUrl: "#",
    feedbackFormUrl: DEFAULT_FEEDBACK_FORM,
  },
  {
    id: "ses-systems-scale",
    title: "Systems that Scale",
    kind: "webinar",
    date: "May 24, 2026",
    host: "Berly",
    blurb: "Turning scattered operations into documented systems a team can run.",
    status: "past",
    detail: "Replay available",
    replayUrl: "#",
  },
];

export const upcomingSessions = () => SESSIONS.filter((s) => s.status === "upcoming");
export const pastSessions = () => SESSIONS.filter((s) => s.status === "past");

// --- Faelight Opportunities ------------------------------------------
export interface Opportunity {
  id: string;
  title: string;
  type: "VA Role" | "Project" | "Internship" | "Partner";
  mode: string;
  posted: string;
  summary: string;
  tags: string[];
  status: "open" | "closed";
  applyUrl?: string;
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-gva",
    title: "General Virtual Assistant",
    type: "VA Role",
    mode: "Remote · Philippines",
    posted: "Posted Jun 12, 2026",
    summary: "Admin, inbox, calendar and file management for a growing consultancy client.",
    tags: ["Admin", "Email", "Calendar", "Google Workspace"],
    status: "open",
    applyUrl: "/contact",
  },
  {
    id: "opp-eva",
    title: "Executive Virtual Assistant (EVA)",
    type: "VA Role",
    mode: "Remote",
    posted: "Posted Jun 5, 2026",
    summary: "Executive support with judgment — stakeholder comms, priorities and light ops.",
    tags: ["Executive support", "Communication", "SOPs"],
    status: "open",
    applyUrl: "/contact",
  },
  {
    id: "opp-notion",
    title: "Systems / Notion Project Specialist",
    type: "Project",
    mode: "Remote · project-based",
    posted: "Posted May 30, 2026",
    summary: "Build Notion workspaces and dashboards for Faelight Systems clients.",
    tags: ["Notion", "Process design", "Dashboards"],
    status: "open",
    applyUrl: "/contact",
  },
  {
    id: "opp-social",
    title: "Social Media Assistant",
    type: "VA Role",
    mode: "Remote · part-time",
    posted: "Posted May 10, 2026",
    summary: "Scheduling, community management and light design for Faelight's channels.",
    tags: ["Social media", "Canva", "Community"],
    status: "closed",
  },
];

export const openOpportunities = () => OPPORTUNITIES.filter((o) => o.status === "open");

// --- Announcements / News --------------------------------------------
export interface Announcement {
  id: string;
  date: string;
  tag: "Update" | "Event" | "Notice" | "News";
  title: string;
  body: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-jul-cohort",
    date: "Jun 20, 2026",
    tag: "Event",
    title: "July Foundations cohort is now open",
    body: "Enrolment for the July Foundations Class is live — 24 seats, starting July 5. Early birds get a bonus 1:1 onboarding call.",
  },
  {
    id: "ann-systems-demo",
    date: "Jun 12, 2026",
    tag: "Update",
    title: "New: the Faelight Systems demo is live",
    body: "See the kind of operations workspace we build for clients — dashboards, SOPs, portals and automations — in one live, clickable demo.",
  },
  {
    id: "ann-holiday",
    date: "Jun 1, 2026",
    tag: "Notice",
    title: "Holiday schedule — office closed Jun 12",
    body: "The Faelight team will be offline on June 12 for Independence Day. Bookings and replies resume June 13.",
  },
  {
    id: "ann-milestone",
    date: "May 28, 2026",
    tag: "News",
    title: "500+ VAs trained 🎉",
    body: "We've now trained over 500 virtual assistants across the Philippines. Thank you to every learner and client who made it possible.",
  },
];

// --- Faelight Poll ----------------------------------------------------
export interface PollDef {
  id: string;
  question: string;
  options: string[];
  base: number[]; // simulated existing vote counts (demo only)
}

export const POLLS: PollDef[] = [
  {
    id: "poll-niche",
    question: "Which niche should we build a class for next?",
    options: ["Real estate VA", "E-commerce VA", "Medical VA", "Bookkeeping VA"],
    base: [42, 58, 27, 33],
  },
  {
    id: "poll-career",
    question: "Which career topic do you want most?",
    options: ["Portfolio building", "Interview prep", "Rate setting", "Client communication"],
    base: [51, 39, 46, 30],
  },
];

// --- Project Teams ----------------------------------------------------
export interface ProjectTeam {
  id: string;
  name: string;
  focus: string;
  glyph: string;
  members: { name: string; role: string }[];
  projects: string[];
}

export const PROJECT_TEAMS: ProjectTeam[] = [
  {
    id: "pt-systems",
    name: "Systems & Operations",
    focus: "Builds and maintains client systems, SOPs and dashboards.",
    glyph: "⚙",
    members: [
      { name: "Berly", role: "Systems & process" },
      { name: "Kenny", role: "Operations & scheduling" },
    ],
    projects: ["Clara's Kitchen Ops OS", "Renee CRM rebuild", "SOP libraries"],
  },
  {
    id: "pt-training",
    name: "Training & Mentorship",
    focus: "Designs and delivers classes, cohorts and 1:1 coaching.",
    glyph: "❦",
    members: [
      { name: "Maia", role: "Lead mentor" },
      { name: "Sassa", role: "Anchor support" },
    ],
    projects: ["Foundations cohorts", "Executive VA masterclass", "Custom programs"],
  },
  {
    id: "pt-marketing",
    name: "Marketing & Web",
    focus: "Tells the Faelight story and keeps it visible online.",
    glyph: "✧",
    members: [
      { name: "Josh", role: "SEO & web" },
      { name: "Kits", role: "Social & marketing" },
    ],
    projects: ["Faelight website", "Campaigns & socials", "Brand assets"],
  },
];

// --- Lead source options (used in admin dropdowns) -------------------
export const LEAD_SOURCES = [
  "Personal",
  "Referral",
  "BNI",
  "BNI Referral",
  "Business Contact",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Google search",
  "Faelight class or event",
  "Website",
  "Other",
];

// --- "How did you hear" options for the inquiry form -----------------
export const HEARD_OPTIONS = [
  "Facebook",
  "Instagram",
  "Referral from a friend",
  "LinkedIn",
  "A Faelight class or event",
  "Google search",
  "Other",
];
