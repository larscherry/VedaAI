"use client";

import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;

  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vedaai_token");
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("vedaai_user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Migrate missing fields
    if (user.mockMode === undefined) user.mockMode = true;
    if (user.apiKey === undefined) user.apiKey = "";
    if (user.llmBaseUrl === undefined) user.llmBaseUrl = "";
    if (user.llmModel === undefined) user.llmModel = "";
    return user;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  loading: false,

  setAuth: (token, user) => {
    localStorage.setItem("vedaai_token", token);
    localStorage.setItem("vedaai_user", JSON.stringify(user));
    set({ token, user, loading: false });
  },

  updateUser: (partial) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...partial } : null;
      if (updated) localStorage.setItem("vedaai_user", JSON.stringify(updated));
      return { user: updated };
    });
  },

  logout: () => {
    localStorage.removeItem("vedaai_token");
    localStorage.removeItem("vedaai_user");
    set({ token: null, user: null });
  },

  setLoading: (v) => set({ loading: v }),
}));
