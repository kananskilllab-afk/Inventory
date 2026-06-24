import { useState, useEffect } from "react";
import Icon from "./Icon";

export default function Toast({ message, type = "success", onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: "var(--success-light)", border: "var(--success)", icon: "check" },
    error: { bg: "var(--danger-light)", border: "var(--danger)", icon: "alert" },
    info: { bg: "var(--info-light)", border: "var(--info)", icon: "alert" },
    warning: { bg: "var(--warn-light)", border: "var(--warn)", icon: "alert" },
  };

  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 2000,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 18px",
      borderRadius: "var(--radius-sm)",
      background: "var(--surface)",
      border: `1px solid ${c.border}`,
      boxShadow: "var(--shadow-lg)",
      fontSize: 14, fontWeight: 500,
      animation: exiting ? "toastOut 0.3s ease forwards" : "toastIn 0.3s ease",
      maxWidth: 380,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: c.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon d={c.icon} size={15} color={c.border} />
      </div>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={() => { setExiting(true); setTimeout(onClose, 300); }} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", padding: 2,
      }}>
        <Icon d="close" size={14} />
      </button>
    </div>
  );
}
