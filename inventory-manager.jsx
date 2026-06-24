import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── Utility Helpers ───
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const today = () => new Date().toISOString().split("T")[0];

// ─── Storage Layer ───
const STORE_KEY = "inv-mgr-data";
const defaults = { items: [], stock: [], invoices: [], stores: [], categories: [] };

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch { return defaults; }
}
function saveData(d) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch {}
}

// ─── Icons (inline SVG) ───
const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  items: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  stock: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  invoice: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  store: "M3 3h18v18H3z M3 9h18 M9 21V9",
  plus: "M12 5v14 M5 12h14",
  trash: "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  search: "M11 17.25a6.25 6.25 0 110-12.5 6.25 6.25 0 010 12.5z M16 16l4.5 4.5",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  close: "M18 6L6 18 M6 6l12 12",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  check: "M20 6L9 17l-5-5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  print: "M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z",
};

// ─── Reusable Components ───
const Badge = ({ children, variant = "default" }) => {
  const colors = {
    default: "background: var(--badge-bg); color: var(--badge-fg)",
    success: "background: #dcfce7; color: #166534",
    warning: "background: #fef3c7; color: #92400e",
    danger: "background: #fee2e2; color: #991b1b",
    info: "background: #dbeafe; color: #1e40af",
  };
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, ...Object.fromEntries(colors[variant].split(";").map(s => { const [k, v] = s.split(":").map(x => x.trim()); return [k, v]; })) }}>{children}</span>;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", icon, disabled, style: sx }) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "inherit", transition: "all .15s", opacity: disabled ? 0.5 : 1 };
  const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "8px 18px", fontSize: 14 }, lg: { padding: "12px 24px", fontSize: 15 } };
  const vars = {
    primary: { background: "var(--accent)", color: "#fff" },
    secondary: { background: "var(--surface-2)", color: "var(--text)" },
    danger: { background: "#ef4444", color: "#fff" },
    ghost: { background: "transparent", color: "var(--text-muted)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...vars[variant], ...sx }}>{icon && <Icon d={icons[icon]} size={size === "sm" ? 14 : 16} />}{children}</button>;
};

const Input = ({ label, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
    {label}
    <input {...props} style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "var(--surface)", color: "var(--text)", outline: "none", ...(props.style || {}) }} />
  </label>
);

