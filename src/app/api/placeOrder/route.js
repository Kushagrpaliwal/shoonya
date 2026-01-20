// pages/api/placeOrder.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";
import Inventory from "@/app/models/Inventory";

export async function POST(req) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const orderData = await req.json();
    console.log("Received order data:", orderData); // Debugging log

    // Destructure and validate required fields
    const {
      email,
      direction,
      executionType,
      lot,
      price,
      quantity,
      market,
      symbol,
      netprice,
      token,
      exchange,
      high,
      low,
      open,
      close,
      ltp
    } = orderData;

    if (!email || !direction || !executionType || !lot || !price || !quantity || !market || !symbol || !netprice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate order direction
    if (!['buy', 'sell'].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid order direction" },
        { status: 400 }
      );
    }

    // For sell orders, validate inventory from dedicated Inventory collection
    if (direction === 'sell') {
      const inventoryDoc = await Inventory.findOne({ email });
      const items = inventoryDoc?.items || [];
      const symbolInventory = items.find(i =>
        i.symbol === symbol && (i.exchange === exchange || i.market === market)
      );

      if (!symbolInventory || symbolInventory.lots <= 0) {
        return NextResponse.json({
          error: `Cannot sell ${symbol}. You don't own any lots of this symbol.`
        }, { status: 400 });
      }

      if (symbolInventory.lots < Number(lot)) {
        return NextResponse.json({
          error: `Insufficient lots. Available: ${symbolInventory.lots}, Requested: ${lot}`
        }, { status: 400 });
      }
    }

    // Calculate charges based on order value (approximate)
    const orderValue = Number(price) * Number(quantity);
    const calculatedCharges = Math.round(orderValue * 0.0001); // ~0.01% for exchange + STT + GST

    // Create new order object
    const newOrder = {
      email: String(email), // Ensure email is included
      lot: Number(lot),
      price: Number(price),
      quantity: Number(quantity),
      market: String(market),
      symbol: String(symbol),
      netprice: Number(netprice),
      type: executionType,
      token: Number(token),
      exchange: String(exchange),
      status: executionType === "market" ? "completed" : "pending",
      timestamp: new Date(),
      originalArray: direction === 'buy' ? 'buyOrders' : 'sellOrders',
      high: Number(high),
      low: Number(low),
      open: Number(open),
      close: Number(close),
      ltp: Number(ltp),
      // Analytics fields
      entryPrice: Number(price), // Entry price is the order price
      stopLoss: orderData.stopLoss ? Number(orderData.stopLoss) : null,
      target: orderData.target ? Number(orderData.target) : null,
      brokerage: 20, // Default brokerage
      charges: calculatedCharges,
      tradeStatus: executionType === "market" ? "OPEN" : "PENDING",
    };

    // Log the new order for debugging
    console.log("New Order:", newOrder);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Push the new order to the appropriate array
    if (direction === 'buy') {
      user.buyOrders.push(newOrder);
    } else {
      user.sellOrders.push(newOrder);
    }

    // Save updated user document
    await user.save();

    // Update inventory for market orders (executed immediately)
    if (executionType === "market") {
      await updateInventory({
        email,
        symbol,
        exchange,
        market,
        token,
        lots: Number(lot),
        quantity: Number(quantity),
        price: Number(price),
        action: direction,
      });
    }

    return NextResponse.json(
      { message: "Order placed successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to update inventory
async function updateInventory({ email, symbol, exchange, market, token, lots, quantity, price, action }) {
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
    if (existingItemIndex >= 0) {
      const item = inventory.items[existingItemIndex];

      // Calculate proportional value to subtract
      const proportionalValue = item.avgBuyPrice * quantity;

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
  }

  inventory.updatedAt = new Date();
  await inventory.save();

  return inventory;
}