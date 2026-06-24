import { useState, useEffect } from "react";
import api from "../utils/api";
import { timeAgo } from "../utils/helpers";
import Badge from "../components/Badge";
import Select from "../components/Select";
import Icon from "../components/Icon";

export default function ActivityLog({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => { loadData(); }, [filterType, limit]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { limit };
      if (filterType) params.type = filterType;
      const data = await api.getActivity(params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const typeIcons = {
    item_added: "plus", item_edited: "edit", item_deleted: "trash",
    stock_in: "plus", stock_out: "download",
    assigned: "assign", returned: "returnIcon",
    person_added: "person", person_edited: "edit", person_deleted: "trash",
    department_added: "department", department_edited: "edit",
    category_added: "plus",
  };

  const typeColors = {
    item_added: "var(--success)", item_edited: "var(--info)", item_deleted: "var(--danger)",
    stock_in: "var(--success)", stock_out: "var(--warn)",
    assigned: "var(--accent)", returned: "var(--info)",
    person_added: "var(--success)", person_edited: "var(--info)", person_deleted: "var(--danger)",
    department_added: "var(--success)", department_edited: "var(--info)",
    category_added: "var(--success)",
  };

  const typeBadge = {
    item_added: "success", item_edited: "info", item_deleted: "danger",
    stock_in: "success", stock_out: "warning",
    assigned: "accent", returned: "info",
    person_added: "success", person_deleted: "danger",
    department_added: "success", category_added: "info",
  };

  const typeOptions = [
    { value: "item_added", label: "Item Added" },
    { value: "item_edited", label: "Item Edited" },
    { value: "item_deleted", label: "Item Deleted" },
    { value: "stock_in", label: "Stock In" },
    { value: "stock_out", label: "Stock Out" },
    { value: "assigned", label: "Assigned" },
    { value: "returned", label: "Returned" },
    { value: "person_added", label: "Person Added" },
    { value: "department_added", label: "Department Added" },
  ];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Activity Log</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{total} total entries</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Select label="" value={filterType} onChange={(e) => setFilterType(e.target.value)}
          options={typeOptions} style={{ minWidth: 180 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading activity...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>No activity logged yet</div>
      ) : (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", overflow: "hidden",
        }}>
          {logs.map((log, i) => (
            <div key={log._id} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 20px",
              borderBottom: i < logs.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background var(--transition)",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${typeColors[log.type] || "var(--accent)"}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2,
              }}>
                <Icon d={typeIcons[log.type] || "activity"} size={16} color={typeColors[log.type] || "var(--accent)"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{log.action}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <Badge variant={typeBadge[log.type] || "default"} style={{ fontSize: 10, padding: "2px 7px" }}>
                    {log.type.replace(/_/g, " ")}
                  </Badge>
                  {log.departmentName && <span style={{ fontSize: 12, color: "var(--text-light)" }}>{log.departmentName}</span>}
                </div>
                {log.details && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{log.details}</div>}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-light)", whiteSpace: "nowrap", marginTop: 2 }}>
                {timeAgo(log.createdAt)}
              </div>
            </div>
          ))}

          {logs.length < total && (
            <div style={{ padding: 16, textAlign: "center" }}>
              <button onClick={() => setLimit((l) => l + 50)} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: 8,
                padding: "8px 20px", cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: 500, color: "var(--accent)",
              }}>
                Load More ({total - logs.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
