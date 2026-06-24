export default function StatCard({ label, value, sub, color, icon, style: sx }) {
  return (
    <div style={{
      padding: 22,
      borderRadius: "var(--radius-md)",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      flex: "1 1 200px",
      minWidth: 180,
      transition: "all var(--transition)",
      animation: "slideUp 0.3s ease",
      ...sx,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
          <div style={{
            fontSize: 28, fontWeight: 800,
            color: color || "var(--text)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.1,
          }}>
            {value}
          </div>
        </div>
        {icon && (
          <div style={{
            width: 42, height: 42, borderRadius: "var(--radius-sm)",
            background: color ? `${color}15` : "var(--accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: color || "var(--accent)",
            fontSize: 20,
          }}>
            {icon}
          </div>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{sub}</div>}
    </div>
  );
}
