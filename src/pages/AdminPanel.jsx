import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import ConfirmDialog from "../components/ConfirmDialog";
import Icon from "../components/Icon";

export default function AdminPanel({ showToast, departments }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const empty = { name: "", username: "", password: "", role: "user", departmentId: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const save = async () => {
    if (!form.name || !form.username) {
      showToast("Name and username are required", "error"); return;
    }
    if (modal === "new" && !form.password) {
      showToast("Password is required", "error"); return;
    }
    if (form.password && form.password.length < 6) {
      showToast("Password must be at least 6 characters", "error"); return;
    }
    try {
      if (modal === "new") {
        await api.createUser(form);
        showToast("User created!");
      } else {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await api.updateUser(modal, updateData);
        showToast("User updated!");
      }
      setModal(null);
      setForm(empty);
      loadUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteUser = async () => {
    try {
      await api.deleteUser(deleteId);
      showToast("User deleted");
      loadUsers();
    } catch (err) {
      showToast(err.message, "error");
    }
    setDeleteId(null);
  };

  const deptOptions = [
    { value: "", label: "No Department (Admin/Global)" },
    ...departments.map((d) => ({ value: d._id, label: d.name })),
  ];

  const roleOptions = [
    { value: "superadmin", label: "Super Admin — full system administration & user management" },
    { value: "admin", label: "Admin — full access to all departments (no user management)" },
    { value: "user", label: "User — limited to assigned department" },
  ];

  const cols = [
    {
      key: "name", label: "User", render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: r.role === "superadmin"
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : r.role === "admin"
                ? "linear-gradient(135deg, #6366f1, #a855f7)"
                : "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {r.name[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{r.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role", label: "Role", render: (r) => {
        const isSuper = r.role === "superadmin";
        const isAdmin = r.role === "admin";
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: isSuper ? "rgba(245,158,11,0.12)" : isAdmin ? "rgba(99,102,241,0.12)" : "rgba(34,197,94,0.12)",
            color: isSuper ? "#d97706" : isAdmin ? "#6366f1" : "#16a34a",
          }}>
            <Icon d={isSuper ? "shield" : isAdmin ? "shield" : "person"} size={12} />
            {isSuper ? "Super Admin" : isAdmin ? "Admin" : "User"}
          </span>
        );
      },
    },
    {
      key: "departmentName", label: "Department",
      render: (r) => r.departmentName || <span style={{ color: "var(--text-light)" }}>All Departments</span>,
    },
    {
      key: "profile", label: "Employee Profile",
      render: (r) => r.linkedPerson ? (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
          background: "rgba(99,102,241,0.1)", color: "#6366f1",
        }}>
          <Icon d="person" size={12} />
          {r.linkedPerson.name}
        </span>
      ) : (
        <span style={{ color: "var(--text-light)", fontSize: 12 }}>—</span>
      ),
    },
    {
      key: "actions", label: "", align: "right", render: (r) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Btn size="sm" variant="ghost" icon="edit" onClick={() => {
            setForm({
              name: r.name, username: r.username, password: "",
              role: r.role, departmentId: r.departmentId || "",
            });
            setModal(r.id);
          }} />
          {r.id !== currentUser?.id && (
            <Btn size="sm" variant="ghost" icon="trash" onClick={() => setDeleteId(r.id)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Admin Panel</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            Manage users and their department access
          </p>
        </div>
        <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>Add User</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Users", value: users.length, color: "#3b82f6" },
          { label: "Super Admins", value: users.filter((u) => u.role === "superadmin").length, color: "#f59e0b" },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "#a855f7" },
          { label: "Users", value: users.filter((u) => u.role === "user").length, color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--surface)", borderRadius: 14,
            border: "1px solid var(--border)", padding: "16px 20px",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Table columns={cols} data={users} emptyMsg="No users yet. Add the first user." />

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setForm(empty); }}
        title={modal === "new" ? "Add User" : "Edit User"}
        width={480}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input
            label="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ gridColumn: "1/-1" }}
          />
          <Input
            label="Username *"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            label={modal === "new" ? "Password *" : "New Password (leave blank to keep)"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Role</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {roleOptions.map((r) => (
              <button
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: "1.5px solid",
                  borderColor: form.role === r.value ? "var(--accent)" : "var(--border)",
                  background: form.role === r.value ? "var(--accent-light)" : "var(--surface)",
                  color: form.role === r.value ? "var(--accent)" : "var(--text)",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Select
            label="Department Access"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={deptOptions}
          />
          {form.role === "user" && !form.departmentId && (
            <div style={{
              marginTop: 6, padding: "8px 12px", background: "rgba(245,158,11,0.1)",
              borderRadius: 8, fontSize: 12, color: "#b45309",
            }}>
              Warning: User with no department will see no data.
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">{modal === "new" ? "Create User" : "Save"}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteUser}
        title="Delete User?"
        message="This user will lose access to the system permanently."
      />
    </div>
  );
}
