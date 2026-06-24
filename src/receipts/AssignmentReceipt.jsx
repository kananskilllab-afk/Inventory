import { useRef } from "react";
import { fmtDate, fmtDateTime } from "../utils/helpers";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

const RECEIPT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #111827; background: #fff; }

  .page { padding: 40px 48px; min-height: 100vh; position: relative; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #111827; margin-bottom: 28px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 22px; }
  .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #111827; }
  .brand-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .receipt-meta { text-align: right; }
  .receipt-no { font-size: 20px; font-weight: 800; color: #6366f1; letter-spacing: 0.02em; }
  .receipt-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; margin-bottom: 3px; }
  .receipt-date { font-size: 13px; color: #374151; margin-top: 4px; }

  /* Status badge */
  .status-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-radius: 10px; margin-bottom: 24px; }
  .status-active { background: #eff6ff; border: 1px solid #bfdbfe; }
  .status-returned { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .status-overdue { background: #fef2f2; border: 1px solid #fecaca; }
  .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; }
  .pill-active { background: #2563eb; color: #fff; }
  .pill-returned { background: #16a34a; color: #fff; }
  .pill-overdue { background: #dc2626; color: #fff; }
  .status-issued { font-size: 12px; color: #6b7280; }

  /* Sections */
  .sections-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .section { background: #f9fafb; border-radius: 10px; padding: 16px 18px; border: 1px solid #e5e7eb; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .info-label { font-size: 12px; color: #9ca3af; font-weight: 500; }
  .info-value { font-size: 13px; color: #111827; font-weight: 600; text-align: right; max-width: 55%; word-break: break-word; }

  /* Assignment table */
  .table-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 700; margin-bottom: 10px; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
  thead { background: #111827; }
  th { padding: 11px 14px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #fff; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  td { padding: 12px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  tbody tr:last-child td { border-bottom: none; }
  .td-name { font-weight: 600; color: #111827; }
  .qty-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 12px; }

  /* Notes & return info */
  .info-box { padding: 12px 16px; border-radius: 8px; font-size: 12.5px; margin-bottom: 16px; line-height: 1.6; }
  .info-box-blue { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
  .info-box-green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
  .info-box-amber { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }

  /* Watermark */
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 90px; font-weight: 900; letter-spacing: 0.1em; color: rgba(0,0,0,0.04); pointer-events: none; white-space: nowrap; }

  /* Signatures */
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 48px; padding-top: 20px; }
  .sig-block { text-align: center; }
  .sig-area { height: 56px; border-bottom: 1.5px solid #374151; margin-bottom: 8px; }
  .sig-label { font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
  .sig-name { font-size: 13px; color: #111827; font-weight: 600; margin-top: 2px; }

  /* Footer */
  .receipt-footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
  .terms-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 700; margin-bottom: 8px; }
  .terms-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .terms-list li { font-size: 11px; color: #9ca3af; line-height: 1.5; padding-left: 12px; position: relative; }
  .terms-list li::before { content: "•"; position: absolute; left: 0; color: #d1d5db; }
  .footer-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e5e7eb; }
  .footer-text { font-size: 10px; color: #d1d5db; }

  @media print {
    @page { margin: 0; size: A4; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 30px 40px; }
    .watermark { position: fixed; }
  }
`;

function buildReceiptHTML(a) {
  const item = a.itemId || {};
  const person = a.personId || {};
  const dept = a.departmentId || {};
  const isReturned = a.status === "Returned";
  const isOverdue = a.status === "Active" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();

  const statusClass = isReturned ? "status-returned" : isOverdue ? "status-overdue" : "status-active";
  const pillClass = isReturned ? "pill-returned" : isOverdue ? "pill-overdue" : "pill-active";
  const statusLabel = isReturned ? "RETURNED" : isOverdue ? "OVERDUE" : "ACTIVE";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipt ${a.receiptNo}</title>
      <style>${RECEIPT_STYLES}</style>
    </head>
    <body>
      <div class="watermark">${isReturned ? "RETURNED" : ""}</div>
      <div class="page">

        <!-- Header -->
        <div class="header">
          <div class="brand">
            <div class="brand-logo">S</div>
            <div>
              <div class="brand-name">StockFlow</div>
              <div class="brand-sub">Asset Assignment Receipt</div>
            </div>
          </div>
          <div class="receipt-meta">
            <div class="receipt-label">Receipt No.</div>
            <div class="receipt-no">${a.receiptNo}</div>
            <div class="receipt-date">Issued: ${fmtDate(a.assignedDate)}</div>
            ${a.expectedReturnDate ? `<div class="receipt-date" style="color:#6b7280;">Return by: ${fmtDate(a.expectedReturnDate)}</div>` : ""}
          </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar ${statusClass}">
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="status-pill ${pillClass}">${statusLabel}</span>
            ${isOverdue ? '<span style="font-size:12px;color:#dc2626;font-weight:600;">Return date has passed</span>' : ""}
            ${isReturned ? `<span style="font-size:12px;color:#16a34a;">Returned on ${fmtDate(a.returnedDate)}</span>` : ""}
          </div>
          <div class="status-issued">
            ${a.issuedBy ? `<strong>Issued by:</strong> ${a.issuedBy}` : ""}
          </div>
        </div>

        <!-- Info Grid -->
        <div class="sections-grid">
          <!-- Item Details -->
          <div class="section">
            <div class="section-title">Item Details</div>
            <div class="info-row"><span class="info-label">Item Name</span><span class="info-value">${item.name || "—"}</span></div>
            <div class="info-row"><span class="info-label">SKU</span><span class="info-value">${item.sku || "—"}</span></div>
            ${item.serialNumber ? `<div class="info-row"><span class="info-label">Serial No.</span><span class="info-value">${item.serialNumber}</span></div>` : ""}
            <div class="info-row"><span class="info-label">Department</span><span class="info-value">${dept.name || "—"}</span></div>
            <div class="info-row"><span class="info-label">Condition</span><span class="info-value">${a.conditionOnAssign || "—"}</span></div>
            ${item.category ? `<div class="info-row"><span class="info-label">Category</span><span class="info-value">${item.category}</span></div>` : ""}
          </div>

          <!-- Employee Details -->
          <div class="section">
            <div class="section-title">Assigned To</div>
            <div class="info-row"><span class="info-label">Name</span><span class="info-value">${person.name || "—"}</span></div>
            <div class="info-row"><span class="info-label">Employee ID</span><span class="info-value">${person.employeeId || "—"}</span></div>
            <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${person.designation || "—"}</span></div>
            ${person.email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value">${person.email}</span></div>` : ""}
            ${person.phone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${person.phone}</span></div>` : ""}
          </div>
        </div>

        <!-- Assignment Table -->
        <div class="table-title">Assignment Summary</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>SKU / Serial</th>
              <th>Qty</th>
              <th>Condition</th>
              <th>Assigned Date</th>
              <th>Expected Return</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="td-name">${item.name || "—"}</td>
              <td>${item.sku || "—"}${item.serialNumber ? ` / ${item.serialNumber}` : ""}</td>
              <td><span class="qty-badge">${a.quantityAssigned} ${item.unit || "Pieces"}</span></td>
              <td>${a.conditionOnAssign || "—"}</td>
              <td>${fmtDate(a.assignedDate)}</td>
              <td>${a.expectedReturnDate ? fmtDate(a.expectedReturnDate) : "<span style='color:#9ca3af'>No date set</span>"}</td>
            </tr>
          </tbody>
        </table>

        ${a.notes ? `
        <div class="info-box info-box-blue">
          <strong>Notes:</strong> ${a.notes}
        </div>` : ""}

        ${isReturned ? `
        <div class="info-box info-box-green">
          <strong>Return Record</strong><br/>
          <strong>Returned on:</strong> ${fmtDate(a.returnedDate)} &nbsp;&nbsp;
          <strong>Condition on Return:</strong> ${a.conditionOnReturn || "Not specified"}
          ${a.returnNotes ? `<br/><strong>Return Notes:</strong> ${a.returnNotes}` : ""}
        </div>` : ""}

        ${isOverdue ? `
        <div class="info-box info-box-amber">
          <strong>Overdue Notice:</strong> This item was expected to be returned by ${fmtDate(a.expectedReturnDate)}. Please return it immediately or request an extension.
        </div>` : ""}

        <!-- Signatures -->
        <div class="signatures">
          <div class="sig-block">
            <div class="sig-area"></div>
            <div class="sig-label">Issued By</div>
            <div class="sig-name">${a.issuedBy || "Authorized Signatory"}</div>
          </div>
          <div class="sig-block">
            <div class="sig-area"></div>
            <div class="sig-label">Received By</div>
            <div class="sig-name">${person.name || "Employee"}</div>
          </div>
          <div class="sig-block">
            <div class="sig-area"></div>
            <div class="sig-label">Department Head</div>
            <div class="sig-name">${dept.contactPerson || "Department Head"}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="receipt-footer">
          <div class="terms-title">Terms &amp; Conditions</div>
          <ul class="terms-list">
            <li>The assigned item must be returned in the same or better condition.</li>
            <li>Any damage or loss must be reported to the department head immediately.</li>
            <li>The item must be returned by the expected return date or extended by management.</li>
            <li>This receipt is proof of assignment and must be retained until return.</li>
          </ul>
          <div class="footer-bar">
            <span class="footer-text">Generated by StockFlow &mdash; ${fmtDateTime(new Date())}</span>
            <span class="footer-text">${a.receiptNo} &mdash; Confidential</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default function AssignmentReceipt({ assignment, onClose }) {
  if (!assignment) return null;

  const a = assignment;
  const item = a.itemId || {};
  const person = a.personId || {};
  const dept = a.departmentId || {};
  const isReturned = a.status === "Returned";
  const isOverdue = a.status === "Active" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();

  const printReceipt = () => {
    const html = buildReceiptHTML(a);
    const w = window.open("", "_blank", "width=900,height=750");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  const downloadReceipt = () => {
    const html = buildReceiptHTML(a);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${a.receiptNo}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = isReturned ? "#16a34a" : isOverdue ? "#dc2626" : "#2563eb";
  const statusBg = isReturned ? "#f0fdf4" : isOverdue ? "#fef2f2" : "#eff6ff";
  const statusLabel = isReturned ? "Returned" : isOverdue ? "Overdue" : "Active";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 0,
        width: "94%", maxWidth: 780, maxHeight: "93vh", overflow: "auto",
        boxShadow: "0 25px 70px rgba(0,0,0,.3)", animation: "scaleIn 0.25s ease",
        color: "#111827",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 24px", borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb", borderRadius: "16px 16px 0 0",
          position: "sticky", top: 0, zIndex: 2,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon d="assign" size={18} color="#6366f1" />
            <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Assignment Receipt</span>
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

        {/* Receipt Preview */}
        <div style={{ padding: "36px 44px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            paddingBottom: 22, borderBottom: "2px solid #111827", marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 22, flexShrink: 0,
              }}>S</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#111827" }}>StockFlow</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Asset Assignment Receipt</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 700, marginBottom: 3 }}>Receipt No.</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1", letterSpacing: "0.02em" }}>{a.receiptNo}</div>
              <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>Issued: {fmtDate(a.assignedDate)}</div>
              {a.expectedReturnDate && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>Return by: {fmtDate(a.expectedReturnDate)}</div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", borderRadius: 10, marginBottom: 22,
            background: statusBg, border: `1px solid ${statusColor}30`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                padding: "3px 12px", borderRadius: 99, background: statusColor,
                color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
              }}>{statusLabel.toUpperCase()}</span>
              {isOverdue && <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Return date has passed</span>}
              {isReturned && <span style={{ fontSize: 12, color: "#16a34a" }}>Returned on {fmtDate(a.returnedDate)}</span>}
            </div>
            {a.issuedBy && <span style={{ fontSize: 12, color: "#6b7280" }}>Issued by: <strong>{a.issuedBy}</strong></span>}
          </div>

          {/* Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
            {/* Item */}
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px 18px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 700, marginBottom: 12 }}>
                Item Details
              </div>
              {[
                ["Item Name", item.name],
                ["SKU", item.sku],
                ...(item.serialNumber ? [["Serial No.", item.serialNumber]] : []),
                ["Department", dept.name],
                ["Condition", a.conditionOnAssign],
                ...(item.category ? [["Category", item.category]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#111827", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Person */}
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px 18px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 700, marginBottom: 12 }}>
                Assigned To
              </div>
              {[
                ["Name", person.name],
                ["Employee ID", person.employeeId],
                ["Designation", person.designation],
                ...(person.email ? [["Email", person.email]] : []),
                ...(person.phone ? [["Phone", person.phone]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#111827", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{value || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Table */}
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 700, marginBottom: 10 }}>
            Assignment Summary
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#111827" }}>
                  {["Description", "SKU / Serial", "Qty", "Condition", "Assigned", "Return By"].map((h) => (
                    <th key={h} style={{
                      padding: "11px 14px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.8px", color: "#fff",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827", fontSize: 13 }}>{item.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                    {item.sku}{item.serialNumber ? ` / ${item.serialNumber}` : ""}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 99,
                      background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: 12,
                    }}>{a.quantityAssigned} {item.unit || "Pieces"}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{a.conditionOnAssign}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{fmtDate(a.assignedDate)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: a.expectedReturnDate ? "#374151" : "#9ca3af" }}>
                    {a.expectedReturnDate ? fmtDate(a.expectedReturnDate) : "Not set"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {a.notes && (
            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 14,
              background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af",
            }}>
              <strong>Notes:</strong> {a.notes}
            </div>
          )}

          {/* Return info */}
          {isReturned && (
            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 14,
              background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534",
            }}>
              <strong>Return Record</strong> &mdash;{" "}
              <strong>Returned on:</strong> {fmtDate(a.returnedDate)} &nbsp;
              <strong>Condition:</strong> {a.conditionOnReturn || "Not specified"}
              {a.returnNotes && <><br /><strong>Return Notes:</strong> {a.returnNotes}</>}
            </div>
          )}

          {isOverdue && (
            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 14,
              background: "#fffbeb", border: "1px solid #fde68a", fontSize: 13, color: "#92400e",
            }}>
              <strong>Overdue Notice:</strong> This item was expected by {fmtDate(a.expectedReturnDate)}. Please return immediately or request an extension.
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 44, paddingTop: 16 }}>
            {[
              { label: "Issued By", name: a.issuedBy || "Authorized Signatory" },
              { label: "Received By", name: person.name || "Employee" },
              { label: "Department Head", name: dept.contactPerson || "Department Head" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ height: 52, borderBottom: "1.5px solid #374151", marginBottom: 8 }} />
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", color: "#9ca3af", fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#111827", fontWeight: 600, marginTop: 2 }}>{s.name}</div>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: "#9ca3af", fontWeight: 700, marginBottom: 8 }}>
              Terms &amp; Conditions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {[
                "The assigned item must be returned in the same or better condition.",
                "Any damage or loss must be reported to the department head immediately.",
                "The item must be returned by the expected date unless extended by management.",
                "This receipt serves as proof of assignment and must be retained until return.",
              ].map((t, i) => (
                <div key={i} style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5, display: "flex", gap: 6 }}>
                  <span style={{ color: "#d1d5db", flexShrink: 0 }}>•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 14, paddingTop: 10, borderTop: "1px dashed #e5e7eb",
            }}>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>Generated by StockFlow &mdash; {fmtDateTime(new Date())}</span>
              <span style={{ fontSize: 10, color: "#d1d5db" }}>{a.receiptNo} &mdash; Confidential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
