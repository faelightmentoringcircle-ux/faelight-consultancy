"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  getClients,
  addClient,
  updateClient,
  archiveClient,
  removeClient,
  onStoreChange,
  getLeadSourceOptions,
  ClientContact,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input =
  "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";
const labelCls = "text-[10px] font-semibold uppercase tracking-wide text-ink-faint";

function Detail({ label, value, link }: { label: string; value: string; link?: string }) {
  const shown = value || "—";
  return (
    <div>
      <p className={labelCls}>{label}</p>
      {link ? (
        <a href={link.startsWith("http") ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="break-all text-sm font-medium text-firefly-deep hover:underline">
          {shown}
        </a>
      ) : (
        <p className="break-all text-sm text-ink-soft">{shown}</p>
      )}
    </div>
  );
}

type Draft = Omit<ClientContact, "id" | "archived" | "projects"> & { projects: string };

const EMPTY: Draft = {
  name: "",
  logo: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  bizPhone: "",
  country: "",
  industry: "",
  leadSource: "",
  website: "",
  whois: "",
  contractSigned: false,
  signedDocUrl: "",
  contractorDoc: "",
  projects: "",
};

function toDraft(c: ClientContact): Draft {
  return { ...c, projects: c.projects.join(", ") };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "gallery">("table");

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, logo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  const toggleRow = (id: string) =>
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  useEffect(() => {
    const sync = () => setClients(getClients());
    sync();
    return onStoreChange(sync);
  }, []);

  const visible = useMemo(() => {
    return clients
      .filter((c) => (showArchived ? c.archived : !c.archived))
      .filter(
        (c) =>
          !q.trim() ||
          [c.name, c.company, c.industry, c.country].some((f) => f.toLowerCase().includes(q.toLowerCase()))
      );
  }, [clients, showArchived, q]);

  const activeCount = clients.filter((c) => !c.archived).length;
  const archivedCount = clients.filter((c) => c.archived).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(c: ClientContact) {
    setDraft(toDraft(c));
    setEditing(c.id);
  }
  function save() {
    const payload = { ...draft, projects: draft.projects.split(",").map((x) => x.trim()).filter(Boolean) };
    if (editing === "new") addClient(payload);
    else if (editing) updateClient(editing, payload);
    setEditing(null);
  }

  return (
    <>
      <AdminHeader
        title="Client List & Contacts"
        subtitle="Your client directory — click a client (▶) to expand every field: role, lead source, who-is, projects, signed & contractor docs."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
              <button onClick={() => setView("table")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "table" ? "bg-forest text-parchment" : "text-ink-soft"}`}>☰ Table</button>
              <button onClick={() => setView("gallery")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "gallery" ? "bg-forest text-parchment" : "text-ink-soft"}`}>▦ Gallery</button>
            </div>
            <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
              {showArchived ? `← Active (${activeCount})` : `Archived (${archivedCount})`}
            </button>
            <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add client</button>
          </div>
        }
      />

      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, company, industry or country…"
          className="w-full max-w-md rounded-full border border-firefly/25 bg-parchment-card px-4 py-2 text-sm outline-none focus:border-firefly"
        />
      </div>

      {view === "gallery" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((c) => (
            <button key={c.id} onClick={() => openEdit(c)} className="card-hover flex flex-col items-center text-center">
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.company || c.name} className="h-16 w-16 rounded-2xl object-contain ring-1 ring-firefly/20" />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-twilight/15 to-forest/15 text-lg font-bold text-firefly-deep">
                  {(c.company || c.name).slice(0, 2).toUpperCase()}
                </span>
              )}
              <p className="mt-3 text-sm font-semibold text-forest-deep">{c.company || c.name}</p>
              <p className="text-[11px] text-ink-faint">{c.name}</p>
              {c.industry && <p className="mt-1 text-[10px] text-ink-faint">{c.industry}</p>}
            </button>
          ))}
          {visible.length === 0 && <p className="col-span-full py-10 text-center text-sm text-ink-faint">No clients found.</p>}
        </div>
      )}

      {view === "table" && (
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="py-2 pr-3 font-semibold">Client</th>
              <th className="py-2 pr-3 font-semibold">Company</th>
              <th className="py-2 pr-3 font-semibold">Industry</th>
              <th className="py-2 pr-3 font-semibold">Contact</th>
              <th className="py-2 pr-3 font-semibold">Contract</th>
              <th className="py-2 pr-0 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => {
              const isOpen = openRows.has(c.id);
              return (
                <Fragment key={c.id}>
                  <tr className="border-b border-firefly/10 align-top last:border-0">
                    <td className="py-3 pr-3">
                      <button onClick={() => toggleRow(c.id)} className="flex items-start gap-2 text-left">
                        <span className={`mt-1 text-[10px] text-ink-faint transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain ring-1 ring-firefly/20" />
                        ) : (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest/8 text-[10px] font-bold text-forest">{(c.company || c.name).slice(0, 2).toUpperCase()}</span>
                        )}
                        <span>
                          <span className="font-medium text-forest-deep">{c.name}</span>
                          <span className="block text-[11px] text-ink-faint">{c.role || "—"}{c.country && ` · ${c.country}`}</span>
                        </span>
                      </button>
                    </td>
                    <td className="py-3 pr-3 text-ink-soft">
                      {c.company || "—"}
                      {c.website && (
                        <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-firefly-deep hover:underline">↗</a>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-ink-soft">{c.industry || "—"}</td>
                    <td className="py-3 pr-3 text-ink-soft">
                      {c.email ? <span className="break-all">{c.email}</span> : <span className="text-ink-faint">—</span>}
                      {c.phone && <p className="text-[11px] text-ink-faint">{c.phone}</p>}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.contractSigned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                        {c.contractSigned ? "Signed" : "Unsigned"}
                      </span>
                    </td>
                    <td className="py-3 pr-0">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(c)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                        <button onClick={() => archiveClient(c.id, !c.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{c.archived ? "Restore" : "Archive"}</button>
                        {confirmRemove === c.id ? (
                          <button onClick={() => { removeClient(c.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                        ) : (
                          <button onClick={() => setConfirmRemove(c.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-firefly/10 bg-parchment-warm/40">
                      <td colSpan={6} className="px-3 py-4">
                        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail label="Role" value={c.role} />
                          <Detail label="Country" value={c.country} />
                          <Detail label="Industry" value={c.industry} />
                          <Detail label="Lead source" value={c.leadSource} />
                          <Detail label="Email" value={c.email} />
                          <Detail label="Phone" value={c.phone} />
                          <Detail label="Business phone" value={c.bizPhone} />
                          <Detail label="Website" value={c.website} link={c.website} />
                          <Detail label="Who is" value={c.whois} />
                          <Detail label="Signed document" value={c.signedDocUrl ? "Open ↗" : ""} link={c.signedDocUrl} />
                          <Detail label="Contractor doc" value={c.contractorDoc ? "Open ↗" : ""} link={c.contractorDoc} />
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className={labelCls}>Projects</p>
                            {c.projects.length ? (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {c.projects.map((p) => (
                                  <span key={p} className="rounded-full bg-firefly/10 px-2 py-0.5 text-[11px] font-medium text-firefly-deep">{p}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-sm text-ink-faint">—</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-ink-faint">{showArchived ? "No archived clients." : "No clients found."}</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Client" : "Edit Client"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1"><span className={lbl}>Client name</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Role</span><input className={input} value={draft.role} onChange={(e) => set({ role: e.target.value })} /></label>
              <div className="flex items-center gap-3 sm:col-span-2">
                {draft.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.logo} alt="" className="h-14 w-14 rounded-xl object-contain ring-1 ring-firefly/20" />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-forest/8 text-lg text-firefly-deep">◐</span>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="cursor-pointer rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">
                    Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
                  </label>
                  {draft.logo && <button type="button" onClick={() => set({ logo: "" })} className="text-left text-xs text-rose-600 hover:underline">Remove logo</button>}
                </div>
              </div>
              <label className="space-y-1"><span className={lbl}>Company</span><input className={input} value={draft.company} onChange={(e) => set({ company: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Website</span><input className={input} value={draft.website} onChange={(e) => set({ website: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Email</span><input className={input} value={draft.email} onChange={(e) => set({ email: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Phone</span><input className={input} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Business phone</span><input className={input} value={draft.bizPhone} onChange={(e) => set({ bizPhone: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Country</span><input className={input} value={draft.country} onChange={(e) => set({ country: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Industry</span><input className={input} value={draft.industry} onChange={(e) => set({ industry: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Lead source</span>
                <input className={input} list="fae-lead-sources" value={draft.leadSource} onChange={(e) => set({ leadSource: e.target.value })} placeholder="Choose or type…" />
                <datalist id="fae-lead-sources">{getLeadSourceOptions().map((s) => <option key={s} value={s} />)}</datalist>
              </label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Who is / description</span><input className={input} value={draft.whois} onChange={(e) => set({ whois: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Projects (comma-separated)</span><input className={input} value={draft.projects} onChange={(e) => set({ projects: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Signed document link</span><input className={input} value={draft.signedDocUrl} onChange={(e) => set({ signedDocUrl: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Contractor doc link</span><input className={input} value={draft.contractorDoc} onChange={(e) => set({ contractorDoc: e.target.value })} /></label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={draft.contractSigned} onChange={(e) => set({ contractSigned: e.target.checked })} />
                <span className="text-sm text-ink-soft">Contract signed</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add Client" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
