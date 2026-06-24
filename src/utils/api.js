const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("sf_token");
}

async function request(url, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  // Token expired on a protected route — kick to login screen
  // But NEVER intercept auth endpoints — let the caller handle those errors
  if (res.status === 401 && !url.startsWith("/auth/")) {
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_user");
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  if (res.headers.get("Content-Type")?.includes("text/csv")) {
    return res;
  }
  return res.json();
}

const api = {
  // Auth
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/auth/me"),
  getUsers: () => request("/auth/users"),
  createUser: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/auth/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE" }),

  // Departments
  getDepartments: () => request("/departments"),
  createDepartment: (data) => request("/departments", { method: "POST", body: JSON.stringify(data) }),
  updateDepartment: (id, data) => request(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/categories"),
  createCategory: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // Items
  getItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/items${qs ? `?${qs}` : ""}`);
  },
  getItem: (id) => request(`/items/${id}`),
  createItem: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  stockMovement: (id, data) => request(`/items/${id}/stock`, { method: "PATCH", body: JSON.stringify(data) }),

  // People
  getPeople: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/people${qs ? `?${qs}` : ""}`);
  },
  getPerson: (id) => request(`/people/${id}`),
  createPerson: (data) => request("/people", { method: "POST", body: JSON.stringify(data) }),
  updatePerson: (id, data) => request(`/people/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePerson: (id) => request(`/people/${id}`, { method: "DELETE" }),

  // Assignments
  getAssignments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assignments${qs ? `?${qs}` : ""}`);
  },
  getAssignment: (id) => request(`/assignments/${id}`),
  createAssignment: (data) => request("/assignments", { method: "POST", body: JSON.stringify(data) }),
  returnAssignment: (id, data) => request(`/assignments/${id}/return`, { method: "PATCH", body: JSON.stringify(data) }),

  // Activity
  getActivity: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activity${qs ? `?${qs}` : ""}`);
  },

  // Reports
  getDashboard: () => request("/reports/dashboard"),
  exportData: async (type) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/reports/export/${type}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Export failed" }));
      throw new Error(err.error || "Export failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default api;
