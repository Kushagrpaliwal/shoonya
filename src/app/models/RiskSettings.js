import mongoose from 'mongoose';

const RiskSettingsSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    maxDailyLoss: { type: Number, default: 5000 },
    maxTradesPerDay: { type: Number, default: 10 },
    maxConsecutiveLosses: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.RiskSettings || mongoose.model('RiskSettings', RiskSettingsSchema);
