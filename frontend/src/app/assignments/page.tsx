"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Filter, Search, MoreVertical, Plus, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import type { Assignment } from "@/types";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssignments = () => {
    api
      .getAssignments()
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenu(null);
    if (!confirm("Delete this assignment? This cannot be undone.")) return;
    try {
      await api.deleteAssignment(id);
      fetchAssignments();
    } catch {}
  };

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#e8e8ea] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden relative">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-32 bg-gradient-to-b from-[#f5f5f7] to-white">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-[#22c55e]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Assignments</h1>
              <p className="text-sm text-[#8a8a90] mt-1">
                Manage and create assignments for your classes.
              </p>
            </div>
          </div>

          {/* Filter / Search */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button className="flex items-center gap-2 text-sm text-[#6b6b70] hover:text-[#1a1a1a] cursor-pointer">
              <Filter className="h-4 w-4" />
              Filter By
            </button>
            <div className="relative w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0a8]" />
              <input
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-full bg-[#f3f3f4] pl-10 pr-4 text-sm placeholder:text-[#a0a0a8] outline-none focus:ring-2 focus:ring-[#E94E1B]/30"
              />
            </div>
          </div>

          {/* Cards grid */}
          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {searchQuery ? "No assignments match your search" : "No assignments yet"}
              </p>
              {!searchQuery && (
                <Link href="/create">
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 hover:bg-black transition cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Create Your First Assignment
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="relative bg-white rounded-2xl border border-[#ececf0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(`/output/${a._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-extrabold text-[#1a1a1a] underline underline-offset-4 decoration-1">
                      {a.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === a._id ? null : a._id);
                      }}
                      className="p-1 text-[#8a8a90] hover:text-[#1a1a1a] cursor-pointer"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-12 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#1a1a1a]">
                      Assigned on:{" "}
                      <span className="font-normal text-[#6b6b70]">
                        {new Date(a.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </span>
                    <span className="font-semibold text-[#1a1a1a]">
                      Due:{" "}
                      <span className="font-normal text-[#6b6b70]">
                        {new Date(a.dueDate).toLocaleDateString("en-GB")}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
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
                    <span className="text-xs text-[#8a8a90]">
                      {a.numQuestions} questions &middot; {a.totalMarks} marks
                    </span>
                  </div>

                  {openMenu === a._id && (
                    <div className="absolute top-12 right-6 w-44 bg-white rounded-xl shadow-xl border border-[#ececf0] py-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/output/${a._id}`);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f7f7f8] cursor-pointer"
                      >
                        View Assignment
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, a._id)}
                        className="w-full text-left px-4 py-2 text-sm text-[#E94E1B] hover:bg-[#fef2ee] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Create button */}
        <Link href="/create">
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <button className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-6 py-3.5 shadow-2xl hover:bg-black transition cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Assignment
            </button>
          </div>
        </Link>
      </main>
    </div>
  );
}
