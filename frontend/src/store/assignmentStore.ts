"use client";

import { create } from "zustand";

interface AssignmentFormState {
  title: string;
  dueDate: string;
  questionTypes: string[];
  numQuestions: string;
  totalMarks: string;
  instructions: string;
  file: File | null;
  errors: Record<string, string>;
  isSubmitting: boolean;
  assignmentId: string | null;

  setField: (key: string, value: string) => void;
  setFile: (file: File | null) => void;
  toggleQuestionType: (type: string) => void;
  validate: () => boolean;
  setSubmitting: (v: boolean) => void;
  setAssignmentId: (id: string) => void;
  reset: () => void;
}

const initial = {
  title: "",
  dueDate: "",
  questionTypes: [] as string[],
  numQuestions: "",
  totalMarks: "",
  instructions: "",
  file: null as File | null,
  errors: {} as Record<string, string>,
  isSubmitting: false,
  assignmentId: null as string | null,
};

export const useAssignmentStore = create<AssignmentFormState>((set, get) => ({
  ...initial,

  setField: (key, value) => {
    set({ [key]: value });
  },

  setFile: (file) => {
    set({ file });
  },

  toggleQuestionType: (type) => {
    const current = get().questionTypes;
    if (current.includes(type)) {
      set({ questionTypes: current.filter((t) => t !== type) });
    } else {
      set({ questionTypes: [...current, type] });
    }
  },

  validate: () => {
    const state = get();
    const errors: Record<string, string> = {};

    if (!state.title.trim()) errors.title = "Title is required";
    if (!state.dueDate) errors.dueDate = "Due date is required";
    else if (new Date(state.dueDate) < new Date(new Date().toDateString())) {
      errors.dueDate = "Due date must be in the future";
    }
    if (state.questionTypes.length === 0) errors.questionTypes = "Select at least one question type";
    if (!state.numQuestions || parseInt(state.numQuestions) < 1) errors.numQuestions = "Must be at least 1";
    if (!state.totalMarks || parseInt(state.totalMarks) < 1) errors.totalMarks = "Must be at least 1";

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  setSubmitting: (v) => set({ isSubmitting: v }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  reset: () => set({ ...initial }),
}));
