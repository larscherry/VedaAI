"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { api } from "@/services/api";
import { Users, Plus, Loader2, MoreVertical, UserPlus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Group {
  _id: string;
  name: string;
  description: string;
  students: { name: string; rollNumber: string; email: string }[];
  createdAt: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchGroups = () => {
    setLoading(true);
    api.getGroups().then(setGroups).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await api.createGroup({ name: newName, description: newDesc });
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    fetchGroups();
  };

  const handleDelete = async (id: string) => {
    await api.deleteGroup(id);
    fetchGroups();
  };

  return (
    <div className="min-h-screen bg-[#e8e8ea] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden relative">
        <Topbar />

        <div className="flex-1 overflow-y-auto px-7 pt-6 pb-32 bg-gradient-to-b from-[#f5f5f7] to-white">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-[#22c55e]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">My Groups</h1>
              <p className="text-sm text-[#8a8a90] mt-1">Manage your class groups and student rosters.</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
            </div>
          ) : groups.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-4 text-sm text-gray-500">No groups yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-2.5 hover:bg-black transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {groups.map((g) => (
                <div
                  key={g._id}
                  className="relative bg-white rounded-2xl border border-[#ececf0] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(`/groups/${g._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#1a1a1a]">{g.name}</h3>
                        {g.description && (
                          <p className="text-xs text-[#8a8a90]">{g.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === g._id ? null : g._id); }}
                      className="p-1 text-[#8a8a90] hover:text-[#1a1a1a] cursor-pointer"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-4 text-sm text-[#6b6b70]">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {g.students.length} students
                    </span>
                    <span>
                      Created {new Date(g.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {openMenu === g._id && (
                    <div className="absolute top-12 right-6 w-44 bg-white rounded-xl shadow-xl border border-[#ececf0] py-2 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/groups/${g._id}`); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f7f7f8] cursor-pointer"
                      >
                        <UserPlus className="h-3.5 w-3.5 inline mr-2" />
                        Manage Students
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(g._id); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add card */}
              <div
                onClick={() => setShowCreate(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-[#e5e5e7] p-6 flex items-center justify-center hover:border-[#E94E1B] hover:bg-[#fef2ee] transition cursor-pointer"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 text-[#8a8a90] mx-auto" />
                  <p className="mt-2 text-sm font-medium text-[#8a8a90]">Create New Group</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">New Group</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 cursor-pointer"><X className="h-5 w-5 text-[#8a8a90]" /></button>
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Group name"
                className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 mb-3"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 mb-4"
              />
              <button onClick={handleCreate} className="w-full h-11 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-black transition cursor-pointer">
                Create Group
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
