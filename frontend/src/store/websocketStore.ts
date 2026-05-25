"use client";

import { create } from "zustand";
import type { WSMessage } from "@/types";

interface WebSocketState {
  ws: WebSocket | null;
  status: "idle" | "connecting" | "connected" | "disconnected";
  progress: { stage: string; percent: number } | null;
  isComplete: boolean;
  pdfReady: boolean;
  pdfUrl: string;
  error: string | null;

  connect: (assignmentId: string) => void;
  disconnect: () => void;
  reset: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ws: null,
  status: "idle",
  progress: null,
  isComplete: false,
  pdfReady: false,
  pdfUrl: "",
  error: null,

  connect: (assignmentId) => {
    const existing = get().ws;
    if (existing) existing.close();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://vedaai-backend-wxe5.onrender.com/api";
    const wsBase = apiUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");
    const ws = new WebSocket(`${wsBase}/ws?assignmentId=${assignmentId}`);

    ws.onopen = () => set({ status: "connected", error: null });
    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data);

        switch (data.type) {
          case "job:progress":
            set({ progress: { stage: data.stage || "", percent: data.percent || 0 }, error: null });
            break;
          case "job:completed":
            set({ isComplete: true, progress: { stage: "complete", percent: 100 }, error: null });
            break;
          case "job:failed":
            set({ error: data.error || "Generation failed", status: "disconnected", progress: null });
            break;
          case "pdf:ready":
            set({ pdfReady: true, pdfUrl: data.url || "" });
            break;
          case "pdf:failed":
            set({ error: data.error || "PDF generation failed" });
            break;
          case "connected":
            break;
        }
      } catch {
        // ignore parse errors
      }
    };
    ws.onclose = () => set({ status: "disconnected" });
    ws.onerror = () => set({ error: "WebSocket connection error" });

    set({ ws, status: "connecting", isComplete: false, pdfReady: false, error: null, progress: null });
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) ws.close();
    set({ ws: null, status: "disconnected" });
  },

  reset: () => {
    const { ws } = get();
    if (ws) ws.close();
    set({
      ws: null,
      status: "idle",
      progress: null,
      isComplete: false,
      pdfReady: false,
      pdfUrl: "",
      error: null,
    });
  },
}));
