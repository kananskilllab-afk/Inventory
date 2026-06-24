import { useState, useEffect } from "react";
import api from "../utils/api";
import { fmt } from "../utils/helpers";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";

export default function Inventory({ showToast, departments }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [filterDept, setFilterDept] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const empty = { itemId: "", type: "in", quantity: "", note: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [itemsData, catsData] = await Promise.all([api.getItems(), api.getCategories()]);
      setItems(itemsData);
      setCategories(catsData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.itemId || !form.quantity) {
      showToast("Item and quantity are required", "error");
      return;
    }
    try {
      await api.stockMovement(form.itemId, { type: form.type, quantity: +form.quantity, note: form.note });
      showToast(`Stock ${form.type === "in" ? "added" : "removed"} successfully!`);
      setModal(false);
      setForm(empty);
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || (i.departmentId?._id || i.departmentId) === filterDept;
    const matchCat = !filterCategory || i.category === filterCategory;
    return matchSearch && matchDept && matchCat;
  });

  const totalValue = filtered.reduce((s, i) => s + (i.quantity * i.costPrice), 0);

  const cols = [
    { key: "sku", label: "SKU", render: (r) => <span style={{ fontWeight: 600 }}>{r.sku}</span> },
    { key: "name", label: "Item", render: (r) => (
      <div>
        <span style={{ fontWeight: 500 }}>{r.name}</span>
        {r.serialNumber && <div style={{ fontSize: 11, color: "var(--text-light)" }}>S/N: {r.serialNumber}</div>}
      </div>
    )},
    { key: "department", label: "Department", render: (r) => {
      const dept = r.departmentId;
      return dept?.name ? <Badge variant="accent" style={{ background: `${dept.color}18`, color: dept.color }}>{dept.name}</Badge> : "—";
    }},
    { key: "category", label: "Category", render: (r) => r.category ? <Badge>{r.category}</Badge> : "—" },
    { key: "quantity", label: "Quantity", align: "right", render: (r) => (
      <span style={{ fontWeight: 700, color: r.quantity < r.reorderLevel ? "var(--danger)" : "inherit" }}>
        {r.quantity} {r.unit}
      </span>
    )},
    { key: "stockValue", label: "Stock Value", align: "right", render: (r) => fmt(r.quantity * r.costPrice) },
    { key: "status", label: "Status", align: "center", render: (r) => {
      if (r.quantity === 0) return <Badge variant="danger">Out</Badge>;
      if (r.quantity < r.reorderLevel) return <Badge variant="danger">Low</Badge>;
      if (r.quantity < r.reorderLevel * 2) return <Badge variant="warning">Medium</Badge>;
      return <Badge variant="success">OK</Badge>;
    }},
  ];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Inventory</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {items.length} items • Total value: <strong style={{ color: "var(--text)" }}>{fmt(totalValue)}</strong>
          </p>
        </div>
        <Btn icon="plus" onClick={() => setModal(true)}>Stock In/Out</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 250 }} />
        <Select label="" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          options={departments.map((d) => ({ value: d._id, label: d.name }))} style={{ minWidth: 160 }} />
        <Select label="" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          options={categories.map((c) => ({ value: c.name, label: c.name }))} style={{ minWidth: 160 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading inventory...</div>
      ) : (
        <Table columns={cols} data={filtered} emptyMsg="No stock records. Add items first, then record stock." />
      )}

      <Modal open={modal} onClose={() => { setModal(false); setForm(empty); }} title="Record Stock Movement">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Item *" value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })}
            options={items.map((i) => ({ value: i._id, label: `${i.name} (${i.sku}) — ${i.quantity} in stock` }))}
            style={{ gridColumn: "1/-1" }} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: "in", label: "Stock In (+)" }, { value: "out", label: "Stock Out (−)" }]} />
          <Input label="Quantity *" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={{ gridColumn: "1/-1" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
          <Btn variant="secondary" onClick={() => { setModal(false); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">Record</Btn>
        </div>
      </Modal>
    </div>
  );
}
