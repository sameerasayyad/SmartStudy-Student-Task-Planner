import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  dueDate: { type: Date, default: null },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
