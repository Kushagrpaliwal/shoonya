// models/Inventory.js
import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
    symbol: { type: String, required: true },
    exchange: { type: String, required: true },
    market: { type: String },
    token: { type: String },
    lots: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 }, // Total value of purchases
    avgBuyPrice: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
});

const InventorySchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    items: [InventoryItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Add a compound index for quick lookups
InventorySchema.index({ email: 1 });

export default mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
