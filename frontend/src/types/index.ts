export interface User {
  _id: string;
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  school: string;
  location: string;
  className: string;
  apiKey: string;
  mockMode: boolean;
}

export interface Question {
  number: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  answerKey: string[];
  subject: string;
  className: string;
  createdAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  filePath: string | null;
  dueDate: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  instructions: string;
  subject: string;
  className: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface WSMessage {
  type: string;
  stage?: string;
  percent?: number;
  assignmentId?: string;
  error?: string;
  url?: string;
  fileName?: string;
}
