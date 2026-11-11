import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectName: { type: String, required: true, trim: true }
}, { timestamps: true });

export default mongoose.model("Subject", subjectSchema);
