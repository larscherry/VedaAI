"use client";

export default function MarksBadge({ marks }: { marks: number }) {
  return (
    <span className="text-xs text-slate-600">
      [{marks} {marks === 1 ? "Mark" : "Marks"}]
    </span>
  );
}
