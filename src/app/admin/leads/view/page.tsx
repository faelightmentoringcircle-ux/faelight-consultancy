"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getLead, updateLead, getNotes, addNote, getBookings, onStoreChange,
  Lead, LeadNote, Booking, getLeadStatuses,
} from "@/lib/store";
import { SERVICES } from "@/lib/content";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { AdminHeader, Panel, LeadBadge, CategoryTag, BookingBadge } from "@/components/admin/ui";

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-ink-faint">Loading…</div>}>
      <LeadDetail />
    </Suspense>
  );
}

function LeadDetail() {
  const id = useSearchParams().get("id") ?? "";
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | undefined>();
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [draft, setDraft] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setLead(getLead(id));
      setNotes(getNotes(id));
      setBookings(getBookings().filter((b) => b.leadId === id));
      setStatuses(getLeadStatuses());
    };
    sync();
    return onStoreChange(sync);
  }, [id]);

  if (!lead) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-soft">Lead not found.</p>
        <Link href="/admin/leads" className="btn-primary mt-4">← Back to leads</Link>
      </div>
    );
  }

  const svc = SERVICES.find((s) => s.id === lead.serviceId);

  function saveNote() {
    if (!draft.trim()) return;
    addNote(id, user?.name ?? "Team", draft.trim());
    setDraft("");
  }

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-block text-sm text-ink-soft hover:text-forest">← All leads</Link>
      <AdminHeader title={lead.name} subtitle={lead.company || lead.email} action={<LeadBadge status={lead.status} />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{lead.message}</p>
          </Panel>

          <Panel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Email" value={<a href={`mailto:${lead.email}`} className="text-firefly-deep hover:underline">{lead.email}</a>} />
              <Detail label="Phone" value={lead.phone || "—"} />
              <Detail label="Sub-brand" value={<CategoryTag slug={lead.categorySlug} />} />
              <Detail label="Service" value={svc?.name || "—"} />
              <Detail label="How they heard" value={lead.source} />
              <Detail label="Updates opt-in" value={lead.agreedToUpdates ? "Yes ✓" : "No"} />
              {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                <Detail label="UTM" value={[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" · ")} />
              )}
              <Detail label="Received" value={formatDateTime(lead.createdAt)} />
            </div>
          </Panel>

          {bookings.length > 0 && (
            <Panel>
              <h2 className="font-serif text-lg text-forest-deep">Linked Bookings</h2>
              <div className="mt-3 space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-firefly/12 px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-forest-deep">{b.bookingTypeName}</p>
                      <p className="text-xs text-ink-faint">{formatDateTime(b.startsAt)}</p>
                    </div>
                    <BookingBadge status={b.status} />
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Internal Notes</h2>
            <div className="mt-4 space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="rounded-xl bg-parchment-warm/60 p-3">
                  <div className="flex items-center justify-between text-xs text-ink-faint">
                    <span className="font-semibold text-forest">{n.author}</span>
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{n.note}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-ink-faint">No notes yet.</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNote()}
                placeholder="Add a note…"
                className="flex-1 rounded-xl border border-firefly/25 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-firefly"
              />
              <button onClick={saveNote} className="btn-primary !px-4 !py-2 text-sm">Add</button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Pipeline Status</h2>
            <p className="text-xs text-ink-faint">Move this lead along the pipeline.</p>
            <div className="mt-4 space-y-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateLead(id, { status: s })}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm capitalize transition ${
                    lead.status === s ? "border-forest bg-forest text-parchment" : "border-firefly/20 text-ink-soft hover:border-firefly"
                  }`}
                >
                  {s}
                  {lead.status === s && <span>✓</span>}
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Quick Actions</h2>
            <div className="mt-3 space-y-2">
              <a href={`mailto:${lead.email}`} className="btn-ghost w-full !justify-start">✉ Email {lead.name.split(" ")[0]}</a>
              <Link href="/admin/bookings" className="btn-ghost w-full !justify-start">◷ View bookings</Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm text-forest-deep">{value}</p>
    </div>
  );
}
