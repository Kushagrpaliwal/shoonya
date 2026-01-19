#!/usr/bin/env node

/**
 * Script to set up cron job for limit orders cleanup
 * This script helps configure the cron job to run at 12am daily
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

function setupCron() {
  const scriptPath = path.resolve(__dirname, 'cleanupLimitOrders.js');
  const nodePath = process.execPath;
  
  // Cron expression for 12am daily
  const cronExpression = '0 0 * * *';
  
  // Create the cron command
  const cronCommand = `${cronExpression} ${nodePath} ${scriptPath}`;
  
  console.log('Setting up cron job for limit orders cleanup...');
  console.log(`Script path: ${scriptPath}`);
  console.log(`Node path: ${nodePath}`);
  console.log(`Cron expression: ${cronExpression}`);
  console.log(`Full cron command: ${cronCommand}`);
  
  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    console.error('Error: cleanupLimitOrders.js script not found!');
    process.exit(1);
  }
  
  // Make script executable
  try {
    fs.chmodSync(scriptPath, '755');
    console.log('Made script executable');
  } catch (error) {
    console.warn('Warning: Could not make script executable:', error.message);
  }
  
  console.log('\nTo set up the cron job, run one of these commands:');
  console.log('\n1. Add to current user crontab:');
  console.log(`   crontab -e`);
  console.log(`   # Add this line: ${cronCommand}`);
  
  console.log('\n2. Or use this command to add directly:');
  console.log(`   (crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`);
  
  console.log('\n3. Or add to system crontab (requires sudo):');
  console.log(`   sudo crontab -e`);
  console.log(`   # Add this line: ${cronCommand}`);
  
  console.log('\n4. Alternative: Use absolute paths for better reliability:');
  console.log(`   ${cronExpression} cd ${process.cwd()} && ${nodePath} ${scriptPath}`);
  
  console.log('\nTo test the cleanup manually, run:');
  console.log(`   npm run cleanup-orders`);
  
  console.log('\nTo view current crontab:');
  console.log(`   crontab -l`);
  
  console.log('\nTo remove the cron job:');
  console.log(`   crontab -e`);
  console.log(`   # Remove the line with the cleanup command`);
}

// Run if called directly
if (require.main === module) {
  setupCron();
}

module.exports = setupCron;
