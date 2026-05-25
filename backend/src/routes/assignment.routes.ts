import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth";
import {
  listAssignments,
  createAssignment,
  getAssignment,
  getQuestionPaper,
  regeneratePaper,
  downloadPdf,
  getStats,
  deleteAssignment,
} from "../controllers/assignment.controller";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".txt", ".md", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, MD, DOC, DOCX, JPG, JPEG, PNG files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.use(authMiddleware);

router.get("/", listAssignments);
router.get("/stats", getStats);
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "File size exceeds 10 MB limit" });
        return;
      }
      res.status(400).json({ error: `Upload error: ${err.message}` });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, createAssignment);
router.get("/:id", getAssignment);
router.get("/:id/paper", getQuestionPaper);
router.delete("/:id", deleteAssignment);
router.post("/:id/regenerate", regeneratePaper);
router.get("/:id/pdf", downloadPdf);

export default router;
