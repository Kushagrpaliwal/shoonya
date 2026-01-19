class LimitOrderService {
  constructor() {
    this.priceCache = new Map(); // Cache for current prices
    this.checkInterval = null;
    this.isRunning = false;
  }

  // Start monitoring limit orders
  startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkInterval = setInterval(() => {
      this.checkAllLimitOrders();
    }, 5000); // Check every 5 seconds
    
    console.log('Limit order monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Limit order monitoring stopped');
  }

  // Update price for a symbol
  updatePrice(symbol, market, price) {
    const key = `${market}:${symbol}`;
    this.priceCache.set(key, {
      price: price,
      timestamp: new Date()
    });
  }

  // Check all limit orders against current prices
  async checkAllLimitOrders() {
    try {
      // Get all unique symbols and markets from pending limit orders
      const response = await fetch('/api/getUsers');
      const data = await response.json();
      
      if (!data.users) return;

      const symbolsToCheck = new Set();
      
      // Collect all symbols with pending limit orders
      data.users.forEach(user => {
        const allOrders = [...(user.buyOrders || []), ...(user.sellOrders || [])];
        allOrders.forEach(order => {
          if (order.status === 'pending' && order.type === 'limit' && order.symbol && order.market) {
            symbolsToCheck.add(`${order.market}:${order.symbol}`);
          }
        });
      });

      // Check each symbol
      for (const symbolKey of symbolsToCheck) {
        const [market, symbol] = symbolKey.split(':');
        const cachedPrice = this.priceCache.get(symbolKey);
        
        if (cachedPrice && cachedPrice.price !== undefined) {
          await this.checkLimitOrdersForSymbol(symbol, market, cachedPrice.price);
        }
      }
    } catch (error) {
      console.error('Error checking limit orders:', error);
    }
  }

  // Check limit orders for a specific symbol
  async checkLimitOrdersForSymbol(symbol, market, currentPrice) {
    try {
      const response = await fetch('/api/checkLimitOrders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          market: market,
          currentPrice: currentPrice
        }),
      });

      const result = await response.json();
      
      if (result.totalExecuted > 0) {
        console.log(`Executed ${result.totalExecuted} limit orders for ${symbol} at price ${currentPrice}`);
        // Trigger UI update if needed
        this.notifyOrderExecution(result.executedOrders);
      }
    } catch (error) {
      console.error(`Error checking limit orders for ${symbol}:`, error);
    }
  }

  // Notify about order execution (can be extended for real-time UI updates)
  notifyOrderExecution(executedOrders) {
    // This can be extended to emit events or update UI in real-time
    if (typeof window !== 'undefined') {
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('limitOrderExecuted', {
        detail: { executedOrders }
      }));
    }
  }

  // Get current price for a symbol
  getCurrentPrice(symbol, market) {
    const key = `${market}:${symbol}`;
    const cached = this.priceCache.get(key);
    return cached ? cached.price : null;
  }

  // Clear price cache
  clearPriceCache() {
    this.priceCache.clear();
  }
}

// Create singleton instance
const limitOrderService = new LimitOrderService();

export default limitOrderService;






