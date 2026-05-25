"use client";

import { Download } from "lucide-react";
import { api } from "@/services/api";

interface ActionBarProps {
  assignmentId: string;
}

export default function ActionBar({ assignmentId }: ActionBarProps) {
  const handleDownloadPdf = () => {
    window.open(api.getPdfUrl(assignmentId), "_blank");
  };

  return (
    <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-sm leading-relaxed max-w-3xl">
        Certainly! Here is the customized Question Paper for your class.
      </p>
      <button
        onClick={handleDownloadPdf}
        className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
      >
        <Download className="h-4 w-4" />
        Download as PDF
      </button>
    </div>
  );
}
