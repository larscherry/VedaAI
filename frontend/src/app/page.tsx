"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import {
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { Assignment } from "@/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    dueToday: 0,
  });
  const [recent, setRecent] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getAssignments()])
      .then(([s, a]) => {
        setStats(s);
        setRecent(a.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Assignments",
      value: stats.total,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Due Today",
      value: stats.dueToday,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] lg:p-3 lg:flex lg:gap-3">
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} />
      <main className="flex-1 lg:bg-[var(--card)] lg:rounded-2xl lg:flex lg:flex-col lg:overflow-hidden relative">
        <Topbar />
        <MobileHeader onMenuToggle={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />

        <div className="flex-1 overflow-y-auto px-4 sm:px-7 pt-4 sm:pt-6 pb-32 lg:pb-32" style={{ background: "linear-gradient(to bottom, var(--muted), var(--card))" }}>
          {/* Welcome */}
          <div className="flex items-start gap-3 mb-6 sm:mb-8">
            <span className="mt-2 h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                Welcome back, {user?.name?.split(" ")[0] || "Teacher"}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Here&apos;s your assessment overview.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">
                          {card.label}
                        </span>
                        <div className={`h-9 w-9 rounded-full ${card.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-3 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                        {card.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 sm:mt-8 flex gap-4">
                <Link href="/create">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition cursor-pointer">
                    <Plus className="h-4 w-4" />
                    New Assignment
                  </button>
                </Link>
                <Link href="/assignments">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-sm font-semibold px-5 py-2.5 hover:bg-[var(--hover)] transition cursor-pointer">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              {/* Recent */}
              <div className="mt-6 sm:mt-8 mb-20 lg:mb-0">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
                  Recent Assignments
                </h2>
                {recent.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-2xl">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No assignments yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recent.map((a) => (
                      <Link key={a._id} href={`/output/${a._id}`}>
                        <div className="flex items-center justify-between bg-[var(--card)] rounded-xl border border-[var(--border)] p-3 sm:p-4 hover:shadow-sm transition cursor-pointer">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-[var(--muted-foreground)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                                {a.title}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {a.numQuestions} questions &middot; {a.totalMarks} marks
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              a.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : a.status === "processing"
                                ? "bg-amber-100 text-amber-700"
                                : a.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
