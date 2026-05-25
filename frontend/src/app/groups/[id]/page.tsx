"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { api } from "@/services/api";
import { ArrowLeft, Plus, Trash2, Loader2, Users } from "lucide-react";

interface Student {
  name: string;
  rollNumber: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  students: Student[];
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [sName, setSName] = useState("");
  const [sRoll, setSRoll] = useState("");
  const [sEmail, setSEmail] = useState("");

  const fetchGroup = () => {
    if (!id) return;
    api.getGroup(id).then(setGroup).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroup(); }, [id]);

  const handleAdd = async () => {
    if (!sName.trim() || !sRoll.trim()) return;
    await api.addStudent(id, { name: sName, rollNumber: sRoll, email: sEmail });
    setShowAdd(false);
    setSName("");
    setSRoll("");
    setSEmail("");
    fetchGroup();
  };

  const handleRemove = async (rollNumber: string) => {
    await api.removeStudent(id, rollNumber);
    fetchGroup();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-[var(--card)] rounded-2xl flex flex-col overflow-hidden relative">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-32" style={{ background: "linear-gradient(to bottom, var(--muted), var(--card))" }}>
          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
            </div>
          ) : !group ? (
            <div className="mt-20 text-center text-sm text-[var(--muted-foreground)]">Group not found</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push("/groups")} className="p-1 cursor-pointer">
                  <ArrowLeft className="h-5 w-5 text-[var(--muted-foreground)]" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">{group.name}</h1>
                  {group.description && (
                    <p className="text-sm text-[var(--muted-foreground)]">{group.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">
                  <Users className="h-4 w-4 inline mr-1" />
                  {group.students.length} student{group.students.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold px-4 py-2 hover:opacity-90 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </button>
              </div>

              {group.students.length === 0 ? (
                <div className="mt-8 text-center py-12 border border-dashed border-[var(--border)] rounded-2xl">
                  <Users className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">No students yet</p>
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--hover)] text-left text-[var(--muted-foreground)]">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Roll Number</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.students.map((s) => (
                        <tr key={s.rollNumber} className="border-t border-[var(--border)]">
                          <td className="px-4 py-3 text-[var(--foreground)] font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)]">{s.rollNumber}</td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)]">{s.email || "—"}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemove(s.rollNumber)}
                              className="p-1 text-[var(--muted-foreground)] hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Student Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-[var(--card)] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h2 className="text-lg font-bold mb-4">Add Student</h2>
              <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Student name" className="w-full h-11 rounded-xl bg-[var(--hover)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/30 mb-3" />
              <input value={sRoll} onChange={(e) => setSRoll(e.target.value)} placeholder="Roll number" className="w-full h-11 rounded-xl bg-[var(--hover)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/30 mb-3" />
              <input value={sEmail} onChange={(e) => setSEmail(e.target.value)} placeholder="Email (optional)" className="w-full h-11 rounded-xl bg-[var(--hover)] border border-[var(--border)] px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/30 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-11 rounded-full border border-[var(--border)] text-sm font-medium hover:bg-[var(--hover)] transition cursor-pointer">Cancel</button>
                <button onClick={handleAdd} className="flex-1 h-11 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold hover:opacity-90 transition cursor-pointer">Add</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
