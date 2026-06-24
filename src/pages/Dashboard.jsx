import { useState, useEffect } from "react";
import api from "../utils/api";
import { fmt, fmtDate, timeAgo } from "../utils/helpers";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import Icon from "../components/Icon";

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashData, actData] = await Promise.all([
        api.getDashboard(),
        api.getActivity({ limit: 8 }),
      ]);
      setStats(dashData);
      setActivity(actData.logs || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Loading Dashboard...</div>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "pulse 1s infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const actionTypeColors = {
    item_added: "success", item_edited: "info", item_deleted: "danger",
    stock_in: "success", stock_out: "warning",
    assigned: "accent", returned: "info",
    person_added: "success", person_deleted: "danger",
    department_added: "success", category_added: "info",
  };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Dashboard</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Overview of your inventory system</p>
      </div>

      {/* Top Stats */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard
          label="Total Items" value={stats.totalItems}
          color="var(--accent)"
          icon={<Icon d="items" size={20} />}
        />
        <StatCard
          label="Total Stock Units" value={stats.totalStock?.toLocaleString("en-IN") || 0}
          icon={<Icon d="stock" size={20} />}
        />
        <StatCard
          label="Active Assignments" value={stats.activeAssignments}
          color="var(--info)"
          icon={<Icon d="assign" size={20} />}
        />
        <StatCard
          label="Total Employees" value={stats.totalPeople}
          color="var(--success)"
          icon={<Icon d="people" size={20} />}
        />
      </div>

      {/* Overdue Warning */}
      {stats.overdueAssignments > 0 && (
        <div style={{
          background: "var(--danger-light)", border: "1px solid var(--danger)",
          borderRadius: "var(--radius-md)", padding: 16, marginBottom: 24,
          display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.3s ease",
        }}>
          <Icon d="alert" size={20} color="var(--danger)" />
          <div>
            <strong style={{ color: "var(--danger)" }}>{stats.overdueAssignments} Overdue Return{stats.overdueAssignments > 1 ? "s" : ""}</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>Items past their expected return date</span>
          </div>
          <Btn size="sm" variant="outline" onClick={() => setPage("assignments")} style={{ marginLeft: "auto" }}>View</Btn>
        </div>
      )}

      {/* Low Stock Warning */}
      {stats.lowStockItems?.length > 0 && (
        <div style={{
          background: "var(--warn-light)", border: "1px solid var(--warn)",
          borderRadius: "var(--radius-md)", padding: 16, marginBottom: 24,
          animation: "slideUp 0.35s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon d="alert" size={18} color="var(--warn)" />
            <strong style={{ color: "var(--warn)" }}>Low Stock Alerts ({stats.lowStockItems.length})</strong>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {stats.lowStockItems.slice(0, 12).map((it) => (
              <Badge key={it._id} variant="warning">{it.name} ({it.quantity})</Badge>
            ))}
            {stats.lowStockItems.length > 12 && <Badge variant="warning">+{stats.lowStockItems.length - 12} more</Badge>}
          </div>
        </div>
      )}

      {/* Department Stats */}
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Departments</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.deptStats?.map((dept) => (
          <div key={dept._id} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: 20,
            boxShadow: "var(--shadow-sm)", animation: "slideUp 0.3s ease",
            cursor: "pointer", transition: "all var(--transition)",
          }} onClick={() => setPage("departments")}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "var(--radius-sm)",
                background: `${dept.color}18`, color: dept.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon d={dept.icon || "box"} size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{dept.name}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div><span style={{ color: "var(--text-muted)" }}>Items: </span><strong>{dept.itemCount}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Stock: </span><strong>{dept.totalStock}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Assigned: </span><strong>{dept.activeAssignments}</strong></div>
              <div><span style={{ color: "var(--text-muted)" }}>Value: </span><strong>{fmt(dept.stockValue)}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Recent Activity */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: 22,
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Activity</h4>
            <Btn size="sm" variant="ghost" onClick={() => setPage("activity")}>View All</Btn>
          </div>
          {activity.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 20, textAlign: "center" }}>No activity yet</div>
          ) : (
            activity.map((log) => (
              <div key={log._id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 0", borderBottom: "1px solid var(--border)",
                fontSize: 13,
              }}>
                <Badge variant={actionTypeColors[log.type] || "default"} style={{ fontSize: 10, padding: "2px 7px", marginTop: 2 }}>
                  {log.type.replace(/_/g, " ")}
                </Badge>
                <div style={{ flex: 1 }}>
                  <div>{log.action}</div>
                  <div style={{ color: "var(--text-light)", fontSize: 11, marginTop: 2 }}>{timeAgo(log.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: 22,
          boxShadow: "var(--shadow-sm)",
        }}>
          <h4 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15 }}>Quick Actions</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Add New Item", p: "items", icon: "plus", color: "var(--accent)" },
              { label: "Assign Item", p: "assignments", icon: "assign", color: "var(--info)" },
              { label: "Record Stock", p: "inventory", icon: "stock", color: "var(--success)" },
              { label: "Add Employee", p: "people", icon: "person", color: "var(--warn)" },
              { label: "Export Reports", p: "reports", icon: "download", color: "var(--text-muted)" },
            ].map((a) => (
              <Btn key={a.p} variant="secondary" onClick={() => setPage(a.p)} icon={a.icon}
                style={{ justifyContent: "flex-start", color: a.color }}>
                {a.label}
              </Btn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
