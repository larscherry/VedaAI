import type { GeneratedPaper } from "./llmService";

const STOPWORDS = new Set([
  "this", "that", "with", "from", "have", "been", "were", "what", "which",
  "their", "them", "will", "about", "would", "could", "should", "there",
  "these", "those", "into", "over", "such", "than", "then", "when",
  "where", "while", "after", "before", "between", "through", "during",
  "above", "below", "under", "again", "further", "once", "very",
  "each", "other", "some", "more", "also", "just", "most", "only",
  "new", "good", "first", "last", "long", "great", "same", "different",
  "every", "still", "early", "well", "much", "many", "both", "here",
  "like", "made", "said", "part", "used", "known", "life", "work",
  "year", "hand", "area", "show", "come", "name", "need", "turn",
  "make", "take", "give", "find", "keep", "help", "move", "live",
  "call", "must", "even", "back", "tell", "next", "real", "down",
  "open", "high", "away", "left", "right", "still", "along", "does",
  "done", "lets", "type", "form", "word", "line", "end", "day", "way",
  "ask", "men", "set", "put", "say", "see", "get", "let", "can",
  "also", "too", "using", "based", "text", "file", "part", "question",
  "paper", "answer", "list", "share", "following", "false", "true",
  "identify", "name", "marks", "mark", "section", "total", "general",
  "instructions", "instruction", "example", "generate", "genrate",
  "provided", "source", "material", "attempt", "carries", "equal",
  "choose", "correct", "option", "applicable", "detailed", "explanations",
  "short", "long", "multiple", "choice", "numerical", "problems",
  "diagram", "graph", "fill", "blanks",
]);

function pickDifficulty(index: number, total: number): "easy" | "medium" | "hard" {
  const ratio = index / total;
  if (ratio < 0.4) return "easy";
  if (ratio < 0.75) return "medium";
  return "hard";
}

function looksLikeEnglishWord(word: string): boolean {
  if (word.length < 4) return false;
  if (!/[aeiouy]/i.test(word)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(word)) return false;
  if (/(.)\1{3,}/.test(word)) return false;
  return true;
}

function isStopword(word: string): boolean {
  return STOPWORDS.has(word.toLowerCase());
}

function extractTopics(fileContent?: string, subject?: string, instructions?: string): string[] {
  const topics: string[] = [];

  // Always use the subject if it's specific
  if (subject && subject.toLowerCase() !== "general" && subject !== "") {
    topics.push(subject);
  }

  // Extract from instructions
  if (instructions) {
    const words = instructions
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && looksLikeEnglishWord(w) && !isStopword(w))
      .map((w) => w.toLowerCase());
    topics.push(...words);
  }

  // Extract from file content
  if (fileContent) {
    const words = fileContent
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => looksLikeEnglishWord(w) && !isStopword(w))
      .map((w) => w.toLowerCase());

    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    const sorted = [...new Set(words)]
      .filter((w) => freq[w] >= 2 || topics.some((t) => t.toLowerCase() === w))
      .sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
    topics.push(...sorted);
  }

  return [...new Set(topics)].slice(0, 12);
}

function generateQuestionText(
  number: number,
  questionType: string,
  subject: string,
  difficulty: string,
  topics: string[]
): string {
  const primaryTopic = topics.length > 0
    ? topics[number % topics.length]
    : (subject && subject.toLowerCase() !== "general" ? subject.toLowerCase() : "the given topic");

  const subjectContext = subject && subject.toLowerCase() !== "general" ? subject.toLowerCase() : "this subject";

  const easyQs = [
    `What is ${primaryTopic}? Explain with an example.`,
    `Define "${primaryTopic}" in your own words.`,
    `List any four key characteristics of ${primaryTopic}.`,
    `What is the main purpose of ${primaryTopic}?`,
    `Explain the basic concept of ${primaryTopic}.`,
    `Name the primary components of ${primaryTopic}.`,
    `How is ${primaryTopic} useful in ${subjectContext}? Give two examples.`,
  ];
  const mediumQs = [
    `Explain how ${primaryTopic} is applied in real-world scenarios with examples.`,
    `Compare and contrast different aspects of ${primaryTopic}.`,
    `Describe the process of ${primaryTopic} with suitable examples.`,
    `Analyze the relationship between ${primaryTopic} and related concepts in ${subjectContext}.`,
    `Discuss the advantages and limitations of ${primaryTopic}.`,
    `Solve the following problem related to ${primaryTopic}: Provide a step-by-step solution.`,
  ];
  const hardQs = [
    `Critically evaluate the role of ${primaryTopic} in ${subjectContext}.`,
    `Design a comprehensive framework for understanding ${primaryTopic} in depth.`,
    `Analyze the challenges related to ${primaryTopic} and propose practical solutions.`,
    `Evaluate the impact of ${primaryTopic} on learning outcomes in ${subjectContext}.`,
    `Synthesize a detailed explanation of ${primaryTopic} with multiple examples.`,
    `Create a real-world problem involving ${primaryTopic} and solve it step by step.`,
  ];

  const pool = difficulty === "easy" ? easyQs : difficulty === "medium" ? mediumQs : hardQs;
  return pool[number % pool.length];
}

function generateAnswer(number: number, text: string): string {
  return `Answer ${number}: ${text.replace("?", ".")} The complete explanation requires understanding of core concepts and their interrelationships. Students should provide relevant examples and demonstrate analytical thinking.`;
}

export function generateMockPaper(params: {
  title: string;
  subject: string;
  className: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  fileContent?: string;
  instructions?: string;
}): GeneratedPaper {
  const { subject, questionTypes, numQuestions, totalMarks, fileContent, instructions } = params;

  const topics = extractTopics(fileContent, subject, instructions);
  const numSections = Math.min(3, Math.ceil(numQuestions / 5));
  const questionsPerSection = Math.ceil(numQuestions / numSections);

  const sections = [];
  let qNum = 0;
  let allocatedMarks = 0;

  const sectionNames = ["Section A", "Section B", "Section C", "Section D"];
  const sectionInstructions = [
    "Attempt all questions. Each question carries equal marks.",
    "Attempt all questions.",
    "Attempt any four questions. Each question carries equal marks.",
    "Attempt all questions. Provide detailed explanations.",
  ];

  for (let s = 0; s < numSections && qNum < numQuestions; s++) {
    const count = Math.min(questionsPerSection, numQuestions - qNum);
    const sectionMarks = Math.floor((totalMarks - allocatedMarks) / (numSections - s));
    const questions = [];

    for (let i = 0; i < count && qNum < numQuestions; i++) {
      qNum++;
      const difficulty = pickDifficulty(qNum - 1, numQuestions);
      const marks = Math.max(1, Math.floor(sectionMarks / count));
      const text = generateQuestionText(qNum, questionTypes[0] || "General", subject || "General", difficulty, topics);
      allocatedMarks += marks;

      questions.push({
        number: qNum,
        text,
        difficulty,
        marks,
      });
    }

    sections.push({
      title: sectionNames[s] || `Section ${String.fromCharCode(65 + s)}`,
      instruction: sectionInstructions[s] || "Attempt all questions.",
      questions,
    });
  }

  const answerKey = [];
  for (const section of sections) {
    for (const q of section.questions) {
      answerKey.push(generateAnswer(q.number, q.text));
    }
  }

  return { sections, answerKey };
}
