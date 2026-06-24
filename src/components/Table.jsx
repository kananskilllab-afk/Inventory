export default function Table({ columns, data, onRow, emptyMsg = "No records found" }) {
  return (
    <div style={{
      overflowX: "auto",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)",
      background: "var(--surface)",
      boxShadow: "var(--shadow-sm)",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                padding: "11px 14px",
                textAlign: c.align || "left",
                background: "var(--surface-2)",
                fontWeight: 600, fontSize: 11.5,
                textTransform: "uppercase",
                letterSpacing: ".6px",
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border)",
                whiteSpace: "nowrap",
                position: "sticky", top: 0,
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: 48, textAlign: "center",
                color: "var(--text-muted)", fontSize: 14,
              }}>
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                onClick={() => onRow?.(row)}
                style={{
                  cursor: onRow ? "pointer" : "default",
                  borderBottom: i < data.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background var(--transition)",
                }}
              >
                {columns.map((c) => (
                  <td key={c.key} style={{
                    padding: "11px 14px",
                    textAlign: c.align || "left",
                    whiteSpace: c.nowrap ? "nowrap" : "normal",
                  }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
