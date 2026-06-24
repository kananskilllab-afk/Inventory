import { useState, useEffect } from "react";
import api from "../utils/api";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";

// ── tiny icon helper ──────────────────────────────────────────────────────────
function Icon({ d, size = 16, style = {} }) {
  const paths = {
    person: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21.6h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
    mail: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
    phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
    id: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.75c1.24 0 2.25 1.01 2.25 2.25S13.24 11.25 12 11.25 9.75 10.24 9.75 9s1.01-2.25 2.25-2.25zM17 17H7v-.75c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17z",
    building: "M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2z",
    shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
    clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    tag: "M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z",
    link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
    box: "M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L11 13.17l7.59-7.59L20 7l-9 9z",
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0, ...style }}>
      <path d={paths[d] || paths.person} />
    </svg>
  );
}

// ── role badge ────────────────────────────────────────────────────────────────
const ROLE_STYLE = {
  superadmin: { bg: "#fef3c7", color: "#b45309", label: "Super Admin" },
  admin:      { bg: "#ede9fe", color: "#7c3aed", label: "Admin" },
  user:       { bg: "#e0f2fe", color: "#0369a1", label: "User" },
};

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || { bg: "#f3f4f6", color: "#6b7280", label: role };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      <Icon d="shield" size={10} />
      {s.label}
    </span>
  );
}

// ── avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, linked, size = 36 }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const bg = linked
    ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
    : "linear-gradient(135deg, #9ca3af, #6b7280)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", background: bg,
      color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      userSelect: "none",
    }}>
      {initials}
    </span>
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)",
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0,
      }}>
        <Icon d={icon} size={22} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function People({ showToast, departments }) {
  const [people, setPeople] = useState([]);
  const [modal, setModal] = useState(null);
  const [viewPerson, setViewPerson] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const empty = { name: "", employeeId: "", departmentId: "", designation: "", email: "", phone: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getPeople();
      setPeople(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.employeeId || !form.departmentId) {
      showToast("Name, Employee ID, and Department are required", "error");
      return;
    }
    try {
      if (modal === "new") {
        await api.createPerson(form);
        showToast("Employee added!");
      } else {
        await api.updatePerson(modal, form);
        showToast("Employee updated!");
      }
      setModal(null);
      setForm(empty);
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deletePerson = async () => {
    try {
      await api.deletePerson(deleteId);
      showToast("Employee deleted");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
    setDeleteId(null);
  };

  const viewDetails = async (person) => {
    try {
      const data = await api.getPerson(person._id);
      setViewPerson(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filtered = people.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.employeeId.toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q);
    const matchDept = !filterDept || (p.departmentId?._id || p.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  // Stats
  const totalWithLogin = people.filter((p) => p.userId).length;
  const totalItems = people.reduce((s, p) => s + (p.activeAssignments || 0), 0);

  const cols = [
    {
      key: "employee", label: "Employee",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={r.name} linked={!!r.userId} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              {r.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "department", label: "Department",
      render: (r) => {
        const dept = r.departmentId;
        return dept?.name
          ? <Badge variant="accent" style={{ background: `${dept.color}18`, color: dept.color }}>{dept.name}</Badge>
          : "—";
      },
    },
    { key: "designation", label: "Designation", render: (r) => r.designation || <span style={{ color: "var(--text-muted)" }}>—</span> },
    {
      key: "contact", label: "Contact",
      render: (r) => (
        <div style={{ fontSize: 12 }}>
          {r.email ? <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon d="mail" size={12} />{r.email}</div> : null}
          {r.phone ? <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Icon d="phone" size={12} />{r.phone}</div> : null}
          {!r.email && !r.phone ? <span style={{ color: "var(--text-muted)" }}>—</span> : null}
        </div>
      ),
    },
    {
      key: "items", label: "Active Items",
      render: (r) => r.activeAssignments > 0
        ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: "#fef3c7", color: "#b45309",
          }}>
            <Icon d="box" size={11} />
            {r.activeAssignments}
          </span>
        )
        : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>,
    },
    {
      key: "access", label: "System Access",
      render: (r) => r.userId
        ? <RoleBadge role={r.userId.role} />
        : (
          <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Icon d="person" size={11} />No Login
          </span>
        ),
    },
    {
      key: "actions", label: "", align: "right",
      render: (r) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Btn size="sm" variant="ghost" icon="eye" onClick={(e) => { e.stopPropagation(); viewDetails(r); }} />
          <Btn size="sm" variant="ghost" icon="edit" onClick={(e) => {
            e.stopPropagation();
            setForm({
              name: r.name || "",
              employeeId: r.employeeId || "",
              departmentId: r.departmentId?._id || r.departmentId || "",
              designation: r.designation || "",
              email: r.email || "",
              phone: r.phone || "",
            });
            setModal(r._id);
          }} />
          <Btn size="sm" variant="ghost" icon="trash" onClick={(e) => { e.stopPropagation(); setDeleteId(r._id); }} />
        </div>
      ),
    },
  ];

  // Avatar initial letter for form preview
  const formInitial = form.name ? form.name.trim()[0]?.toUpperCase() : "?";

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>People</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {people.length} employees across all departments
          </p>
        </div>
        <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>Add Employee</Btn>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Total Employees" value={people.length} icon="users" color="#6366f1" />
          <StatCard label="Items Assigned" value={totalItems} icon="box" color="#f59e0b" />
          <StatCard label="With Login Access" value={totalWithLogin} icon="shield" color="#10b981" />
          <StatCard label="No Login Account" value={people.length - totalWithLogin} icon="person" color="#9ca3af" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Input
          placeholder="Search by name, employee ID or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 300 }}
        />
        <Select
          label=""
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
          style={{ minWidth: 180 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading employees...</div>
      ) : (
        <Table columns={cols} data={filtered} emptyMsg="No employees added yet." />
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={!!modal && !viewPerson}
        onClose={() => { setModal(null); setForm(empty); }}
        title={modal === "new" ? "Add Employee" : "Edit Employee"}
        width={520}
      >
        {/* Avatar preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800,
          }}>
            {formInitial}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            Purple avatar = linked to a system login account
          </p>
        </div>

        {/* Full-width name */}
        <Input
          label="Full Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ marginBottom: 12 }}
        />

        {/* 2-column grid for the rest */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Employee ID *" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          <Select
            label="Department *"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={departments.map((d) => ({ value: d._id, label: d.name }))}
          />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ gridColumn: "1 / -1" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">{modal === "new" ? "Add Employee" : "Save Changes"}</Btn>
        </div>
      </Modal>

      {/* View Person Details Modal */}
      <Modal open={!!viewPerson} onClose={() => setViewPerson(null)} title="" width={600}>
        {viewPerson && (() => {
          const p = viewPerson.person;
          const dept = p.departmentId;
          const linked = p.userId;
          return (
            <div>
              {/* Person header */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                <Avatar name={p.name} linked={!!linked} size={64} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{p.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {p.designation || "No designation set"}
                  </div>
                  {dept?.name && (
                    <Badge variant="accent" style={{ background: `${dept.color}18`, color: dept.color, marginTop: 8 }}>
                      {dept.name}
                    </Badge>
                  )}
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Employee ID</div>
                  <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>{p.employeeId}</div>
                </div>
              </div>

              {/* System account section */}
              <div style={{
                borderRadius: 10, padding: "14px 16px", marginBottom: 20,
                background: linked ? "#ede9fe" : "#f9fafb",
                border: `1px solid ${linked ? "#c4b5fd" : "var(--border)"}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: linked ? "#7c3aed" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon d="link" size={13} />
                  System Account
                </div>
                {linked ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{linked.username || linked.name}</span>
                    </div>
                    <RoleBadge role={linked.role} />
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No system login account linked. Create a user in Admin Panel with a matching department to link automatically.
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369a1", flexShrink: 0 }}>
                    <Icon d="mail" size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Email</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.email || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", flexShrink: 0 }}>
                    <Icon d="phone" size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.phone || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Assignment history */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h4 style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>Assignment History</h4>
                  <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      {viewPerson.activeCount || 0} Active
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {viewPerson.totalCount || 0} Total
                    </span>
                  </div>
                </div>
                {viewPerson.assignments?.length > 0 ? (
                  <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {viewPerson.assignments.map((a) => (
                      <div key={a._id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                        background: a.status === "Active" ? "#f0fdf4" : "var(--bg)",
                        border: `1px solid ${a.status === "Active" ? "#bbf7d0" : "var(--border)"}`,
                        fontSize: 13,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon d="tag" size={13} style={{ color: "var(--text-muted)" }} />
                          <div>
                            <strong>{a.itemId?.name || "Unknown Item"}</strong>
                            <span style={{ color: "var(--text-muted)", marginLeft: 6, fontSize: 12 }}>
                              ×{a.quantityAssigned}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {a.receiptNo && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                              #{a.receiptNo}
                            </span>
                          )}
                          <Badge variant={a.status === "Active" ? "info" : a.status === "Returned" ? "success" : "danger"}>
                            {a.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                    No assignments yet
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deletePerson}
        title="Delete Employee?"
        message="Cannot delete if they have active assignments. Return all items first."
      />
    </div>
  );
}
