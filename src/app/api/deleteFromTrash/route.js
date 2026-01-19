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

    // Find the order in trash
    const trashIndex = user.trash.findIndex(order => 
      order._id.toString() === orderId
    );
    
    if (trashIndex === -1) {
      return NextResponse.json(
        { error: "Order not found in trash" },
        { status: 404 }
      );
    }

    // Remove from trash permanently
    user.trash.splice(trashIndex, 1);

    await user.save();

    return NextResponse.json({
      message: "Order permanently deleted from trash",
      orderId: orderId,
      trashCount: user.trash.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting from trash:", error);
    return NextResponse.json(
      { error: "Failed to delete from trash", details: error.message },
      { status: 500 }
    );
  }
}
