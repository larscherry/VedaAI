import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  listGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  addStudent,
  removeStudent,
} from "../controllers/group.controller";

const router = Router();
router.use(authMiddleware);

router.get("/", listGroups);
router.post("/", createGroup);
router.get("/:id", getGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:id/students", addStudent);
router.delete("/:id/students/:rollNumber", removeStudent);

export default router;
