"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  X,
  UploadCloud,
  Calendar,
  Mic,
  ChevronDown,
  ArrowLeft,
  WifiOff,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Stepper from "./Stepper";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useWebSocketStore } from "@/store/websocketStore";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import StatusTracker from "./StatusTracker";

interface QuestionRow {
  id: number;
  type: string;
  count: number;
  marks: number;
}

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True / False",
  "Fill in the Blanks",
];

export default function AssignmentForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(5);
  const user = useAuthStore((s) => s.user);

  const [rows, setRows] = useState<QuestionRow[]>([
    { id: 1, type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: 2, type: "Short Questions", count: 3, marks: 2 },
    { id: 3, type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: 4, type: "Numerical Problems", count: 5, marks: 5 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [info, setInfo] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState(user?.className || "");
  const [subject, setSubject] = useState(user?.subject || "");
  const [submitError, setSubmitError] = useState("");

  const {
    isSubmitting,
    assignmentId,
    setSubmitting,
    setAssignmentId,
    reset: resetAssignment,
  } = useAssignmentStore();

  const {
    connect,
    disconnect,
    progress,
    isComplete,
    error: wsError,
  } = useWebSocketStore();

  const { totalQ, totalM } = useMemo(() => {
    return {
      totalQ: rows.reduce((s, r) => s + r.count, 0),
      totalM: rows.reduce((s, r) => s + r.count * r.marks, 0),
    };
  }, [rows]);

  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: nextId.current++, type: QUESTION_TYPES[0], count: 1, marks: 1 },
    ]);

  const removeRow = (id: number) =>
    setRows((r) => r.filter((row) => row.id !== id));

  const updateRow = (id: number, patch: Partial<QuestionRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((f) => [...f, ...dropped]);
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [wsOffline, setWsOffline] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!dueDate) errs.dueDate = "Due date is required";
    if (rows.length === 0) errs.rows = "Add at least one question type";
    if (rows.some((r) => r.count < 1)) errs.rows = "Each question type must have at least 1 question";
    if (totalQ === 0) errs.rows = "Total questions must be at least 1";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setSubmitError("");
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("dueDate", new Date(dueDate).toISOString());
    formData.append("questionTypes", JSON.stringify(rows.map((r) => r.type)));
    formData.append("numQuestions", String(totalQ));
    formData.append("totalMarks", String(totalM));
    formData.append("instructions", info);
    formData.append("subject", subject);
    formData.append("className", className);
    if (files[0]) formData.append("file", files[0]);

    try {
      const result = await api.createAssignment(formData);
      if (result.status === "completed") {
        router.push(`/output/${result.assignmentId}`);
        return;
      }
      setAssignmentId(result.assignmentId);
      connect(result.assignmentId);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create assignment");
      setSubmitting(false);
    }
  }, [title, dueDate, rows, totalQ, totalM, info, subject, className, files, setSubmitting, setAssignmentId, connect]);

  // Polling fallback when assignmentId is set
  useEffect(() => {
    if (!assignmentId) return;

    setLocalError(null);
    setWsOffline(false);

    const poll = async () => {
      try {
        const a = await api.getAssignment(assignmentId);
        if (a.status === "completed") {
          useWebSocketStore.setState({ isComplete: true });
          clearInterval(pollRef.current!);
          pollRef.current = null;
        } else if (a.status === "failed") {
          setLocalError(a.error || "Generation failed");
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
      } catch {}
    };

    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [assignmentId]);

  // Track WebSocket offline
  useEffect(() => {
    if (wsError) setWsOffline(true);
  }, [wsError]);

  if (assignmentId) {
    if (isComplete) {
      setTimeout(() => {
        disconnect();
        resetAssignment();
        router.push(`/output/${assignmentId}`);
      }, 500);
    }

    return (
      <div className="max-w-lg mx-auto w-full py-8 space-y-3">
        <StatusTracker progress={progress} error={localError || wsError} isComplete={isComplete} />
        {wsOffline && !isComplete && !localError && !wsError && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            Live updates unavailable — checking every 2 seconds
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-emerald-500 rounded-full transition-all" />
      </div>

      {/* Assignment Details Header */}
      <div>
        <h2 className="text-base font-semibold">Assignment Details</h2>
        <p className="text-xs text-gray-500">Basic information about your assignment</p>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: "" })); }}
          placeholder="Assignment title"
          className={`w-full rounded-xl border ${fieldErrors.title ? "border-red-400" : "border-gray-200"} bg-[var(--card)] px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors`}
        />
        {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
      </div>

      {/* Subject + Class row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Mathematics"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-[var(--card)] px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Class</label>
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. XII"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-[var(--card)] px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
          />
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-orange-400 bg-orange-50"
            : "border-gray-300 bg-gray-50/50 hover:border-orange-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={(e) =>
            setFiles((f) => [...f, ...Array.from(e.target.files ?? [])])
          }
        />
        <div className="mx-auto h-10 w-10 rounded-full bg-[var(--card)] shadow-sm grid place-items-center mb-3">
          <UploadCloud size={20} className="text-gray-500" />
        </div>
        <p className="text-sm font-medium">
          Choose a file or drag & drop it here
        </p>
        <p className="text-xs text-gray-400 mt-0.5">PDF, TXT, MD, DOC, DOCX, JPG, PNG &middot; upto 10 MB</p>
        <button
          type="button"
          className="mt-4 px-4 py-1.5 rounded-lg bg-[var(--card)] border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Browse Files
        </button>
        {files.length > 0 && (
          <p className="mt-3 text-xs text-emerald-600">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
      <p className="text-center text-xs text-gray-400 -mt-4">
        Upload images of your preferred document/image
      </p>

      {/* Due Date */}
      <div>
        <label className="text-sm font-medium">Due Date</label>
        <div className="mt-2 relative">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => { setDueDate(e.target.value); setFieldErrors((p) => ({ ...p, dueDate: "" })); }}
            className={`w-full rounded-xl border ${fieldErrors.dueDate ? "border-red-400" : "border-gray-200"} bg-[var(--card)] px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors`}
          />
          <Calendar
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        {fieldErrors.dueDate && <p className="text-xs text-red-500 mt-1">{fieldErrors.dueDate}</p>}
      </div>

      {/* Question Type Table Header */}
      <div>
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 mb-2 px-1">
          <div className="col-span-7">Question Type</div>
          <div className="col-span-3 text-center">No. of Questions</div>
          <div className="col-span-2 text-center">Marks</div>
        </div>

        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-7 flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(row.id, { type: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-[var(--card)] px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors cursor-pointer"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="h-8 w-8 grid place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <Stepper
                className="col-span-3"
                value={row.count}
                onChange={(v) => updateRow(row.id, { count: v })}
                min={0}
              />
              <Stepper
                className="col-span-2"
                value={row.marks}
                onChange={(v) => updateRow(row.id, { marks: v })}
                min={1}
              />
            </div>
          ))}
        </div>

        {fieldErrors.rows && <p className="text-xs text-red-500 mt-1">{fieldErrors.rows}</p>}

        <button
          type="button"
          onClick={addRow}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <span className="h-6 w-6 grid place-items-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
            <Plus size={14} />
          </span>
          Add Question Type
        </button>

        <div className="mt-4 text-right text-sm space-y-0.5">
          <div>
            <span className="text-gray-500">Total Questions: </span>
            <span className="font-semibold">{totalQ}</span>
          </div>
          <div>
            <span className="text-gray-500">Total Marks: </span>
            <span className="font-semibold">{totalM}</span>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div>
        <label className="text-sm font-medium">
          Additional Information (For better output)
        </label>
        <div className="mt-2 relative">
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            rows={3}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            className="w-full rounded-xl border border-gray-200 bg-[var(--card)] px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none transition-colors"
          />
          <button
            type="button"
            className="absolute right-3 bottom-3 h-7 w-7 grid place-items-center rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-colors cursor-pointer"
          >
            <Mic size={14} />
          </button>
        </div>
      </div>

      {/* Error message */}
      {submitError && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{submitError}</p>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/assignments")}
          className="px-6 py-2.5 rounded-full bg-[var(--card)] shadow-sm text-sm font-medium flex items-center gap-2 hover:shadow-md transition-shadow cursor-pointer"
        >
          <ArrowLeft size={14} /> Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Generating..." : "Generate"} <span className="text-base leading-none">→</span>
        </button>
      </div>
    </div>
  );
}
