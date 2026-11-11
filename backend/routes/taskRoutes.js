import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import Subject from "../models/Subject.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).populate("subjectId", "subjectName").sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch { res.status(500).json({ message: "Could not load tasks" }); }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, dueDate, subjectId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Task title is required" });
    if (subjectId && !mongoose.isValidObjectId(subjectId)) return res.status(400).json({ message: "Invalid subject" });
    if (subjectId && !(await Subject.findOne({ _id: subjectId, userId: req.userId }))) return res.status(400).json({ message: "Subject not found" });
    const task = await Task.create({ userId: req.userId, title: title.trim(), description, dueDate: dueDate || null, subjectId: subjectId || null });
    res.status(201).json(await task.populate("subjectId", "subjectName"));
  } catch { res.status(500).json({ message: "Could not create task" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    ["title", "description", "dueDate", "status", "subjectId"].forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key] || (key === "subjectId" || key === "dueDate" ? null : req.body[key]);
    });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, updates, { new: true, runValidators: true }
    ).populate("subjectId", "subjectName");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch { res.status(500).json({ message: "Could not update task" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch { res.status(500).json({ message: "Could not delete task" }); }
});

export default router;
