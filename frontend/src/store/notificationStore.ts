import { create } from "zustand";

export interface Notification {
  _id: string;
  userId: string;
  type: "assignment_completed" | "assignment_failed" | "assignment_processing" | "due_date" | "info";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  relatedId?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (token: string) => Promise<void>;
  markAsRead: (token: string, id: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  addOptimistic: (n: Partial<Notification>) => void;
}

const API_BASE = "http://localhost:5000/api";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (token: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (token: string, id: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllAsRead: async (token: string) => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },

  // Add a notification optimistically (for real-time WS events)
  addOptimistic: (n: Partial<Notification>) => {
    const notif: Notification = {
      _id: n._id || `opt-${Date.now()}`,
      userId: n.userId || "",
      type: (n.type as Notification["type"]) || "info",
      title: n.title || "",
      message: n.message || "",
      read: false,
      link: n.link,
      relatedId: n.relatedId,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
