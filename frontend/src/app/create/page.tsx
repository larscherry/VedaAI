"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AssignmentForm from "@/components/AssignmentForm";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar />

        {/* Page Header */}
        <div className="mt-4 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-lg font-semibold">Create Assignment</h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] ml-4.5 mt-0.5">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-[var(--card)] backdrop-blur shadow-sm p-6 md:p-8 max-w-4xl mx-auto">
          <AssignmentForm />
        </div>
      </main>
    </div>
  );
}
