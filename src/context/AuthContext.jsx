import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_user") || "null"); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("sf_token") || null);

  // On mount, refresh the user from the server so role changes are picked up
  // without requiring a logout/login cycle.
  useEffect(() => {
    const storedToken = localStorage.getItem("sf_token");
    if (!storedToken) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("sf_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token is expired or invalid — clear everything so login screen shows
        setUser(null);
        setToken(null);
        localStorage.removeItem("sf_user");
        localStorage.removeItem("sf_token");
      });
  }, []);

  const login = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("sf_user", JSON.stringify(userData));
    localStorage.setItem("sf_token", tokenData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sf_user");
    localStorage.removeItem("sf_token");
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
