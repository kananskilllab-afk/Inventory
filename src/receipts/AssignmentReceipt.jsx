import { fmtDate, fmtDateTime } from "../utils/helpers";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

// Kanan brand blue
const BRAND = "#2356a9";

// ── print CSS ─────────────────────────────────────────────────────────────────
const RECEIPT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }

  /* ── Letterhead ── */
  .lh-header {
    background: #fff;
    padding: 20px 48px 16px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 3px solid ${BRAND};
  }
  .lh-logo { height: 60px; width: auto; object-fit: contain; }
  .lh-right { text-align: right; }
  .lh-doc-type {
    display: inline-block;
    background: ${BRAND}; color: #fff;
    font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 4px 14px; border-radius: 4px;
    margin-bottom: 6px;
  }
  .lh-doc-title { font-size: 20px; font-weight: 800; color: ${BRAND}; }
  .lh-accent-strip { height: 3px; background: linear-gradient(90deg, ${BRAND}, #4f9cf9, #22c55e); }

  /* ── Page ── */
  .page { padding: 28px 48px 40px; }

  /* Meta row */
  .meta-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 20px; border-radius: 8px;
    background: #f0f4ff; border: 1px solid #c7d7f5; margin-bottom: 20px;
  }
  .meta-receipt-no { font-size: 22px; font-weight: 800; color: ${BRAND}; letter-spacing: 0.04em; }
  .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; font-weight: 700; }
  .meta-val   { font-size: 13px; color: #1a1a2e; font-weight: 600; margin-top: 2px; }

  /* Status badge */
  .status-bar { display: flex; align-items: center; justify-content: space-between;
    padding: 10px 18px; border-radius: 8px; margin-bottom: 20px; }
  .status-active   { background: #eff6ff; border: 1px solid #bfdbfe; }
  .status-returned { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .status-overdue  { background: #fef2f2; border: 1px solid #fecaca; }
  .pill { padding: 4px 14px; border-radius: 99px; font-size: 11px; font-weight: 800;
          letter-spacing: 0.08em; color: #fff; }
  .pill-active   { background: ${BRAND}; }
  .pill-returned { background: #16a34a; }
  .pill-overdue  { background: #dc2626; }

  /* Grid sections */
  .sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .section { background: #f8faff; border-radius: 8px; padding: 14px 18px; border: 1px solid #e0e7ff; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
                   color: ${BRAND}; font-weight: 700; margin-bottom: 10px;
                   padding-bottom: 6px; border-bottom: 1px solid #e0e7ff; }
  .info-row { display: flex; justify-content: space-between; padding: 4px 0;
              border-bottom: 1px solid #f0f4ff; }
  .info-row:last-child { border-bottom: none; }
  .info-label { font-size: 12px; color: #9ca3af; font-weight: 500; }
  .info-value { font-size: 12px; color: #1a1a2e; font-weight: 600; text-align: right; max-width: 55%; }

  /* Table */
  .table-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
                 color: ${BRAND}; font-weight: 700; margin-bottom: 8px; }
  table { width: 100%; border-collapse: separate; border-spacing: 0;
          border: 1px solid #e0e7ff; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
  thead { background: ${BRAND}; }
  th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700;
       text-transform: uppercase; letter-spacing: 0.8px; color: #fff; }
  tbody tr:nth-child(even) { background: #f8faff; }
  td { padding: 11px 14px; font-size: 12px; color: #374151; border-bottom: 1px solid #f0f4ff; }
  tbody tr:last-child td { border-bottom: none; }
  .qty-badge { display: inline-block; padding: 2px 10px; border-radius: 99px;
               background: #dbeafe; color: ${BRAND}; font-weight: 700; font-size: 11px; }

  /* Info boxes */
  .info-box { padding: 10px 16px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; line-height: 1.6; }
  .info-box-blue  { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
  .info-box-green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
  .info-box-amber { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }

  /* Watermark */
  .watermark { position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 80px; font-weight: 900; letter-spacing: 0.1em;
    color: rgba(35,86,169,0.05); pointer-events: none; white-space: nowrap; }

  /* Signatures */
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr;
                gap: 20px; margin-top: 40px; }
  .sig-area { height: 52px; border-bottom: 1.5px solid #374151; margin-bottom: 8px; }
  .sig-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px;
               color: #9ca3af; font-weight: 700; text-align: center; }
  .sig-name  { font-size: 12px; color: #1a1a2e; font-weight: 600; margin-top: 2px; text-align: center; }

  /* Footer */
  .receipt-footer { margin-top: 22px; padding-top: 14px; border-top: 1px solid #e5e7eb; }
  .terms-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
                 color: ${BRAND}; font-weight: 700; margin-bottom: 8px; }
  .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
  .term-item { font-size: 11px; color: #9ca3af; line-height: 1.5; display: flex; gap: 6px; }
  .footer-bar { display: flex; justify-content: space-between; margin-top: 12px;
                padding-top: 10px; border-top: 1px dashed #e5e7eb; }
  .footer-text { font-size: 10px; color: #d1d5db; }

  /* Bottom strip */
  .lh-footer { background: ${BRAND}; padding: 10px 48px;
               display: flex; justify-content: space-between; align-items: center; }
  .lh-footer span { font-size: 10px; color: rgba(255,255,255,0.7); }
  .lh-footer strong { color: #fff; }

  @media print {
    @page { margin: 0; size: A4; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .lh-header { padding: 16px 40px 14px; }
    .page { padding: 22px 40px 32px; }
    .lh-footer { padding: 10px 40px; }
    .watermark { position: fixed; }
  }
`;

function buildReceiptHTML(a, logoUrl) {
  const item   = a.itemId   || {};
  const person = a.personId || {};
  const dept   = a.departmentId || {};
  const isReturned = a.status === "Returned";
  const isOverdue  = a.status === "Active" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();

  const statusClass = isReturned ? "status-returned" : isOverdue ? "status-overdue" : "status-active";
  const pillClass   = isReturned ? "pill-returned"   : isOverdue ? "pill-overdue"   : "pill-active";
  const statusLabel = isReturned ? "RETURNED" : isOverdue ? "OVERDUE" : "ACTIVE";
  const watermark   = isReturned ? "RETURNED" : isOverdue ? "OVERDUE" : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${a.receiptNo} — Kanan.co</title>
  <style>${RECEIPT_STYLES}</style>
</head>
<body>
  ${watermark ? `<div class="watermark">${watermark}</div>` : ""}

  <!-- Letterhead header -->
  <div class="lh-header">
    <img class="lh-logo" src="${logoUrl}" alt="Kanan.co"
      onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=&quot;font-size:28px;font-weight:900;color:${BRAND};&quot;>Kanan.co</span>');" />
    <div class="lh-right">
      <div class="lh-doc-type">Inventory Management</div>
      <div class="lh-doc-title">Asset Assignment Receipt</div>
    </div>
  </div>
  <div class="lh-accent-strip"></div>

  <div class="page">

    <!-- Receipt meta -->
    <div class="meta-row">
      <div>
        <div class="meta-label">Receipt Number</div>
        <div class="meta-receipt-no">${a.receiptNo}</div>
      </div>
      <div style="text-align:center;">
        <div class="meta-label">Department</div>
        <div class="meta-val">${dept.name || "—"}</div>
      </div>
      <div style="text-align:right;">
        <div class="meta-label">Issue Date</div>
        <div class="meta-val">${fmtDate(a.assignedDate)}</div>
        ${a.expectedReturnDate ? `<div style="font-size:11px;color:#6b7280;">Return by: ${fmtDate(a.expectedReturnDate)}</div>` : ""}
      </div>
    </div>

    <!-- Status bar -->
    <div class="status-bar ${statusClass}">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="pill ${pillClass}">${statusLabel}</span>
        ${isOverdue  ? '<span style="font-size:12px;color:#dc2626;font-weight:600;">Return date has passed</span>' : ""}
        ${isReturned ? `<span style="font-size:12px;color:#16a34a;">Returned on ${fmtDate(a.returnedDate)}</span>` : ""}
      </div>
      ${a.issuedBy ? `<span style="font-size:12px;color:#6b7280;">Issued by: <strong>${a.issuedBy}</strong></span>` : ""}
    </div>

    <!-- Info grid -->
    <div class="sections-grid">
      <div class="section">
        <div class="section-title">Item Details</div>
        <div class="info-row"><span class="info-label">Item Name</span><span class="info-value">${item.name || "—"}</span></div>
        <div class="info-row"><span class="info-label">SKU</span><span class="info-value">${item.sku || "—"}</span></div>
        ${item.serialNumber ? `<div class="info-row"><span class="info-label">Serial No.</span><span class="info-value">${item.serialNumber}</span></div>` : ""}
        ${item.category ? `<div class="info-row"><span class="info-label">Category</span><span class="info-value">${item.category}</span></div>` : ""}
        <div class="info-row"><span class="info-label">Condition</span><span class="info-value">${a.conditionOnAssign || "—"}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Assigned To</div>
        <div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${person.name || "—"}</span></div>
        <div class="info-row"><span class="info-label">Employee ID</span><span class="info-value">${person.employeeId || "—"}</span></div>
        ${person.designation ? `<div class="info-row"><span class="info-label">Designation</span><span class="info-value">${person.designation}</span></div>` : ""}
        ${person.email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value">${person.email}</span></div>` : ""}
        ${person.phone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${person.phone}</span></div>` : ""}
      </div>
    </div>

    <!-- Table -->
    <div class="table-label">Assignment Summary</div>
    <table>
      <thead>
        <tr>
          <th>Description</th><th>SKU / Serial</th><th>Quantity</th>
          <th>Condition</th><th>Assigned Date</th><th>Expected Return</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight:700;color:#1a1a2e;">${item.name || "—"}</td>
          <td>${item.sku || "—"}${item.serialNumber ? ` / ${item.serialNumber}` : ""}</td>
          <td><span class="qty-badge">${a.quantityAssigned} ${item.unit || "Pieces"}</span></td>
          <td>${a.conditionOnAssign || "—"}</td>
          <td>${fmtDate(a.assignedDate)}</td>
          <td>${a.expectedReturnDate ? fmtDate(a.expectedReturnDate) : "<span style='color:#9ca3af'>Not set</span>"}</td>
        </tr>
      </tbody>
    </table>

    ${a.notes ? `<div class="info-box info-box-blue"><strong>Notes:</strong> ${a.notes}</div>` : ""}
    ${isReturned ? `<div class="info-box info-box-green"><strong>Return Record</strong> — <strong>Date:</strong> ${fmtDate(a.returnedDate)} &nbsp; <strong>Condition:</strong> ${a.conditionOnReturn || "Not specified"}${a.returnNotes ? `<br/><strong>Notes:</strong> ${a.returnNotes}` : ""}</div>` : ""}
    ${isOverdue  ? `<div class="info-box info-box-amber"><strong>Overdue Notice:</strong> This item was expected back by ${fmtDate(a.expectedReturnDate)}. Please return it immediately or contact management.</div>` : ""}

    <!-- Signatures -->
    <div class="signatures">
      <div><div class="sig-area"></div><div class="sig-label">Issued By</div><div class="sig-name">${a.issuedBy || "Authorized Signatory"}</div></div>
      <div><div class="sig-area"></div><div class="sig-label">Received By</div><div class="sig-name">${person.name || "Employee"}</div></div>
      <div><div class="sig-area"></div><div class="sig-label">Department Head</div><div class="sig-name">${dept.contactPerson || "Department Head"}</div></div>
    </div>

    <!-- Terms -->
    <div class="receipt-footer">
      <div class="terms-title">Terms &amp; Conditions</div>
      <div class="terms-grid">
        <div class="term-item"><span style="color:#d1d5db;flex-shrink:0;">•</span><span>The assigned item must be returned in the same or better condition.</span></div>
        <div class="term-item"><span style="color:#d1d5db;flex-shrink:0;">•</span><span>Any damage or loss must be reported to the department head immediately.</span></div>
        <div class="term-item"><span style="color:#d1d5db;flex-shrink:0;">•</span><span>Items must be returned by the expected date unless extended by management.</span></div>
        <div class="term-item"><span style="color:#d1d5db;flex-shrink:0;">•</span><span>This receipt is proof of assignment and must be retained until return.</span></div>
      </div>
      <div class="footer-bar">
        <span class="footer-text">Generated by Kanan.co Inventory System &mdash; ${fmtDateTime(new Date())}</span>
        <span class="footer-text">${a.receiptNo} &mdash; Confidential</span>
      </div>
    </div>
  </div>

  <!-- Letterhead footer -->
  <div class="lh-footer">
    <span><strong>Kanan.co</strong> &mdash; Let's Grow Globally</span>
    <span>${a.receiptNo}</span>
    <span>kanan.co</span>
  </div>
</body>
</html>`;
}

export default function AssignmentReceipt({ assignment, onClose }) {
  if (!assignment) return null;

  const a      = assignment;
  const item   = a.itemId   || {};
  const person = a.personId || {};
  const dept   = a.departmentId || {};
  const isReturned = a.status === "Returned";
  const isOverdue  = a.status === "Active" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();

  const logoUrl = `${window.location.origin}/kanan-logo.png`;

  const printReceipt = () => {
    const html = buildReceiptHTML(a, logoUrl);
    const w = window.open("", "_blank", "width=960,height=800");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  const downloadReceipt = () => {
    const html = buildReceiptHTML(a, logoUrl);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kanan_Receipt_${a.receiptNo}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = isReturned ? "#16a34a" : isOverdue ? "#dc2626" : BRAND;
  const statusBg    = isReturned ? "#f0fdf4" : isOverdue ? "#fef2f2" : "#eff6ff";
  const statusLabel = isReturned ? "Returned" : isOverdue ? "Overdue" : "Active";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16,
        width: "96%", maxWidth: 860, maxHeight: "95vh", overflow: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,.35)", animation: "scaleIn 0.25s ease",
        color: "#1a1a2e", display: "flex", flexDirection: "column",
      }}>

        {/* Toolbar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 22px", borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb", borderRadius: "16px 16px 0 0",
          position: "sticky", top: 0, zIndex: 2, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon d="assign" size={18} color={BRAND} />
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Assignment Receipt</span>
            <span style={{
              padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
              background: statusBg, color: statusColor,
            }}>{statusLabel}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon="print" onClick={printReceipt} size="sm">Print / PDF</Btn>
            <Btn icon="download" onClick={downloadReceipt} size="sm" variant="secondary">Download</Btn>
            <Btn variant="secondary" icon="close" onClick={onClose} size="sm">Close</Btn>
          </div>
        </div>

        {/* ── Letterhead header (preview) ── */}
        <div style={{
          background: "#fff", padding: "18px 36px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `3px solid ${BRAND}`, flexShrink: 0,
        }}>
          <img
            src="/kanan-logo.png"
            alt="Kanan.co"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.insertAdjacentHTML("afterend",
                `<span style="font-size:26px;font-weight:900;color:${BRAND};">Kanan.co</span>`);
            }}
          />
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block", background: BRAND, color: "#fff",
              fontSize: 10, fontWeight: 800, letterSpacing: "1.5px",
              textTransform: "uppercase", padding: "3px 12px", borderRadius: 4, marginBottom: 6,
            }}>Inventory Management</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: BRAND }}>Asset Assignment Receipt</div>
          </div>
        </div>
        {/* accent strip */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${BRAND}, #4f9cf9, #22c55e)`,
          flexShrink: 0,
        }} />

        {/* Receipt body */}
        <div style={{ padding: "24px 36px 32px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

          {/* Meta row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px", borderRadius: 8,
            background: "#f0f4ff", border: "1px solid #c7d7f5", marginBottom: 18,
          }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6b7280", fontWeight: 700 }}>Receipt Number</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: BRAND, letterSpacing: "0.04em", marginTop: 2 }}>{a.receiptNo}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6b7280", fontWeight: 700 }}>Department</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginTop: 2 }}>{dept.name || "—"}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6b7280", fontWeight: 700 }}>Issue Date</div>
              <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600, marginTop: 2 }}>{fmtDate(a.assignedDate)}</div>
              {a.expectedReturnDate && (
                <div style={{ fontSize: 11, color: "#6b7280" }}>Return by: {fmtDate(a.expectedReturnDate)}</div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 18px", borderRadius: 8, marginBottom: 18,
            background: statusBg, border: `1px solid ${statusColor}30`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                padding: "3px 14px", borderRadius: 99, background: statusColor,
                color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
              }}>{statusLabel.toUpperCase()}</span>
              {isOverdue  && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Return date has passed</span>}
              {isReturned && <span style={{ fontSize: 12, color: "#16a34a" }}>Returned on {fmtDate(a.returnedDate)}</span>}
            </div>
            {a.issuedBy && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>Issued by: <strong>{a.issuedBy}</strong></span>
            )}
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[
              { title: "Item Details", rows: [
                ["Item Name", item.name], ["SKU", item.sku],
                ...(item.serialNumber ? [["Serial No.", item.serialNumber]] : []),
                ...(item.category ? [["Category", item.category]] : []),
                ["Condition", a.conditionOnAssign],
              ]},
              { title: "Assigned To", rows: [
                ["Full Name", person.name], ["Employee ID", person.employeeId],
                ...(person.designation ? [["Designation", person.designation]] : []),
                ...(person.email ? [["Email", person.email]] : []),
                ...(person.phone ? [["Phone", person.phone]] : []),
              ]},
            ].map((sec) => (
              <div key={sec.title} style={{ background: "#f8faff", borderRadius: 8, padding: "14px 18px", border: "1px solid #e0e7ff" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: BRAND, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #e0e7ff" }}>
                  {sec.title}
                </div>
                {sec.rows.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f0f4ff" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 600, textAlign: "right", maxWidth: "58%" }}>{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Summary table */}
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: BRAND, fontWeight: 700, marginBottom: 8 }}>
            Assignment Summary
          </div>
          <div style={{ border: "1px solid #e0e7ff", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: BRAND }}>
                  {["Description", "SKU / Serial", "Quantity", "Condition", "Assigned", "Return By"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#fff" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: "#1a1a2e", fontSize: 13 }}>{item.name || "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12 }}>{item.sku}{item.serialNumber ? ` / ${item.serialNumber}` : ""}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 99, background: "#dbeafe", color: BRAND, fontWeight: 700, fontSize: 11 }}>
                      {a.quantityAssigned} {item.unit || "Pieces"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12 }}>{a.conditionOnAssign || "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12 }}>{fmtDate(a.assignedDate)}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: a.expectedReturnDate ? "#374151" : "#9ca3af" }}>
                    {a.expectedReturnDate ? fmtDate(a.expectedReturnDate) : "Not set"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes / return */}
          {a.notes && (
            <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 10, background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af" }}>
              <strong>Notes:</strong> {a.notes}
            </div>
          )}
          {isReturned && (
            <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534" }}>
              <strong>Return Record</strong> &mdash; <strong>Date:</strong> {fmtDate(a.returnedDate)}&nbsp;
              <strong>Condition:</strong> {a.conditionOnReturn || "Not specified"}
              {a.returnNotes && <><br /><strong>Notes:</strong> {a.returnNotes}</>}
            </div>
          )}
          {isOverdue && (
            <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 10, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
              <strong>Overdue Notice:</strong> This item was expected back by {fmtDate(a.expectedReturnDate)}. Please return immediately or contact management.
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 36 }}>
            {[
              { label: "Issued By",       name: a.issuedBy || "Authorized Signatory" },
              { label: "Received By",     name: person.name || "Employee" },
              { label: "Department Head", name: dept.contactPerson || "Department Head" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ height: 52, borderBottom: "1.5px solid #374151", marginBottom: 8 }} />
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "#9ca3af", fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#1a1a2e", fontWeight: 600, marginTop: 2 }}>{s.name}</div>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: BRAND, fontWeight: 700, marginBottom: 8 }}>
              Terms &amp; Conditions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {[
                "The assigned item must be returned in the same or better condition.",
                "Any damage or loss must be reported to the department head immediately.",
                "Items must be returned by the expected date unless extended by management.",
                "This receipt is proof of assignment and must be retained until return.",
              ].map((t, i) => (
                <div key={i} style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5, display: "flex", gap: 6 }}>
                  <span style={{ color: "#d1d5db", flexShrink: 0 }}>•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px dashed #e5e7eb" }}>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>Generated by Kanan.co Inventory System &mdash; {fmtDateTime(new Date())}</span>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>{a.receiptNo} &mdash; Confidential</span>
            </div>
          </div>
        </div>

        {/* Letterhead footer strip */}
        <div style={{
          background: BRAND, padding: "10px 36px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderRadius: "0 0 16px 16px", flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            Kanan.co &mdash; Let's Grow Globally
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{a.receiptNo}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>kanan.co</span>
        </div>
      </div>
    </div>
  );
}
