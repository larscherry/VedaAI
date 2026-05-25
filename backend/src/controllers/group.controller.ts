import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Group } from "../models/Group";

export async function listGroups(req: AuthRequest, res: Response): Promise<void> {
  try {
    const groups = await Group.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-__v");
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createGroup(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    if (!name) { res.status(400).json({ error: "Group name is required" }); return; }
    const group = await Group.create({ userId: req.userId, name, description: description || "" });
    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getGroup(req: AuthRequest, res: Response): Promise<void> {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.userId });
    if (!group) { res.status(404).json({ error: "Group not found" }); return; }
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateGroup(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { name, description } },
      { new: true }
    );
    if (!group) { res.status(404).json({ error: "Group not found" }); return; }
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteGroup(req: AuthRequest, res: Response): Promise<void> {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!group) { res.status(404).json({ error: "Group not found" }); return; }
    res.json({ message: "Group deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function addStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, rollNumber, email } = req.body;
    if (!name || !rollNumber) { res.status(400).json({ error: "Name and roll number required" }); return; }
    const group = await Group.findOne({ _id: req.params.id, userId: req.userId });
    if (!group) { res.status(404).json({ error: "Group not found" }); return; }
    group.students.push({ name, rollNumber, email: email || "" });
    await group.save();
    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.userId });
    if (!group) { res.status(404).json({ error: "Group not found" }); return; }
    group.students = group.students.filter((s) => s.rollNumber !== req.params.rollNumber);
    await group.save();
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
