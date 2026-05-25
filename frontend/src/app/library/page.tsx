"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";
import { PieChart, FileText, Loader2, Search } from "lucide-react";
import Link from "next/link";
import type { Assignment } from "@/types";

export default function LibraryPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getAssignments().then(setAssignments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter(
    (a) =>
      a.status === "completed" &&
      a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#e8e8ea] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-16 bg-gradient-to-b from-[#f5f5f7] to-white">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-[#22c55e]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">My Library</h1>
              <p className="text-sm text-[#8a8a90] mt-1">Browse your completed question papers.</p>
            </div>
          </div>

          <div className="mt-6 relative w-[340px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a0a0a8]" />
            <input
              placeholder="Search papers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-full bg-[#f3f3f4] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30"
            />
          </div>

          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <PieChart className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {search ? "No completed papers match your search" : "No completed papers yet"}
              </p>
              {!search && (
                <Link href="/create">
                  <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 hover:bg-black transition cursor-pointer">
                    Create Your First Paper
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map((a) => (
                <Link key={a._id} href={`/output/${a._id}`}>
                  <div className="bg-white rounded-2xl border border-[#ececf0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 hover:shadow-md transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#1a1a1a]">{a.title}</h3>
                        <p className="text-xs text-[#8a8a90]">{a.numQuestions} questions · {a.totalMarks} marks</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#8a8a90]">
                      <span>{a.subject || "General"}</span>
                      {a.className && <span>· Class {a.className}</span>}
                      <span>· {new Date(a.createdAt).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
