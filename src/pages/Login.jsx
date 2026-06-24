import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function Login({ showToast }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ username, password });
      login(res.user, res.token);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };



  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text)", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--surface-2)",
    }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="StockFlow Logo" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 14 }} />
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>StockFlow</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-muted)" }}>Inventory Management System</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: "var(--surface)", borderRadius: 18,
          border: "1px solid var(--border)", padding: 32,
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Welcome back</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>Sign in to your account</p>

          {/* Error message */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 16,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#dc2626", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Icon d="alert" size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter username"
                autoFocus
                autoComplete="username"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter password"
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                marginTop: 4, padding: "12px", borderRadius: 10,
                background: loading ? "var(--text-muted)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                opacity: (!username || !password) ? 0.5 : 1,
                transition: "opacity 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
