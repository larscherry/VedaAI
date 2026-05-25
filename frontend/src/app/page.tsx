"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import {
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { Assignment } from "@/types";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
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
    <div className="min-h-screen bg-[#e8e8ea] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden relative">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-32 bg-gradient-to-b from-[#f5f5f7] to-white">
          {/* Welcome */}
          <div className="flex items-start gap-3 mb-8">
            <span className="mt-2 h-3 w-3 rounded-full bg-[#22c55e]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">
                Welcome back, {user?.name?.split(" ")[0] || "Teacher"}
              </h1>
              <p className="text-sm text-[#8a8a90] mt-1">
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
              <div className="grid grid-cols-3 gap-5">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="bg-white rounded-2xl border border-[#ececf0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#8a8a90]">
                          {card.label}
                        </span>
                        <div className={`h-9 w-9 rounded-full ${card.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-[#1a1a1a]">
                        {card.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 flex gap-4">
                <Link href="/create">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 hover:bg-black transition cursor-pointer">
                    <Plus className="h-4 w-4" />
                    New Assignment
                  </button>
                </Link>
                <Link href="/assignments">
                  <button className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e5e7] text-[#1a1a1a] text-sm font-semibold px-5 py-2.5 hover:bg-[#f7f7f8] transition cursor-pointer">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              {/* Recent */}
              <div className="mt-8">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
                  Recent Assignments
                </h2>
                {recent.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#e5e5e7] rounded-2xl">
                    <p className="text-sm text-[#8a8a90]">
                      No assignments yet. Create your first one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recent.map((a) => (
                      <Link key={a._id} href={`/output/${a._id}`}>
                        <div className="flex items-center justify-between bg-white rounded-xl border border-[#ececf0] p-4 hover:shadow-sm transition cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#f3f3f4] flex items-center justify-center">
                              <FileText className="h-4 w-4 text-[#6b6b70]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1a1a1a]">
                                {a.title}
                              </p>
                              <p className="text-xs text-[#8a8a90]">
                                {a.numQuestions} questions &middot; {a.totalMarks} marks
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
    </div>
  );
}
