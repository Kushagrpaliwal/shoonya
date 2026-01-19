import mongoose from "mongoose";

const WatchListSchema = new mongoose.Schema({
  tsym: { type: String, required: true },
  expiry: { type: String, required: true },
  lp: { type: Number },
  bp1: { type: Number },
  sp1: { type: Number },
  h: { type: Number },
  l: { type: Number },
  o: { type: Number },
  c: { type: Number },
  token: { type: String, required: true },
  exchange: { type: String, required: true }
});

export default mongoose.models.WatchList || mongoose.model("WatchList", WatchListSchema);