import { useState, useEffect, useCallback } from "react";
import "./index.css";
import api from "./utils/api";
import Icon from "./components/Icon";
import Toast from "./components/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ItemsMaster from "./pages/ItemsMaster";
import Departments from "./pages/Departments";
import People from "./pages/People";
import Inventory from "./pages/Inventory";
import Assignments from "./pages/Assignments";
import ActivityLog from "./pages/ActivityLog";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";

function AppInner() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [toast, setToast] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    if (user) loadDepartments();
  }, [user]);

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  if (!user) {
    return (
      <>
        <Login showToast={showToast} />
        {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "items", label: "Stationary", icon: "items" },
    { id: "departments", label: "Departments", icon: "department" },
    { id: "people", label: "People", icon: "people" },
    { id: "inventory", label: "Inventory", icon: "stock" },
    { id: "assignments", label: "Assignments", icon: "assign" },
    { id: "activity", label: "Activity Log", icon: "activity" },
    { id: "reports", label: "Reports", icon: "reports" },
    ...(isSuperAdmin ? [{ id: "admin", label: "Admin Panel", icon: "shield" }] : []),
  ];

  const pages = {
    dashboard: <Dashboard setPage={setPage} showToast={showToast} />,
    items: <ItemsMaster showToast={showToast} departments={departments} />,
    departments: <Departments showToast={showToast} departments={departments} reloadDepartments={loadDepartments} />,
    people: <People showToast={showToast} departments={departments} />,
    inventory: <Inventory showToast={showToast} departments={departments} />,
    assignments: <Assignments showToast={showToast} departments={departments} />,
    activity: <ActivityLog showToast={showToast} />,
    reports: <Reports showToast={showToast} />,
    ...(isSuperAdmin ? { admin: <AdminPanel showToast={showToast} departments={departments} /> } : {}),
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: sideOpen ? 240 : 68,
        transition: "width var(--transition)",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex", flexDirection: "column",
        flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: sideOpen ? "20px 18px" : "20px 14px",
          display: "flex", alignItems: "center", gap: 12,
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          transition: "padding var(--transition)",
        }} onClick={() => setSideOpen(!sideOpen)}>
          <img src="/logo.png" alt="StockFlow Logo" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
          {sideOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 800, fontSize: 17, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>StockFlow</div>
              <div style={{ fontSize: 11, color: "var(--text-light)", whiteSpace: "nowrap" }}>Inventory Manager</div>
            </div>
          )}
        </div>

        {/* User Info Strip */}
        {sideOpen && (
          <div style={{
            margin: "12px 8px 0",
            padding: "10px 12px",
            borderRadius: 10,
            background: isSuperAdmin ? "rgba(245,158,11,0.08)" : isAdmin ? "rgba(99,102,241,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${isSuperAdmin ? "rgba(245,158,11,0.15)" : isAdmin ? "rgba(99,102,241,0.15)" : "rgba(34,197,94,0.15)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: isSuperAdmin
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : isAdmin
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}>
                {user.name[0]?.toUpperCase()}
              </div>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: 11, color: isSuperAdmin ? "#d97706" : isAdmin ? "#6366f1" : "#16a34a", fontWeight: 600,
                }}>
                  {isSuperAdmin ? "Super Admin" : isAdmin ? "Administrator" : user.departmentName || "User"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              title={!sideOpen ? n.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                width: "100%", padding: sideOpen ? "10px 14px" : "10px 14px",
                borderRadius: 10, border: "none",
                background: page === n.id ? "var(--accent-light)" : "transparent",
                color: page === n.id ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: page === n.id ? 600 : 400,
                marginBottom: 2, transition: "all var(--transition)",
                justifyContent: sideOpen ? "flex-start" : "center",
              }}
            >
              <Icon d={n.icon} size={20} />
              {sideOpen && <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: sideOpen ? "14px 18px" : "14px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          justifyContent: sideOpen ? "space-between" : "center",
          gap: 8,
        }}>
          {sideOpen && (
            <div style={{ fontSize: 11, color: "var(--text-light)" }}>
              StockFlow v2.0
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setDark(!dark)}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                background: "var(--surface-3)", border: "none", borderRadius: 8,
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all var(--transition)", color: "var(--text-muted)",
              }}
            >
              <Icon d={dark ? "sun" : "moon"} size={16} />
            </button>
            <button
              onClick={logout}
              title="Sign out"
              style={{
                background: "var(--surface-3)", border: "none", borderRadius: 8,
                width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all var(--transition)", color: "var(--text-muted)",
              }}
            >
              <Icon d="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1, overflow: "auto", padding: 28,
        background: "var(--surface-2)",
      }}>
        <div key={page}>
          {pages[page] || pages.dashboard}
        </div>
      </main>

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
