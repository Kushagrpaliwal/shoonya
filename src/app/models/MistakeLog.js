import mongoose from 'mongoose';

const MistakeItemSchema = new mongoose.Schema({
    tradeId: { type: String },
    symbol: { type: String, required: true },
    mistakeType: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    impact: { type: Number, default: 0 },
    rrRatio: { type: Number },
    timeSinceLoss: { type: Number },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now } // When the mistake happened (trade time)
});

const MistakeLogSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    mistakes: [MistakeItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.MistakeLog || mongoose.model('MistakeLog', MistakeLogSchema);
