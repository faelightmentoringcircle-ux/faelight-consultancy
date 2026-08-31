"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Wordmark } from "./Wordmark";

type NavLink = { href: string; label: string };
type NavItem = { label: string; href?: string; children?: NavLink[] };

const NAV: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Services",
    children: [
      { href: "/mentoring", label: "Mentoring Circle" },
      { href: "/systems", label: "Systems" },
      { href: "/experiences", label: "Experiences" },
      { href: "/classes", label: "Classes & Webinars" },
      { href: "/register", label: "Register for a Class" },
      { href: "/pricing", label: "Pricing" },
      { href: "/brochures", label: "Brochures" },
    ],
  },
  {
    label: "Community",
    children: [
      { href: "/pool", label: "Faelight Pool" },
      { href: "/blog", label: "Blog & Insights" },
      { href: "/community", label: "News & Polls" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/feedback", label: "Share Feedback" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);
  const groupActive = (item: NavItem) =>
    item.href ? isActive(item.href) : !!item.children?.some((c) => isActive(c.href));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-firefly/15 bg-parchment/90 backdrop-blur-md"
          : "border-b border-transparent bg-parchment/70 backdrop-blur"
      }`}
    >
      <div className="container-fae flex h-16 items-center justify-between">
        <Wordmark />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    groupActive(item) ? "text-forest" : "text-ink-soft group-hover:text-forest"
                  }`}
                >
                  {item.label}
                  <span className="text-[9px] transition-transform group-hover:rotate-180">▾</span>
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="min-w-[210px] rounded-2xl border border-firefly/20 bg-parchment-card p-2 shadow-card">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block rounded-xl px-3.5 py-2 text-sm transition-colors ${
                          isActive(c.href)
                            ? "bg-firefly/10 font-semibold text-forest"
                            : "text-ink-soft hover:bg-firefly/8 hover:text-forest"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={`link-underline text-sm font-medium transition-colors ${
                  isActive(item.href!) ? "text-forest" : "text-ink-soft hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link href="/register" className="btn-gold !px-5 !py-2.5">
            Register
          </Link>
          <Link href="/book" className="btn-primary !px-5 !py-2.5">
            Book a Discovery Call
          </Link>
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-full border border-firefly/25 text-forest lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-firefly/15 bg-parchment lg:hidden">
          <nav className="container-fae flex flex-col py-4">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="border-b border-firefly/10 py-3">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-deep">
                    {item.label}
                  </p>
                  <div className="flex flex-col">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="py-2 text-sm font-medium text-ink-soft">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="border-b border-firefly/10 py-3 text-sm font-medium text-ink-soft"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link href="/register" className="btn-gold mt-4">
              Register for a Class
            </Link>
            <Link href="/book" className="btn-primary mt-3">
              Book a Discovery Call
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
