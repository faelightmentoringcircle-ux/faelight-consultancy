"use client";

import { useEffect, useRef, useState } from "react";
import {
  getTemplates,
  addTemplate,
  updateTemplate,
  removeTemplate,
  getDocuments,
  createDraftFromTemplate,
  addBlankDocument,
  addUploadedDocument,
  saveDocument,
  sendDocument,
  removeDocument,
  duplicateDocument,
  onStoreChange,
  READY_MADE_TEMPLATES,
  installReadyMadeTemplate,
  DocTemplate,
  DocRecord,
  TemplateKind,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

const KIND_STYLES: Record<TemplateKind, string> = {
  contract: "bg-forest/10 text-forest",
  invoice: "bg-firefly/15 text-firefly-deep",
  design: "bg-twilight/15 text-twilight",
  other: "bg-twilight/10 text-twilight-light",
};

const MAX_TEMPLATE_MB = 4;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

type TDraft = {
  name: string; kind: TemplateKind; body: string;
  fileUrl: string; fileName: string; fileType: string; canvaUrl: string;
};
const T_EMPTY: TDraft = { name: "", kind: "contract", body: "", fileUrl: "", fileName: "", fileType: "", canvaUrl: "" };

export default function TemplatesPage() {
  const [tab, setTab] = useState<"templates" | "documents">("templates");
  const [templates, setTemplates] = useState<DocTemplate[]>([]);
  const [docs, setDocs] = useState<DocRecord[]>([]);

  // Template editor state
  const [tEditing, setTEditing] = useState<string | "new" | null>(null);
  const [tDraft, setTDraft] = useState<TDraft>(T_EMPTY);
  const [uploadErr, setUploadErr] = useState("");
  // Document editor state (auto-saves as draft)
  const [openDoc, setOpenDoc] = useState<DocRecord | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sentNote, setSentNote] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  function doSend() {
    if (!openDoc || !sendEmail.trim()) return;
    const updated = sendDocument(openDoc.id, sendEmail.trim());
    if (updated) setOpenDoc(updated);
    setShowSend(false);
    setSentNote(`✓ ${openDoc.kind === "invoice" ? "Invoice" : "Document"} sent to ${sendEmail.trim()}`);
    setTimeout(() => setSentNote(""), 4000);
  }

  function printDocument(d: DocRecord) {
    const w = window.open("", "_blank", "width=820,height=1040");
    if (!w) { alert("Please allow pop-ups to print / save as PDF."); return; }
    const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const origin = window.location.origin;
    const logo = `${origin}/brand/logo-mark.png`;
    const isInvoice = d.kind === "invoice";
    const metaRows = isInvoice ? `
      <div class="metawrap">
        <div class="metacol">
          <div class="mrow"><span>Invoice #</span><b>${esc(d.invoiceNo || "—")}</b></div>
          <div class="mrow"><span>Date</span><b>${esc(d.invoiceDate || new Date().toLocaleDateString())}</b></div>
          <div class="mrow"><span>Due date</span><b>${esc(d.dueDate || "—")}</b></div>
        </div>
        <div class="metacol">
          <div class="mrow"><span>Bill to</span><b>${esc(d.billTo || "—")}</b></div>
        </div>
        <div class="amtbox"><span>Amount due</span><b>${esc(d.amount || "—")}</b></div>
      </div>` : "";
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.name)}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        :root{--forest:#2f5646;--forest-deep:#1e3a2e;--gold:#c9922f;--gold-deep:#b98900;--ink:#22201b;--soft:#7a7263;--parch:#faf6ec}
        *{box-sizing:border-box}
        html,body{margin:0}
        body{font-family:'Nunito Sans',Arial,sans-serif;color:var(--ink);line-height:1.6;background:#fff}
        .sheet{max-width:720px;margin:0 auto;padding:0 0 40px}
        /* Branded header band */
        .band{background:linear-gradient(135deg,var(--forest-deep),var(--forest));color:#fff;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid var(--gold)}
        .brand{display:flex;align-items:center;gap:14px}
        .brand img{height:56px;width:auto;filter:drop-shadow(0 2px 8px rgba(0,0,0,.25))}
        .brand .name{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:700;line-height:1}
        .brand .name small{display:block;font-family:'Nunito Sans',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#f4d58a;margin-top:4px;font-weight:600}
        .docmeta{text-align:right}
        .docmeta .kind{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#f4d58a;font-weight:700}
        .docmeta h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;margin:4px 0 0;font-weight:600}
        .body{padding:32px 40px 0}
        /* Invoice meta */
        .metawrap{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;background:var(--parch);border:1px solid #ecdfbf;border-radius:12px;padding:18px 22px;margin-bottom:28px}
        .metacol{display:flex;flex-direction:column;gap:6px}
        .mrow{display:flex;flex-direction:column}
        .mrow span{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--soft)}
        .mrow b{font-size:14px;color:var(--ink)}
        .amtbox{margin-left:auto;text-align:right}
        .amtbox span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--soft)}
        .amtbox b{font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--forest);font-weight:700}
        pre{white-space:pre-wrap;font-family:'Nunito Sans',Arial,sans-serif;font-size:14px;margin:0;color:#2c2a24}
        .foot{margin:44px 40px 0;border-top:2px solid var(--gold);padding-top:14px;display:flex;justify-content:space-between;font-size:11px;color:var(--soft)}
        .foot .tag{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:var(--forest)}
        @media print{ body{-webkit-print-color-adjust:exact;print-color-adjust:exact} .sheet{max-width:none} }
      </style></head><body>
      <div class="sheet">
        <div class="band">
          <div class="brand">
            <img src="${logo}" alt="Faelight" onerror="this.style.display='none'"/>
            <div class="name">Faelight<small>Business Consultancy</small></div>
          </div>
          <div class="docmeta"><div class="kind">${esc(d.kind)}</div><h1>${esc(d.name)}</h1></div>
        </div>
        <div class="body">
          ${metaRows}
          <pre>${esc(d.body)}</pre>
        </div>
        <div class="foot">
          <span class="tag">People first. Systems second. Magic throughout.</span>
          <span>Faelight Business Consultancy · Philippines</span>
        </div>
      </div>
      <script>window.onload=function(){setTimeout(function(){window.print();},350);}</script>
      </body></html>`);
    w.document.close();
  }

  const docFileRef = useRef<HTMLInputElement>(null);
  const [docUploadKind, setDocUploadKind] = useState<TemplateKind>("invoice");
  async function onDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_TEMPLATE_MB * 1024 * 1024) { alert(`File too large (max ${MAX_TEMPLATE_MB} MB).`); return; }
    const url = await fileToDataUrl(file);
    addUploadedDocument({ name: file.name.replace(/\.[^.]+$/, ""), kind: docUploadKind, fileUrl: url, fileName: file.name, fileType: file.type });
    if (docFileRef.current) docFileRef.current.value = "";
  }

  useEffect(() => {
    const sync = () => { setTemplates(getTemplates()); setDocs(getDocuments()); };
    sync();
    return onStoreChange(sync);
  }, []);

  // Auto-save the open document draft (debounced-ish on each change).
  const savedRef = useRef(false);
  function editDoc(patch: Partial<DocRecord>) {
    if (!openDoc) return;
    const next = { ...openDoc, ...patch };
    setOpenDoc(next);
    saveDocument(openDoc.id, patch); // persists immediately as draft
    savedRef.current = true;
  }

  function duplicateDoc(d: DocRecord) {
    const copy = duplicateDocument(d.id);
    if (copy) { setOpenDoc(copy); setTab("documents"); }
  }

  const replaceFileRef = useRef<HTMLInputElement>(null);
  async function onReplaceDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !openDoc) return;
    if (file.size > MAX_TEMPLATE_MB * 1024 * 1024) { alert(`File too large (max ${MAX_TEMPLATE_MB} MB).`); return; }
    const url = await fileToDataUrl(file);
    editDoc({ fileUrl: url, fileName: file.name, fileType: file.type });
    if (replaceFileRef.current) replaceFileRef.current.value = "";
  }

  function newTemplate() { setTDraft(T_EMPTY); setUploadErr(""); setTEditing("new"); }
  function newDesignTemplate() { setTDraft({ ...T_EMPTY, kind: "design" }); setUploadErr(""); setTEditing("new"); }
  function editTemplate(t: DocTemplate) {
    setTDraft({ name: t.name, kind: t.kind, body: t.body, fileUrl: t.fileUrl ?? "", fileName: t.fileName ?? "", fileType: t.fileType ?? "", canvaUrl: t.canvaUrl ?? "" });
    setUploadErr(""); setTEditing(t.id);
  }
  function saveTemplate() {
    if (!tDraft.name.trim()) return;
    const payload = {
      name: tDraft.name.trim(), kind: tDraft.kind, body: tDraft.body,
      fileUrl: tDraft.fileUrl || undefined, fileName: tDraft.fileName || undefined,
      fileType: tDraft.fileType || undefined, canvaUrl: tDraft.canvaUrl.trim() || undefined,
    };
    if (tEditing === "new") addTemplate(payload);
    else if (tEditing) updateTemplate(tEditing, payload);
    setTEditing(null);
  }
  async function onTemplateFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_TEMPLATE_MB * 1024 * 1024) { setUploadErr(`File too large (max ${MAX_TEMPLATE_MB} MB). For big decks, paste the Canva link instead.`); return; }
    setUploadErr("");
    const url = await fileToDataUrl(file);
    setTDraft((d) => ({ ...d, fileUrl: url, fileName: file.name, fileType: file.type }));
  }

  return (
    <>
      <AdminHeader
        title="Templates & Documents"
        subtitle="Text templates (contracts, invoices) fill in the browser; design templates hold your Canva / PDF / image files so existing brand designs are reused as-is."
        action={
          <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
            <button onClick={() => setTab("templates")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === "templates" ? "bg-forest text-parchment" : "text-ink-soft"}`}>Templates</button>
            <button onClick={() => setTab("documents")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === "documents" ? "bg-forest text-parchment" : "text-ink-soft"}`}>Documents ({docs.length})</button>
          </div>
        }
      />

      {/* TEMPLATES TAB */}
      {tab === "templates" && (
        <>
          <div className="mb-4 flex flex-wrap justify-end gap-2">
            <button onClick={() => setShowLibrary(true)} className="btn-ghost !py-2 text-xs">✦ Template library</button>
            <button onClick={newDesignTemplate} className="btn-ghost !py-2 text-xs">⬆ Upload design (Canva/PDF)</button>
            <button onClick={newTemplate} className="btn-primary !py-2 text-xs">+ New template</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.filter((t) => !t.archived).map((t) => {
              const isDesign = t.kind === "design" || !!t.fileUrl || !!t.canvaUrl;
              const isImg = t.fileType?.startsWith("image/");
              const isPdf = t.fileType === "application/pdf" || t.fileName?.toLowerCase().endsWith(".pdf");
              return (
              <Panel key={t.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${KIND_STYLES[t.kind]}`}>{t.kind}</span>
                    <h3 className="mt-1.5 font-serif text-lg text-forest-deep">{t.name}</h3>
                  </div>
                </div>

                {isDesign ? (
                  <div className="mt-3 flex gap-3">
                    <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-firefly/15 bg-parchment-warm/50">
                      {isImg && t.fileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.fileUrl} alt={t.name} className="h-full w-full object-cover" />
                      ) : isPdf ? (
                        <span className="text-center text-xs font-semibold text-rose-600">📄 PDF<br /><span className="text-[9px] font-normal text-ink-faint">{t.fileName}</span></span>
                      ) : t.canvaUrl ? (
                        <span className="text-center text-xs font-semibold text-twilight">🎨 Canva<br /><span className="text-[9px] font-normal text-ink-faint">linked design</span></span>
                      ) : (
                        <span className="text-xs text-ink-faint">No file</span>
                      )}
                    </div>
                    {t.body && <p className="min-w-0 flex-1 text-xs text-ink-soft">{t.body.slice(0, 180)}{t.body.length > 180 ? "…" : ""}</p>}
                  </div>
                ) : (
                  <pre className="mt-3 max-h-32 overflow-hidden whitespace-pre-wrap rounded-lg bg-parchment-warm/50 p-3 text-[11px] text-ink-soft">{t.body.slice(0, 240)}{t.body.length > 240 ? "…" : ""}</pre>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-firefly/15 pt-3">
                  {isDesign ? (
                    <>
                      {t.canvaUrl && <a href={t.canvaUrl} target="_blank" rel="noreferrer" className="btn-primary !py-2 text-xs">Open in Canva ↗</a>}
                      {t.fileUrl && <a href={t.fileUrl} download={t.fileName || t.name} className="btn-ghost !py-2 text-xs">⬇ Download</a>}
                    </>
                  ) : (
                    <button onClick={() => { const d = createDraftFromTemplate(t); setOpenDoc(d); setTab("documents"); }} className="btn-primary !py-2 text-xs">Use / fill →</button>
                  )}
                  <button onClick={() => editTemplate(t)} className="btn-ghost !py-2 text-xs">Edit template</button>
                  <button onClick={() => { if (confirm(`Delete the "${t.name}" template?`)) removeTemplate(t.id); }} className="ml-auto text-xs font-semibold text-rose-600 hover:underline">Delete</button>
                </div>
              </Panel>
              );
            })}
          </div>
        </>
      )}

      {/* DOCUMENTS TAB */}
      {tab === "documents" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <button onClick={() => setOpenDoc(addBlankDocument("contract"))} className="btn-ghost !py-2 text-xs">+ Blank contract</button>
            <button onClick={() => setOpenDoc(addBlankDocument("invoice"))} className="btn-ghost !py-2 text-xs">+ Blank invoice</button>
            <span className="mx-1 h-5 w-px bg-firefly/20" />
            <select value={docUploadKind} onChange={(e) => setDocUploadKind(e.target.value as TemplateKind)} className="rounded-lg border border-firefly/25 bg-parchment-card px-2 py-1.5 text-xs outline-none focus:border-firefly">
              <option value="invoice">Invoice</option><option value="contract">Contract</option><option value="other">Other</option>
            </select>
            <button onClick={() => docFileRef.current?.click()} className="btn-primary !py-2 text-xs">⬆ Upload file</button>
            <input ref={docFileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onDocFile} />
          </div>
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="py-2 pr-3 font-semibold">Document</th>
                  <th className="py-2 pr-3 font-semibold">Type</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 font-semibold">Updated</th>
                  <th className="py-2 pr-0 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-b border-firefly/10 last:border-0">
                    <td className="py-3 pr-3 font-medium text-forest-deep">
                      <span className="flex items-center gap-1.5">
                        {d.fileUrl && <span title="Uploaded file">{d.fileType?.startsWith("image/") ? "🖼" : "📄"}</span>}
                        {d.name}
                      </span>
                      {d.fileUrl && <p className="text-[10px] text-ink-faint">{d.fileName}</p>}
                    </td>
                    <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_STYLES[d.kind]}`}>{d.kind}</span></td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.status === "sent" ? "bg-blue-100 text-blue-700" : d.status === "final" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{d.status === "sent" ? "Sent" : d.status === "final" ? "Final" : "Draft"}</span>
                      {d.status === "sent" && d.sentTo && <p className="mt-0.5 text-[10px] text-ink-faint">→ {d.sentTo}</p>}
                    </td>
                    <td className="py-3 pr-3 text-ink-soft">{new Date(d.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-0">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button onClick={() => setOpenDoc(d)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">{d.fileUrl ? "Edit" : "Open"}</button>
                        {d.fileUrl && (
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Open ↗</a>
                        )}
                        <button onClick={() => duplicateDoc(d)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Duplicate</button>
                        <button onClick={() => { setOpenDoc(d); setSendEmail(d.clientEmail ?? ""); setShowSend(true); }} className="rounded-lg border border-forest/30 px-2.5 py-1 text-xs font-semibold text-forest hover:border-firefly">Send</button>
                        <button onClick={() => { if (confirm("Delete this document?")) removeDocument(d.id); }} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-ink-faint">No documents yet — use a template to start one.</td></tr>}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      {/* Template editor modal */}
      {tEditing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{tEditing === "new" ? "New Template" : "Edit Template"}</h2>
              <button onClick={() => setTEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1"><span className={lbl}>Template name</span><input className={input} value={tDraft.name} onChange={(e) => setTDraft((d) => ({ ...d, name: e.target.value }))} /></label>
                <label className="space-y-1"><span className={lbl}>Type</span>
                  <select className={input} value={tDraft.kind} onChange={(e) => setTDraft((d) => ({ ...d, kind: e.target.value as TemplateKind }))}>
                    <option value="contract">Contract</option><option value="invoice">Invoice</option><option value="design">Design (Canva / PDF / image)</option><option value="other">Other</option>
                  </select>
                </label>
              </div>

              {tDraft.kind === "design" ? (
                <>
                  {/* Canva link + file upload */}
                  <label className="space-y-1 block"><span className={lbl}>Canva link (open / duplicate the design)</span>
                    <input className={input} value={tDraft.canvaUrl} onChange={(e) => setTDraft((d) => ({ ...d, canvaUrl: e.target.value }))} placeholder="https://www.canva.com/design/…" />
                  </label>
                  <div>
                    <span className={lbl}>Upload the design file <span className="normal-case text-ink-faint">(Canva export — PDF, PNG or JPG)</span></span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer rounded-lg border border-firefly/30 px-3 py-2 text-xs font-semibold text-forest hover:border-firefly">
                        ⬆ Choose file
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onTemplateFile} />
                      </label>
                      {tDraft.fileUrl ? (
                        <span className="flex items-center gap-2 text-xs text-emerald-700">
                          ✓ {tDraft.fileName || "file attached"}
                          <button type="button" onClick={() => setTDraft((d) => ({ ...d, fileUrl: "", fileName: "", fileType: "" }))} className="text-rose-600 hover:underline">remove</button>
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-faint">No file yet · max {MAX_TEMPLATE_MB} MB</span>
                      )}
                    </div>
                    {tDraft.fileUrl && tDraft.fileType.startsWith("image/") && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tDraft.fileUrl} alt="preview" className="mt-3 max-h-40 rounded-lg border border-firefly/20" />
                    )}
                    {uploadErr && <p className="mt-2 text-xs text-rose-600">{uploadErr}</p>}
                  </div>
                  <label className="space-y-1 block"><span className={lbl}>Usage notes <span className="normal-case text-ink-faint">(how to adapt this design)</span></span>
                    <textarea rows={3} className={input} value={tDraft.body} onChange={(e) => setTDraft((d) => ({ ...d, body: e.target.value }))} placeholder="e.g. Duplicate in Canva, swap client name and pricing, export to PDF." />
                  </label>
                </>
              ) : (
                <label className="space-y-1 block"><span className={lbl}>Body — use {"{{placeholders}}"} for fields</span>
                  <textarea rows={12} className={`${input} font-mono text-xs`} value={tDraft.body} onChange={(e) => setTDraft((d) => ({ ...d, body: e.target.value }))} />
                </label>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setTEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={saveTemplate} disabled={!tDraft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{tEditing === "new" ? "Create template" : "Save template"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Document editor (auto-saves as draft) */}
      {openDoc && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-forest-deep">{openDoc.fileUrl ? "Edit Uploaded Document" : "Edit Document"}</h2>
                <p className="text-[11px] text-ink-faint">Auto-saved ✦ Changes are kept as you type.</p>
              </div>
              <button onClick={() => setOpenDoc(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1 sm:col-span-1"><span className={lbl}>Document name</span><input className={input} value={openDoc.name} onChange={(e) => editDoc({ name: e.target.value })} /></label>
                <label className="space-y-1"><span className={lbl}>Type</span>
                  <select className={input} value={openDoc.kind} onChange={(e) => editDoc({ kind: e.target.value as TemplateKind })}>
                    <option value="invoice">Invoice</option><option value="contract">Contract</option><option value="other">Other</option>
                  </select>
                </label>
                <label className="space-y-1"><span className={lbl}>Status</span>
                  <select className={input} value={openDoc.status} onChange={(e) => editDoc({ status: e.target.value as DocRecord["status"] })}>
                    <option value="draft">Draft</option><option value="final">Final</option><option value="sent">Sent</option>
                  </select>
                </label>
              </div>

              {openDoc.fileUrl && (
                <div className="rounded-xl border border-firefly/20 bg-parchment-warm/40 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Attached file</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-firefly/15 bg-white/60">
                      {openDoc.fileType?.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={openDoc.fileUrl} alt={openDoc.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-center text-xs font-semibold text-rose-600">📄 PDF<br /><span className="text-[9px] font-normal text-ink-faint">{openDoc.fileName}</span></span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <a href={openDoc.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">Open file ↗</a>
                      <a href={openDoc.fileUrl} download={openDoc.fileName || openDoc.name} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">⬇ Download</a>
                      <label className="cursor-pointer rounded-lg border border-firefly/30 px-3 py-1.5 text-center text-xs font-semibold text-forest hover:border-firefly">
                        ↻ Replace file
                        <input ref={replaceFileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onReplaceDocFile} />
                      </label>
                    </div>
                    <p className="min-w-0 flex-1 text-[11px] text-ink-faint">
                      Editing a PDF/image in the browser isn&rsquo;t possible, but you can rename it, change the invoice details below, replace the file, or use <span className="font-semibold text-forest">Duplicate</span> to save a new copy without touching the original.
                    </p>
                  </div>
                </div>
              )}

              {openDoc.kind === "invoice" && (
                <div className="rounded-xl border border-firefly/20 bg-parchment-warm/40 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Invoice details</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1"><span className={lbl}>Invoice #</span><input className={input} value={openDoc.invoiceNo ?? ""} onChange={(e) => editDoc({ invoiceNo: e.target.value })} placeholder="INV-0001" /></label>
                    <label className="space-y-1"><span className={lbl}>Amount due</span><input className={input} value={openDoc.amount ?? ""} onChange={(e) => editDoc({ amount: e.target.value })} placeholder="₱10,000" /></label>
                    <label className="space-y-1"><span className={lbl}>Invoice date</span><input type="date" className={input} value={openDoc.invoiceDate ?? ""} onChange={(e) => editDoc({ invoiceDate: e.target.value })} /></label>
                    <label className="space-y-1"><span className={lbl}>Due date</span><input type="date" className={input} value={openDoc.dueDate ?? ""} onChange={(e) => editDoc({ dueDate: e.target.value })} /></label>
                    <label className="space-y-1 sm:col-span-2"><span className={lbl}>Bill to</span><input className={input} value={openDoc.billTo ?? ""} onChange={(e) => editDoc({ billTo: e.target.value })} placeholder="Client name / company" /></label>
                  </div>
                </div>
              )}

              <label className="space-y-1 block">
                <span className={lbl}>{openDoc.fileUrl ? "Notes (optional)" : `Content — fill in the ${"{{placeholders}}"}`}</span>
                <textarea rows={openDoc.fileUrl ? 4 : 14} className={`${input} font-mono text-xs`} value={openDoc.body} onChange={(e) => editDoc({ body: e.target.value })} placeholder={openDoc.fileUrl ? "Internal notes about this file (not printed)…" : ""} />
              </label>
              {openDoc.status === "sent" && openDoc.sentTo && (
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">✓ Sent to {openDoc.sentTo}{openDoc.sentAt ? ` on ${new Date(openDoc.sentAt).toLocaleString()}` : ""}</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button onClick={() => duplicateDoc(openDoc)} className="btn-ghost !py-2 text-xs">⧉ Duplicate</button>
              {!openDoc.fileUrl && (
                <button onClick={() => printDocument(openDoc)} className="btn-ghost !py-2 text-xs">🖨 Print / PDF</button>
              )}
              <button onClick={() => { setSendEmail(openDoc.clientEmail ?? ""); setShowSend(true); }} className="btn-ghost !py-2 text-xs">✉ Save &amp; send to email</button>
              <button onClick={() => setOpenDoc(null)} className="btn-primary !py-2 text-xs">Done (saved)</button>
            </div>
          </div>
        </div>
      )}

      {/* Send-to-email sub-modal */}
      {showSend && openDoc && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={() => setShowSend(false)}>
          <div className="w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-xl text-forest-deep">Send {openDoc.kind === "invoice" ? "invoice" : "document"}</h2>
            <p className="mt-1 text-xs text-ink-faint">Emails “{openDoc.name}” to the client and marks it as sent.</p>
            <label className="mt-4 block space-y-1"><span className={lbl}>Client email</span>
              <input type="email" className={input} value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} placeholder="client@email.com" autoFocus />
            </label>
            <div className="mt-3 rounded-lg border border-firefly/20 bg-firefly/8 p-2.5 text-[11px] text-ink-soft">
              <span className="font-semibold text-forest-deep">✦ Demo note:</span> sending is simulated. In production this renders a PDF and emails it via your mail service (Resend), then logs it here.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowSend(false)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={doSend} disabled={!sendEmail.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">✉ Send now</button>
            </div>
          </div>
        </div>
      )}

      {/* Ready-made template library */}
      {showLibrary && (
        <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={() => setShowLibrary(false)}>
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-forest-deep">Template Library</h2>
                <p className="text-[11px] text-ink-faint">Ready-made starters — click Add to drop one into your templates, then edit freely.</p>
              </div>
              <button onClick={() => setShowLibrary(false)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {READY_MADE_TEMPLATES.map((t) => {
                const already = templates.some((x) => x.name.toLowerCase() === t.name.toLowerCase());
                return (
                  <div key={t.name} className="flex flex-col rounded-xl border border-firefly/15 bg-white/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${KIND_STYLES[t.kind]}`}>{t.kind}</span>
                      <p className="font-medium text-forest-deep">{t.name}</p>
                    </div>
                    <p className="mt-2 line-clamp-3 flex-1 text-[11px] text-ink-soft">{t.body.slice(0, 150)}…</p>
                    <button
                      onClick={() => installReadyMadeTemplate(t.name)}
                      disabled={already}
                      className="mt-3 self-start rounded-lg border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly disabled:opacity-40"
                    >
                      {already ? "✓ Added" : "+ Add to templates"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sent toast */}
      {sentNote && (
        <div className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-parchment shadow-glow">
          {sentNote}
        </div>
      )}
    </>
  );
}
