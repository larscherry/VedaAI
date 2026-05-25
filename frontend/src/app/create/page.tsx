"use client";

"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import AssignmentForm from "@/components/AssignmentForm";

export default function CreatePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:p-3 lg:flex lg:gap-3">
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} />
      <main className="flex-1 min-w-0 lg:mb-0">
        <Topbar />
        <MobileHeader onMenuToggle={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />

        <div className="px-4 sm:px-7 pt-4 sm:pt-6 pb-32 lg:pb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold">Create Assignment</h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4 ml-4.5">
            Set up a new assignment for your students
          </p>

          <div className="rounded-3xl bg-[var(--card)] backdrop-blur shadow-sm p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <AssignmentForm />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
