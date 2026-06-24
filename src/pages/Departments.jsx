import { useState } from "react";
import api from "../utils/api";
import { fmt } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Icon from "../components/Icon";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Departments({ showToast, departments, reloadDepartments }) {
  const { isAdmin } = useAuth();
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const empty = { name: "", icon: "box", color: "#6366f1", description: "", contactPerson: "", phone: "", email: "", location: "" };
  const [form, setForm] = useState(empty);

  const save = async () => {
    if (!form.name) { showToast("Department name is required", "error"); return; }
    try {
      if (modal === "new") {
        await api.createDepartment(form);
        showToast("Department created!");
      } else {
        await api.updateDepartment(modal, form);
        showToast("Department updated!");
      }
      setModal(null);
      setForm(empty);
      reloadDepartments();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteDept = async () => {
    try {
      await api.deleteDepartment(deleteId);
      showToast("Department deleted");
      reloadDepartments();
    } catch (err) {
      showToast(err.message, "error");
    }
    setDeleteId(null);
  };

  const presetColors = ["#6366f1", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6"];
  const presetIcons = [
    { value: "monitor", label: "💻 Tech" },
    { value: "pen", label: "✏️ Stationery" },
    { value: "book", label: "📚 Books" },
    { value: "box", label: "📦 General" },
  ];

  const cols = [
    {
      key: "name", label: "Department", render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "var(--radius-sm)",
            background: `${r.color}18`, color: r.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon d={r.icon || "box"} size={18} />
          </div>
          <strong>{r.name}</strong>
        </div>
      ),
    },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "location", label: "Location", render: (r) => r.location || "—" },
    { key: "contactPerson", label: "Contact", render: (r) => r.contactPerson || "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    ...(isAdmin ? [{
      key: "actions", label: "", align: "right", render: (r) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Btn size="sm" variant="ghost" icon="edit" onClick={() => {
            setForm({
              name: r.name || "",
              icon: r.icon || "box",
              color: r.color || "#6366f1",
              description: r.description || "",
              contactPerson: r.contactPerson || "",
              phone: r.phone || "",
              email: r.email || "",
              location: r.location || "",
            });
            setModal(r._id);
          }} />
          <Btn size="sm" variant="ghost" icon="trash" onClick={() => setDeleteId(r._id)} />
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Departments</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {departments.length} department{departments.length !== 1 ? "s" : ""}
            {!isAdmin && " — showing your department"}
          </p>
        </div>
        {isAdmin && (
          <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>New Department</Btn>
        )}
      </div>

      {!isAdmin && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon d="shield" size={14} color="#6366f1" />
          Department management is restricted to administrators.
        </div>
      )}

      <Table columns={cols} data={departments} emptyMsg="No departments yet. An admin must create one first." />

      {isAdmin && (
        <>
          <Modal open={!!modal} onClose={() => { setModal(null); setForm(empty); }} title={modal === "new" ? "Add Department" : "Edit Department"} width={520}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Department Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ gridColumn: "1/-1" }} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ gridColumn: "1/-1" }} />
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Icon</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {presetIcons.map((ic) => (
                  <button key={ic.value} onClick={() => setForm({ ...form, icon: ic.value })} style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 13,
                    border: form.icon === ic.value ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: form.icon === ic.value ? "var(--accent-light)" : "var(--surface)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {ic.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>Color</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {presetColors.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                    width: 32, height: 32, borderRadius: 8, background: c,
                    border: form.color === c ? "3px solid var(--text)" : "2px solid transparent",
                    cursor: "pointer",
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
              <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
              <Btn onClick={save} icon="check">{modal === "new" ? "Create" : "Save"}</Btn>
            </div>
          </Modal>

          <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deleteDept}
            title="Delete Department?" message="This will remove the department. Items in this department will not be deleted." />
        </>
      )}
    </div>
  );
}
