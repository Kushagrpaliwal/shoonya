import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/connectToDatabase';
import User from '@/app/models/User'

export async function POST(req) {
  await connectToDatabase();
  try{
    
    const {orderId , email} = await req.json();
    const user = await User.findOne({email});
    if(!user){
      return NextResponse.json({error:'User not found'},{status:404});
    }

    const order = user.totalOrders.find(order => order._id.toString() === orderId);
    if(!order){
      return NextResponse.json({error:'Order not found'} , {status:404})
    }
    
    if(order.status == 'pending'){

      // Find the order index in totalOrders
      const totalOrderIndex = user.totalOrders.findIndex(order => order._id.toString() === orderId);
      
      // Find the order index in buyOrders if it exists
      const buyOrderIndex = user.buyOrders.findIndex(order => order._id.toString() === orderId);
      
      // Find the order index in sellOrders if it exists
      const sellOrderIndex = user.sellOrders.findIndex(order => order._id.toString() === orderId);
      
      // Update the order status in totalOrders
      if(totalOrderIndex !== -1){
        user.totalOrders[totalOrderIndex].status = 'executed';
      }
      
      // Update the order status in buyOrders if it exists
      if(buyOrderIndex !== -1){
        user.buyOrders[buyOrderIndex].status = 'executed';
      }
      
      // Update the order status in sellOrders if it exists
      if(sellOrderIndex !== -1){
        user.sellOrders[sellOrderIndex].status = 'executed';
      }

      await user.save();
    }

    return NextResponse.json({message:'Order Executed Successfully'})

  }catch (error) {
    console.error('Error executing order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

