"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getInvoices,
  addInvoice,
  saveDocument,
  duplicateDocument,
  sendDocument,
  removeDocument,
  markInvoicePaid,
  archiveDocument,
  addUploadedDocument,
  invoiceSubtotal,
  invoiceTotal,
  effectiveTotal,
  formatPeso,
  getClients,
  getPaymentTerms,
  addPaymentTerm,
  renamePaymentTerm,
  removePaymentTerm,
  getInvoiceParticularsTemplate,
  setInvoiceParticularsTemplate,
  renderInvoiceParticulars,
  onStoreChange,
  DocRecord,
  InvoiceItem,
  ClientContact,
} from "@/lib/store";
import { printInvoice } from "@/lib/docPrint";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";
const MAX_MB = 4;

function statusBadge(d: DocRecord) {
  if (d.paid) return "bg-emerald-100 text-emerald-700";
  if (d.status === "sent") return "bg-blue-100 text-blue-700";
  if (d.status === "final") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-800";
}
function statusText(d: DocRecord) {
  if (d.paid) return "Paid";
  return d.status === "sent" ? "Sent" : d.status === "final" ? "Final" : "Draft";
}
function billLabel(c: ClientContact) {
  return c.company ? `${c.name} — ${c.company}` : c.name;
}
/** The "client" an invoice belongs to — company first, else the contact name. */
function clientKey(d: DocRecord) {
  return (d.billCompany?.trim() || d.billTo?.trim() || "");
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<DocRecord[]>([]);
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [clientFilter, setClientFilter] = useState("All");
  const [sort, setSort] = useState<"recent" | "client" | "amount" | "due">("recent");
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState<DocRecord | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [manageTerms, setManageTerms] = useState(false);
  const [manageParticulars, setManageParticulars] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => { setInvoices(getInvoices()); setClients(getClients()); setTerms(getPaymentTerms()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const clientNames = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((d) => { const k = clientKey(d); if (k) set.add(k); });
    return ["All", ...Array.from(set).sort()];
  }, [invoices]);

  const activeCount = invoices.filter((d) => !d.archived).length;
  const archivedCount = invoices.filter((d) => d.archived).length;

  const shown = useMemo(() => {
    let list = invoices.filter((d) => (showArchived ? d.archived : !d.archived));
    list = list.filter((d) => (filter === "all" ? true : filter === "paid" ? d.paid : !d.paid));
    if (clientFilter !== "All") list = list.filter((d) => clientKey(d) === clientFilter);
    const by = {
      recent: (a: DocRecord, b: DocRecord) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
      client: (a: DocRecord, b: DocRecord) => clientKey(a).localeCompare(clientKey(b)),
      amount: (a: DocRecord, b: DocRecord) => effectiveTotal(b) - effectiveTotal(a),
      due: (a: DocRecord, b: DocRecord) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    }[sort];
    return [...list].sort(by);
  }, [invoices, filter, clientFilter, sort, showArchived]);

  const stats = useMemo(() => {
    let invoiced = 0, paid = 0, outstanding = 0, count = 0;
    invoices.filter((d) => !d.archived).forEach((d) => {
      const t = effectiveTotal(d);
      invoiced += t; count += 1;
      if (d.paid) paid += t; else outstanding += t;
    });
    return { invoiced, paid, outstanding, count };
  }, [invoices]);

  // Editing helpers — every change auto-saves and keeps the amount in sync.
  function editInv(patch: Partial<DocRecord>) {
    if (!open) return;
    const next = { ...open, ...patch };
    next.amount = formatPeso(effectiveTotal(next));
    setOpen(next);
    saveDocument(open.id, { ...patch, amount: next.amount });
  }
  function setItem(i: number, patch: Partial<InvoiceItem>) {
    if (!open) return;
    const items = [...(open.items ?? [])];
    items[i] = { ...items[i], ...patch };
    editInv({ items });
  }
  function addItem() {
    if (!open) return;
    editInv({ items: [...(open.items ?? []), { description: "", qty: 1, unitPrice: 0 }] });
  }
  function removeItem(i: number) {
    if (!open) return;
    editInv({ items: (open.items ?? []).filter((_, idx) => idx !== i) });
  }

  // Explicit save: persists the full invoice and KEEPS the editor open
  // (edits already auto-save; this gives a clear confirmation + stays put).
  function saveInvoice() {
    if (!open) return;
    saveDocument(open.id, { ...open, amount: formatPeso(invoiceTotal(open)) });
    flash("💾 Invoice saved");
  }

  function newInvoice() {
    const d = addInvoice();
    // Seed Page 2 with the editable Particulars template so it's ready to tweak.
    const body = renderInvoiceParticulars(getInvoiceParticularsTemplate(), d);
    saveDocument(d.id, { body });
    setOpen({ ...d, body });
  }
  function duplicate(d: DocRecord) { const c = duplicateDocument(d.id); if (c) setOpen(c); }
  function insertParticulars() {
    if (!open) return;
    if (open.body?.trim() && !confirm("Replace the current Particulars with the template?")) return;
    editInv({ body: renderInvoiceParticulars(getInvoiceParticularsTemplate(), open) });
    flash("✓ Particulars template inserted");
  }
  function doSend() {
    if (!open || !sendEmail.trim()) return;
    const updated = sendDocument(open.id, sendEmail.trim());
    if (updated) setOpen(updated);
    setShowSend(false);
    flash(`✓ Invoice sent to ${sendEmail.trim()}`);
  }
  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 4000); }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { alert(`File too large (max ${MAX_MB} MB).`); return; }
    const url = await fileToDataUrl(file);
    addUploadedDocument({ name: file.name.replace(/\.[^.]+$/, ""), kind: "invoice", fileUrl: url, fileName: file.name, fileType: file.type });
    if (fileRef.current) fileRef.current.value = "";
    flash("✓ Invoice file uploaded");
  }

  return (
    <>
      <AdminHeader
        title="Invoices"
        subtitle="Create branded Faelight invoices with line items, send them, and track what's paid. Print or Save as PDF anytime."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowArchived((s) => !s); }} className="btn-ghost !py-2 text-xs">
              {showArchived ? `← Active (${activeCount})` : `🗄 Archived (${archivedCount})`}
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-ghost !py-2 text-xs">⬆ Upload invoice</button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onUpload} />
            <button onClick={newInvoice} className="btn-primary !py-2 text-xs">+ New invoice</button>
          </div>
        }
      />

      {/* Summary tiles — click to filter */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Invoices" value={String(stats.count)} onClick={() => { setShowArchived(false); setFilter("all"); }} active={!showArchived && filter === "all"} hint="Show all active" />
        <Tile label="Total invoiced" value={formatPeso(stats.invoiced)} onClick={() => { setShowArchived(false); setFilter("all"); }} active={!showArchived && filter === "all"} hint="Show all active" />
        <Tile label="Outstanding" value={formatPeso(stats.outstanding)} accent="amber" onClick={() => { setShowArchived(false); setFilter("unpaid"); }} active={!showArchived && filter === "unpaid"} hint="Show unpaid" />
        <Tile label="Paid" value={formatPeso(stats.paid)} accent="emerald" onClick={() => { setShowArchived(false); setFilter("paid"); }} active={!showArchived && filter === "paid"} hint="Show paid" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "unpaid", "paid"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? "bg-forest text-parchment" : "border border-firefly/25 bg-parchment-card text-ink-soft"}`}>{f}</button>
        ))}
        <label className="ml-1 flex items-center gap-1.5 text-xs text-ink-faint">Client
          <select className="rounded-lg border border-firefly/25 bg-parchment-card px-2 py-1.5 text-xs outline-none focus:border-firefly" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            {clientNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Sort
          <select className="rounded-lg border border-firefly/25 bg-parchment-card px-2 py-1.5 text-xs outline-none focus:border-firefly" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recent">Most recent</option>
            <option value="client">Client A–Z</option>
            <option value="amount">Amount (high→low)</option>
            <option value="due">Due date</option>
          </select>
        </label>
        <span className="ml-auto text-xs text-ink-faint">{shown.length} shown</span>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="py-2 pr-3 font-semibold">Invoice</th>
              <th className="py-2 pr-3 font-semibold">Bill to</th>
              <th className="py-2 pr-3 font-semibold">Total</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-3 font-semibold">Due</th>
              <th className="py-2 pr-0 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <tr key={d.id} className="border-b border-firefly/10 last:border-0">
                <td className="py-3 pr-3">
                  <button onClick={() => setOpen(d)} className="text-left font-medium text-forest-deep hover:underline">
                    {d.fileUrl && <span className="mr-1" title="Uploaded file">📎</span>}
                    {d.invoiceNo || "—"}
                  </button>
                  <p className="text-[11px] text-ink-faint">{d.name}</p>
                </td>
                <td className="py-3 pr-3 text-ink-soft">
                  {clientKey(d) || "—"}
                  {d.billCompany && d.billTo && <p className="text-[11px] text-ink-faint">{d.billTo}</p>}
                </td>
                <td className="py-3 pr-3 font-semibold text-forest-deep">{effectiveTotal(d) > 0 ? formatPeso(effectiveTotal(d)) : "—"}</td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge(d)}`}>{statusText(d)}</span></td>
                <td className="py-3 pr-3 text-ink-soft">{d.dueDate || "—"}</td>
                <td className="py-3 pr-0">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button onClick={() => setOpen(d)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                    <button onClick={() => markInvoicePaid(d.id, !d.paid)} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${d.paid ? "border-firefly/25 text-ink-soft hover:bg-firefly/10" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>{d.paid ? "Unmark paid" : "Mark paid"}</button>
                    {!d.fileUrl && <button onClick={() => printInvoice(d)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">PDF</button>}
                    <button onClick={() => duplicate(d)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Duplicate</button>
                    <button onClick={() => { setOpen(d); setSendEmail(d.clientEmail ?? d.billEmail ?? ""); setShowSend(true); }} className="rounded-lg border border-forest/30 px-2.5 py-1 text-xs font-semibold text-forest hover:border-firefly">Send</button>
                    <button onClick={() => archiveDocument(d.id, !d.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{d.archived ? "Restore" : "Archive"}</button>
                    <button onClick={() => { if (confirm("Delete this invoice?")) removeDocument(d.id); }} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-ink-faint">{showArchived ? "No archived invoices." : <>No invoices yet — click <span className="font-semibold text-forest">+ New invoice</span> to create one.</>}</td></tr>}
          </tbody>
        </table>
      </Panel>

      {/* Invoice editor */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-forest-deep">{open.fileUrl ? "Uploaded Invoice" : "Invoice"}</h2>
                <p className="text-[11px] text-ink-faint">Auto-saved ✦</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="space-y-1 sm:col-span-2"><span className={lbl}>Invoice title</span><input className={input} value={open.name} onChange={(e) => editInv({ name: e.target.value })} /></label>
                <label className="space-y-1"><span className={lbl}>Invoice #</span><input className={input} value={open.invoiceNo ?? ""} onChange={(e) => editInv({ invoiceNo: e.target.value })} placeholder="INV-0001" /></label>
                <label className="space-y-1"><span className={lbl}>Status</span>
                  <select className={input} value={open.status} onChange={(e) => editInv({ status: e.target.value as DocRecord["status"] })}>
                    <option value="draft">Draft</option><option value="final">Final</option><option value="sent">Sent</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1"><span className={lbl}>Invoice date</span><input type="date" className={input} value={open.invoiceDate ?? ""} onChange={(e) => editInv({ invoiceDate: e.target.value })} /></label>
                <label className="space-y-1"><span className={lbl}>Due date</span><input type="date" className={input} value={open.dueDate ?? ""} onChange={(e) => editInv({ dueDate: e.target.value })} /></label>
                <label className="flex items-end gap-2 pb-1 text-sm text-ink-soft">
                  <input type="checkbox" checked={!!open.paid} onChange={(e) => { editInv({ paid: e.target.checked, paidAt: e.target.checked ? new Date().toISOString() : undefined }); }} className="h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
                  Marked paid
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-2"><span className={lbl}>Billed to — pick a contact</span>
                  <select
                    className={input}
                    value={
                      clients.find((c) => c.name === open.billTo && (c.company || "") === (open.billCompany || ""))?.id
                      ?? ((open.billTo || open.billCompany) ? "__custom" : "")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__custom" || v === "") return;
                      const c = clients.find((x) => x.id === v);
                      if (c) editInv({ billTo: c.name, billCompany: c.company, billEmail: c.email || open.billEmail });
                    }}
                  >
                    <option value="">— Choose a contact —</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{billLabel(c)}</option>)}
                    {(open.billTo || open.billCompany) && !clients.some((c) => c.name === open.billTo && (c.company || "") === (open.billCompany || "")) && (
                      <option value="__custom">{open.billCompany || open.billTo} (custom)</option>
                    )}
                  </select>
                </label>
                <label className="space-y-1"><span className={lbl}>Company</span><input className={input} value={open.billCompany ?? ""} onChange={(e) => editInv({ billCompany: e.target.value })} placeholder="Client company" /></label>
                <label className="space-y-1"><span className={lbl}>Contact name</span><input className={input} value={open.billTo ?? ""} onChange={(e) => editInv({ billTo: e.target.value })} placeholder="Person to address" /></label>
                <label className="space-y-1 sm:col-span-2"><span className={lbl}>Client email</span><input type="email" className={input} value={open.billEmail ?? ""} onChange={(e) => editInv({ billEmail: e.target.value })} placeholder="client@email.com" /></label>
              </div>

              {open.fileUrl ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-firefly/20 bg-parchment-warm/40 p-3 text-sm text-ink-soft">
                    This invoice is an uploaded file. <a href={open.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-forest hover:underline">Open file ↗</a> · edit the details, set the amount below, and mark it paid.
                  </div>
                  <label className="space-y-1 block sm:max-w-xs"><span className={lbl}>Invoice amount (₱)</span>
                    <input type="number" min={0} step="0.01" className={input} value={open.manualAmount ?? ""} onChange={(e) => editInv({ manualAmount: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="e.g. 65000" />
                    <span className="text-[10px] text-ink-faint">Reflected in the list total, totals, and Outstanding/Paid tracking.</span>
                  </label>
                </div>
              ) : (
                <>
                  {/* Line items */}
                  <div className="rounded-xl border border-firefly/20 bg-parchment-warm/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Line items</p>
                      <button onClick={addItem} className="rounded-lg border border-firefly/30 px-2.5 py-1 text-xs font-semibold text-forest hover:border-firefly">+ Add line</button>
                    </div>
                    <div className="hidden grid-cols-[1fr,70px,110px,110px,28px] gap-2 px-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint sm:grid">
                      <span>Description</span><span className="text-right">Qty</span><span className="text-right">Unit price</span><span className="text-right">Amount</span><span />
                    </div>
                    <div className="space-y-2">
                      {(open.items ?? []).map((it, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr,70px,110px,110px,28px] sm:items-center">
                          <input className={`${input} col-span-2 sm:col-span-1`} value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="e.g. VA Foundations training — Batch 4" />
                          <input type="number" min={0} className={`${input} sm:text-right`} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                          <input type="number" min={0} step="0.01" className={`${input} sm:text-right`} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} />
                          <div className="flex items-center justify-end px-1 text-sm font-semibold text-forest-deep">{formatPeso((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</div>
                          <button onClick={() => removeItem(i)} className="justify-self-end text-ink-faint hover:text-rose-600" title="Remove line">✕</button>
                        </div>
                      ))}
                      {(open.items ?? []).length === 0 && <p className="py-2 text-center text-xs text-ink-faint">No line items yet — click “+ Add line”.</p>}
                    </div>

                    {/* Totals */}
                    <div className="mt-3 flex flex-col items-end gap-1 border-t border-firefly/20 pt-3 text-sm">
                      <div className="flex w-full max-w-xs justify-between text-ink-soft"><span>Subtotal</span><span>{formatPeso(invoiceSubtotal(open.items))}</span></div>
                      <div className="flex w-full max-w-xs items-center justify-between text-ink-soft">
                        <span>Discount (₱)</span>
                        <input type="number" min={0} step="0.01" className="w-28 rounded-lg border border-firefly/25 bg-white px-2 py-1 text-right text-sm outline-none focus:border-firefly" value={open.discount ?? 0} onChange={(e) => editInv({ discount: Number(e.target.value) })} />
                      </div>
                      <div className="flex w-full max-w-xs items-center justify-between text-ink-soft">
                        <span>Tax (%)</span>
                        <input type="number" min={0} step="0.01" className="w-28 rounded-lg border border-firefly/25 bg-white px-2 py-1 text-right text-sm outline-none focus:border-firefly" value={open.taxPct ?? 0} onChange={(e) => editInv({ taxPct: Number(e.target.value) })} />
                      </div>
                      <div className="mt-1 flex w-full max-w-xs justify-between border-t border-firefly/20 pt-2 text-base font-bold text-forest"><span>Total due</span><span>{formatPeso(invoiceTotal(open))}</span></div>
                    </div>
                  </div>

                  <label className="space-y-1 block"><span className={lbl}>Payment terms</span>
                    <div className="flex items-center gap-2">
                      <select className={input} value={terms.includes(open.terms ?? "") ? open.terms : (open.terms ? "__custom" : "")} onChange={(e) => { if (e.target.value !== "__custom") editInv({ terms: e.target.value }); }}>
                        <option value="">— Select payment terms —</option>
                        {terms.map((t) => <option key={t} value={t}>{t}</option>)}
                        {open.terms && !terms.includes(open.terms) && <option value="__custom">{open.terms} (custom)</option>}
                      </select>
                      <button type="button" onClick={() => setManageTerms(true)} className="shrink-0 rounded-lg border border-firefly/25 px-3 py-2 text-xs font-semibold text-forest hover:border-firefly">Manage</button>
                    </div>
                  </label>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={lbl}>Particulars — Page 2 <span className="normal-case text-ink-faint/70">(prints as the second page)</span></span>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={insertParticulars} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-[11px] font-semibold text-forest hover:bg-firefly/10">↻ Insert template</button>
                        <button type="button" onClick={() => setManageParticulars(true)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-[11px] font-semibold text-forest hover:bg-firefly/10">Edit template</button>
                      </div>
                    </div>
                    <textarea rows={7} className={input} value={open.body ?? ""} onChange={(e) => editInv({ body: e.target.value })} placeholder="Breakdown, scope details, terms & conditions, notes… — anything for the second sheet." />
                    <p className="text-[10px] text-ink-faint">Tip: the template can use <code>{"{{company}}"}</code> and <code>{"{{amount_due}}"}</code> — they fill in automatically when inserted.</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button onClick={() => duplicate(open)} className="btn-ghost !py-2 text-xs">⧉ Duplicate</button>
              {!open.fileUrl && <button onClick={() => printInvoice(open)} className="btn-ghost !py-2 text-xs">🖨 Print / PDF</button>}
              <button onClick={() => { setSendEmail(open.clientEmail ?? open.billEmail ?? ""); setShowSend(true); }} className="btn-ghost !py-2 text-xs">✉ Send to client</button>
              <span className="mx-1 h-5 w-px bg-firefly/20" />
              <button onClick={saveInvoice} className="btn-primary !py-2 text-xs">💾 Save</button>
              <button onClick={() => setOpen(null)} className="btn-ghost !py-2 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Send modal */}
      {showSend && open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={() => setShowSend(false)}>
          <div className="w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-forest-deep">Send invoice</h2>
            <p className="mt-1 text-xs text-ink-faint">Emails “{open.invoiceNo || open.name}” to the client and marks it as sent.</p>
            <label className="mt-4 block space-y-1"><span className={lbl}>Client email</span>
              <input type="email" className={input} value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} placeholder="client@email.com" autoFocus />
            </label>
            <div className="mt-3 rounded-lg border border-firefly/20 bg-firefly/8 p-2.5 text-[11px] text-ink-soft">
              <span className="font-semibold text-forest-deep">✦ Demo note:</span> sending is simulated. In production this renders the PDF and emails it via your mail service, then logs it here.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowSend(false)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={doSend} disabled={!sendEmail.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">✉ Send now</button>
            </div>
          </div>
        </div>
      )}

      {manageTerms && <TermsManager terms={terms} onClose={() => setManageTerms(false)} />}
      {manageParticulars && <ParticularsTemplateManager onClose={() => setManageParticulars(false)} onSaved={() => flash("✓ Particulars template saved")} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-parchment shadow-glow">{toast}</div>
      )}
    </>
  );
}

// Add / rename / remove payment-term options (the invoice dropdown) ----------
function TermsManager({ terms, onClose }: { terms: string[]; onClose: () => void }) {
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  return (
    <div className="fixed inset-0 z-[92] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Manage Payment Terms</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">These appear in the Payment terms dropdown on every invoice.</p>
        <div className="mt-4 space-y-2">
          {terms.map((t, i) => (
            <div key={t} className="flex items-center gap-2 rounded-xl border border-firefly/15 bg-white/70 px-3 py-2">
              {editIdx === i ? (
                <input autoFocus className="min-w-0 flex-1 rounded-lg border border-firefly/30 px-2 py-1 text-sm outline-none focus:border-firefly" value={editVal} onChange={(e) => setEditVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { renamePaymentTerm(t, editVal); setEditIdx(null); } }} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-deep">{t}</span>
              )}
              {editIdx === i ? (
                <>
                  <button onClick={() => { renamePaymentTerm(t, editVal); setEditIdx(null); }} className="shrink-0 rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-parchment">Save</button>
                  <button onClick={() => setEditIdx(null)} className="shrink-0 text-xs text-ink-faint">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditIdx(i); setEditVal(t); }} className="shrink-0 rounded-lg border border-firefly/25 px-2 py-1 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                  <button onClick={() => { if (confirm(`Remove "${t}"?`)) removePaymentTerm(t); }} className="shrink-0 text-xs font-semibold text-ink-faint hover:text-rose-600">Remove</button>
                </>
              )}
            </div>
          ))}
          {terms.length === 0 && <p className="text-sm text-ink-faint">No payment terms yet — add one below.</p>}
        </div>
        <div className="mt-4 flex gap-2 border-t border-firefly/15 pt-4">
          <input className="flex-1 rounded-xl border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly" placeholder="New payment term…" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { addPaymentTerm(newName); setNewName(""); } }} />
          <button onClick={() => { if (newName.trim()) { addPaymentTerm(newName); setNewName(""); } }} disabled={!newName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">+ Add</button>
        </div>
      </div>
    </div>
  );
}

// Edit the reusable Particulars (Page 2) template used for new invoices -------
function ParticularsTemplateManager({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [text, setText] = useState("");
  useEffect(() => { setText(getInvoiceParticularsTemplate()); }, []);
  return (
    <div className="fixed inset-0 z-[92] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-forest-deep">Particulars Template</h2>
            <p className="text-[11px] text-ink-faint">Used to pre-fill Page 2 on new invoices. Use {"{{company}}"} and {"{{amount_due}}"} for auto-fill.</p>
          </div>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <textarea rows={16} className={`${input} mt-4 font-mono text-[11px] leading-relaxed`} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost !py-2 text-xs">Cancel</button>
          <button onClick={() => { setInvoiceParticularsTemplate(text); onSaved(); onClose(); }} className="btn-primary !py-2 text-xs">💾 Save template</button>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, accent, onClick, active, hint }: { label: string; value: string; accent?: "amber" | "emerald"; onClick?: () => void; active?: boolean; hint?: string }) {
  const ring = accent === "amber" ? "text-amber-700" : accent === "emerald" ? "text-emerald-700" : "text-forest-deep";
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`rounded-2xl border bg-parchment-card p-4 text-left shadow-card transition hover:border-firefly hover:shadow-glow-sm ${active ? "border-firefly ring-1 ring-firefly/40" : "border-firefly/15"}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className={`mt-1 font-serif text-2xl ${ring}`}>{value}</p>
    </button>
  );
}
