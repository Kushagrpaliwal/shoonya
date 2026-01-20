import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/connectToDatabase';
import User from '@/app/models/User';

/**
 * Close Position API
 * Records the exit price and calculates final P&L for a trade
 */
export async function POST(req) {
    await connectToDatabase();
    try {
        const { orderId, email, exitPrice, exitType } = await req.json();

        if (!orderId || !email || !exitPrice) {
            return NextResponse.json(
                { error: 'Missing required fields: orderId, email, exitPrice' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the order in totalOrders
        const totalOrderIndex = user.totalOrders.findIndex(
            (order) => order._id.toString() === orderId
        );

        if (totalOrderIndex === -1) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = user.totalOrders[totalOrderIndex];

        // Check if order is in a valid state to close
        if (order.exitPrice || order.closedAt) {
            return NextResponse.json(
                { error: 'Position already closed' },
                { status: 400 }
            );
        }

        if (!['completed', 'executed'].includes(order.status)) {
            return NextResponse.json(
                { error: 'Only completed/executed orders can be closed' },
                { status: 400 }
            );
        }

        // Determine trade status based on exit conditions
        let tradeStatus = 'COMPLETED';
        if (exitType === 'TARGET_HIT' || (order.target && Number(exitPrice) >= order.target)) {
            tradeStatus = 'TARGET_HIT';
        } else if (exitType === 'SL_HIT' || (order.stopLoss && Number(exitPrice) <= order.stopLoss)) {
            tradeStatus = 'SL_HIT';
        }

        // Calculate final charges
        const orderValue = (order.entryPrice || order.price) * order.quantity;
        const exitValue = Number(exitPrice) * order.quantity;
        const totalValue = orderValue + exitValue;
        const additionalCharges = Math.round(totalValue * 0.0001); // Exit charges

        // Update the order with exit data
        const closeData = {
            exitPrice: Number(exitPrice),
            closedAt: new Date(),
            tradeStatus: tradeStatus,
            charges: (order.charges || 0) + additionalCharges,
        };

        // Update in totalOrders
        Object.assign(user.totalOrders[totalOrderIndex], closeData);

        // Update in buyOrders if it exists
        const buyOrderIndex = user.buyOrders.findIndex(
            (o) => o._id.toString() === orderId
        );
        if (buyOrderIndex !== -1) {
            Object.assign(user.buyOrders[buyOrderIndex], closeData);
        }

        // Update in sellOrders if it exists
        const sellOrderIndex = user.sellOrders.findIndex(
            (o) => o._id.toString() === orderId
        );
        if (sellOrderIndex !== -1) {
            Object.assign(user.sellOrders[sellOrderIndex], closeData);
        }

        await user.save();

        // Calculate P&L for response
        const entryPrice = order.entryPrice || order.price;
        const isBuy = order.originalArray === 'buyOrders';
        const pnl = isBuy
            ? (Number(exitPrice) - entryPrice) * order.quantity
            : (entryPrice - Number(exitPrice)) * order.quantity;

        return NextResponse.json({
            message: 'Position closed successfully',
            pnl: pnl,
            tradeStatus: tradeStatus,
            exitPrice: Number(exitPrice),
            brokerage: order.brokerage || 20,
            charges: closeData.charges,
        });
    } catch (error) {
        console.error('Error closing position:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
