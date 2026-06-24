import { useState, useEffect } from "react";
import api from "../utils/api";
import { fmtDate, today } from "../utils/helpers";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import Textarea from "../components/Textarea";
import Badge from "../components/Badge";
import AssignmentReceipt from "../receipts/AssignmentReceipt";

export default function Assignments({ showToast, departments }) {
  const [assignments, setAssignments] = useState([]);
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [modal, setModal] = useState(false);
  const [returnModal, setReturnModal] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const empty = {
    itemId: "", personId: "", departmentId: "", quantityAssigned: "1",
    conditionOnAssign: "Good", assignedDate: today(), expectedReturnDate: "",
    notes: "", issuedBy: "",
  };
  const [form, setForm] = useState(empty);
  const [returnForm, setReturnForm] = useState({ conditionOnReturn: "Good", returnNotes: "", returnedDate: today() });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [assignData, itemsData, peopleData] = await Promise.all([
        api.getAssignments(),
        api.getItems(),
        api.getPeople(),
      ]);
      setAssignments(assignData);
      setItems(itemsData);
      setPeople(peopleData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.itemId || !form.personId) {
      showToast("Item and Person are required", "error");
      return;
    }
    try {
      const result = await api.createAssignment({
        ...form,
        quantityAssigned: +form.quantityAssigned || 1,
        expectedReturnDate: form.expectedReturnDate || null,
      });
      showToast(`Item assigned! Receipt: ${result.receiptNo}`);
      setModal(false);
      setForm(empty);
      loadData();
      // Open receipt for download
      setViewReceipt(result);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleReturn = async () => {
    try {
      await api.returnAssignment(returnModal._id, returnForm);
      showToast("Item returned successfully!");
      setReturnModal(null);
      setReturnForm({ conditionOnReturn: "Good", returnNotes: "", returnedDate: today() });
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filtered = assignments.filter((a) => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchDept = !filterDept || (a.departmentId?._id) === filterDept;
    const matchSearch = !search ||
      (a.itemId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.personId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      a.receiptNo.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDept && matchSearch;
  });

  // Check overdue
  const now = new Date();
  const withOverdue = filtered.map((a) => {
    if (a.status === "Active" && a.expectedReturnDate && new Date(a.expectedReturnDate) < now) {
      return { ...a, status: "Overdue" };
    }
    return a;
  });

  const statusColors = { Active: "info", Returned: "success", Overdue: "danger" };

  const cols = [
    { key: "receiptNo", label: "Receipt #", nowrap: true, render: (r) => (
      <span style={{ fontWeight: 700, color: "var(--accent)", cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); setViewReceipt(r); }}>
        {r.receiptNo}
      </span>
    )},
    { key: "item", label: "Item", render: (r) => (
      <div>
        <strong>{r.itemId?.name || "—"}</strong>
        {r.itemId?.sku && <div style={{ fontSize: 11, color: "var(--text-light)" }}>{r.itemId.sku}</div>}
      </div>
    )},
    { key: "person", label: "Assigned To", render: (r) => (
      <div>
        <strong>{r.personId?.name || "—"}</strong>
        {r.personId?.employeeId && <div style={{ fontSize: 11, color: "var(--text-light)" }}>{r.personId.employeeId}</div>}
      </div>
    )},
    { key: "department", label: "Dept", render: (r) => {
      const dept = r.departmentId;
      return dept?.name ? <Badge variant="accent" style={{ background: `${dept.color}18`, color: dept.color }}>{dept.name}</Badge> : "—";
    }},
    { key: "qty", label: "Qty", align: "center", render: (r) => r.quantityAssigned },
    { key: "assignedDate", label: "Assigned", render: (r) => fmtDate(r.assignedDate) },
    { key: "expectedReturn", label: "Expected Return", render: (r) => fmtDate(r.expectedReturnDate) },
    { key: "status", label: "Status", align: "center", render: (r) => (
      <Badge variant={statusColors[r.status] || "default"}>{r.status}</Badge>
    )},
    { key: "actions", label: "", align: "right", render: (r) => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <Btn size="sm" variant="ghost" icon="download" onClick={(e) => { e.stopPropagation(); setViewReceipt(r); }} />
        {r.status !== "Returned" && (
          <Btn size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setReturnModal(r); }}
            style={{ fontSize: 12, padding: "4px 10px" }}>Return</Btn>
        )}
      </div>
    )},
  ];

  // When item is selected, auto-set department
  const handleItemChange = (itemId) => {
    const item = items.find((i) => i._id === itemId);
    setForm({
      ...form,
      itemId,
      departmentId: item?.departmentId?._id || item?.departmentId || form.departmentId,
      conditionOnAssign: item?.condition || "Good",
    });
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Assignments</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {assignments.filter((a) => a.status === "Active").length} active • {assignments.filter((a) => a.status === "Returned").length} returned
          </p>
        </div>
        <Btn icon="assign" onClick={() => setModal(true)}>Assign Item</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Input placeholder="Search by item, person, or receipt..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 260 }} />
        <Select label="" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          options={[{ value: "Active", label: "Active" }, { value: "Returned", label: "Returned" }]} style={{ minWidth: 140 }} />
        <Select label="" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          options={departments.map((d) => ({ value: d._id, label: d.name }))} style={{ minWidth: 160 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading assignments...</div>
      ) : (
        <Table columns={cols} data={withOverdue} emptyMsg="No assignments yet. Assign items to employees!" />
      )}

      {/* Assign Item Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(empty); }} title="Assign Item to Employee" width={600}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Item *" value={form.itemId} onChange={(e) => handleItemChange(e.target.value)}
            options={items.filter((i) => i.quantity > 0).map((i) => ({
              value: i._id, label: `${i.name} (${i.sku}) — ${i.quantity} available`,
            }))} style={{ gridColumn: "1/-1" }} />
          <Select label="Assign To *" value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })}
            options={people.map((p) => ({
              value: p._id, label: `${p.name} (${p.employeeId})`,
            }))} style={{ gridColumn: "1/-1" }} />
          <Input label="Quantity" type="number" min="1" value={form.quantityAssigned}
            onChange={(e) => setForm({ ...form, quantityAssigned: e.target.value })} />
          <Select label="Condition" value={form.conditionOnAssign}
            onChange={(e) => setForm({ ...form, conditionOnAssign: e.target.value })}
            options={["New", "Good", "Fair", "Poor"].map((c) => ({ value: c, label: c }))} />
          <Input label="Assigned Date" type="date" value={form.assignedDate}
            onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} />
          <Input label="Expected Return Date" type="date" value={form.expectedReturnDate}
            onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} />
          <Input label="Issued By" value={form.issuedBy}
            onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ gridColumn: "1/-1" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => { setModal(false); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">Assign Item</Btn>
        </div>
      </Modal>

      {/* Return Item Modal */}
      <Modal open={!!returnModal} onClose={() => setReturnModal(null)} title={`Return: ${returnModal?.itemId?.name || ""}`} width={450}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", padding: 12, background: "var(--surface-2)", borderRadius: 8 }}>
            <div>Assigned to: <strong>{returnModal?.personId?.name}</strong></div>
            <div>Quantity: <strong>{returnModal?.quantityAssigned}</strong></div>
            <div>Receipt: <strong>{returnModal?.receiptNo}</strong></div>
          </div>
          <Select label="Condition on Return" value={returnForm.conditionOnReturn}
            onChange={(e) => setReturnForm({ ...returnForm, conditionOnReturn: e.target.value })}
            options={["New", "Good", "Fair", "Poor"].map((c) => ({ value: c, label: c }))} />
          <Input label="Return Date" type="date" value={returnForm.returnedDate}
            onChange={(e) => setReturnForm({ ...returnForm, returnedDate: e.target.value })} />
          <Textarea label="Return Notes" value={returnForm.returnNotes}
            onChange={(e) => setReturnForm({ ...returnForm, returnNotes: e.target.value })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => setReturnModal(null)}>Cancel</Btn>
          <Btn variant="success" onClick={handleReturn} icon="returnIcon">Mark Returned</Btn>
        </div>
      </Modal>

      {/* Receipt View */}
      {viewReceipt && (
        <AssignmentReceipt assignment={viewReceipt} onClose={() => setViewReceipt(null)} />
      )}
    </div>
  );
}
