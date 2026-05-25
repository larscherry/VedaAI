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

function extractTopics(fileContent?: string, subject?: string, _instructions?: string): string[] {
  const topics: string[] = [];

  // Use the subject as primary topic
  if (subject && subject.toLowerCase() !== "general" && subject !== "") {
    topics.push(subject);
  }

  // Extract from file content — only high-frequency meaningful words
  if (fileContent) {
    const words = fileContent
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 5 && looksLikeEnglishWord(w) && !isStopword(w))
      .map((w) => w.toLowerCase());

    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    const sorted = [...new Set(words)]
      .filter((w) => freq[w] >= 3)
      .sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
    topics.push(...sorted);
  }

  return [...new Set(topics)].slice(0, 8);
}

function generateQuestionText(
  number: number,
  _questionType: string,
  subject: string,
  difficulty: string,
  topics: string[]
): string {
  const topic = topics.length > 0 ? topics[number % topics.length] : "";
  const subj = subject && subject.toLowerCase() !== "general" ? subject : "this subject";

  const easyQs = [
    topic ? `What is ${topic} in ${subj}? Explain with an example.` : `Define an important concept in ${subj}.`,
    topic ? `Describe the key features of ${topic} in ${subj}.` : `List the main components of ${subj}.`,
    topic ? `How does ${topic} function in ${subj}? Give examples.` : `Explain the basic principles of ${subj} with examples.`,
    topic ? `What is the importance of ${topic} in ${subj}?` : `Why is ${subj} important in daily life?`,
    topic ? `Name the different types of ${topic} found in ${subj}.` : `Describe the fundamental concepts of ${subj}.`,
  ];
  const mediumQs = [
    topic ? `Explain how ${topic} is applied in real-world ${subj} scenarios.` : `Describe real-world applications of ${subj}.`,
    topic ? `Compare and contrast different aspects of ${topic} in ${subj}.` : `Compare different concepts within ${subj}.`,
    topic ? `Describe the process of ${topic} with suitable ${subj} examples.` : `Explain the key processes in ${subj} with examples.`,
    topic ? `Analyze the relationship between ${topic} and related ${subj} concepts.` : `Analyze how different ${subj} concepts relate to each other.`,
    topic ? `Discuss the advantages and limitations of ${topic} in ${subj}.` : `Evaluate the role of ${subj} in modern education.`,
  ];
  const hardQs = [
    topic ? `Critically evaluate the role of ${topic} in ${subj}.` : `Critically analyze the importance of ${subj} in science.`,
    topic ? `Design an experiment to study ${topic} in ${subj}.` : `Design a framework for understanding ${subj} concepts.`,
    topic ? `Analyze the challenges related to ${topic} in ${subj} and propose solutions.` : `Identify challenges in learning ${subj} and propose solutions.`,
    topic ? `Evaluate the impact of ${topic} on learning outcomes in ${subj}.` : `Evaluate how ${subj} knowledge impacts other fields.`,
    topic ? `Create a real-world problem involving ${topic} in ${subj} and solve it.` : `Create a real-world scenario applying ${subj} concepts.`,
  ];

  const pool = difficulty === "easy" ? easyQs : difficulty === "medium" ? mediumQs : hardQs;
  return pool[number % pool.length];
}

function generateAnswer(number: number, text: string, subject: string): string {
  return `Answer ${number}: ${text.replace("?", ".")} Students should explain using examples from ${subject} and demonstrate clear understanding of the core concepts.`;
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
      answerKey.push(generateAnswer(q.number, q.text, subject));
    }
  }

  return { sections, answerKey };
}
