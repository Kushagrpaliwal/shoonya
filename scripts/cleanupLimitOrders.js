#!/usr/bin/env node

/**
 * Script to clean up limit orders at 12am
 * This script can be used with cron jobs or scheduled tasks
 * 
 * Usage with cron (add to crontab):
 * 0 0 * * * /usr/bin/node /path/to/your/project/scripts/cleanupLimitOrders.js
 * 
 * Or run manually:
 * node scripts/cleanupLimitOrders.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('../src/app/models/User.js').default;

async function cleanupLimitOrders() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

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
      
      // Calculate total orders removed (for logging purposes)
      const totalOrdersRemoved = buyOrdersRemoved + sellOrdersRemoved;

      // Update user document
      user.buyOrders = buyOrdersToKeep;
      user.sellOrders = sellOrdersToKeep;
      // Note: totalOrders is a virtual field, so we don't set it manually
      
      await user.save();
      totalRemoved += buyOrdersRemoved + sellOrdersRemoved;
    }
    
    console.log(`Cleanup completed at ${new Date().toISOString()}. Removed ${totalRemoved} limit orders.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error during limit orders cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupLimitOrders();
}

module.exports = cleanupLimitOrders;
