import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { symbol, market, currentPrice } = await req.json();

    if (!symbol || !market || currentPrice === undefined) {
      return NextResponse.json(
        { error: "Symbol, market, and current price are required" },
        { status: 400 }
      );
    }

    // Find all users with pending limit orders for this symbol and market
    const users = await User.find({
      $or: [
        { "buyOrders.symbol": symbol, "buyOrders.market": market, "buyOrders.status": "pending", "buyOrders.type": "limit" },
        { "sellOrders.symbol": symbol, "sellOrders.market": market, "sellOrders.status": "pending", "sellOrders.type": "limit" }
      ]
    });

    let executedOrders = [];

    for (const user of users) {
      // Check buy orders (execute when current price <= order price)
      const buyOrdersToExecute = user.buyOrders.filter(order => 
        order.symbol === symbol && 
        order.market === market && 
        order.status === "pending" && 
        order.type === "limit" &&
        currentPrice <= order.price
      );

      // Check sell orders (execute when current price >= order price)
      const sellOrdersToExecute = user.sellOrders.filter(order => 
        order.symbol === symbol && 
        order.market === market && 
        order.status === "pending" && 
        order.type === "limit" &&
        currentPrice >= order.price
      );

      // Update buy orders
      for (const order of buyOrdersToExecute) {
        order.status = "completed";
        order.executedAt = new Date();
        order.executedPrice = currentPrice;
        executedOrders.push({
          userId: user._id,
          orderId: order._id,
          type: "buy",
          symbol: order.symbol,
          market: order.market,
          quantity: order.quantity,
          price: order.price,
          executedPrice: currentPrice
        });
      }

      // Update sell orders
      for (const order of sellOrdersToExecute) {
        order.status = "completed";
        order.executedAt = new Date();
        order.executedPrice = currentPrice;
        executedOrders.push({
          userId: user._id,
          orderId: order._id,
          type: "sell",
          symbol: order.symbol,
          market: order.market,
          quantity: order.quantity,
          price: order.price,
          executedPrice: currentPrice
        });
      }

      // Save the user if any orders were executed
      if (buyOrdersToExecute.length > 0 || sellOrdersToExecute.length > 0) {
        await user.save();
      }
    }

    return NextResponse.json({
      message: "Limit orders checked and executed",
      executedOrders: executedOrders,
      totalExecuted: executedOrders.length
    });

  } catch (error) {
    console.error("Error checking limit orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




