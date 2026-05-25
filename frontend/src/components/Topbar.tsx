"use client";

import { usePathname } from "next/navigation";
import { Bell, Settings, Moon, Sun, LogOut, User, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useEffect, useRef, useState } from "react";

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/create": "Create Assignment",
  "/assignments": "Assignments",
  "/toolkit": "AI Teacher's Toolkit",
  "/groups": "My Groups",
  "/library": "My Library",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);
  const { theme, toggleTheme } = useThemeStore();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) fetchNotifications(token);
  }, [token, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch notifications periodically
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => fetchNotifications(token), 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  const pageName = breadcrumbMap[pathname] || pathname.split("/").filter(Boolean).pop() || "Dashboard";
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <header className="h-16 bg-[var(--topbar-bg)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-[var(--foreground)]">{pageName}</h1>

      <div className="flex items-center gap-3">
        {/* ── Notifications ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
          >
            <Bell size={20} className="text-[var(--muted-foreground)]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[var(--brand)] text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--foreground)]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => token && markAllAsRead(token)}
                    className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <a
                      key={n._id}
                      href={n.link || "#"}
                      onClick={() => { if (!n.read && token) markAsRead(token, n._id); }}
                      className={`block px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors ${
                        !n.read ? "bg-[var(--brand)]/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                          n.type === "assignment_completed" ? "bg-emerald-500" :
                          n.type === "assignment_failed" ? "bg-rose-500" :
                          n.type === "due_date" ? "bg-amber-500" : "bg-[var(--accent)]"
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{n.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-60">
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block max-w-[120px] truncate">
              {user?.name || "User"}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.name || "User"}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email || ""}</p>
              </div>

              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
                onClick={() => setShowProfile(false)}
              >
                <Settings size={16} className="text-[var(--muted-foreground)]" />
                Settings
              </a>

              <button
                onClick={() => { toggleTheme(); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
              >
                <span className="flex items-center gap-3">
                  {theme === "dark" ? <Sun size={16} className="text-[var(--muted-foreground)]" /> : <Moon size={16} className="text-[var(--muted-foreground)]" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
                <div className={`h-5 w-9 rounded-full transition-colors ${theme === "dark" ? "bg-[var(--brand)]" : "bg-[var(--muted)]"} relative`}>
                  <div className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>

              <div className="border-t border-[var(--border)] mt-1">
                <button
                  onClick={() => { logout(); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-[var(--hover)] transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
