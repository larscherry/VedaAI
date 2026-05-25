"use client";

import { ChevronLeft, Bell, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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

export default function MobileHeader({
  onMenuToggle,
  menuOpen,
}: {
  onMenuToggle: () => void;
  menuOpen: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotificationStore();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) fetchNotifications(token);
  }, [token, fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pageName =
    breadcrumbMap[pathname] ||
    pathname.split("/").filter(Boolean).pop() ||
    "Dashboard";

  const showBack = pathname !== "/";

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-[var(--topbar-bg)] border-b border-[var(--border)] shrink-0">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[var(--hover)]">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
            V
          </div>
          <span className="font-bold text-gray-900 text-sm">VedaAI</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-1.5 rounded-full hover:bg-[var(--hover)] transition"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <a
                      key={n._id}
                      href={n.link || "#"}
                      onClick={() => { if (!n.read && token) markAsRead(token, n._id); setShowNotif(false); }}
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
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-7 h-7 rounded-full overflow-hidden">
          <img src="/profile.png" alt="Profile" className="h-full w-full object-cover" />
        </div>

        <button
          onClick={onMenuToggle}
          className="p-1 rounded-full hover:bg-[var(--hover)] transition"
        >
          {menuOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <div className="flex flex-col gap-1">
              <span className="w-4 h-0.5 bg-gray-800 rounded" />
              <span className="w-4 h-0.5 bg-gray-800 rounded" />
              <span className="w-4 h-0.5 bg-gray-800 rounded" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
