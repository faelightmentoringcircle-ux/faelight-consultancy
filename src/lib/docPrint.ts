import { DocRecord, invoiceSubtotal, invoiceTotal, formatPeso } from "@/lib/store";

// Faelight company + payment details (from the official invoice template).
const COMPANY = {
  name: "FAELIGHT BUSINESS CONSULTANCY",
  address: "10 Muralla St., Las Villas De Manila, Biñan Laguna",
  email: "faelightmentoringcircle@gmail.com",
  bank: "Bank of the Philippine Islands",
  accountName: "Maria Lourdes A Castañeda",
  accountNumber: "0179070154",
};

/**
 * Prints an invoice in the official Faelight layout (logo header, BILLED TO /
 * DATE / PAYMENT TERMS, DESCRIPTION · QTY · AMOUNT table, TOTAL, PAY TO bank
 * block, footer). Client-only — call from a button handler.
 */
export function printInvoice(d: DocRecord) {
  const w = window.open("", "_blank", "width=880,height=1120");
  if (!w) { alert("Please allow pop-ups to print / save as PDF."); return; }
  const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const origin = window.location.origin;
  const logo = `${origin}/brand/logo-full.png`;
  const sub = invoiceSubtotal(d.items);
  const total = invoiceTotal(d);
  const items = d.items ?? [];
  const rows = items.map((it) => `
    <tr>
      <td class="desc">${esc(it.description || "—")}</td>
      <td class="qty">${Number(it.qty) || 0}</td>
      <td class="amt">${esc(formatPeso((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)))}</td>
    </tr>`).join("");
  const extraTotals = `
    ${d.discount ? `<div class="trow"><span>Discount</span><b>−${esc(formatPeso(Number(d.discount) || 0))}</b></div>` : ""}
    ${d.taxPct ? `<div class="trow"><span>Tax (${Number(d.taxPct)}%)</span><b>${esc(formatPeso(Math.max(0, sub - (Number(d.discount) || 0)) * ((Number(d.taxPct) || 0) / 100)))}</b></div>` : ""}
    ${(d.discount || d.taxPct) ? `<div class="trow"><span>Subtotal</span><b>${esc(formatPeso(sub))}</b></div>` : ""}`;

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(d.invoiceNo || "")}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root{--ink:#1c1a17;--soft:#6f6a62;--gold:#b8892b;--gold-soft:#cba24a;--line:#e7ddc7}
      *{box-sizing:border-box}
      html,body{margin:0}
      body{font-family:'Montserrat',Arial,sans-serif;color:var(--ink);background:#fff;line-height:1.5}
      .sheet{max-width:760px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;padding:44px 52px 0}
      /* Header */
      .head{display:flex;align-items:center;justify-content:space-between;gap:20px}
      .head img{height:120px;width:auto}
      .head .co{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:.5px;text-align:right;max-width:320px}
      .title{margin-top:14px;text-align:right}
      .title .big{font-family:'Montserrat',sans-serif;font-weight:400;letter-spacing:10px;font-size:44px;color:var(--ink)}
      .title .no{font-weight:700;letter-spacing:2px;font-size:20px;color:var(--ink);margin-top:2px}
      /* Meta */
      .meta{margin-top:26px;font-size:13px}
      .meta .row{display:flex;gap:10px;margin-bottom:4px}
      .meta .k{font-weight:700;letter-spacing:1px;min-width:150px;text-transform:uppercase}
      /* Table */
      table{width:100%;border-collapse:collapse;margin-top:22px}
      thead th{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-align:left;border-bottom:1.5px solid var(--ink);padding:0 8px 10px}
      thead th.qty{text-align:center;width:80px}
      thead th.amt{text-align:right;width:150px}
      tbody td{padding:11px 8px;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top}
      tbody td.qty{text-align:center}
      tbody td.amt{text-align:right;white-space:nowrap}
      tbody tr:last-child td{border-bottom:1.5px solid var(--ink)}
      .totals{margin-top:8px;margin-left:auto;width:300px}
      .totals .trow{display:flex;justify-content:space-between;padding:3px 8px;font-size:12px;color:var(--soft)}
      .totals .grand{display:flex;justify-content:space-between;align-items:center;padding:10px 8px 0;border-top:0}
      .totals .grand span{font-size:15px;font-weight:700;letter-spacing:3px}
      .totals .grand b{font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--gold)}
      .note{margin-top:16px;font-size:11px;color:var(--soft);font-style:italic}
      /* Pay-to */
      .payto{margin-top:auto;padding:26px 0 0}
      .payto h3{font-size:13px;font-weight:700;letter-spacing:2px;margin:0 0 8px}
      .payto .prow{display:flex;font-size:12px;margin-bottom:3px}
      .payto .pk{color:var(--soft);min-width:150px}
      .payto .pv{color:var(--ink);font-weight:600}
      .foot{margin-top:20px;border-top:2px solid var(--gold);padding:12px 0 26px;text-align:center;font-size:11px;color:var(--soft)}
      /* Page 2 — Particulars (kept to a single page) */
      .page2{page-break-before:always;min-height:auto;padding-top:34px;justify-content:flex-start}
      .p2head{display:flex;align-items:center;gap:16px}
      .p2head img{height:76px;width:auto}
      .p2head .co{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;font-weight:700;letter-spacing:.5px}
      .p2title{font-size:12px;font-weight:700;letter-spacing:3px;margin:18px 0 8px;border-bottom:1.5px solid var(--ink);padding-bottom:6px}
      .particulars{white-space:pre-wrap;font-family:'Montserrat',Arial,sans-serif;font-size:9.5px;line-height:1.4;color:var(--ink);margin:0 0 12px}
      .page2 .foot{margin-top:16px}
      @page{margin:12mm}
      @media print{ body{-webkit-print-color-adjust:exact;print-color-adjust:exact} .sheet{max-width:none;min-height:auto} .page2{min-height:auto;page-break-inside:avoid} }
    </style></head><body>
    <div class="sheet">
      <div class="head">
        <img src="${logo}" alt="Faelight" onerror="this.style.display='none'"/>
        <div>
          <div class="co">${esc(COMPANY.name)}</div>
          <div class="title">
            <div class="big">INVOICE</div>
            <div class="no">#${esc((d.invoiceNo || "000").replace(/^INV-?/i, "") || "000")}</div>
          </div>
        </div>
      </div>

      <div class="meta">
        <div class="row"><span class="k">Billed to:</span><span>${esc(d.billCompany || d.billTo || "")}${d.billCompany && d.billTo ? " (Attn: " + esc(d.billTo) + ")" : ""}</span></div>
        ${d.billEmail ? `<div class="row"><span class="k"></span><span>${esc(d.billEmail)}</span></div>` : ""}
        ${d.billAddress ? `<div class="row"><span class="k"></span><span>${esc(d.billAddress)}</span></div>` : ""}
        <div class="row"><span class="k">Date:</span><span>${esc(d.invoiceDate || "")}${d.dueDate ? " · Due " + esc(d.dueDate) : ""}</span></div>
        <div class="row"><span class="k">Payment terms:</span><span>${esc(d.terms || "")}</span></div>
      </div>

      <table>
        <thead><tr><th class="desc">Description</th><th class="qty">Qty</th><th class="amt">Amount</th></tr></thead>
        <tbody>${rows || `<tr><td class="desc">—</td><td class="qty"></td><td class="amt"></td></tr>`}</tbody>
      </table>

      <div class="totals">
        ${extraTotals}
        <div class="grand"><span>TOTAL</span><b>${esc(formatPeso(total))}</b></div>
      </div>
      <p class="note">** Kindly see Page 2 for Particulars${d.paid ? " · PAID" : ""}</p>

      <div class="payto">
        <h3>PAY TO:</h3>
        <div class="prow"><span class="pk">Bank</span><span class="pv">${esc(COMPANY.bank)}</span></div>
        <div class="prow"><span class="pk">Account Name</span><span class="pv">${esc(COMPANY.accountName)}</span></div>
        <div class="prow"><span class="pk">Account Number</span><span class="pv">${esc(COMPANY.accountNumber)}</span></div>
      </div>
      <div class="foot">${esc(COMPANY.address)} — ${esc(COMPANY.email)}</div>
    </div>

    <div class="sheet page2">
      <div class="p2head">
        <img src="${logo}" alt="Faelight" onerror="this.style.display='none'"/>
        <div class="co">${esc(COMPANY.name)}</div>
      </div>
      <div class="p2title">PARTICULARS</div>
      <pre class="particulars">${esc(d.body || "")}</pre>
      <div class="foot">${esc(COMPANY.address)} — ${esc(COMPANY.email)}</div>
    </div>
    <script>window.onload=function(){setTimeout(function(){window.print();},400);}</script>
    </body></html>`);
  w.document.close();
}

/**
 * Opens a print window with a branded, print-ready rendering of a document
 * (contract or invoice) and triggers the browser's Print / Save-as-PDF dialog.
 * Client-only — call from a button handler.
 */
export function printDocument(d: DocRecord) {
  const w = window.open("", "_blank", "width=820,height=1040");
  if (!w) { alert("Please allow pop-ups to print / save as PDF."); return; }
  const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const origin = window.location.origin;
  const logo = `${origin}/brand/logo-mark.png`;
  const isInvoice = d.kind === "invoice";
  const hasItems = isInvoice && Array.isArray(d.items) && d.items.length > 0;
  const sub = invoiceSubtotal(d.items);
  const total = invoiceTotal(d);
  const metaRows = isInvoice ? `
    <div class="metawrap">
      <div class="metacol">
        <div class="mrow"><span>Invoice #</span><b>${esc(d.invoiceNo || "—")}</b></div>
        <div class="mrow"><span>Date</span><b>${esc(d.invoiceDate || new Date().toLocaleDateString())}</b></div>
        <div class="mrow"><span>Due date</span><b>${esc(d.dueDate || "—")}</b></div>
      </div>
      <div class="metacol">
        <div class="mrow"><span>Bill to</span><b>${esc(d.billTo || "—")}</b></div>
        ${d.billEmail ? `<div class="mrow"><span>Email</span><b>${esc(d.billEmail)}</b></div>` : ""}
        ${d.billAddress ? `<div class="mrow"><span>Address</span><b>${esc(d.billAddress)}</b></div>` : ""}
        <div class="mrow"><span>Status</span><b>${d.paid ? "PAID" : esc(d.status)}</b></div>
      </div>
      <div class="amtbox"><span>Amount due</span><b>${hasItems ? esc(formatPeso(total)) : esc(d.amount || "—")}</b></div>
    </div>` : "";
  const itemsTable = hasItems ? `
    <table class="items">
      <thead><tr><th class="desc">Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${d.items!.map((it) => `<tr><td class="desc">${esc(it.description || "—")}</td><td class="num">${Number(it.qty) || 0}</td><td class="num">${esc(formatPeso(Number(it.unitPrice) || 0))}</td><td class="num">${esc(formatPeso((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)))}</td></tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="trow"><span>Subtotal</span><b>${esc(formatPeso(sub))}</b></div>
      ${d.discount ? `<div class="trow"><span>Discount</span><b>−${esc(formatPeso(Number(d.discount) || 0))}</b></div>` : ""}
      ${d.taxPct ? `<div class="trow"><span>Tax (${Number(d.taxPct)}%)</span><b>${esc(formatPeso(Math.max(0, sub - (Number(d.discount) || 0)) * ((Number(d.taxPct) || 0) / 100)))}</b></div>` : ""}
      <div class="trow grand"><span>Total due</span><b>${esc(formatPeso(total))}</b></div>
    </div>
    ${d.terms ? `<p class="terms">${esc(d.terms)}</p>` : ""}` : "";
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.name)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      :root{--forest:#2f5646;--forest-deep:#1e3a2e;--gold:#c9922f;--gold-deep:#b98900;--ink:#22201b;--soft:#7a7263;--parch:#faf6ec}
      *{box-sizing:border-box}
      html,body{margin:0}
      body{font-family:'Nunito Sans',Arial,sans-serif;color:var(--ink);line-height:1.6;background:#fff}
      .sheet{max-width:720px;margin:0 auto;padding:0 0 40px}
      .band{background:linear-gradient(135deg,var(--forest-deep),var(--forest));color:#fff;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid var(--gold)}
      .brand{display:flex;align-items:center;gap:14px}
      .brand img{height:56px;width:auto;filter:drop-shadow(0 2px 8px rgba(0,0,0,.25))}
      .brand .name{font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:700;line-height:1}
      .brand .name small{display:block;font-family:'Nunito Sans',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#f4d58a;margin-top:4px;font-weight:600}
      .docmeta{text-align:right}
      .docmeta .kind{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#f4d58a;font-weight:700}
      .docmeta h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;margin:4px 0 0;font-weight:600}
      .body{padding:32px 40px 0}
      .metawrap{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;background:var(--parch);border:1px solid #ecdfbf;border-radius:12px;padding:18px 22px;margin-bottom:28px}
      .metacol{display:flex;flex-direction:column;gap:6px}
      .mrow{display:flex;flex-direction:column}
      .mrow span{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--soft)}
      .mrow b{font-size:14px;color:var(--ink)}
      .amtbox{margin-left:auto;text-align:right}
      .amtbox span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--soft)}
      .amtbox b{font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--forest);font-weight:700}
      pre{white-space:pre-wrap;font-family:'Nunito Sans',Arial,sans-serif;font-size:14px;margin:0;color:#2c2a24}
      table.items{width:100%;border-collapse:collapse;margin:0 0 18px}
      table.items thead th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--soft);border-bottom:2px solid var(--gold);padding:0 10px 8px}
      table.items th.num,table.items td.num{text-align:right;white-space:nowrap}
      table.items tbody td{padding:9px 10px;border-bottom:1px solid #eee4cf;font-size:13px;vertical-align:top}
      table.items td.desc{color:var(--ink)}
      .totals{margin-left:auto;width:280px}
      .totals .trow{display:flex;justify-content:space-between;padding:5px 10px;font-size:13px;color:var(--soft)}
      .totals .trow b{color:var(--ink);font-weight:600}
      .totals .grand{border-top:2px solid var(--gold);margin-top:4px;padding-top:9px;font-size:15px;color:var(--forest)}
      .totals .grand b{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--forest);font-weight:700}
      .terms{margin:22px 0 0;font-size:12px;color:var(--soft);border-left:3px solid var(--gold);padding-left:12px}
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
        ${itemsTable}
        ${d.body ? `<pre>${esc(d.body)}</pre>` : ""}
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
