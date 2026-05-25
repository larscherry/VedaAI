"use client";

import type { Section } from "@/types";
import DifficultyBadge from "./DifficultyBadge";
import MarksBadge from "./MarksBadge";

interface QuestionSectionProps {
  section: Section;
  index: number;
}

export default function QuestionSection({ section, index }: QuestionSectionProps) {
  const totalMarks = section.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="mt-6">
      <h2 className="text-center text-lg font-bold underline underline-offset-4">
        {section.title}
      </h2>
      <p className="mt-4 text-sm font-semibold">Short Answer Questions</p>
      <p className="text-xs italic text-slate-600">Attempt all questions. Each question carries 2 marks.</p>

      <ol className="mt-4 space-y-3 text-sm list-decimal pl-5">
        {section.questions.map((q) => (
          <li key={q.number} className="leading-relaxed">
            <DifficultyBadge difficulty={q.difficulty} />{" "}
            {q.text}{" "}
            <MarksBadge marks={q.marks} />
          </li>
        ))}
      </ol>
    </div>
  );
}
