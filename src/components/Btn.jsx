import Icon from "./Icon";

export default function Btn({ children, onClick, variant = "primary", size = "md", icon, disabled, style: sx, type = "button" }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: "var(--radius-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontFamily: "inherit",
    transition: "all var(--transition)",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: 13 },
    md: { padding: "9px 18px", fontSize: 14 },
    lg: { padding: "12px 24px", fontSize: 15 },
  };

  const vars = {
    primary: { background: "var(--accent)", color: "#fff" },
    secondary: { background: "var(--surface-3)", color: "var(--text)" },
    danger: { background: "var(--danger)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    success: { background: "var(--success)", color: "#fff" },
    outline: { background: "transparent", color: "var(--accent)", border: "1.5px solid var(--accent)" },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...vars[variant], ...sx }}>
      {icon && <Icon d={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
