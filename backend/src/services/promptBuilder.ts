interface PromptInput {
  title: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  instructions: string;
  subject?: string;
  className?: string;
  fileContent?: string;
}

export function buildPrompt(input: PromptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const types = input.questionTypes.join(", ");

  const systemPrompt = `You are an expert exam question paper generator. You create well-structured, pedagogically sound question papers.

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const fileContext = input.fileContent
    ? `\n\nUse the following source material for context:\n${input.fileContent}`
    : "";

  const userPrompt = `Generate a question paper with the following specifications:

Title: ${input.title}
Subject: ${input.subject || "General"}
Class: ${input.className || "General"}
Question Types: ${types}
Total Questions: ${input.numQuestions}
Total Marks: ${input.totalMarks}
Time Allowed: 45 minutes
${input.instructions ? `Additional Instructions: ${input.instructions}` : ""}${fileContext}

Divide the questions into sections (A, B, C, etc.). Each section should have a clear theme and equal distribution of marks.

For each question, assign a difficulty level:
- "easy" (basic recall/understanding)
- "medium" (application/analysis)
- "hard" (evaluation/creation)

Return JSON in this exact structure:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "number": 1,
          "text": "Full question text here",
          "difficulty": "easy",
          "marks": 5
        }
      ]
    }
  ],
  "answerKey": [
    "1. Answer for question 1",
    "2. Answer for question 2"
  ]
}

Rules:
- Total marks across all questions must equal ${input.totalMarks}
- Generate exactly ${input.numQuestions} questions total
- Distribute questions across sections (2-4 sections recommended)
- Mix difficulties (roughly 40% easy, 35% medium, 25% hard)
- Questions must be appropriate for ${types} type
- Each question number must be unique across the entire paper
- Provide a detailed answer for every question in the answerKey array`;
  return { systemPrompt, userPrompt };
}
