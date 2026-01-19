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
    let orderUpdated = false;

    // Check in buyOrders
    const buyOrderIndex = user.buyOrders.findIndex(order => 
      order._id.toString() === orderId && order.status === "pending"
    );
    
    if (buyOrderIndex !== -1) {
      user.buyOrders[buyOrderIndex].status = "rejected";
      orderFound = true;
      orderUpdated = true;
    }

    // Check in sellOrders
    const sellOrderIndex = user.sellOrders.findIndex(order => 
      order._id.toString() === orderId && order.status === "pending"
    );
    
    if (sellOrderIndex !== -1) {
      user.sellOrders[sellOrderIndex].status = "rejected";
      orderFound = true;
      orderUpdated = true;
    }

    if (!orderFound) {
      return NextResponse.json(
        { error: "Order not found or not in pending status" },
        { status: 404 }
      );
    }

    if (orderUpdated) {
      await user.save();
    }

    return NextResponse.json({
      message: "Order cancelled successfully",
      orderId: orderId,
      status: "rejected"
    }, { status: 200 });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order", details: error.message },
      { status: 500 }
    );
  }
}
