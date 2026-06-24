export default function Textarea({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
      {label}
      <textarea
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
          resize: "vertical",
          minHeight: 80,
          transition: "border var(--transition), box-shadow var(--transition)",
          ...(props.style || {}),
        }}
      />
    </label>
  );
}
