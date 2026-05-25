const API_BASE = "http://localhost:5000/api";

function headers(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("vedaai_token") : null;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("vedaai_token") : null;
  const h: Record<string, string> = {};
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export const api = {
  // ── Auth ──
  async register(data: {
    teacherId: string;
    name: string;
    email: string;
    password: string;
    subject?: string;
    school?: string;
    location?: string;
    className?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error);
    }
    return res.json();
  },

  async login(teacherId: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error);
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },

  async updateProfile(data: Partial<{ name: string; subject: string; school: string; location: string; className: string }>) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  },

  async updateApiKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/auth/apikey`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ apiKey }),
    });
    if (!res.ok) throw new Error("Failed to update API key");
    return res.json();
  },

  async updateMockMode(mockMode: boolean) {
    const res = await fetch(`${API_BASE}/auth/mockmode`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ mockMode }),
    });
    if (!res.ok) throw new Error("Failed to update mock mode");
    return res.json();
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/password`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update password" }));
      throw new Error(err.error);
    }
    return res.json();
  },

  // ── Assignments ──
  async getAssignments() {
    const res = await fetch(`${API_BASE}/assignments`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/assignments/stats`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async createAssignment(formData: FormData): Promise<{ assignmentId: string; status: string }> {
    const token = typeof window !== "undefined" ? localStorage.getItem("vedaai_token") : null;
    const h: Record<string, string> = {};
    if (token) h["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/assignments`, {
      method: "POST",
      headers: h,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create assignment" }));
      throw new Error(err.error);
    }
    return res.json();
  },

  async getAssignment(id: string) {
    const res = await fetch(`${API_BASE}/assignments/${id}`, { headers: headers() });
    if (!res.ok) throw new Error("Assignment not found");
    return res.json();
  },

  async getPaper(id: string) {
    const res = await fetch(`${API_BASE}/assignments/${id}/paper`, { headers: headers() });
    if (!res.ok) throw new Error("Paper not found");
    return res.json();
  },

  async regeneratePaper(id: string) {
    const res = await fetch(`${API_BASE}/assignments/${id}/regenerate`, {
      method: "POST",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to regenerate");
    return res.json();
  },

  // ── Groups ──
  async getGroups() {
    const res = await fetch(`${API_BASE}/groups`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to fetch groups");
    return res.json();
  },

  async createGroup(data: { name: string; description?: string }) {
    const res = await fetch(`${API_BASE}/groups`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create group");
    return res.json();
  },

  async getGroup(id: string) {
    const res = await fetch(`${API_BASE}/groups/${id}`, { headers: headers() });
    if (!res.ok) throw new Error("Group not found");
    return res.json();
  },

  async updateGroup(id: string, data: { name: string; description?: string }) {
    const res = await fetch(`${API_BASE}/groups/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update group");
    return res.json();
  },

  async deleteAssignment(id: string) {
    const res = await fetch(`${API_BASE}/assignments/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete assignment");
    return res.json();
  },

  async deleteGroup(id: string) {
    const res = await fetch(`${API_BASE}/groups/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete group");
    return res.json();
  },

  async addStudent(groupId: string, data: { name: string; rollNumber: string; email?: string }) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/students`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add student");
    return res.json();
  },

  async removeStudent(groupId: string, rollNumber: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/students/${rollNumber}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to remove student");
    return res.json();
  },

  // ── Notifications ──
  async getNotifications(limit = 20, unreadOnly = false) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (unreadOnly) params.set("unread", "true");
    const res = await fetch(`${API_BASE}/notifications?${params}`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  },

  async markNotificationRead(id: string) {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: "PUT", headers: headers() });
  },

  async markAllNotificationsRead() {
    await fetch(`${API_BASE}/notifications/read-all`, { method: "PUT", headers: headers() });
  },

  getPdfUrl(id: string): string {
    const token = typeof window !== "undefined" ? localStorage.getItem("vedaai_token") : null;
    const params = token ? `?token=${token}` : "";
    return `${API_BASE}/assignments/${id}/pdf${params}`;
  },
};
