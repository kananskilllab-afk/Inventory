import { useState, useEffect } from "react";
import api from "../utils/api";
import { fmt } from "../utils/helpers";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Btn from "../components/Btn";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";
import ConfirmDialog from "../components/ConfirmDialog";

// Generate a unique serial number like STN-20260413-001
function generateSerialNumber(existingItems) {
  const today = new Date();
  const dateStr =
    String(today.getFullYear()) +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const prefix = `STN-${dateStr}-`;

  // Find the highest number with the same date prefix
  let maxNum = 0;
  existingItems.forEach((item) => {
    if (item.serialNumber && item.serialNumber.startsWith(prefix)) {
      const num = parseInt(item.serialNumber.replace(prefix, ""), 10);
      if (num > maxNum) maxNum = num;
    }
  });

  return prefix + String(maxNum + 1).padStart(3, "0");
}

// Unit options with full names
const UNIT_OPTIONS = [
  { value: "Pieces", label: "Pieces" },
  { value: "Kilograms", label: "Kilograms" },
  { value: "Litres", label: "Litres" },
  { value: "Metres", label: "Metres" },
  { value: "Boxes", label: "Boxes" },
  { value: "Packets", label: "Packets" },
  { value: "Sets", label: "Sets" },
  { value: "Dozens", label: "Dozens" },
  { value: "Reams", label: "Reams" },
  { value: "Bundles", label: "Bundles" },
  { value: "Rolls", label: "Rolls" },
  { value: "Bottles", label: "Bottles" },
  { value: "Pairs", label: "Pairs" },
];

