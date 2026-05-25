import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { QuestionPaper } from "../models/QuestionPaper";
import { Assignment } from "../models/Assignment";
import { generatePDF } from "../services/pdfService";
import { sendToAssignment } from "../websocket";
import path from "path";

interface PDFJobData {
  assignmentId: string;
}

export const pdfWorker = new Worker<PDFJobData>(
  "pdf-export",
  async (job: Job<PDFJobData>) => {
    const { assignmentId } = job.data;

    try {
      const paper = await QuestionPaper.findOne({ assignmentId });
      if (!paper) throw new Error("Question paper not found");

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      const fileName = `assignment_${assignmentId}_${Date.now()}.pdf`;
      const outputPath = path.resolve(__dirname, "../../uploads", fileName);

      await generatePDF(paper, assignment, outputPath);

      sendToAssignment(assignmentId, {
        type: "pdf:ready",
        url: `/api/assignments/${assignmentId}/pdf`,
        fileName,
      });
    } catch (error: any) {
      sendToAssignment(assignmentId, {
        type: "pdf:failed",
        error: error.message || "PDF generation failed",
      });
      throw error;
    }
  },
  { connection: redis }
);

pdfWorker.on("failed", (job, err) => {
  console.error(`PDF job ${job?.id} failed:`, err.message);
});
