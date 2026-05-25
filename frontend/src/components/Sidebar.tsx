"use client";

import {
  Sparkles,
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route: string;
};

const NAV: NavItem[] = [
  { icon: LayoutGrid, label: "Home", route: "/" },
  { icon: ImageIcon, label: "My Groups", route: "/groups" },
  { icon: FileText, label: "Assignments", route: "/assignments" },
  { icon: BookOpen, label: "AI Teacher's Toolkit", route: "/toolkit" },
  { icon: PieChart, label: "My Library", route: "/library" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    api
      .getAssignments()
      .then((data) => setCount(data.length))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="w-[260px] shrink-0">
      <div className="rounded-3xl bg-[var(--sidebar-bg)] shadow-sm p-5 flex flex-col min-h-[calc(100vh-32px)]">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 px-2 py-1 cursor-pointer">
            <img src="/veda.png" alt="VedaAI" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              VedaAI
            </span>
          </div>
        </Link>

        {/* Create button */}
        <Link href="/create">
          <button className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold py-3.5 shadow-[0_0_0_3px_rgba(233,78,27,0.45)] hover:opacity-90 transition-all cursor-pointer">
            <Sparkles className="h-4 w-4" />
            Create Assignment
          </button>
        </Link>

        {/* Nav */}
        <nav className="mt-6 flex-1 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.route === "/"
                ? pathname === "/"
                : pathname.startsWith(item.route);

            return (
              <Link key={item.label} href={item.route}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] cursor-pointer transition ${
                    isActive
                      ? "bg-[var(--muted)] text-[var(--foreground)] font-semibold"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--hover)]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Assignments" && count !== null && count > 0 && (
                    <span className="text-xs font-bold text-white bg-[var(--brand)] rounded-full px-2 py-0.5">
                      {count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Settings + Logout */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[var(--border)]">
          <Link href="/settings">
            <div className="flex items-center gap-3 px-3 py-2 text-[15px] text-[var(--muted-foreground)] cursor-pointer hover:bg-[var(--hover)] rounded-lg transition">
              <Settings className="h-[18px] w-[18px]" />
              <span>Settings</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--muted)] p-2.5">
            <div className="h-11 w-11 rounded-full overflow-hidden shrink-0">
              <img src="/profile.png" alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-[var(--foreground)] leading-tight truncate">
                {user?.name || "Teacher"}
              </span>
              <span className="text-xs text-[var(--muted-foreground)] truncate">
                {user?.school || user?.subject || "No school set"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-[15px] text-[var(--muted-foreground)] cursor-pointer hover:text-red-400 rounded-lg transition"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
