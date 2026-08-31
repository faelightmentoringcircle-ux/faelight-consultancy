"use client";

import Link from "next/link";
import { AdminHeader, Panel } from "@/components/admin/ui";

const OVERVIEW: { icon: string; title: string; href: string; desc: string }[] = [
  { icon: "◈", title: "Dashboard", href: "/admin", desc: "Leads, bookings, pipeline and conversion at a glance. Click any stat tile to see the underlying list." },
  { icon: "✎", title: "Tasks", href: "/admin/tasks", desc: "Kanban board — add/edit statuses, link tasks to projects & clients, add notes." },
  { icon: "❑", title: "Projects", href: "/admin/projects", desc: "Client projects that feed the Tasks project dropdown." },
  { icon: "☎", title: "Clients & Contacts", href: "/admin/clients", desc: "Your client directory — powers the client dropdowns elsewhere." },
  { icon: "✦", title: "Leads", href: "/admin/leads", desc: "Inquiries from the site — track status from new to won." },
  { icon: "◷", title: "Bookings", href: "/admin/bookings", desc: "Discovery calls and sessions booked through the site. Click a tile to filter." },
  { icon: "◫", title: "Classes & Sessions", href: "/admin/sessions", desc: "Set up classes/webinars: date range, time, seats, price, discounts and forms." },
  { icon: "☑", title: "Registrations", href: "/admin/registrations", desc: "Everyone who signed up on the site lands here automatically." },
  { icon: "₱", title: "Payments", href: "/admin/payments", desc: "Booking fees, proof of payment and verification." },
  { icon: "▦", title: "Calendar", href: "/admin/calendar", desc: "Availability, blocked dates and linked calendars." },
  { icon: "✉", title: "Marketing", href: "/admin/marketing", desc: "Email campaigns, content calendar, social, promos and automations." },
  { icon: "✍", title: "Blog & Insights", href: "/admin/blog", desc: "Write and publish blog posts shown on the public /blog page." },
  { icon: "★", title: "Reviews", href: "/admin/reviews", desc: "Approve testimonials and manage video testimonials." },
  { icon: "❤", title: "Session Feedback", href: "/admin/feedback", desc: "Student feedback collected on the site — feature the best as testimonials." },
  { icon: "▤", title: "Templates & Docs", href: "/admin/templates", desc: "Branded invoices & documents, print/PDF, and a ready-made template library." },
  { icon: "❖", title: "Services", href: "/admin/services", desc: "Edit service pricing, descriptions and availability." },
  { icon: "⚑", title: "Faelight Pool", href: "/admin/pool", desc: "Manage the VA talent pool — edit, archive or remove VAs." },
  { icon: "◨", title: "Landing / Content", href: "/admin/content", desc: "Edit the homepage hero text and call-to-action buttons." },
  { icon: "⚙", title: "Settings", href: "/admin/settings", desc: "Booking rules, calendar, the confirmation email + delivery, and team accounts." },
];

type Guide = { title: string; badge?: string; steps: string[]; note?: string; href?: string; hrefLabel?: string };

