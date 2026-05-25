"use client";

interface AnswerKeyProps {
  answers: string[];
}

export default function AnswerKey({ answers }: AnswerKeyProps) {
  return (
    <div className="mx-auto max-w-3xl mt-6">
      <hr className="border-slate-300" />
      <h2 className="mt-6 text-center text-lg font-bold underline underline-offset-4 font-serif">
        Answer Key
      </h2>
      <ol className="mt-4 space-y-3 text-xs leading-relaxed list-decimal pl-5 font-serif">
        {answers.map((a, i) => (
          <li key={i} className="whitespace-pre-line">{a}</li>
        ))}
      </ol>
    </div>
  );
}
