"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import QuestionPaper from "@/components/QuestionPaper";
import ActionBar from "@/components/ActionBar";
import AnswerKey from "@/components/AnswerKey";
import StatusTracker from "@/components/StatusTracker";
import { api } from "@/services/api";
import { useWebSocketStore } from "@/store/websocketStore";
import type { QuestionPaper as QuestionPaperType, Assignment } from "@/types";
import { FileText, Loader2, WifiOff } from "lucide-react";

export default function OutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [paper, setPaper] = useState<QuestionPaperType | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [wsOffline, setWsOffline] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { connect, disconnect, progress, isComplete, error: wsError, reset } = useWebSocketStore();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [paperData, assignmentData] = await Promise.all([
        api.getPaper(id),
        api.getAssignment(id),
      ]);

      setAssignment(assignmentData);

      if (assignmentData?.status === "failed") {
        setError("Question paper generation failed. Please try again.");
        setProcessing(false);
        stopPolling();
        return true;
      }

      if (paperData && paperData.sections) {
        setPaper(paperData);
        setProcessing(false);
        stopPolling();
        return true;
      }

      if (paperData && (paperData.status === "processing" || paperData.status === "pending")) {
        setProcessing(true);
        return false;
      }

      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [id, stopPolling]);

  useEffect(() => {
    fetchData();

    // Try WebSocket but don't block on it
    connect(id);

    // Poll as primary mechanism
    pollRef.current = setInterval(async () => {
      const done = await fetchData();
      if (done) stopPolling();
    }, 2000);

    return () => {
      disconnect();
      reset();
      stopPolling();
    };
  }, [id]);

  // WebSocket updates → re-fetch
  useEffect(() => {
    if (isComplete) {
      fetchData().finally(() => setIsRegenerating(false));
    }
  }, [isComplete]);

  // WebSocket error → just note it, don't treat as generation failure
  useEffect(() => {
    if (wsError) {
      setWsOffline(true);
    }
  }, [wsError]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setPaper(null);
    setError(null);
    setProcessing(true);
    setWsOffline(false);
    try {
      await api.regeneratePaper(id);
      connect(id);
    } catch (err: any) {
      setError(err.message);
      setIsRegenerating(false);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 flex gap-3">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading question paper...</p>
          </div>
        </main>
      </div>
    );
  }

  if (processing || (progress && !isComplete)) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 flex gap-3">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl">
          <div className="max-w-md w-full px-6">
            <StatusTracker progress={progress} error={null} isComplete={isComplete} />
            {wsOffline && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                <WifiOff className="h-3.5 w-3.5 shrink-0" />
                Live updates unavailable — checking every 2 seconds
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 flex gap-3">
        <Sidebar />
        <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden">
          <Topbar />
          <section className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <span className="text-2xl text-red-500">!</span>
              </div>
              <p className="mt-4 text-sm text-red-600">{error}</p>
              <button
                onClick={handleRegenerate}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-black text-white text-sm font-medium px-5 py-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 flex gap-3">
        <Sidebar />
        <main className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden">
          <Topbar />
          <section className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <FileText className="h-7 w-7 text-gray-400" />
              </div>
              <p className="mt-4 text-sm text-gray-500">Question paper not available</p>
              <button
                onClick={handleRegenerate}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-black text-white text-sm font-medium px-5 py-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Generate Now
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] p-3 flex gap-3">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar />

        <div className="mt-4">
          <ActionBar assignmentId={id} />
        </div>

        <section className="mt-4 rounded-2xl bg-white p-5 sm:p-8 shadow-sm">
          {paper && <QuestionPaper paper={paper} />}

          {paper && paper.answerKey && paper.answerKey.length > 0 && <AnswerKey answers={paper.answerKey} />}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRegenerating ? "Regenerating..." : "Regenerate Questions"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
