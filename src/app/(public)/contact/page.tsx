import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send an inquiry to Faelight Business Consultancy. We reply like humans, within 1–2 business days.",
};

export default function ContactPage() {
  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={12} />
        <Glow className="-left-16 top-4" size={440} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Say hello</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Let's build the next right step — together.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-parchment/75">
            Tell us about the mess, the goal or the dream. No form-robots on our
            end — a real person from the Faelight team will read it and reply.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae grid gap-10 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl text-forest-deep">Reach us directly</h2>
            <div className="mt-5 space-y-4">
              <ContactRow label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
              <ContactRow label="Founder" value={CONTACT.name} />
            </div>

            <div className="mt-8 card bg-parchment-warm/60">
              <p className="font-serif text-lg text-forest-deep">
                <Star className="mr-1.5 text-firefly" /> Prefer to book a time?
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Skip the back-and-forth and grab a slot on Maia's real calendar.
              </p>
              <Link href="/book" className="btn-primary mt-4">Book a Discovery Call</Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="card-hover flex items-center gap-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-forest/8 text-firefly">✦</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="font-medium text-forest-deep">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
