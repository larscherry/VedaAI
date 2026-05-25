"use client";

import type { QuestionPaper as QuestionPaperType } from "@/types";
import QuestionSection from "./QuestionSection";
import StudentInfo from "./StudentInfo";
import { useAuthStore } from "@/store/authStore";

interface QuestionPaperProps {
  paper: QuestionPaperType;
}

export default function QuestionPaper({ paper }: QuestionPaperProps) {
  const user = useAuthStore((s) => s.user);
  const school = user?.school || "Delhi Public School, Sector-4, Bokaro";

  const sections = paper?.sections ?? [];
  const totalMarks = sections.reduce(
    (sum, s) => sum + (s.questions ?? []).reduce((sq, q) => sq + (q.marks ?? 0), 0),
    0
  );

  return (
    <article className="mx-auto max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-inner font-serif text-slate-900">
      <header className="text-center">
        <h1 className="text-2xl font-bold">{school}</h1>
        <p className="mt-2 text-sm">First Terminal Examination, 2025-26</p>
      </header>

      <div className="mt-4 text-sm leading-relaxed">
        <p>
          <span className="font-semibold">Subject</span> : {paper?.subject || "General"}
          <span className="float-right">
            <span className="font-semibold">Class</span> : {paper?.className || "___________"}
          </span>
        </p>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <span>Time Allowed : 45 Minutes</span>
        <span>Maximum Marks : {totalMarks}</span>
      </div>

      <div className="mt-5">
        <StudentInfo className={paper?.className} />
      </div>

      {sections.map((section, idx) => (
        <QuestionSection key={section.title} section={section} index={idx} />
      ))}

      <p className="mt-6 text-sm font-semibold text-center">— End of Question Paper —</p>
    </article>
  );
}
