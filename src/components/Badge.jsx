export default function Badge({ children, variant = "default", style: sx }) {
  const styles = {
    default: { background: "var(--badge-bg)", color: "var(--badge-fg)" },
    success: { background: "var(--success-light)", color: "var(--success)" },
    warning: { background: "var(--warn-light)", color: "var(--warn)" },
    danger: { background: "var(--danger-light)", color: "var(--danger)" },
    info: { background: "var(--info-light)", color: "var(--info)" },
    accent: { background: "var(--accent-light)", color: "var(--accent)" },
  };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      ...styles[variant],
      ...sx,
    }}>
      {children}
    </span>
  );
}