const Select = ({ label, options, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
    {label}
    <select {...props} style={{ padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "var(--surface)", color: "var(--text)" }}>
      <option value="">— Select —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

const Modal = ({ open, onClose, title, children, width = 540 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: 16, padding: 24, width: "90%", maxWidth: width, maxHeight: "85vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><Icon d={icons.close} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Table = ({ columns, data, onRow, emptyMsg = "No records found" }) => (
  <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr>{columns.map(c => <th key={c.key} style={{ padding: "10px 14px", textAlign: c.align || "left", background: "var(--surface-2)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>{emptyMsg}</td></tr>
        ) : data.map((row, i) => (
          <tr key={row.id || i} onClick={() => onRow?.(row)} style={{ cursor: onRow ? "pointer" : "default", borderBottom: "1px solid var(--border)" }}>
            {columns.map(c => <td key={c.key} style={{ padding: "10px 14px", textAlign: c.align || "left", whiteSpace: c.nowrap ? "nowrap" : "normal" }}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatCard = ({ label, value, sub, color }) => (
  <div style={{ padding: 20, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", flex: "1 1 200px" }}>
    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
  </div>
);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  const update = useCallback((fn) => {
    setData(prev => { const next = { ...prev }; fn(next); saveData(next); return next; });
  }, []);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "items", label: "Items Master", icon: "items" },
    { id: "stores", label: "Stores", icon: "store" },
    { id: "stock", label: "Inventory", icon: "stock" },
    { id: "invoices", label: "Invoices", icon: "invoice" },
  ];

  const pages = {
    dashboard: <Dashboard data={data} setPage={setPage} />,
    items: <ItemsMaster data={data} update={update} />,
    stores: <Stores data={data} update={update} />,
    stock: <StockMgmt data={data} update={update} />,
    invoices: <Invoices data={data} update={update} />,
  };

  return (
    <div style={{ "--accent": "#2563eb", "--accent-light": "#dbeafe", "--surface": "#ffffff", "--surface-2": "#f8fafc", "--border": "#e2e8f0", "--text": "#0f172a", "--text-muted": "#64748b", "--badge-bg": "#f1f5f9", "--badge-fg": "#475569", "--danger": "#ef4444", "--success": "#22c55e", "--warn": "#f59e0b", fontFamily: "'Outfit', 'Segoe UI', sans-serif", display: "flex", height: "100vh", background: "var(--surface-2)", color: "var(--text)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{ width: sideOpen ? 230 : 64, transition: "width .2s", background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderBottom: "1px solid var(--border)" }} onClick={() => setSideOpen(!sideOpen)}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>S</span>
          </div>
          {sideOpen && <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>StockFlow</span>}
        </div>
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "none", background: page === n.id ? "var(--accent-light)" : "transparent",
              color: page === n.id ? "var(--accent)" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: page === n.id ? 600 : 400, marginBottom: 2, transition: "all .15s",
            }}>
              <Icon d={icons[n.icon]} size={20} />
              {sideOpen && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
            </button>
          ))}
        </nav>
        {sideOpen && <div style={{ padding: "16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>StockFlow v1.0<br/>Inventory Manager</div>}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
        {pages[page]}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function Dashboard({ data, setPage }) {
  const totalItems = data.items.length;
  const totalStock = data.stock.reduce((s, x) => s + (x.qty || 0), 0);
  const lowStock = data.items.filter(it => {
    const qty = data.stock.filter(s => s.itemId === it.id).reduce((s, x) => s + x.qty, 0);
    return qty < (it.reorderLevel || 5);
  });
  const totalInvValue = data.invoices.reduce((s, inv) => s + (inv.total || 0), 0);
  const thisMonth = data.invoices.filter(inv => { const d = new Date(inv.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const monthValue = thisMonth.reduce((s, inv) => s + (inv.total || 0), 0);

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 24, fontWeight: 800 }}>Dashboard</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Total Items" value={totalItems} sub={`${data.categories.length} categories`} color="var(--accent)" />
        <StatCard label="Total Stock Units" value={totalStock.toLocaleString("en-IN")} sub={`Across ${data.stores.length} stores`} />
        <StatCard label="This Month Revenue" value={fmt(monthValue)} sub={`${thisMonth.length} invoices`} color="var(--success)" />
        <StatCard label="All-Time Revenue" value={fmt(totalInvValue)} sub={`${data.invoices.length} total invoices`} />
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon d={icons.alert} size={18} color="#92400e" />
            <strong style={{ color: "#92400e" }}>Low Stock Alerts ({lowStock.length})</strong>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lowStock.slice(0, 10).map(it => <Badge key={it.id} variant="warning">{it.name}</Badge>)}
            {lowStock.length > 10 && <Badge variant="warning">+{lowStock.length - 10} more</Badge>}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px", fontWeight: 700 }}>Recent Invoices</h4>
          {data.invoices.slice(-5).reverse().map(inv => (
            <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{inv.invoiceNo}</span>
              <span style={{ color: "var(--text-muted)" }}>{inv.customerName}</span>
              <span style={{ fontWeight: 600 }}>{fmt(inv.total)}</span>
            </div>
          ))}
          {data.invoices.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No invoices yet</div>}
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px", fontWeight: 700 }}>Quick Actions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "Add New Item", p: "items" }, { label: "Record Stock", p: "stock" }, { label: "Create Invoice", p: "invoices" }, { label: "Manage Stores", p: "stores" }].map(a => (
              <Btn key={a.p} variant="secondary" onClick={() => setPage(a.p)} style={{ justifyContent: "flex-start" }} icon="plus">{a.label}</Btn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ITEMS MASTER
// ═══════════════════════════════════════════
function ItemsMaster({ data, update }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [catModal, setCatModal] = useState(false);
  const [catName, setCatName] = useState("");
  const empty = { name: "", sku: "", category: "", unit: "Pcs", price: "", costPrice: "", hsnCode: "", gstRate: "18", reorderLevel: "5", description: "" };
  const [form, setForm] = useState(empty);

  const filtered = data.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.name || !form.sku) return;
    update(d => {
      if (modal === "new") d.items.push({ ...form, id: uid(), price: +form.price || 0, costPrice: +form.costPrice || 0, reorderLevel: +form.reorderLevel || 5, createdAt: new Date().toISOString() });
      else { const idx = d.items.findIndex(x => x.id === modal); if (idx >= 0) d.items[idx] = { ...d.items[idx], ...form, price: +form.price, costPrice: +form.costPrice, reorderLevel: +form.reorderLevel }; }
    });
    setModal(null); setForm(empty);
  };

  const del = (id) => { if (confirm("Delete this item?")) update(d => { d.items = d.items.filter(x => x.id !== id); }); };

  const openEdit = (item) => { setForm({ ...item, price: item.price + "", costPrice: item.costPrice + "", reorderLevel: item.reorderLevel + "" }); setModal(item.id); };

  const addCat = () => { if (!catName.trim()) return; update(d => { if (!d.categories.includes(catName.trim())) d.categories.push(catName.trim()); }); setCatName(""); setCatModal(false); };

  const getQty = (itemId) => data.stock.filter(s => s.itemId === itemId).reduce((s, x) => s + x.qty, 0);

  const cols = [
    { key: "sku", label: "SKU", nowrap: true, render: r => <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r.sku}</span> },
    { key: "name", label: "Item Name", render: r => <span style={{ fontWeight: 500 }}>{r.name}</span> },
    { key: "category", label: "Category", render: r => r.category ? <Badge>{r.category}</Badge> : "—" },
    { key: "unit", label: "Unit" },
    { key: "price", label: "Sell Price", align: "right", render: r => fmt(r.price) },
    { key: "costPrice", label: "Cost", align: "right", render: r => fmt(r.costPrice) },
    { key: "qty", label: "In Stock", align: "right", render: r => { const q = getQty(r.id); return <span style={{ fontWeight: 600, color: q < r.reorderLevel ? "var(--danger)" : "var(--success)" }}>{q}</span>; } },
    { key: "gstRate", label: "GST%", align: "center" },
    { key: "actions", label: "", align: "right", render: r => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <Btn size="sm" variant="ghost" icon="edit" onClick={(e) => { e.stopPropagation(); openEdit(r); }} />
        <Btn size="sm" variant="ghost" icon="trash" onClick={(e) => { e.stopPropagation(); del(r.id); }} />
      </div>
    )},
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Items Master</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" icon="plus" onClick={() => setCatModal(true)} size="sm">Category</Btn>
          <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>New Item</Btn>
        </div>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 350 }}>
        <Input placeholder="Search items by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      <Table columns={cols} data={filtered} />

      <Modal open={!!modal} onClose={() => { setModal(null); setForm(empty); }} title={modal === "new" ? "Add New Item" : "Edit Item"} width={600}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Item Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="SKU *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={data.categories.map(c => ({ value: c, label: c }))} />
          <Select label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} options={["Pcs", "Kg", "Ltr", "Mtr", "Box", "Pack", "Set", "Dozen"].map(u => ({ value: u, label: u }))} />
          <Input label="Selling Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <Input label="Cost Price (₹)" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
          <Input label="HSN Code" value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} />
          <Select label="GST Rate %" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: e.target.value })} options={["0", "5", "12", "18", "28"].map(g => ({ value: g, label: g + "%" }))} />
          <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">{modal === "new" ? "Add Item" : "Save"}</Btn>
        </div>
      </Modal>

      <Modal open={catModal} onClose={() => setCatModal(false)} title="Add Category" width={360}>
        <Input label="Category Name" value={catName} onChange={e => setCatName(e.target.value)} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Btn variant="secondary" onClick={() => setCatModal(false)}>Cancel</Btn>
          <Btn onClick={addCat} icon="check">Add</Btn>
        </div>
        {data.categories.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.categories.map(c => <Badge key={c}>{c}</Badge>)}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// STORES
// ═══════════════════════════════════════════
function Stores({ data, update }) {
  const [modal, setModal] = useState(null);
  const empty = { name: "", location: "", contactPerson: "", phone: "", email: "" };
  const [form, setForm] = useState(empty);

  const save = () => {
    if (!form.name) return;
    update(d => {
      if (modal === "new") d.stores.push({ ...form, id: uid(), createdAt: new Date().toISOString() });
      else { const idx = d.stores.findIndex(x => x.id === modal); if (idx >= 0) d.stores[idx] = { ...d.stores[idx], ...form }; }
    });
    setModal(null); setForm(empty);
  };

  const del = (id) => { if (confirm("Delete store?")) update(d => { d.stores = d.stores.filter(x => x.id !== id); }); };

  const cols = [
    { key: "name", label: "Store Name", render: r => <strong>{r.name}</strong> },
    { key: "location", label: "Location" },
    { key: "contactPerson", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "items", label: "Items in Stock", align: "center", render: r => { const count = new Set(data.stock.filter(s => s.storeId === r.id).map(s => s.itemId)).size; return <Badge variant="info">{count}</Badge>; } },
    { key: "actions", label: "", align: "right", render: r => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <Btn size="sm" variant="ghost" icon="edit" onClick={() => { setForm(r); setModal(r.id); }} />
        <Btn size="sm" variant="ghost" icon="trash" onClick={() => del(r.id)} />
      </div>
    )},
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Stores</h2>
        <Btn icon="plus" onClick={() => { setForm(empty); setModal("new"); }}>New Store</Btn>
      </div>
      <Table columns={cols} data={data.stores} />
      <Modal open={!!modal} onClose={() => { setModal(null); setForm(empty); }} title={modal === "new" ? "Add Store" : "Edit Store"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Store Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <Input label="Contact Person" value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ gridColumn: "1/-1" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">{modal === "new" ? "Add Store" : "Save"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// STOCK / INVENTORY
// ═══════════════════════════════════════════
function StockMgmt({ data, update }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({ store: "", category: "" });
  const empty = { itemId: "", storeId: "", qty: "", type: "in", note: "" };
  const [form, setForm] = useState(empty);

  const save = () => {
    if (!form.itemId || !form.storeId || !form.qty) return;
    const qty = +form.qty * (form.type === "out" ? -1 : 1);
    update(d => {
      const existing = d.stock.find(s => s.itemId === form.itemId && s.storeId === form.storeId);
      if (existing) existing.qty = Math.max(0, existing.qty + qty);
      else d.stock.push({ id: uid(), itemId: form.itemId, storeId: form.storeId, qty: Math.max(0, qty), updatedAt: new Date().toISOString() });
    });
    setModal(false); setForm(empty);
  };

  // Build inventory view
  const inventory = useMemo(() => {
    let rows = [];
    data.stock.forEach(s => {
      const item = data.items.find(i => i.id === s.itemId);
      const store = data.stores.find(st => st.id === s.storeId);
      if (!item) return;
      if (filter.store && s.storeId !== filter.store) return;
      if (filter.category && item.category !== filter.category) return;
      rows.push({ ...s, itemName: item.name, sku: item.sku, category: item.category, unit: item.unit, storeName: store?.name || "—", reorderLevel: item.reorderLevel, price: item.price, stockValue: s.qty * item.costPrice });
    });
    return rows;
  }, [data, filter]);

  const cols = [
    { key: "sku", label: "SKU", render: r => <span style={{ fontWeight: 600 }}>{r.sku}</span> },
    { key: "itemName", label: "Item" },
    { key: "category", label: "Category", render: r => r.category ? <Badge>{r.category}</Badge> : "—" },
    { key: "storeName", label: "Store", render: r => <Badge variant="info">{r.storeName}</Badge> },
    { key: "qty", label: "Quantity", align: "right", render: r => <span style={{ fontWeight: 700, color: r.qty < r.reorderLevel ? "var(--danger)" : "inherit" }}>{r.qty} {r.unit}</span> },
    { key: "stockValue", label: "Stock Value", align: "right", render: r => fmt(r.stockValue) },
    { key: "status", label: "Status", align: "center", render: r => r.qty < r.reorderLevel ? <Badge variant="danger">Low</Badge> : r.qty < r.reorderLevel * 2 ? <Badge variant="warning">Medium</Badge> : <Badge variant="success">OK</Badge> },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Inventory</h2>
        <Btn icon="plus" onClick={() => setModal(true)}>Stock In/Out</Btn>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Select label="Filter by Store" value={filter.store} onChange={e => setFilter({ ...filter, store: e.target.value })} options={data.stores.map(s => ({ value: s.id, label: s.name }))} />
        <Select label="Filter by Category" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} options={data.categories.map(c => ({ value: c, label: c }))} />
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted)" }}>
        Total stock value: <strong style={{ color: "var(--text)" }}>{fmt(inventory.reduce((s, r) => s + r.stockValue, 0))}</strong>
      </div>

      <Table columns={cols} data={inventory} emptyMsg="No stock records. Add stores & items first, then record stock." />

      <Modal open={modal} onClose={() => { setModal(false); setForm(empty); }} title="Record Stock Movement">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Item *" value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })} options={data.items.map(i => ({ value: i.id, label: `${i.name} (${i.sku})` }))} />
          <Select label="Store *" value={form.storeId} onChange={e => setForm({ ...form, storeId: e.target.value })} options={data.stores.map(s => ({ value: s.id, label: s.name }))} />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={[{ value: "in", label: "Stock In (+)" }, { value: "out", label: "Stock Out (−)" }]} />
          <Input label="Quantity *" type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
          <Input label="Note" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ gridColumn: "1/-1" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setModal(false); setForm(empty); }}>Cancel</Btn>
          <Btn onClick={save} icon="check">Record</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════
function Invoices({ data, update }) {
  const [modal, setModal] = useState(null);
  const [viewInv, setViewInv] = useState(null);
  const [search, setSearch] = useState("");

  const emptyLine = { itemId: "", qty: 1, price: 0, gstRate: 18 };
  const emptyInv = { customerName: "", customerPhone: "", customerGstin: "", storeId: "", date: today(), lines: [{ ...emptyLine }], discount: 0, notes: "" };
  const [form, setForm] = useState(emptyInv);

  const nextInvNo = () => "INV-" + String(data.invoices.length + 1).padStart(5, "0");

  const setLine = (idx, key, val) => {
    const lines = [...form.lines];
    lines[idx] = { ...lines[idx], [key]: val };
    if (key === "itemId") {
      const item = data.items.find(i => i.id === val);
      if (item) { lines[idx].price = item.price; lines[idx].gstRate = +item.gstRate || 18; }
    }
    setForm({ ...form, lines });
  };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { ...emptyLine }] });
  const removeLine = (idx) => { if (form.lines.length > 1) setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) }); };

  const calcLine = (l) => { const base = l.qty * l.price; const gst = base * (l.gstRate / 100); return { base, gst, total: base + gst }; };
  const calcTotal = () => {
    let sub = 0, gst = 0;
    form.lines.forEach(l => { const c = calcLine(l); sub += c.base; gst += c.gst; });
    const disc = +form.discount || 0;
    return { sub, gst, disc, total: sub + gst - disc };
  };

  const saveInvoice = () => {
    if (!form.customerName || form.lines.some(l => !l.itemId || !l.qty)) return;
    const totals = calcTotal();
    const inv = {
      ...form, id: uid(), invoiceNo: nextInvNo(), ...totals, createdAt: new Date().toISOString(),
      lines: form.lines.map(l => ({ ...l, ...calcLine(l), itemName: data.items.find(i => i.id === l.itemId)?.name || "" })),
      storeName: data.stores.find(s => s.id === form.storeId)?.name || "",
    };
    // Deduct stock
    update(d => {
      d.invoices.push(inv);
      inv.lines.forEach(l => {
        if (form.storeId) {
          const s = d.stock.find(x => x.itemId === l.itemId && x.storeId === form.storeId);
          if (s) s.qty = Math.max(0, s.qty - l.qty);
        }
      });
    });
    setModal(null); setForm(emptyInv);
  };

  const filtered = data.invoices.filter(i => i.invoiceNo.toLowerCase().includes(search.toLowerCase()) || i.customerName.toLowerCase().includes(search.toLowerCase()));

  const cols = [
    { key: "invoiceNo", label: "Invoice #", render: r => <span style={{ fontWeight: 700, color: "var(--accent)" }}>{r.invoiceNo}</span> },
    { key: "date", label: "Date", render: r => fmtDate(r.date) },
    { key: "customerName", label: "Customer", render: r => <strong>{r.customerName}</strong> },
    { key: "storeName", label: "Store", render: r => r.storeName ? <Badge variant="info">{r.storeName}</Badge> : "—" },
    { key: "lines", label: "Items", align: "center", render: r => r.lines.length },
    { key: "total", label: "Total", align: "right", render: r => <strong>{fmt(r.total)}</strong> },
    { key: "actions", label: "", align: "right", render: r => <Btn size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setViewInv(r); }}>View</Btn> },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Invoices</h2>
        <Btn icon="plus" onClick={() => { setForm(emptyInv); setModal("new"); }}>New Invoice</Btn>
      </div>

      <div style={{ marginBottom: 16, maxWidth: 350 }}>
        <Input placeholder="Search by invoice # or customer…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Table columns={cols} data={[...filtered].reverse()} />

      {/* Create Invoice Modal */}
      <Modal open={modal === "new"} onClose={() => { setModal(null); setForm(emptyInv); }} title="Create Invoice" width={750}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          <Input label="Customer Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
          <Input label="Phone" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
          <Input label="GSTIN" value={form.customerGstin} onChange={e => setForm({ ...form, customerGstin: e.target.value })} />
          <Select label="Store" value={form.storeId} onChange={e => setForm({ ...form, storeId: e.target.value })} options={data.stores.map(s => ({ value: s.id, label: s.name }))} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>

        <h4 style={{ margin: "0 0 10px", fontWeight: 700 }}>Line Items</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["Item", "Qty", "Price (₹)", "GST%", "Amount", ""].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", background: "var(--surface-2)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {form.lines.map((l, idx) => {
                const c = calcLine(l);
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "6px 4px" }}>
                      <select value={l.itemId} onChange={e => setLine(idx, "itemId", e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, fontFamily: "inherit" }}>
                        <option value="">Select…</option>
                        {data.items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "6px 4px", width: 70 }}><input type="number" min="1" value={l.qty} onChange={e => setLine(idx, "qty", +e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }} /></td>
                    <td style={{ padding: "6px 4px", width: 100 }}><input type="number" value={l.price} onChange={e => setLine(idx, "price", +e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }} /></td>
                    <td style={{ padding: "6px 4px", width: 70 }}><input type="number" value={l.gstRate} onChange={e => setLine(idx, "gstRate", +e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }} /></td>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>{fmt(c.total)}</td>
                    <td style={{ padding: "6px 4px" }}><Btn size="sm" variant="ghost" icon="trash" onClick={() => removeLine(idx)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Btn variant="secondary" size="sm" icon="plus" onClick={addLine} style={{ marginTop: 8 }}>Add Line</Btn>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <div style={{ minWidth: 250 }}>
            {[["Subtotal", fmt(calcTotal().sub)], ["GST", fmt(calcTotal().gst)]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14, color: "var(--text-muted)" }}><span>{k}</span><span>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Discount (₹)</span>
              <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} style={{ width: 100, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 14, textAlign: "right" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid var(--text)", marginTop: 8, fontSize: 18, fontWeight: 800 }}><span>Total</span><span>{fmt(calcTotal().total)}</span></div>
          </div>
        </div>

        <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ marginTop: 12 }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(emptyInv); }}>Cancel</Btn>
          <Btn onClick={saveInvoice} icon="check">Create Invoice</Btn>
        </div>
      </Modal>

      {/* View Invoice Modal */}
      <Modal open={!!viewInv} onClose={() => setViewInv(null)} title={`Invoice ${viewInv?.invoiceNo || ""}`} width={650}>
        {viewInv && (
          <div id="invoice-print">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid var(--text)" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>INVOICE</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{viewInv.invoiceNo}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13 }}>
                <div><strong>Date:</strong> {fmtDate(viewInv.date)}</div>
                {viewInv.storeName && <div><strong>Store:</strong> {viewInv.storeName}</div>}
              </div>
            </div>
            <div style={{ marginBottom: 20, fontSize: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Bill To:</div>
              <div>{viewInv.customerName}</div>
              {viewInv.customerPhone && <div>Ph: {viewInv.customerPhone}</div>}
              {viewInv.customerGstin && <div>GSTIN: {viewInv.customerGstin}</div>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
              <thead><tr>{["#", "Item", "Qty", "Price", "GST%", "GST Amt", "Total"].map(h => <th key={h} style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {viewInv.lines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px" }}>{i + 1}</td>
                    <td style={{ padding: "8px", fontWeight: 500 }}>{l.itemName}</td>
                    <td style={{ padding: "8px" }}>{l.qty}</td>
                    <td style={{ padding: "8px" }}>{fmt(l.price)}</td>
                    <td style={{ padding: "8px" }}>{l.gstRate}%</td>
                    <td style={{ padding: "8px" }}>{fmt(l.gst)}</td>
                    <td style={{ padding: "8px", fontWeight: 600 }}>{fmt(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ minWidth: 220, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Subtotal</span><span>{fmt(viewInv.sub)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>GST</span><span>{fmt(viewInv.gst)}</span></div>
                {viewInv.disc > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "var(--danger)" }}><span>Discount</span><span>−{fmt(viewInv.disc)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid var(--text)", marginTop: 8, fontSize: 18, fontWeight: 800 }}><span>Total</span><span>{fmt(viewInv.total)}</span></div>
              </div>
            </div>
            {viewInv.notes && <div style={{ marginTop: 16, padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 13 }}><strong>Notes:</strong> {viewInv.notes}</div>}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => setViewInv(null)}>Close</Btn>
          <Btn icon="print" onClick={() => { const w = window.open("", "", "width=800,height=600"); w.document.write(`<html><head><title>${viewInv.invoiceNo}</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}th{font-weight:600}</style></head><body>${document.getElementById("invoice-print").innerHTML}</body></html>`); w.document.close(); w.print(); }}>Print</Btn>
        </div>
      </Modal>
    </div>
  );
}
