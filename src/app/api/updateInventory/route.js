import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import Inventory from "@/app/models/Inventory";

/**
 * Update inventory when buying or selling
 * POST /api/updateInventory
 * 
 * Body: {
 *   email: string,
 *   symbol: string,
 *   exchange: string,
 *   market: string,
 *   token: string,
 *   lots: number,
 *   quantity: number,
 *   price: number,
 *   action: 'buy' | 'sell'
 * }
 */
export async function POST(req) {
    try {
        await connectToDatabase();

        const data = await req.json();
        const { email, symbol, exchange, market, token, lots, quantity, price, action } = data;

        if (!email || !symbol || !lots || !quantity || !price || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find or create inventory for user
        let inventory = await Inventory.findOne({ email });

        if (!inventory) {
            inventory = new Inventory({
                email,
                items: [],
            });
        }

        // Find existing item for this symbol
        const existingItemIndex = inventory.items.findIndex(
            item => item.symbol === symbol && (item.exchange === exchange || item.market === market)
        );

        const tradeValue = price * quantity;

        if (action === 'buy') {
            if (existingItemIndex >= 0) {
                // Update existing item
                const item = inventory.items[existingItemIndex];
                const newTotalValue = item.totalValue + tradeValue;
                const newQuantity = item.quantity + quantity;

                item.lots += lots;
                item.quantity = newQuantity;
                item.totalValue = newTotalValue;
                item.avgBuyPrice = newQuantity > 0 ? newTotalValue / newQuantity : 0;
                item.lastUpdated = new Date();
            } else {
                // Add new item
                inventory.items.push({
                    symbol,
                    exchange: exchange || market,
                    market: market || exchange,
                    token,
                    lots,
                    quantity,
                    totalValue: tradeValue,
                    avgBuyPrice: price,
                    lastUpdated: new Date(),
                });
            }
        } else if (action === 'sell') {
            if (existingItemIndex < 0) {
                return NextResponse.json(
                    { error: `Cannot sell ${symbol}. You don't own any lots of this symbol.` },
                    { status: 400 }
                );
            }

            const item = inventory.items[existingItemIndex];

            if (item.lots < lots) {
                return NextResponse.json(
                    { error: `Insufficient lots. Available: ${item.lots}, Requested: ${lots}` },
                    { status: 400 }
                );
            }

            // Calculate proportional value to subtract
            const proportionalValue = (tradeValue / item.quantity) * quantity;

            item.lots -= lots;
            item.quantity -= quantity;
            item.totalValue -= proportionalValue;
            item.avgBuyPrice = item.quantity > 0 ? item.totalValue / item.quantity : 0;
            item.lastUpdated = new Date();

            // Remove item if lots reach 0
            if (item.lots <= 0) {
                inventory.items.splice(existingItemIndex, 1);
            }
        }

        inventory.updatedAt = new Date();
        await inventory.save();

        return NextResponse.json({
            success: true,
            message: `Inventory updated successfully`,
            inventory: inventory.items,
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating inventory:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
