"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface StatusTrackerProps {
  progress: { stage: string; percent: number } | null;
  error: string | null;
  isComplete: boolean;
}

const stageLabels: Record<string, string> = {
  generating: "Generating questions with AI...",
  parsing: "Parsing and validating response...",
  saving: "Saving to database...",
  complete: "Question paper ready!",
};

export default function StatusTracker({ progress, error, isComplete }: StatusTrackerProps) {
  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">Generation failed</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-700">Question paper generated successfully!</p>
          <p className="text-xs text-green-500">Redirecting to output page...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
          <p className="text-sm font-medium text-blue-700">Connecting to generation service...</p>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: "10%" }} />
        </div>
      </div>
    );
  }

  const stageText = stageLabels[progress.stage] || "Processing...";

  return (
    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div className="flex items-center gap-3 mb-3">
        <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
        <p className="text-sm font-medium text-blue-700">{stageText}</p>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
