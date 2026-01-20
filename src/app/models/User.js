// models/User.js
import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
    exchange: { type: String, required: true },
    token: { type: String, required: true },
});

// models/User.js
const OrderSchema = new mongoose.Schema({
    lot: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['market', 'limit'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'rejected', 'executed'], required: true },
    email: { type: String },
    market: { type: String },
    symbol: { type: String },
    netprice: { type: Number },
    token: { type: String },
    exchange: { type: String },
    timestamp: { type: Date, default: Date.now },
    originalArray: { type: String, enum: ['buyOrders', 'sellOrders'], default: 'buyOrders' },
    executedAt: { type: Date },
    executedPrice: { type: Number },
    // Market data fields
    high: { type: Number },
    low: { type: Number },
    open: { type: Number },
    close: { type: Number },
    ltp: { type: Number },
    // Analytics fields
    entryPrice: { type: Number },           // Actual entry price
    exitPrice: { type: Number },            // Set when position is closed
    stopLoss: { type: Number },             // Optional stop loss
    target: { type: Number },               // Optional target price
    brokerage: { type: Number, default: 20 }, // Default brokerage per trade
    charges: { type: Number, default: 0 },  // STT, exchange charges, GST
    tradeStatus: { type: String, enum: ['PENDING', 'OPEN', 'COMPLETED', 'TARGET_HIT', 'SL_HIT', 'CANCELLED'] },
    closedAt: { type: Date },               // When position was closed
    notes: { type: String },                // User notes for journal
    emotion: { type: String, enum: ['calm', 'neutral', 'stressed'] }
});

// models/User.js
// const PositionsSchema = new mongoose.Schema({
//     segment: { type:String, required:false},
//     client: { type:String, required:false},
//     symbol: { type:String, required:false},
//     totalbuy: { type:String, required:false},
//     avaeragebuy: { type:String, required:false},
//     totalsell: { type:String, required:false},
//     averagesell: { type:String, required:false},
//     netquantity: { type:String, required:false},
//     bea: { type:String, required:false},
//     cr: { type:String, required:false},
//     mtmclose: { type:String, required:false},
//   });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // name: { type: String, required: true },
    // loginId: { type: String, required: true, unique: true },
    // broker: { type: String, required: true },
    // master: { type: String, required: true },
    // onlyPosition: { type: String, enum: ['Yes', 'No'], default: 'No' },
    // action: { type: String, enum: ['L', 'B', 'S'], default: 'L' },
    createdAt: { type: Date, default: Date.now },
    trades: [TradeSchema],
    buyOrders: [OrderSchema],
    sellOrders: [OrderSchema],
    trash: [OrderSchema],
});

UserSchema.virtual('totalOrders').get(function () {
    return [...this.buyOrders, ...this.sellOrders];
});

UserSchema.virtual('totalPositions').get(function () {

    const relevantOrders = [
        ...this.buyOrders.filter(order => ['completed', 'executed'].includes(order.status)),
        ...this.sellOrders.filter(order => ['completed', 'executed'].includes(order.status))
    ];


    const positionsMap = relevantOrders.reduce((acc, order) => {
        const { symbol } = order;
        if (!symbol) return acc;

        if (!acc[symbol]) {
            acc[symbol] = [];
        }
        acc[symbol].push(order);
        return acc;
    }, {});

    return Object.keys(positionsMap).map(symbol => ({
        symbol,
        orders: positionsMap[symbol]
    }));
});

// Inventory virtual - calculates owned lots per symbol
UserSchema.virtual('inventory').get(function () {
    const inventoryMap = {};

    // Sum buy orders (completed/executed)
    this.buyOrders
        .filter(o => ['completed', 'executed'].includes(o.status))
        .forEach(order => {
            // Use exchange or market field (they might be used interchangeably)
            const exchangeValue = order.exchange || order.market;
            const key = `${order.symbol}|${exchangeValue}`;
            if (!inventoryMap[key]) {
                inventoryMap[key] = {
                    symbol: order.symbol,
                    exchange: exchangeValue,
                    market: order.market || order.exchange,
                    token: order.token,
                    lots: 0,
                    quantity: 0,
                    totalValue: 0,
                    orders: []
                };
            }
            inventoryMap[key].lots += order.lot;
            inventoryMap[key].quantity += order.quantity;
            inventoryMap[key].totalValue += (order.price * order.quantity);
            inventoryMap[key].orders.push(order);
        });

    // Subtract sell orders (completed/executed)
    this.sellOrders
        .filter(o => ['completed', 'executed'].includes(o.status))
        .forEach(order => {
            const exchangeValue = order.exchange || order.market;
            const key = `${order.symbol}|${exchangeValue}`;
            if (inventoryMap[key]) {
                inventoryMap[key].lots -= order.lot;
                inventoryMap[key].quantity -= order.quantity;
                inventoryMap[key].totalValue -= (order.price * order.quantity);
            }
        });

    // Return only items with lots > 0
    return Object.values(inventoryMap)
        .filter(item => item.lots > 0)
        .map(item => ({
            ...item,
            avgBuyPrice: item.quantity > 0 ? item.totalValue / item.quantity : 0
        }));
});

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });


export default mongoose.models.User || mongoose.model('User', UserSchema);