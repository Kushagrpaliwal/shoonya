import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/connectToDatabase';
import User from '@/app/models/User';
import Inventory from '@/app/models/Inventory';

export async function POST(req) {
  await connectToDatabase();
  try {

    const { orderId, email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const order = user.totalOrders.find(order => order._id.toString() === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status == 'pending') {

      // Determine action (buy/sell) from originalArray
      const action = order.originalArray === 'buyOrders' ? 'buy' : 'sell';

      // For sell orders, we should ideally validate inventory again, but since it's a limit order 
      // getting executed, we assume the user had inventory when placing it? 
      // Actually, standard practice for limit sell is to block inventory when placing.
      // But here we are just executing. Let's proceed with execution and inventory update.

      // Find the order index in totalOrders
      const totalOrderIndex = user.totalOrders.findIndex(order => order._id.toString() === orderId);

      // Find the order index in buyOrders if it exists
      const buyOrderIndex = user.buyOrders.findIndex(order => order._id.toString() === orderId);

      // Find the order index in sellOrders if it exists
      const sellOrderIndex = user.sellOrders.findIndex(order => order._id.toString() === orderId);

      const executionData = {
        status: 'completed', // Changed from 'executed' to 'completed'
        executedAt: new Date(),
        entryPrice: order.price, // Uses the limit price as execution price
        tradeStatus: 'OPEN'
      };

      // Update the order status in totalOrders
      if (totalOrderIndex !== -1) {
        Object.assign(user.totalOrders[totalOrderIndex], executionData);
      }

      // Update the order status in buyOrders if it exists
      if (buyOrderIndex !== -1) {
        Object.assign(user.buyOrders[buyOrderIndex], executionData);
      }

      // Update the order status in sellOrders if it exists
      if (sellOrderIndex !== -1) {
        Object.assign(user.sellOrders[sellOrderIndex], executionData);
      }

      await user.save();

      // Update Inventory
      await updateInventory({
        email,
        symbol: order.symbol,
        exchange: order.exchange,
        market: order.market,
        token: order.token,
        lots: Number(order.lot),
        quantity: Number(order.quantity),
        price: Number(order.price),
        action: action
      });
    }

    return NextResponse.json({ message: 'Order Executed Successfully' })

  } catch (error) {
    console.error('Error executing order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update inventory (reused from placeOrder)
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
