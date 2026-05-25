"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { Sparkles, FileText, BookOpen, BarChart3, ArrowRight } from "lucide-react";

const tools = [
  {
    icon: FileText,
    title: "Question Paper Generator",
    desc: "Create custom question papers with AI in seconds.",
    link: "/create",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Lesson Plan Creator",
    desc: "Generate structured lesson plans aligned to your curriculum.",
    link: "#",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    coming: true,
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Analyze student performance and identify learning gaps.",
    link: "#",
    color: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    coming: true,
  },
];

export default function ToolkitPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] lg:p-3 lg:flex lg:gap-3">
      <Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} />
      <main className="flex-1 lg:bg-[var(--card)] lg:rounded-2xl lg:flex lg:flex-col lg:overflow-hidden">
        <Topbar />
        <MobileHeader onMenuToggle={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
        <div className="flex-1 overflow-y-auto px-4 sm:px-7 pt-4 sm:pt-6 pb-32 lg:pb-16" style={{ background: "linear-gradient(to bottom, var(--muted), var(--card))" }}>
          <div className="flex items-start gap-3 mb-6 sm:mb-8">
            <span className="mt-2 h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">AI Teacher&apos;s Toolkit</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Access AI-powered tools for teaching and assessment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.title} href={t.link}>
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 sm:p-6 hover:shadow-md transition cursor-pointer">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${t.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-[var(--foreground)]">{t.title}</h3>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--muted-foreground)]">{t.desc}</p>
                    <div className="mt-3 sm:mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--brand)]">
                      {t.coming ? "Coming Soon" : "Open Tool"}
                      {!t.coming && <ArrowRight className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
