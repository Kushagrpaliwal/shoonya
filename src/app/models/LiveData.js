// models/LiveData.js
import mongoose from "mongoose";

const LiveDataSchema = new mongoose.Schema({
  tsym: { type: String, required: true },
  lp: { type: Number, required: true },
  bp1: { type: Number, required: true },
  sp1: { type: Number, required: true },
  h: { type: Number, required: true },
  l: { type: Number, required: true },
  o: { type: Number, required: true },
  c: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }, // Optional: to track when the data was received
}, { timestamps: true });

export default mongoose.models.LiveData || mongoose.model("LiveData", LiveDataSchema);