import { useState, useEffect } from "react";
import api from "../utils/api";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";

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
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || (p.departmentId?._id || p.departmentId) === filterDept;
    return matchSearch && matchDept;
  });

  const cols = [
    { key: "employeeId", label: "Emp ID", nowrap: true, render: (r) => <span style={{ fontWeight: 600 }}>{r.employeeId}</span> },
    { key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> },
    { key: "department", label: "Department", render: (r) => {
      const dept = r.departmentId;
      return dept?.name ? <Badge variant="accent" style={{ background: `${dept.color}18`, color: dept.color }}>{dept.name}</Badge> : "—";
    }},
    { key: "designation", label: "Designation", render: (r) => r.designation || "—" },
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "actions", label: "", align: "right", render: (r) => (
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
    )},
  ];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>People</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{people.length} employees</p>
        </div>
        <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>Add Employee</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Input placeholder="Search by name or employee ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 280 }} />
        <Select label="" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          options={departments.map((d) => ({ value: d._id, label: d.name }))} style={{ minWidth: 180 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading employees...</div>
      ) : (
        <Table columns={cols} data={filtered} emptyMsg="No employees added yet." />
      )}

      {/* Add/Edit Modal */}
      <Modal open={!!modal && modal !== null && !viewPerson} onClose={() => { setModal(null); setForm(empty); }}
        title={modal === "new" ? "Add Employee" : "Edit Employee"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Employee ID *" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          <Select label="Department *" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={departments.map((d) => ({ value: d._id, label: d.name }))} />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">{modal === "new" ? "Add Employee" : "Save"}</Btn>
        </div>
      </Modal>

      {/* View Person Details */}
      <Modal open={!!viewPerson} onClose={() => setViewPerson(null)} title={`Employee: ${viewPerson?.person?.name || ""}`} width={600}>
        {viewPerson && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, fontSize: 14 }}>
              <div><span style={{ color: "var(--text-muted)" }}>Employee ID:</span> <strong>{viewPerson.person.employeeId}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Department:</span> <strong>{viewPerson.person.departmentId?.name || "—"}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Designation:</span> <strong>{viewPerson.person.designation || "—"}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Email:</span> <strong>{viewPerson.person.email || "—"}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Phone:</span> <strong>{viewPerson.person.phone || "—"}</strong></div>
            </div>
            <h4 style={{ fontWeight: 700, marginBottom: 10 }}>Assignment History ({viewPerson.assignments?.length || 0})</h4>
            {viewPerson.assignments?.length > 0 ? (
              viewPerson.assignments.map((a) => (
                <div key={a._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
                }}>
                  <div>
                    <strong>{a.itemId?.name || "Unknown"}</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>x{a.quantityAssigned}</span>
                  </div>
                  <Badge variant={a.status === "Active" ? "info" : a.status === "Returned" ? "success" : "danger"}>
                    {a.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No assignments</div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={deletePerson}
        title="Delete Employee?" message="Cannot delete if they have active assignments. Return items first." />
    </div>
  );
}
