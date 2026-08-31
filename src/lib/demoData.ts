// =====================================================================
// Faelight — sample datasets for the live "Ops OS" demos.
// SAMPLE DATA ONLY. Each entry drives <WorkspaceDemo dataset={...} />,
// which renders three real-feeling app screens per industry:
//   • Website  — the client business's public front/landing page
//   • Admin    — the back-office "Ops OS" (dashboard, SOPs, board, CRM…)
//   • Portal   — the student / client / customer portal
// To build a real client app, replace a dataset's arrays with live data
// (or fetch it) — the component stays exactly the same.
// =====================================================================

import type { Dataset } from "@/components/WorkspaceDemo";

export interface DemoIndustry {
  key: string;
  label: string;
  blurb: string;
  dataset: Dataset;
}

// --- 1. SYSTEMS / general small business (catering) ------------------
const systems: Dataset = {
  workspace: "Faelight Ops OS",
  client: "Clara's Kitchen",
  theme: { accent: "#6366f1", accentSoft: "#eef2ff" },
  landing: {
    domain: "claraskitchen.ph",
    brand: "Clara's Kitchen",
    accent: "forest",
    nav: ["Menu", "Catering", "About", "Contact"],
    eyebrow: "Home-style catering",
    title: "Real food, made with love — for events big and small.",
    subtitle:
      "Catering, meal prep and grazing tables across the metro. Order online, track your event, taste the difference.",
    ctaPrimary: "Order catering",
    ctaSecondary: "View menu",
    features: [
      { glyph: "◈", title: "Order online", text: "Browse packages and lock your date in minutes." },
      { glyph: "❦", title: "Track your event", text: "Follow prep, delivery and setup from your portal." },
      { glyph: "✦", title: "Loved by 200+ events", text: "Weddings, birthdays and corporate lunches." },
    ],
    stats: [
      { value: "200+", label: "events catered" },
      { value: "4.9★", label: "average rating" },
      { value: "48h", label: "booking lead time" },
    ],
  },
  portal: {
    label: "Client portal",
    domain: "claraskitchen.ph/account",
    user: "Aliyah Cruz",
    role: "Catering client",
    stats: [
      { value: "1", label: "upcoming event" },
      { value: "₱18,500", label: "balance due" },
      { value: "3", label: "past orders" },
    ],
    panels: [
      {
        type: "callout",
        title: "Your event is confirmed ✦",
        text: "Garden Wedding · June 14 · 80 pax. Final headcount due June 7.",
        cta: "View event details",
      },
      {
        type: "list",
        title: "Order status",
        cards: [
          { title: "Grazing table + mains", sub: "Garden Wedding", meta: "June 14", pill: { text: "In prep", tone: "firefly" } },
          { title: "Corporate lunch ×40", sub: "Delivered", meta: "May 20", pill: { text: "Completed", tone: "forest" } },
        ],
      },
      {
        type: "progress",
        title: "Planning checklist",
        bars: [
          { label: "Menu finalised", pct: 100 },
          { label: "Deposit paid", pct: 100 },
          { label: "Final headcount", pct: 60 },
          { label: "Delivery details", pct: 40 },
        ],
      },
      {
        type: "list",
        title: "Invoices",
        cards: [
          { title: "Deposit — ₱10,000", meta: "Paid", pill: { text: "Paid", tone: "forest" } },
          { title: "Balance — ₱18,500", meta: "Due June 7", pill: { text: "Due", tone: "twilight" } },
        ],
      },
    ],
  },
  tabs: [
    {
      key: "dashboard",
      label: "Dashboard",
      glyph: "◈",
      type: "dashboard",
      chart: { title: "Projects delivered", bars: [3, 5, 4, 6, 5, 7, 6], caption: "last 7 weeks" },
      kpis: [
        { label: "Active projects", value: "6", note: "2 due this week" },
        { label: "Open tasks", value: "12", note: "4 assigned to you" },
        { label: "SOPs documented", value: "34", note: "+3 this month" },
        { label: "On-time rate", value: "96%", note: "last 30 days" },
      ],
      tasks: [
        { label: "Send weekly ops report to founder", done: true, tag: "Recurring" },
        { label: "Confirm headcount — Garden Wedding", done: false, tag: "Events" },
        { label: "Finalise refund SOP v2", done: false, tag: "SOP" },
        { label: "Publish onboarding checklist to team wiki", done: false, tag: "Systems" },
        { label: "Archive last month's event boards", done: true, tag: "Cleanup" },
      ],
      health: [
        { label: "Onboarding documented", pct: 100 },
        { label: "SOP coverage", pct: 88 },
        { label: "Automations live", pct: 72 },
        { label: "Team trained", pct: 90 },
      ],
    },
    {
      key: "sops",
      label: "SOP Library",
      glyph: "❦",
      type: "list",
      docs: [
        {
          title: "Client Onboarding",
          cat: "Operations SOP",
          updated: "Updated 2 days ago",
          steps: [
            "Send welcome pack + kickoff form within 24 hours.",
            "Create client workspace from the master template.",
            "Book kickoff call and confirm points of contact.",
            "Set up shared folders, access and naming conventions.",
            "Log the engagement in the CRM and assign an owner.",
          ],
        },
        {
          title: "Event Prep & Delivery",
          cat: "Operations SOP",
          updated: "Updated 5 days ago",
          steps: [
            "Confirm final headcount 7 days before the event.",
            "Assign kitchen, packing and delivery leads.",
            "Run the packing checklist; photograph the setup.",
            "Confirm delivery window and on-site contact.",
          ],
        },
        {
          title: "Refund & Escalation",
          cat: "Support SOP",
          updated: "Updated 1 week ago",
          steps: [
            "Confirm the request against policy and order record.",
            "Escalate to lead if the amount exceeds ₱5,000.",
            "Process, then log outcome and reason in the tracker.",
          ],
        },
      ],
    },
    {
      key: "projects",
      label: "Events",
      glyph: "⚙",
      type: "board",
      columns: [
        { col: "Enquiry", accent: "bg-ink-faint", cards: [{ title: "Corporate lunch ×60", owner: "Sassa" }, { title: "Birthday grazing table", owner: "Kenny" }] },
        { col: "In prep", accent: "bg-firefly-deep", cards: [{ title: "Garden Wedding — 80 pax", owner: "Clara" }, { title: "Office launch platters", owner: "Berly" }] },
        { col: "Out for delivery", accent: "bg-twilight-light", cards: [{ title: "Team lunch ×24", owner: "Courier" }] },
        { col: "Completed", accent: "bg-forest", cards: [{ title: "Corporate lunch ×40", owner: "Done" }, { title: "Anniversary set", owner: "Done" }] },
      ],
    },
    {
      key: "clients",
      label: "Clients (CRM)",
      glyph: "✒",
      type: "table",
      table: {
        columns: ["Client", "Stage", "Owner", "Value"],
        rows: [
          ["Garden Wedding — Cruz", { text: "In prep", tone: "firefly" }, "Clara", "₱28,500"],
          ["TXM Corporate", { text: "Retainer", tone: "forest" }, "Kenny", "₱12,000/mo"],
          ["Steps2Life Health", { text: "Enquiry", tone: "twilight" }, "Sassa", "—"],
          ["Renee Consulting", { text: "Repeat", tone: "forest" }, "Kenny", "₱18,000"],
          ["Studio D Launch", { text: "Proposal sent", tone: "firefly" }, "Berly", "₱22,000"],
        ],
      },
    },
    {
      key: "automations",
      label: "Automations",
      glyph: "✦",
      type: "automations",
      rules: [
        { when: "A new booking is confirmed", then: "Create the event board + client portal access", on: true },
        { when: "A task is marked Done", then: "Post an update to the team channel", on: true },
        { when: "It's 7 days before an event", then: "Request the final headcount from the client", on: true },
        { when: "An invoice stays unpaid for 7 days", then: "Send a gentle reminder + flag the owner", on: false },
      ],
    },
  ],
};

