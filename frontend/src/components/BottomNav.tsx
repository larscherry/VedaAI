"use client";

import { Home, ClipboardList, BookOpen, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { key: "home", label: "Home", icon: Home, route: "/" },
  { key: "assignments", label: "Assignments", icon: ClipboardList, route: "/assignments" },
  { key: "library", label: "Library", icon: BookOpen, route: "/library" },
  { key: "toolkit", label: "AI Toolkit", icon: Sparkles, route: "/toolkit" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <Link href="/create">
        <button className="fixed bottom-24 right-5 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/40 active:scale-95 transition lg:hidden">
          <Plus className="w-6 h-6" />
        </button>
      </Link>

      <nav className="fixed bottom-4 left-4 right-4 z-30 bg-neutral-900/95 backdrop-blur rounded-3xl px-2 py-2 flex items-center justify-around shadow-xl lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          return (
            <Link key={item.key} href={item.route} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-pink-400" : ""}`} />
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
