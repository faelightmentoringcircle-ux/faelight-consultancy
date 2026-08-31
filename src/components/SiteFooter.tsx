import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { BRAND, CONTACT } from "@/lib/content";
import { Fireflies } from "./Motifs";
import { FooterSocial } from "./FooterSocial";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-enchanted text-parchment">
      <Fireflies count={10} />
      <div className="container-fae relative z-10 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Wordmark light />
            <p className="mt-4 max-w-sm font-serif text-lg leading-snug text-parchment/90">
              {BRAND.ethos}
            </p>
            <p className="mt-3 max-w-sm text-sm text-parchment/60">
              {BRAND.cheeky}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-parchment/80">
              <li><Link href="/about" className="hover:text-firefly-bright">About & Team</Link></li>
              <li><Link href="/mentoring" className="hover:text-firefly-bright">Mentoring Circle</Link></li>
              <li><Link href="/systems" className="hover:text-firefly-bright">Systems</Link></li>
              <li><Link href="/experiences" className="hover:text-firefly-bright">Experiences</Link></li>
              <li><Link href="/pricing" className="hover:text-firefly-bright">Pricing</Link></li>
              <li><Link href="/brochures" className="hover:text-firefly-bright">Brochures</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-parchment/80">
              <li>{CONTACT.name}</li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-firefly-bright break-all">
                  {CONTACT.email}
                </a>
              </li>
              <li className="pt-2">
                <Link href="/book" className="btn-gold !px-5 !py-2.5 text-forest-deep">
                  Book a Discovery Call
                </Link>
              </li>
            </ul>
            <FooterSocial />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-parchment/15 pt-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-parchment/70">
            {BRAND.footerStrip}
          </p>
          <p className="text-xs text-parchment/45">
            © {new Date().getFullYear()} Faelight Business Consultancy · Built with a little Faelight magic ·{" "}
            <Link href="/admin" className="hover:text-firefly-bright">Team login</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