const GUIDES: Guide[] = [
  {
    title: "Create or edit a class / webinar",
    badge: "Classes & Sessions",
    href: "/admin/sessions",
    hrefLabel: "Open Classes & Sessions",
    steps: [
      "Go to Classes & Sessions and click + Add session (or Edit an existing one).",
      "Set the Type (Class or Webinar), Host and Price (₱). Use 0 for a free session.",
      "Under Date range & time, pick Start/End date and Start/End time — the display text builds automatically (e.g. \"Sept 14–17, 2026 · 6–9 PM\").",
      "Under Seats, enter Total seats and Seats taken — the site shows \"8 of 24 seats left\" and marks Sold out at zero.",
      "Add a Registration form and Feedback form link if you use Google Forms (optional — the site's own forms already save to admin).",
      "Save. The class appears on the public /classes page and gets its own /register landing page.",
    ],
  },
  {
    title: "Add a discount / promo code",
    badge: "Discounts",
    href: "/admin/sessions",
    hrefLabel: "Open Classes & Sessions",
    steps: [
      "Edit the class and scroll to Discounts / promo codes.",
      "Click + Add promo code, then set the CODE, a label (e.g. Early bird), % off or ₱ off, and the amount.",
      "Toggle it on and Save. Give the code to students.",
      "On the registration page a student enters the code and the price updates live with the discount applied.",
    ],
    note: "You can also create site-wide codes in Marketing → Promotions; those are honoured on the registration page too.",
  },
  {
    title: "Where registrations go",
    badge: "Automated",
    href: "/admin/registrations",
    hrefLabel: "Open Registrations",
    steps: [
      "A student fills in the form on the /register page (name, email, mobile, FB, package, goal).",
      "On submit it is saved automatically to Registrations & Enrollees — no Google Form needed.",
      "The class name, auto-detected batch, package/tier, and their mobile/FB/goal (in Notes) are all captured.",
      "Filter by item or batch to see a class roster; archive rows to keep history.",
    ],
  },
  {
    title: "Set up the confirmation email",
    badge: "Email",
    href: "/admin/settings",
    hrefLabel: "Open Settings",
    steps: [
      "Go to Settings → Registration Confirmation Email.",
      "Edit the From name, Subject and Body. Use the placeholders — {firstName}, {name}, {class}, {date}, {package}, {price}, {host} — they are filled in automatically for each person.",
      "Check the live Preview on the right, then click away to save.",
      "Use the On/Off toggle to enable or pause the email.",
    ],
    note: "Every time someone registers, this email is composed automatically with THAT person's name and class details.",
  },
  {
    title: "Turn on real email delivery (EmailJS)",
    badge: "★ Important",
    href: "/admin/settings",
    hrefLabel: "Open Settings → Email delivery",
    steps: [
      "Create a free account at emailjs.com and log in.",
      "Add an Email Service (connect the Gmail/Outlook address you want emails sent FROM) — copy its Service ID (looks like service_xxxxxxx).",
      "Create an Email Template. In the template's To field use {{to_email}}, and in the body use {{message}}; set the subject to {{subject}} and the from-name to {{from_name}}. Save and copy its Template ID (template_xxxxxxx).",
      "In EmailJS → Account, copy your Public Key.",
      "Back in Faelight: Settings → Email delivery, paste the Service ID, Template ID and Public Key, then click away to save.",
      "The badge flips to \"● Live — reaches inboxes\". Test it by registering on the site with your own email.",
    ],
    note: "A static website can't send mail by itself, so EmailJS does the sending from the browser. The keys are public and safe to store here. Until they're added, confirmations are still composed and logged in the activity feed (Demo mode).",
  },
  {
    title: "Collect & use student feedback",
    badge: "Session Feedback",
    href: "/admin/feedback",
    hrefLabel: "Open Session Feedback",
    steps: [
      "Students open Share Feedback (site menu) or the \"Give feedback\" button on a past class.",
      "They rate 1–5 stars, say what they enjoyed, suggest improvements, and can opt in to be shared as a testimonial.",
      "Responses land in Session Feedback with your average rating and counts.",
      "Click ★ Feature on the best ones, filter by class, or archive/delete. Featured, shareable ones are ready to reuse as testimonials.",
    ],
  },
  {
    title: "Branded invoices & documents",
    badge: "Templates & Docs",
    href: "/admin/templates",
    hrefLabel: "Open Templates & Docs",
    steps: [
      "Open Templates & Docs → Documents and create or open an invoice/document.",
      "For invoices, fill the Invoice details (number, amount, date, due date, bill to).",
      "Click 🖨 Print / PDF to export a fully Faelight-branded PDF (logo, header band, brand colours & fonts). Use your browser's \"Save as PDF\".",
      "Use ✦ Template library to install ready-made templates, or Save & send to email a document.",
    ],
    note: "Uploaded files stay in Documents. Allow pop-ups for the site so the print window can open.",
  },
  {
    title: "Publish a blog post",
    badge: "Blog & Insights",
    href: "/admin/blog",
    hrefLabel: "Open Blog & Insights",
    steps: [
      "Open Blog & Insights and click to add a post.",
      "Write the title (the URL slug auto-fills), pick a tag, add an excerpt, body and a cover image.",
      "Choose Publish (live) or Draft, then Save — published posts appear on the public /blog page.",
    ],
  },
  {
    title: "Give a team member access",
    badge: "Settings",
    href: "/admin/settings",
    hrefLabel: "Open Settings",
    steps: [
      "Open Settings → Team Accounts and add the person (or edit an existing team member).",
      "For team members, toggle exactly which sections they can open (e.g. Registrations, Session Feedback).",
      "They'll only see the sections you enable when they sign in.",
    ],
  },
];

export default function AdminGuidePage() {
  return (
    <>
      <AdminHeader
        title="System Manual & How-To"
        subtitle="A complete overview of the admin, plus step-by-step guides for every workflow — including turning on real email delivery."
      />

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">System overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERVIEW.map((o) => (
          <Link key={o.href} href={o.href} className="rounded-2xl border border-firefly/20 bg-parchment-card p-4 shadow-card transition hover:border-firefly/50 hover:shadow-glow">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-twilight/15 to-forest/15 text-lg text-firefly">
                {o.icon}
              </span>
              <p className="font-serif text-base text-forest-deep">{o.title}</p>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{o.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">Step-by-step guides</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {GUIDES.map((g) => (
          <Panel key={g.title} className={g.badge === "★ Important" ? "border-firefly/50 bg-firefly/[0.04]" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-lg text-forest-deep">{g.title}</h3>
              {g.badge && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  g.badge === "★ Important" ? "bg-firefly/20 text-firefly-deep" : "bg-forest/8 text-forest"
                }`}>
                  {g.badge}
                </span>
              )}
            </div>
            <ol className="mt-3 space-y-2.5">
              {g.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest text-[11px] font-semibold text-firefly-bright">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink-soft">{s}</span>
                </li>
              ))}
            </ol>
            {g.note && (
              <p className="mt-3 rounded-lg border border-firefly/15 bg-parchment-warm/50 p-2.5 text-xs text-ink-soft">
                <span className="font-semibold text-firefly-deep">Note:</span> {g.note}
              </p>
            )}
            {g.href && (
              <Link href={g.href} className="mt-3 inline-block text-xs font-semibold text-firefly-deep hover:underline">
                {g.hrefLabel ?? "Open"} →
              </Link>
            )}
          </Panel>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-faint">
        People first. Systems second. Magic throughout.
      </p>
    </>
  );
}
