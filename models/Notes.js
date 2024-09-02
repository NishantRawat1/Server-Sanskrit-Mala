import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  notePdf: { type: String, required: true },
  coverImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


export const Notes= mongoose.model("Notes",noteSchema);