// --- 2. EDUCATION ----------------------------------------------------
const education: Dataset = {
  workspace: "Faelight Learn OS",
  client: "Bloom Learning Academy",
  theme: { accent: "#2563eb", accentSoft: "#eff6ff" },
  landing: {
    domain: "bloomacademy.ph",
    brand: "Bloom Learning Academy",
    accent: "twilight",
    nav: ["Courses", "For teams", "Success stories", "Enroll"],
    eyebrow: "Career-ready skills",
    title: "Learn the skills that get you hired — and keep you growing.",
    subtitle:
      "Live cohorts, real projects and mentors who actually care. From foundations to executive VA.",
    ctaPrimary: "Browse courses",
    ctaSecondary: "Book a call",
    features: [
      { glyph: "◈", title: "Live cohorts", text: "Small classes with real mentor feedback." },
      { glyph: "❦", title: "Project-based", text: "Build a portfolio while you learn." },
      { glyph: "✦", title: "Certified", text: "Earn a certificate employers recognise." },
    ],
    stats: [
      { value: "500+", label: "learners trained" },
      { value: "87%", label: "completion rate" },
      { value: "7", label: "courses" },
    ],
  },
  portal: {
    label: "Student portal",
    domain: "learn.bloomacademy.ph",
    user: "Rhea Mendoza",
    role: "Foundations of VA Work · May cohort",
    stats: [
      { value: "3 / 6", label: "modules done" },
      { value: "93%", label: "attendance" },
      { value: "A-", label: "current grade" },
    ],
    panels: [
      {
        type: "callout",
        title: "Next live session ✦",
        text: "Client Communication · Thursday 7:00 PM · with Coach Maia.",
        cta: "Join session",
      },
      {
        type: "progress",
        title: "Course progress",
        bars: [
          { label: "Module 1 — Tools & setup", pct: 100 },
          { label: "Module 2 — Communication", pct: 100 },
          { label: "Module 3 — Task management", pct: 55 },
          { label: "Module 4 — Portfolio", pct: 0 },
        ],
      },
      {
        type: "list",
        title: "Grades & feedback",
        cards: [
          { title: "Module 2 Quiz", meta: "92%", pill: { text: "Passed", tone: "forest" } },
          { title: "Assignment 1 — Client email", meta: "Reviewed", pill: { text: "A-", tone: "firefly" } },
        ],
      },
      {
        type: "list",
        title: "Resources",
        cards: [
          { title: "Foundations workbook", sub: "PDF · 42 pages", meta: "Download" },
          { title: "Recording — Module 2", sub: "Video · 58 min", meta: "Watch" },
        ],
      },
    ],
  },
  tabs: [
    {
      key: "dashboard",
      label: "Dashboard",
      glyph: "◈",
      type: "dashboard",
      chart: { title: "Enrolments", bars: [8, 12, 10, 15, 14, 18, 16], caption: "last 7 weeks" },
      kpis: [
        { label: "Active students", value: "148", note: "12 enrolled this week" },
        { label: "Courses running", value: "7", note: "2 new cohorts" },
        { label: "Attendance rate", value: "93%", note: "last 30 days" },
        { label: "Completion rate", value: "87%", note: "cohort average" },
      ],
      tasksTitle: "Today's tasks",
      tasks: [
        { label: "Grade Module 3 quizzes — Foundations cohort", done: false, tag: "Grading" },
        { label: "Send weekly progress reports to guardians", done: true, tag: "Recurring" },
        { label: "Approve 4 new enrolment applications", done: false, tag: "Admissions" },
        { label: "Prep live session — Client Communication", done: false, tag: "Teaching" },
        { label: "Issue certificates for graduating cohort", done: true, tag: "Records" },
      ],
      healthTitle: "Program health",
      health: [
        { label: "Curriculum documented", pct: 95 },
        { label: "Tutor onboarding", pct: 80 },
        { label: "Assessments graded", pct: 74 },
        { label: "Materials up to date", pct: 92 },
      ],
    },
    {
      key: "courses",
      label: "Courses",
      glyph: "❦",
      type: "list",
      listTitle: "Course catalog",
      docs: [
        {
          title: "Foundations of VA Work",
          cat: "Beginner · 6 modules",
          updated: "Updated 3 days ago",
          steps: [
            "Module 1 — Tools & remote-work setup.",
            "Module 2 — Communication & client updates.",
            "Module 3 — Task & calendar management.",
            "Module 4 — Portfolio & interview prep.",
            "Module 5 — Onboarding & first-week playbook.",
            "Module 6 — Assessment & certification.",
          ],
        },
        {
          title: "Executive VA Pathway",
          cat: "Advanced · 5 modules",
          updated: "Updated 1 week ago",
          steps: [
            "Stakeholder communication & judgment.",
            "Calendar, inbox & priority management.",
            "SOP discipline & operations thinking.",
            "Remote leadership & team coordination.",
            "Capstone project & review.",
          ],
        },
        {
          title: "Notion for Teams",
          cat: "Skills · 4 modules",
          updated: "Updated 2 weeks ago",
          steps: [
            "Databases, relations and views.",
            "Dashboards your team will actually use.",
            "Templates & workspace structure.",
            "Rollout & training plan.",
          ],
        },
      ],
    },
    {
      key: "enrolments",
      label: "Enrolments",
      glyph: "⚙",
      type: "board",
      columns: [
        { col: "Applied", accent: "bg-ink-faint", cards: [{ title: "R. Mendoza — Foundations", owner: "Admissions" }, { title: "J. Park — Executive VA", owner: "Admissions" }] },
        { col: "Enrolled", accent: "bg-firefly-deep", cards: [{ title: "May cohort — 24 seats", owner: "Registrar" }] },
        { col: "In progress", accent: "bg-twilight-light", cards: [{ title: "Foundations — Module 3", owner: "Tutor" }, { title: "Notion for Teams", owner: "Tutor" }] },
        { col: "Graduated", accent: "bg-forest", cards: [{ title: "April cohort — 21 certified", owner: "Records" }] },
      ],
    },
    {
      key: "students",
      label: "Students",
      glyph: "✒",
      type: "table",
      table: {
        columns: ["Student", "Course", "Progress", "Status"],
        rows: [
          ["Rhea Mendoza", "Foundations of VA Work", "Module 3 / 6", { text: "On track", tone: "forest" }],
          ["Jordan Park", "Executive VA Pathway", "Module 1 / 5", { text: "New", tone: "firefly" }],
          ["Aliyah Cruz", "Foundations of VA Work", "Module 5 / 6", { text: "On track", tone: "forest" }],
          ["Marco Tan", "Notion for Teams", "Module 2 / 4", { text: "Needs support", tone: "twilight" }],
          ["Bea Santos", "Executive VA Pathway", "Completed", { text: "Graduated", tone: "muted" }],
        ],
      },
    },
    {
      key: "automations",
      label: "Automations",
      glyph: "✦",
      type: "automations",
      rules: [
        { when: "A student enrols", then: "Send welcome email + open the student portal", on: true },
        { when: "Attendance drops below 70%", then: "Flag the tutor and log a check-in", on: true },
        { when: "It's Friday", then: "Send progress reports to guardians", on: true },
        { when: "A student completes all modules", then: "Issue certificate + request a review", on: false },
      ],
    },
  ],
};

