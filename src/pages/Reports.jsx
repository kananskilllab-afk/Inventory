import { useState } from "react";
import api from "../utils/api";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

export default function Reports({ showToast }) {
  const [exporting, setExporting] = useState("");

  const handleExport = async (type) => {
    setExporting(type);
    try {
      await api.exportData(type);
      showToast(`${type} data exported successfully!`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setExporting("");
    }
  };

  const reports = [
    {
      title: "Items Report",
      description: "Export all items with details including SKU, department, quantity, pricing, and condition.",
      icon: "items",
      color: "var(--accent)",
      type: "items",
    },
    {
      title: "Assignments Report",
      description: "Export all assignments with item details, assigned person, dates, and return status.",
      icon: "assign",
      color: "var(--info)",
      type: "assignments",
    },
    {
      title: "Employees Report",
      description: "Export all employee records with department, designation, and contact details.",
      icon: "people",
      color: "var(--success)",
      type: "people",
    },
  ];

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Reports & Export</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Download your inventory data as CSV files</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {reports.map((report) => (
          <div key={report.type} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: 24,
            boxShadow: "var(--shadow-sm)",
            display: "flex", flexDirection: "column", gap: 16,
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--radius-sm)",
                background: `${report.color}15`, color: report.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon d={report.icon} size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{report.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>CSV Format</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, flex: 1 }}>
              {report.description}
            </p>
            <Btn icon="download" onClick={() => handleExport(report.type)}
              disabled={exporting === report.type}
              variant="outline">
              {exporting === report.type ? "Exporting..." : "Download CSV"}
            </Btn>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, padding: 20, background: "var(--surface-2)",
        borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
      }}>
        <h4 style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 15 }}>💡 Tips</h4>
        <ul style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, paddingLeft: 20 }}>
          <li>CSV files can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application.</li>
          <li>Use the Assignments report to track who has company assets across departments.</li>
          <li>For printing receipts, use the download button on individual assignment records.</li>
          <li>Activity logs provide a complete audit trail of all inventory operations.</li>
        </ul>
      </div>
    </div>
  );
}
