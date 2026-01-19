// pages/api/placeOrder.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

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
      exchange
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
  originalArray: direction === 'buy' ? 'buyOrders' : 'sellOrders'
};

// Log the new order for debugging
console.log("New Order:", newOrder);

// Find user
const user = await User.findOne({ email });
if (!user) {
  return NextResponse.json(
    { error: "User  not found" },
    { status: 404 }
  );
}

// Push the new order to the appropriate array
if (direction === 'buy') {
  user.buyOrders.push(newOrder);
} else {
  user.sellOrders.push(newOrder);
}

// Also add to totalOrders array
user.totalOrders.push(newOrder);

// Save updated user document
await user.save();

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