import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { Assignment } from "../models/Assignment";
import { User } from "../models/User";
import { QuestionPaper } from "../models/QuestionPaper";
import { buildPrompt } from "../services/promptBuilder";
import { generateQuestionPaper } from "../services/llmService";
import { sendToAssignment } from "../websocket";
import fs from "fs";

interface GenerationJobData {
  assignmentId: string;
}

export const generationWorker = new Worker<GenerationJobData>(
  "question-generation",
  async (job: Job<GenerationJobData>) => {
    const { assignmentId } = job.data;

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      const user = await User.findById(assignment.userId);
      const apiKey = user?.apiKey || undefined;

      await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });
      sendToAssignment(assignmentId, {
        type: "job:progress",
        stage: "generating",
        percent: 20,
      });

      let fileContent: string | undefined;
      if (assignment.filePath) {
        try {
          fileContent = fs.readFileSync(assignment.filePath, "utf-8");
        } catch {
          console.warn("Could not read file:", assignment.filePath);
        }
      }

      const { systemPrompt, userPrompt } = buildPrompt({
        title: assignment.title,
        subject: assignment.subject,
        className: assignment.className,
        questionTypes: assignment.questionTypes,
        numQuestions: assignment.numQuestions,
        totalMarks: assignment.totalMarks,
        instructions: assignment.instructions,
        fileContent,
      });

      sendToAssignment(assignmentId, {
        type: "job:progress",
        stage: "generating",
        percent: 40,
      });

      const generated = await generateQuestionPaper(systemPrompt, userPrompt, apiKey);

      sendToAssignment(assignmentId, {
        type: "job:progress",
        stage: "parsing",
        percent: 70,
      });

      let existingPaper = await QuestionPaper.findOne({ assignmentId });

      if (existingPaper) {
        existingPaper.sections = generated.sections;
        existingPaper.answerKey = generated.answerKey || [];
        existingPaper.subject = assignment.subject;
        existingPaper.className = assignment.className;
        await existingPaper.save();
      } else {
        await QuestionPaper.create({
          assignmentId,
          sections: generated.sections,
          answerKey: generated.answerKey || [],
          subject: assignment.subject,
          className: assignment.className,
        });
      }

      await Assignment.findByIdAndUpdate(assignmentId, { status: "completed" });

      sendToAssignment(assignmentId, {
        type: "job:completed",
        assignmentId,
      });
    } catch (error: any) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });

      sendToAssignment(assignmentId, {
        type: "job:failed",
        error: error.message || "Generation failed",
      });

      throw error;
    }
  },
  { connection: redis }
);

generationWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
