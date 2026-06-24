import Btn from "./Btn";
import Modal from "./Modal";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Delete", variant = "danger" }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant={variant} onClick={() => { onConfirm(); }}>{confirmText}</Btn>
      </div>
    </Modal>
  );
}
