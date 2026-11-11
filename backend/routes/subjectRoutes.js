import { Router } from "express";
import Subject from "../models/Subject.js";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  try { res.json(await Subject.find({ userId: req.userId }).sort({ subjectName: 1 })); }
  catch { res.status(500).json({ message: "Could not load subjects" }); }
});

router.post("/", async (req, res) => {
  try {
    const subjectName = req.body.subjectName?.trim();
    if (!subjectName) return res.status(400).json({ message: "Subject name is required" });
    const subject = await Subject.create({ userId: req.userId, subjectName });
    res.status(201).json(subject);
  } catch { res.status(500).json({ message: "Could not add subject" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    await Task.updateMany({ subjectId: subject._id, userId: req.userId }, { $set: { subjectId: null } });
    res.json({ message: "Subject deleted" });
  } catch { res.status(500).json({ message: "Could not delete subject" }); }
});

export default router;
