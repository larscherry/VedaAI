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
    <div className="min-h-screen bg-[#e8e8ea] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden relative">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-32 bg-gradient-to-b from-[#f5f5f7] to-white">
          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
            </div>
          ) : !group ? (
            <div className="mt-20 text-center text-sm text-gray-500">Group not found</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push("/groups")} className="p-1 cursor-pointer">
                  <ArrowLeft className="h-5 w-5 text-[#6b6b70]" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-[#1a1a1a]">{group.name}</h1>
                  {group.description && (
                    <p className="text-sm text-[#8a8a90]">{group.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-[#6b6b70]">
                  <Users className="h-4 w-4 inline mr-1" />
                  {group.students.length} student{group.students.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-4 py-2 hover:bg-black transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </button>
              </div>

              {group.students.length === 0 ? (
                <div className="mt-8 text-center py-12 border border-dashed border-[#e5e5e7] rounded-2xl">
                  <Users className="h-8 w-8 text-[#8a8a90] mx-auto" />
                  <p className="mt-2 text-sm text-[#8a8a90]">No students yet</p>
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#ececf0]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f7f7f8] text-left text-[#6b6b70]">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Roll Number</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.students.map((s) => (
                        <tr key={s.rollNumber} className="border-t border-[#ececf0]">
                          <td className="px-4 py-3 text-[#1a1a1a] font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-[#6b6b70]">{s.rollNumber}</td>
                          <td className="px-4 py-3 text-[#6b6b70]">{s.email || "—"}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemove(s.rollNumber)}
                              className="p-1 text-[#8a8a90] hover:text-red-500 cursor-pointer"
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
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h2 className="text-lg font-bold mb-4">Add Student</h2>
              <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Student name" className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 mb-3" />
              <input value={sRoll} onChange={(e) => setSRoll(e.target.value)} placeholder="Roll number" className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 mb-3" />
              <input value={sEmail} onChange={(e) => setSEmail(e.target.value)} placeholder="Email (optional)" className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-11 rounded-full border border-[#e5e5e7] text-sm font-medium hover:bg-[#f7f7f8] transition cursor-pointer">Cancel</button>
                <button onClick={handleAdd} className="flex-1 h-11 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-black transition cursor-pointer">Add</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
