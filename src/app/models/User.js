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
    status: { type: String, enum: ['pending', 'completed', 'rejected','executed'], required: true },
    email: { type: String},
    market: { type: String },
    symbol: { type: String },
    netprice: { type: Number },
    token: { type: String },
    exchange: { type: String },
    timestamp: { type: Date, default: Date.now },
    originalArray: { type: String, enum: ['buyOrders', 'sellOrders'], default: 'buyOrders' },
    executedAt: { type: Date },
    executedPrice: { type: Number }
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

UserSchema.virtual('totalOrders').get(function() {
    return [...this.buyOrders, ...this.sellOrders];
});

UserSchema.virtual('totalPositions').get(function() {

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

// Ensure virtuals are included when converting to JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });


export default mongoose.models.User || mongoose.model('User', UserSchema);