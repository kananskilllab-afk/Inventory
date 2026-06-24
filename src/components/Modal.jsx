import Icon from "./Icon";

export default function Modal({ open, onClose, title, children, width = 540 }) {
  if (!open) return null;

  // Close only when the backdrop itself is directly clicked (not when dragging from content)
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent Enter key from accidentally closing the modal
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.stopPropagation();
    }
    // Allow Escape to close
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      onKeyDown={handleKeyDown}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.5)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          width: "92%",
          maxWidth: width,
          maxHeight: "88vh",
          overflow: "auto",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border)",
          animation: "scaleIn 0.25s ease",
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24, paddingBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: "var(--surface-3)", border: "none", borderRadius: 8,
              cursor: "pointer", color: "var(--text-muted)",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all var(--transition)",
            }}
          >
            <Icon d="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
