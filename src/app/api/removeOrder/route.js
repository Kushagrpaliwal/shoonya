import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { orderId, email } = await req.json();
    
    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: orderId and email" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let orderFound = false;
    let orderToMove = null;

    // Check in buyOrders
    const buyOrderIndex = user.buyOrders.findIndex(order => 
      order._id.toString() === orderId
    );
    
    if (buyOrderIndex !== -1) {
      orderToMove = user.buyOrders[buyOrderIndex];
      orderToMove.originalArray = 'buyOrders'; // Track original array
      user.buyOrders.splice(buyOrderIndex, 1);
      orderFound = true;
    }

    // Check in sellOrders
    const sellOrderIndex = user.sellOrders.findIndex(order => 
      order._id.toString() === orderId
    );
    
    if (sellOrderIndex !== -1) {
      orderToMove = user.sellOrders[sellOrderIndex];
      orderToMove.originalArray = 'sellOrders'; // Track original array
      user.sellOrders.splice(sellOrderIndex, 1);
      orderFound = true;
    }

    if (!orderFound) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Move the order to trash
    if (orderToMove) {
      user.trash.push(orderToMove);
    }

    await user.save();

    return NextResponse.json({
      message: "Order moved to trash successfully",
      orderId: orderId,
      trashCount: user.trash.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error removing order:", error);
    return NextResponse.json(
      { error: "Failed to remove order", details: error.message },
      { status: 500 }
    );
  }
}
