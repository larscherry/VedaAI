"use client";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
}

const config = {
  easy: { label: "Easy", className: "text-emerald-600" },
  medium: { label: "Moderate", className: "text-amber-600" },
  hard: { label: "Challenging", className: "text-rose-600" },
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const c = config[difficulty];
  return (
    <span className={`font-semibold text-xs ${c.className}`}>
      [{c.label}]
    </span>
  );
}
