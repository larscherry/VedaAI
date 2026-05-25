import OpenAI from "openai";
import { env } from "../config/env";
import { generateMockPaper } from "./mockLlmService";

export interface GeneratedQuestion {
  number: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  sections: GeneratedSection[];
  answerKey?: string[];
}

function validatePaper(paper: any): paper is GeneratedPaper {
  if (!paper || typeof paper !== "object") return false;
  if (!Array.isArray(paper.sections) || paper.sections.length === 0) return false;

  for (const section of paper.sections) {
    if (!section.title || typeof section.title !== "string") return false;
    if (!section.instruction || typeof section.instruction !== "string") return false;
    if (!Array.isArray(section.questions) || section.questions.length === 0) return false;

    for (const q of section.questions) {
      if (typeof q.number !== "number") return false;
      if (typeof q.text !== "string" || q.text.trim() === "") return false;
      if (!["easy", "medium", "hard"].includes(q.difficulty)) return false;
      if (typeof q.marks !== "number" || q.marks <= 0) return false;
    }
  }

  return true;
}

export async function generateQuestionPaper(
  systemPrompt: string,
  userPrompt: string,
  apiKey?: string,
  fileContent?: string,
  useMock?: boolean,
  llmBaseUrl?: string,
  llmModel?: string
): Promise<GeneratedPaper> {
  const useMockLlm = useMock ?? env.USE_MOCK_LLM;

  if (useMockLlm) {
    const subjectMatch = userPrompt.match(/Subject: (.+)/);
    const classMatch = userPrompt.match(/Class: (.+)/);
    const titleMatch = userPrompt.match(/Title: (.+)/);
    const typesMatch = userPrompt.match(/Question Types: (.+)/);
    const numMatch = userPrompt.match(/Total Questions: (\d+)/);
    const marksMatch = userPrompt.match(/Total Marks: (\d+)/);
    const instrMatch = userPrompt.match(/Additional Instructions: (.+?)(?:\n|$)/);

    return generateMockPaper({
      title: titleMatch?.[1] || "Test Paper",
      subject: subjectMatch?.[1] || "General",
      className: classMatch?.[1] || "X",
      questionTypes: typesMatch?.[1]?.split(", ") || ["General"],
      numQuestions: parseInt(numMatch?.[1] || "10"),
      totalMarks: parseInt(marksMatch?.[1] || "50"),
      fileContent,
      instructions: instrMatch?.[1],
    });
  }

  const key = apiKey || env.OPENAI_API_KEY;
  if (!key) throw new Error("No OpenAI API key available. Enable mock mode in Settings, or provide an API key.");

  const baseURL = llmBaseUrl || env.LLM_BASE_URL || undefined;
  const model = llmModel || env.LLM_MODEL || "gpt-4o-mini";
  const openai = new OpenAI({ apiKey: key, baseURL });

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse OpenAI response as JSON");
    }
  }

  if (!validatePaper(parsed)) {
    throw new Error("Generated paper failed schema validation");
  }

  return parsed as GeneratedPaper;
}
