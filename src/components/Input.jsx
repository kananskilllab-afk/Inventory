export default function Input({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
      {label}
      <input
        {...props}
        style={{
          padding: "9px 13px",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontSize: 14,
          fontFamily: "inherit",
          background: "var(--surface)",
          color: "var(--text)",
          outline: "none",
          transition: "border var(--transition), box-shadow var(--transition)",
          ...(props.style || {}),
        }}
      />
    </label>
  );
}
