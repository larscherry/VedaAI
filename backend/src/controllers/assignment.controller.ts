import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Assignment } from "../models/Assignment";
import { User } from "../models/User";
import { QuestionPaper } from "../models/QuestionPaper";
import { pdfExportQueue } from "../queue";
import { buildPrompt } from "../services/promptBuilder";
import { generateQuestionPaper } from "../services/llmService";
import { sendToAssignment } from "../websocket";
import { createNotification } from "../services/notificationService";
import path from "path";
import fs from "fs";

export async function startGeneration(assignmentId: string) {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    const user = await User.findById(assignment.userId);
    const apiKey = user?.apiKey || undefined;
    const llmBaseUrl = user?.llmBaseUrl || undefined;
    const llmModel = user?.llmModel || undefined;
    const useMock = user?.mockMode ?? true;

    sendToAssignment(assignmentId, {
      type: "job:progress",
      stage: "generating",
      percent: 20,
    });

    let fileContent: string | undefined;
    if (assignment.fileContent) {
      fileContent = assignment.fileContent;
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

    const generated = await generateQuestionPaper(systemPrompt, userPrompt, apiKey, fileContent, useMock, llmBaseUrl, llmModel);

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

    createNotification({
      userId: assignment.userId.toString(),
      type: "assignment_completed",
      title: "Assignment Generated",
      message: `"${assignment.title}" has been generated successfully.`,
      link: `/output/${assignmentId}`,
      relatedId: assignmentId,
    });
  } catch (error: any) {
    console.error("Generation failed:", error.message);
    await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });

    sendToAssignment(assignmentId, {
      type: "job:failed",
      error: error.message || "Generation failed",
    });

    const failedAssignment = await Assignment.findById(assignmentId);
    if (failedAssignment) {
      createNotification({
        userId: failedAssignment.userId.toString(),
        type: "assignment_failed",
        title: "Generation Failed",
        message: `"${failedAssignment.title}" could not be generated. ${error.message || "Please try again."}`,
        link: `/assignments`,
        relatedId: assignmentId,
      });
    }
  }
}

export async function listAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignments = await Assignment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const total = await Assignment.countDocuments({ userId: req.userId });
    const completed = await Assignment.countDocuments({ userId: req.userId, status: "completed" });
    const processing = await Assignment.countDocuments({ userId: req.userId, status: "processing" });
    const failed = await Assignment.countDocuments({ userId: req.userId, status: "failed" });
    const now = new Date();
    const dueToday = await Assignment.countDocuments({
      userId: req.userId,
      dueDate: { $lte: now },
      status: { $ne: "completed" },
    });
    res.json({ total, completed, processing, failed, dueToday });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, dueDate, questionTypes, numQuestions, totalMarks, instructions, subject, className } = req.body;

    if (!title || !dueDate || !questionTypes || !numQuestions || !totalMarks) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (numQuestions < 1 || totalMarks < 1) {
      res.status(400).json({ error: "Number of questions and total marks must be at least 1" });
      return;
    }

    const user = await User.findById(req.userId);
    const isMockMode = user?.mockMode ?? true;

    const parsedTypes = typeof questionTypes === "string" ? JSON.parse(questionTypes) : questionTypes;

    if (!Array.isArray(parsedTypes) || parsedTypes.length === 0) {
      res.status(400).json({ error: "At least one question type is required" });
      return;
    }

    let filePath: string | null = null;
    let fileContent: string | null = null;
    if (req.file) {
      filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if ([".txt", ".md", ".csv"].includes(ext)) {
        try {
          fileContent = fs.readFileSync(filePath, "utf-8");
        } catch (e) {
          console.warn("Could not read uploaded file:", e);
        }
      }
    }

    const assignment = await Assignment.create({
      userId: req.userId,
      title,
      dueDate: new Date(dueDate),
      questionTypes: parsedTypes,
      numQuestions: parseInt(numQuestions, 10),
      totalMarks: parseInt(totalMarks, 10),
      instructions: instructions || "",
      subject: subject || "",
      className: className || "",
      filePath,
      fileContent,
      status: "processing",
    });

    if (isMockMode) {
      // Mock LLM is instant — generate inline
      await startGeneration(assignment._id.toString());
      res.status(201).json({
        assignmentId: assignment._id.toString(),
        status: "completed",
      });
    } else {
      // Real LLM — background generation
      res.status(201).json({
        assignmentId: assignment._id.toString(),
        status: "processing",
      });
      startGeneration(assignment._id.toString()).catch((e) => console.error("Background gen failed:", e));
    }
  } catch (error: any) {
    console.error("Create assignment error:", error);
    res.status(500).json({ error: error.message || "Failed to create assignment" });
  }
}

export async function getAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getQuestionPaper(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id });
    if (!paper) {
      if (assignment.status === "pending" || assignment.status === "processing") {
        res.status(202).json({ status: assignment.status, message: "Still generating..." });
        return;
      }
      res.status(404).json({ error: "Question paper not found" });
      return;
    }
    res.json(paper);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function regeneratePaper(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    await Assignment.findByIdAndUpdate(req.params.id, { status: "processing" });
    await QuestionPaper.deleteOne({ assignmentId: req.params.id });

    res.json({ message: "Regeneration started", assignmentId: req.params.id });

    startGeneration(req.params.id).catch((e) => console.error("Regeneration failed:", e));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    // Also delete associated question paper and uploaded file
    await QuestionPaper.deleteOne({ assignmentId: req.params.id });
    if (assignment.filePath) {
      try { fs.unlinkSync(assignment.filePath); } catch {}
    }
    res.json({ message: "Assignment deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function downloadPdf(req: AuthRequest, res: Response): Promise<void> {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id });
    if (!paper) {
      res.status(404).json({ error: "Question paper not found" });
      return;
    }

    const uploadsDir = path.resolve(__dirname, "../../uploads");
    const fileName = `assignment_${req.params.id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      res.download(filePath, `${assignment.title.replace(/\s+/g, "_")}_Question_Paper.pdf`);
      return;
    }

    const { generatePDF } = await import("../services/pdfService");
    await generatePDF(paper, assignment, filePath);

    res.download(filePath, `${assignment.title.replace(/\s+/g, "_")}_Question_Paper.pdf`);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