// --- 3. E-COMMERCE ---------------------------------------------------
const ecommerce: Dataset = {
  workspace: "Faelight Store OS",
  client: "Mean Bean Coffee Co.",
  theme: { accent: "#d97706", accentSoft: "#fffbeb" },
  landing: {
    domain: "meanbean.co",
    brand: "Mean Bean Coffee Co.",
    accent: "firefly",
    nav: ["Shop", "Subscriptions", "Our roast", "Cart"],
    eyebrow: "Small-batch roasters",
    title: "Coffee worth waking up for — roasted fresh, shipped fast.",
    subtitle:
      "Single-origin beans and house blends, roasted to order and delivered straight to your door.",
    ctaPrimary: "Shop coffee",
    ctaSecondary: "Start a subscription",
    features: [
      { glyph: "◈", title: "Roasted to order", text: "Shipped within 48 hours of roasting." },
      { glyph: "❦", title: "Subscribe & save", text: "Your favourites on autopilot, 15% off." },
      { glyph: "✦", title: "Free shipping", text: "On every order over ₱1,500." },
    ],
    stats: [
      { value: "12k+", label: "orders shipped" },
      { value: "4.8★", label: "average rating" },
      { value: "48h", label: "fresh-roast promise" },
    ],
  },
  portal: {
    label: "Customer portal",
    domain: "meanbean.co/account",
    user: "Marco Tan",
    role: "Member since 2024 · Silver tier",
    stats: [
      { value: "2", label: "active orders" },
      { value: "340", label: "bean points" },
      { value: "Silver", label: "rewards tier" },
    ],
    panels: [
      {
        type: "callout",
        title: "Your order is on the way ✦",
        text: "#1042 · House Blend ×2 · out for delivery today.",
        cta: "Track order",
      },
      {
        type: "list",
        title: "Recent orders",
        cards: [
          { title: "#1042 — House Blend ×2", meta: "Today", pill: { text: "Shipped", tone: "firefly" } },
          { title: "#1039 — Cold Brew Kit", meta: "May 18", pill: { text: "Delivered", tone: "forest" } },
          { title: "#1021 — Sampler Box", meta: "Apr 30", pill: { text: "Delivered", tone: "forest" } },
        ],
      },
      {
        type: "list",
        title: "Your subscription",
        cards: [
          { title: "House Blend 250g · monthly", sub: "Next delivery June 1", pill: { text: "Active", tone: "forest" } },
        ],
      },
      {
        type: "progress",
        title: "Rewards — next tier",
        bars: [{ label: "Silver → Gold", pct: 68 }],
      },
    ],
  },
  tabs: [
    {
      key: "dashboard",
      label: "Dashboard",
      glyph: "◈",
      type: "dashboard",
      chart: { title: "Orders", bars: [24, 31, 28, 35, 30, 38, 42], caption: "last 7 days" },
      kpis: [
        { label: "Orders today", value: "38", note: "9 awaiting pack" },
        { label: "Revenue (30d)", value: "₱412k", note: "+14% vs last" },
        { label: "Avg order value", value: "₱685", note: "up ₱40" },
        { label: "Fulfilment rate", value: "98%", note: "on-time shipping" },
      ],
      tasksTitle: "Fulfilment queue",
      tasks: [
        { label: "Pack & label 9 pending orders", done: false, tag: "Shipping" },
        { label: "Restock House Blend — below threshold", done: false, tag: "Inventory" },
        { label: "Respond to 3 product reviews", done: true, tag: "Support" },
        { label: "Approve weekend flash-sale banner", done: false, tag: "Marketing" },
        { label: "Reconcile yesterday's payouts", done: true, tag: "Finance" },
      ],
      healthTitle: "Store health",
      health: [
        { label: "Catalog documented", pct: 100 },
        { label: "Returns SOP", pct: 85 },
        { label: "Low-stock alerts live", pct: 90 },
        { label: "Reviews responded", pct: 78 },
      ],
    },
    {
      key: "orders",
      label: "Orders",
      glyph: "⚙",
      type: "board",
      columns: [
        { col: "New", accent: "bg-ink-faint", cards: [{ title: "#1042 — House Blend ×2", owner: "R. Cruz" }, { title: "#1043 — Sampler Box", owner: "T. Lim" }] },
        { col: "Packing", accent: "bg-firefly-deep", cards: [{ title: "#1039 — Cold Brew Kit", owner: "Packing" }, { title: "#1040 — Dark Roast ×3", owner: "Packing" }] },
        { col: "Shipped", accent: "bg-twilight-light", cards: [{ title: "#1035 — Gift Set", owner: "Courier" }] },
        { col: "Delivered", accent: "bg-forest", cards: [{ title: "#1031 — House Blend", owner: "Done" }, { title: "#1030 — Sampler Box", owner: "Done" }] },
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      glyph: "✒",
      type: "table",
      table: {
        columns: ["Product", "SKU", "Stock", "Status"],
        rows: [
          ["House Blend 250g", "MB-HB-250", "8 units", { text: "Low stock", tone: "twilight" }],
          ["Dark Roast 250g", "MB-DR-250", "64 units", { text: "In stock", tone: "forest" }],
          ["Cold Brew Kit", "MB-CBK-01", "0 units", { text: "Out of stock", tone: "muted" }],
          ["Sampler Box", "MB-SMP-04", "23 units", { text: "In stock", tone: "forest" }],
          ["Gift Set (Holiday)", "MB-GFT-12", "15 units", { text: "Seasonal", tone: "firefly" }],
        ],
      },
    },
    {
      key: "playbooks",
      label: "Playbooks",
      glyph: "❦",
      type: "list",
      listTitle: "Store playbooks",
      docs: [
        {
          title: "Order Fulfilment",
          cat: "Operations SOP",
          updated: "Updated 1 day ago",
          steps: [
            "Confirm payment and address before packing.",
            "Pick, weigh and pack per the product checklist.",
            "Generate label; move the order card to Shipped.",
            "Send tracking to the customer automatically.",
          ],
        },
        {
          title: "Returns & Refunds",
          cat: "Support SOP",
          updated: "Updated 4 days ago",
          steps: [
            "Verify the return window and condition.",
            "Approve, then issue the refund via the gateway.",
            "Restock or write off; log the reason in the tracker.",
          ],
        },
        {
          title: "Restock Process",
          cat: "Inventory SOP",
          updated: "Updated 1 week ago",
          steps: [
            "Review low-stock alerts every Monday.",
            "Raise a purchase order to the roaster.",
            "Receive, count and update stock on arrival.",
          ],
        },
      ],
    },
    {
      key: "automations",
      label: "Automations",
      glyph: "✦",
      type: "automations",
      rules: [
        { when: "Stock falls below 10 units", then: "Create a restock task + notify ops", on: true },
        { when: "An order is placed", then: "Send confirmation + open the customer portal", on: true },
        { when: "An order ships", then: "Send tracking details to the customer", on: true },
        { when: "A review is 3★ or lower", then: "Flag support to follow up", on: false },
      ],
    },
  ],
};

// --- 4. B2B / professional services ----------------------------------
const b2b: Dataset = {
  workspace: "Faelight Revenue OS",
  client: "Renee Consulting",
  theme: { accent: "#0d9488", accentSoft: "#f0fdfa" },
  landing: {
    domain: "reneeconsulting.co",
    brand: "Renee Consulting",
    accent: "forest",
    nav: ["Services", "Case studies", "About", "Book a call"],
    eyebrow: "B2B operations partner",
    title: "Operations and growth systems for scaling teams.",
    subtitle:
      "We help B2B founders build the pipeline, processes and systems that scale revenue — without the chaos.",
    ctaPrimary: "Book a discovery call",
    ctaSecondary: "See case studies",
    features: [
      { glyph: "◈", title: "Revenue systems", text: "Pipeline, CRM and forecasting that hold up." },
      { glyph: "❦", title: "Process design", text: "SOPs and playbooks your team actually runs." },
      { glyph: "✦", title: "Fractional ops", text: "Senior operators, on demand." },
    ],
    stats: [
      { value: "40+", label: "clients served" },
      { value: "₱120M", label: "pipeline built" },
      { value: "38%", label: "avg win rate" },
    ],
  },
  portal: {
    label: "Client portal",
    domain: "portal.reneeconsulting.co",
    user: "Jordan Park — TXM",
    role: "Retainer client",
    stats: [
      { value: "3", label: "active projects" },
      { value: "2", label: "open invoices" },
      { value: "Jun 12", label: "next review" },
    ],
    panels: [
      {
        type: "callout",
        title: "Next check-in ✦",
        text: "Monthly review · June 12 · 2:00 PM with Kenny.",
        cta: "View agenda",
      },
      {
        type: "list",
        title: "Active projects",
        cards: [
          { title: "CRM rebuild", meta: "On track", pill: { text: "In progress", tone: "firefly" } },
          { title: "Sales playbook", meta: "In review", pill: { text: "Review", tone: "twilight" } },
          { title: "Onboarding docs", meta: "Delivered", pill: { text: "Complete", tone: "forest" } },
        ],
      },
      {
        type: "list",
        title: "Shared deliverables",
        cards: [
          { title: "Pipeline dashboard", sub: "Shared with your team", meta: "May 28" },
          { title: "Discovery SOP v2", sub: "Shared with your team", meta: "May 20" },
        ],
      },
      {
        type: "list",
        title: "Invoices",
        cards: [
          { title: "May retainer — ₱54,000", meta: "Paid", pill: { text: "Paid", tone: "forest" } },
          { title: "Setup fee — ₱30,000", meta: "Due June 5", pill: { text: "Due", tone: "twilight" } },
        ],
      },
    ],
  },
  tabs: [
    {
      key: "dashboard",
      label: "Dashboard",
      glyph: "◈",
      type: "dashboard",
      chart: { title: "Pipeline created (₱k)", bars: [120, 180, 150, 240, 210, 300, 260], caption: "last 7 weeks" },
      kpis: [
        { label: "Open deals", value: "14", note: "5 closing this month" },
        { label: "Pipeline value", value: "₱2.4M", note: "weighted ₱1.1M" },
        { label: "Win rate", value: "38%", note: "last quarter" },
        { label: "MRR", value: "₱186k", note: "+₱24k this month" },
      ],
      tasksTitle: "Priority follow-ups",
      tasks: [
        { label: "Send proposal — Ultra Manpower", done: false, tag: "Proposal" },
        { label: "Follow up — Snapsil Systems (day 3)", done: false, tag: "Follow-up" },
        { label: "Prep QBR deck — Steps2Life", done: true, tag: "Retention" },
        { label: "Kick off onboarding — TXM", done: false, tag: "Onboarding" },
        { label: "Log call notes from discovery calls", done: true, tag: "CRM" },
      ],
      healthTitle: "Revenue health",
      health: [
        { label: "CRM hygiene", pct: 91 },
        { label: "Proposal templates ready", pct: 100 },
        { label: "Onboarding documented", pct: 84 },
        { label: "Renewals on track", pct: 88 },
      ],
    },
    {
      key: "pipeline",
      label: "Pipeline",
      glyph: "⚙",
      type: "board",
      columns: [
        { col: "Lead", accent: "bg-ink-faint", cards: [{ title: "Elyxion — inbound", owner: "Kenny" }, { title: "NZM — referral", owner: "Josh" }] },
        { col: "Qualified", accent: "bg-firefly-deep", cards: [{ title: "Snapsil Systems", owner: "Maia" }, { title: "BNI Chapter", owner: "Kenny" }] },
        { col: "Proposal", accent: "bg-twilight-light", cards: [{ title: "Ultra Manpower", owner: "Maia" }] },
        { col: "Won", accent: "bg-forest", cards: [{ title: "TXM — retainer", owner: "Josh" }, { title: "Steps2Life — renewal", owner: "Kenny" }] },
      ],
    },
    {
      key: "accounts",
      label: "Accounts",
      glyph: "✒",
      type: "table",
      table: {
        columns: ["Account", "Owner", "Stage", "MRR"],
        rows: [
          ["Steps2Life Health", "Kenny", { text: "Retainer", tone: "forest" }, "₱42k/mo"],
          ["TXM", "Josh", { text: "Onboarding", tone: "firefly" }, "₱30k/mo"],
          ["Ultra Manpower", "Maia", { text: "Proposal", tone: "twilight" }, "—"],
          ["Snapsil Systems", "Maia", { text: "Qualified", tone: "muted" }, "—"],
          ["Renee Consulting", "Kenny", { text: "Active", tone: "forest" }, "₱54k/mo"],
        ],
      },
    },
    {
      key: "playbooks",
      label: "Playbooks",
      glyph: "❦",
      type: "list",
      listTitle: "Sales playbooks",
      docs: [
        {
          title: "Discovery Call",
          cat: "Sales SOP",
          updated: "Updated 2 days ago",
          steps: [
            "Confirm the problem, stakeholders and budget.",
            "Map the current process and the ideal outcome.",
            "Agree next steps and book the follow-up before ending.",
            "Log notes and set the deal stage in the CRM.",
          ],
        },
        {
          title: "Proposal Process",
          cat: "Sales SOP",
          updated: "Updated 6 days ago",
          steps: [
            "Draft from the template using discovery notes.",
            "Internal review; approver signs off in the status field.",
            "Send, then set a 3-day follow-up automation.",
          ],
        },
        {
          title: "Client Onboarding",
          cat: "Delivery SOP",
          updated: "Updated 1 week ago",
          steps: [
            "Send welcome pack and schedule the kickoff.",
            "Provision workspace, access and points of contact.",
            "Set the first 30-day milestones and owner.",
          ],
        },
      ],
    },
    {
      key: "automations",
      label: "Automations",
      glyph: "✦",
      type: "automations",
      rules: [
        { when: "A lead is added", then: "Assign an owner and create a follow-up task", on: true },
        { when: "A deal is marked Won", then: "Kick off onboarding + open the client portal", on: true },
        { when: "An invoice is 7 days overdue", then: "Send a reminder and flag the owner", on: true },
        { when: "It's the 1st of the month", then: "Generate account health reports", on: false },
      ],
    },
  ],
};

export const DEMOS: DemoIndustry[] = [
  { key: "systems", label: "Systems", blurb: "General operations for any small business.", dataset: systems },
  { key: "education", label: "Education", blurb: "For academies, tutoring & training programs.", dataset: education },
  { key: "ecommerce", label: "E-commerce", blurb: "For online stores & product brands.", dataset: ecommerce },
  { key: "b2b", label: "B2B", blurb: "For agencies & professional-services teams.", dataset: b2b },
];
