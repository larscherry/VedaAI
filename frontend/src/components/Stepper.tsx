"use client";

import { Minus, Plus } from "lucide-react";

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  className?: string;
}

export default function Stepper({ value, onChange, min = 0, className = "" }: StepperProps) {
  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-6 w-6 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
      >
        <Minus size={12} />
      </button>
      <span className="text-sm font-medium tabular-nums min-w-[20px] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-6 w-6 grid place-items-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
