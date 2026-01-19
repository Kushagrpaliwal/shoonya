import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    // Find all users and remove limit orders with pending status
    const users = await User.find({});
    let totalRemoved = 0;
    
    for (const user of users) {
      // Remove limit orders from buyOrders (only pending ones, keep rejected and completed)
      const buyOrdersToKeep = user.buyOrders.filter(order => 
        !(order.type === 'limit' && order.status === 'pending')
      );
      const buyOrdersRemoved = user.buyOrders.length - buyOrdersToKeep.length;
      
      // Remove limit orders from sellOrders (only pending ones, keep rejected and completed)
      const sellOrdersToKeep = user.sellOrders.filter(order => 
        !(order.type === 'limit' && order.status === 'pending')
      );
      const sellOrdersRemoved = user.sellOrders.length - sellOrdersToKeep.length;
      
      // Update user document
      user.buyOrders = buyOrdersToKeep;
      user.sellOrders = sellOrdersToKeep;
      
      await user.save();
      totalRemoved += buyOrdersRemoved + sellOrdersRemoved;
    }
    
    console.log(`Cleanup completed at ${new Date().toISOString()}. Removed ${totalRemoved} limit orders.`);
    
    return NextResponse.json({
      message: "Limit orders cleanup completed successfully",
      removedCount: totalRemoved,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error during limit orders cleanup:", error);
    return NextResponse.json({
      error: "Failed to cleanup limit orders",
      details: error.message
    }, { status: 500 });
  }
}

// Also support GET request for manual cleanup
export async function GET(req) {
  return await POST(req);
}
