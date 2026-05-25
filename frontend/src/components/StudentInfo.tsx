"use client";

interface StudentInfoProps {
  className?: string;
}

export default function StudentInfo({ className }: StudentInfoProps) {
  return (
    <div className="space-y-2 text-sm">
      <p>
        Name:{" "}
        <span className="inline-block border-b border-gray-400 min-w-[250px]">&nbsp;</span>
        <span className="float-right">
          Roll Number:{" "}
          <span className="inline-block border-b border-gray-400 min-w-[120px]">&nbsp;</span>
        </span>
      </p>
      <p>
        Class:{" "}
        <span className="inline-block border-b border-gray-400 min-w-[100px]">
          {className ? `  ${className}  ` : "\u00a0"}
        </span>
        <span className="ml-8">
          Section:{" "}
          <span className="inline-block border-b border-gray-400 min-w-[100px]">&nbsp;</span>
        </span>
      </p>
    </div>
  );
}