export default function ItemsMaster({ showToast, departments }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null); // null | "new" | itemId
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const empty = {
    name: "",
    unit: "Pieces",
    price: "",
    date: new Date().toISOString().split("T")[0],
    serialNumber: "",
    departmentId: "",
    quantity: "1",
    author: "",
    publisher: "",
    edition: "",
    publishYear: "",
    isbn: "",
  };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const itemsData = await api.getItems();
      setItems(itemsData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openNewItem = () => {
    const serial = generateSerialNumber(items);
    setForm({
      ...empty,
      serialNumber: serial,
      date: new Date().toISOString().split("T")[0],
    });
    setModal("new");
  };

  const save = async () => {
    if (!form.name.trim()) {
      showToast("Please enter an Item Name", "error");
      return;
    }
    if (!form.departmentId) {
      showToast("Please select a Department", "error");
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.serialNumber, // Use serial number as SKU
        serialNumber: form.serialNumber,
        unit: form.unit,
        price: +form.price || 0,
        costPrice: +form.price || 0,
        quantity: +form.quantity || 1,
        departmentId: form.departmentId,
        author: form.author?.trim() || "",
        publisher: form.publisher?.trim() || "",
        edition: form.edition?.trim() || "",
        publishYear: form.publishYear?.trim() || "",
        isbn: form.isbn?.trim() || "",
        // Keep defaults for other fields
        reorderLevel: 5,
        condition: "New",
        gstRate: 0,
        category: "",
        description: "",
        hsnCode: "",
      };
      if (modal === "new") {
        await api.createItem(payload);
        showToast("Item added successfully!");
      } else {
        await api.updateItem(modal, payload);
        showToast("Item updated successfully!");
      }
      setModal(null);
      setForm(empty);
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const deleteItem = async () => {
    try {
      await api.deleteItem(deleteId);
      showToast("Item deleted");
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    }
    setDeleteId(null);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      unit: item.unit || "Pieces",
      price: String(item.price || ""),
      date: item.createdAt
        ? new Date(item.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      serialNumber: item.serialNumber || item.sku || "",
      departmentId: item.departmentId?._id || item.departmentId,
      quantity: String(item.quantity || 1),
      author: item.author || "",
      publisher: item.publisher || "",
      edition: item.edition || "",
      publishYear: item.publishYear || "",
      isbn: item.isbn || "",
    });
    setModal(item._id);
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      (i.serialNumber || "").toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q)
    );
  });

  const cols = [
    {
      key: "serialNumber",
      label: "Serial No.",
      nowrap: true,
      render: (r) => (
        <span
          style={{
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            fontSize: 13,
            color: "var(--accent)",
          }}
        >
          {r.serialNumber || r.sku}
        </span>
      ),
    },
    {
      key: "name",
      label: "Item Name",
      render: (r) => <span style={{ fontWeight: 500 }}>{r.name}</span>,
    },
    {
      key: "department",
      label: "Department",
      render: (r) => {
        const dept = r.departmentId;
        return dept ? (
          <Badge
            variant="accent"
            style={{ background: `${dept.color}18`, color: dept.color }}
          >
            {dept.name}
          </Badge>
        ) : (
          "—"
        );
      },
    },
    {
      key: "quantity",
      label: "Quantity",
      align: "right",
      render: (r) => (
        <span style={{ fontWeight: 600 }}>
          {r.quantity} {r.unit}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) => (
        <span style={{ fontWeight: 600 }}>{fmt(r.price)}</span>
      ),
    },
    {
      key: "date",
      label: "Date Added",
      render: (r) => (
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Btn
            size="sm"
            variant="ghost"
            icon="edit"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
          />
          <Btn
            size="sm"
            variant="ghost"
            icon="trash"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(r._id);
            }}
          />
        </div>
      ),
    },
  ];

  // Prevent form submission on Enter key inside inputs
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const isBookDept = (() => {
    if (!form.departmentId) return false;
    const dept = departments.find((d) => d._id === form.departmentId);
    return dept ? dept.name.toLowerCase().includes("book") || dept.name.toLowerCase().includes("library") : false;
  })();

  return (
    <div className="page-enter">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Stationary Items
          </h2>
          <p
            style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}
          >
            {items.length} total items
          </p>
        </div>
        <Btn icon="plus" onClick={openNewItem}>
          Add New Item
        </Btn>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by item name or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
          }}
        >
          Loading items...
        </div>
      ) : (
        <Table
          columns={cols}
          data={filtered}
          emptyMsg="No items found. Click 'Add New Item' to get started!"
        />
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        open={!!modal}
        onClose={() => {
          setModal(null);
          setForm(empty);
        }}
        title={modal === "new" ? "Add New Item" : "Edit Item"}
        width={480}
      >
        <div onKeyDown={handleFormKeyDown}>
          {/* Auto-generated Serial Number (read-only) */}
          <div
            style={{
              marginBottom: 18,
              padding: "12px 16px",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              Serial Number (Auto-generated)
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {form.serialNumber || "—"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <Input
              label="Item Name *"
              placeholder="e.g. Pen, Notebook, Stapler..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Select
              label="Department *"
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
              options={departments.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
            />

            {isBookDept && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <Input
                    label="Author"
                    placeholder="e.g. J.K. Rowling"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                  />
                  <Input
                    label="Publisher"
                    placeholder="e.g. Bloomsbury"
                    value={form.publisher}
                    onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 14,
                  }}
                >
                  <Input
                    label="Edition"
                    placeholder="e.g. 1st Edition"
                    value={form.edition}
                    onChange={(e) => setForm({ ...form, edition: e.target.value })}
                  />
                  <Input
                    label="Publish Year"
                    placeholder="e.g. 1997"
                    value={form.publishYear}
                    onChange={(e) => setForm({ ...form, publishYear: e.target.value })}
                  />
                  <Input
                    label="ISBN"
                    placeholder="ISBN Number"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  />
                </div>
              </>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="1"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Select
                label="Unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                options={UNIT_OPTIONS}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <Btn
            variant="secondary"
            onClick={() => {
              setModal(null);
              setForm(empty);
            }}
          >
            Cancel
          </Btn>
          <Btn onClick={save} icon="check">
            {modal === "new" ? "Add Item" : "Save Changes"}
          </Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteItem}
        title="Delete Item?"
        message="This will permanently remove this item. This action cannot be undone."
      />
    </div>
  );
}
