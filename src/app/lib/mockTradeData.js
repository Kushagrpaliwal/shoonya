/**
 * Mock Trade Data for UrbanExchange Simulation
 * Realistic sample completed trades for development and demo
 */

// Generate a date within the last 30 days
const getRandomDate = (daysAgo = 30) => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysAgo);
    const randomHours = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
    const randomMinutes = Math.floor(Math.random() * 60);

    const date = new Date(now);
    date.setDate(date.getDate() - randomDays);
    date.setHours(randomHours, randomMinutes, 0, 0);

    return date.toISOString();
};

// Sample instruments
const instruments = [
    { symbol: 'GOLDPETAL', market: 'MCX', lotSize: 100 },
    { symbol: 'CRUDEOIL', market: 'MCX', lotSize: 100 },
    { symbol: 'NATURALGAS', market: 'MCX', lotSize: 1250 },
    { symbol: 'SILVER', market: 'MCX', lotSize: 30 },
    { symbol: 'COPPER', market: 'MCX', lotSize: 2500 },
    { symbol: 'NIFTY', market: 'NSE', lotSize: 50 },
    { symbol: 'BANKNIFTY', market: 'NSE', lotSize: 25 },
];

// Generate mock completed trades
export const mockCompletedTrades = [
    // Profitable trades
    {
        tradeId: 'TRD001',
        _id: 'TRD001',
        symbol: 'GOLDPETAL',
        instrument: 'GOLDPETAL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 5850,
        exitPrice: 5920,
        stopLoss: 5800,
        target: 5950,
        timestamp: getRandomDate(25),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 45,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD002',
        _id: 'TRD002',
        symbol: 'CRUDEOIL',
        instrument: 'CRUDEOIL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 6450,
        exitPrice: 6380,
        stopLoss: 6500,
        target: 6350,
        timestamp: getRandomDate(23),
        tradeStatus: 'TARGET_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 55,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD003',
        _id: 'TRD003',
        symbol: 'SILVER',
        instrument: 'SILVER JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 30,
        lot: 1,
        entryPrice: 74200,
        exitPrice: 74800,
        stopLoss: 73800,
        target: 75000,
        timestamp: getRandomDate(21),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 25,
        charges: 120,
        email: 'demo@urbanexchange.com'
    },
    // Loss trades
    {
        tradeId: 'TRD004',
        _id: 'TRD004',
        symbol: 'NATURALGAS',
        instrument: 'NATURALGAS JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 1250,
        lot: 1,
        entryPrice: 245,
        exitPrice: 238,
        stopLoss: 240,
        target: 255,
        timestamp: getRandomDate(20),
        tradeStatus: 'SL_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 65,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD005',
        _id: 'TRD005',
        symbol: 'NIFTY',
        instrument: 'NIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 50,
        lot: 1,
        entryPrice: 23850,
        exitPrice: 24050,
        stopLoss: 23750,
        target: 24100,
        timestamp: getRandomDate(18),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 80,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD006',
        _id: 'TRD006',
        symbol: 'BANKNIFTY',
        instrument: 'BANKNIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 25,
        lot: 1,
        entryPrice: 51200,
        exitPrice: 51400,
        stopLoss: 51500,
        target: 50800,
        timestamp: getRandomDate(17),
        tradeStatus: 'SL_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 95,
        email: 'demo@urbanexchange.com'
    },
    // No stop loss trade (mistake)
    {
        tradeId: 'TRD007',
        _id: 'TRD007',
        symbol: 'GOLDPETAL',
        instrument: 'GOLDPETAL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 5900,
        exitPrice: 5820,
        stopLoss: null,
        target: 6000,
        timestamp: getRandomDate(15),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 45,
        email: 'demo@urbanexchange.com'
    },
    // Poor R:R trade (mistake)
    {
        tradeId: 'TRD008',
        _id: 'TRD008',
        symbol: 'CRUDEOIL',
        instrument: 'CRUDEOIL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 6400,
        exitPrice: 6420,
        stopLoss: 6300,
        target: 6450,
        timestamp: getRandomDate(14),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 55,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD009',
        _id: 'TRD009',
        symbol: 'COPPER',
        instrument: 'COPPER JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 2500,
        lot: 1,
        entryPrice: 765,
        exitPrice: 758,
        stopLoss: 772,
        target: 752,
        timestamp: getRandomDate(12),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 85,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD010',
        _id: 'TRD010',
        symbol: 'NIFTY',
        instrument: 'NIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 50,
        lot: 1,
        entryPrice: 24100,
        exitPrice: 24200,
        stopLoss: 24200,
        target: 23900,
        timestamp: getRandomDate(10),
        tradeStatus: 'SL_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 80,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD011',
        _id: 'TRD011',
        symbol: 'GOLDPETAL',
        instrument: 'GOLDPETAL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 200,
        lot: 2,
        entryPrice: 5880,
        exitPrice: 5960,
        stopLoss: 5830,
        target: 5980,
        timestamp: getRandomDate(8),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 30,
        charges: 90,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD012',
        _id: 'TRD012',
        symbol: 'CRUDEOIL',
        instrument: 'CRUDEOIL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 6380,
        exitPrice: 6320,
        stopLoss: 6340,
        target: 6450,
        timestamp: getRandomDate(7),
        tradeStatus: 'SL_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 55,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD013',
        _id: 'TRD013',
        symbol: 'SILVER',
        instrument: 'SILVER JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 30,
        lot: 1,
        entryPrice: 75200,
        exitPrice: 74800,
        stopLoss: 75500,
        target: 74500,
        timestamp: getRandomDate(6),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 25,
        charges: 120,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD014',
        _id: 'TRD014',
        symbol: 'BANKNIFTY',
        instrument: 'BANKNIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 25,
        lot: 1,
        entryPrice: 51000,
        exitPrice: 51350,
        stopLoss: 50800,
        target: 51400,
        timestamp: getRandomDate(5),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 95,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD015',
        _id: 'TRD015',
        symbol: 'NATURALGAS',
        instrument: 'NATURALGAS JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 1250,
        lot: 1,
        entryPrice: 252,
        exitPrice: 248,
        stopLoss: 258,
        target: 244,
        timestamp: getRandomDate(4),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 65,
        email: 'demo@urbanexchange.com'
    },
    // More recent trades
    {
        tradeId: 'TRD016',
        _id: 'TRD016',
        symbol: 'GOLDPETAL',
        instrument: 'GOLDPETAL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 5920,
        exitPrice: 5890,
        stopLoss: 5880,
        target: 5970,
        timestamp: getRandomDate(3),
        tradeStatus: 'SL_HIT',
        status: 'completed',
        brokerage: 20,
        charges: 45,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD017',
        _id: 'TRD017',
        symbol: 'CRUDEOIL',
        instrument: 'CRUDEOIL JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 100,
        lot: 1,
        entryPrice: 6520,
        exitPrice: 6450,
        stopLoss: 6580,
        target: 6420,
        timestamp: getRandomDate(2),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 55,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD018',
        _id: 'TRD018',
        symbol: 'NIFTY',
        instrument: 'NIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 50,
        lot: 1,
        entryPrice: 24200,
        exitPrice: 24380,
        stopLoss: 24100,
        target: 24400,
        timestamp: getRandomDate(1),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 80,
        email: 'demo@urbanexchange.com'
    },
    // Recent trades for session summary
    {
        tradeId: 'TRD019',
        _id: 'TRD019',
        symbol: 'SILVER',
        instrument: 'SILVER JAN FUT',
        market: 'MCX',
        exchange: 'MCX',
        side: 'BUY',
        originalArray: 'buyOrders',
        quantity: 30,
        lot: 1,
        entryPrice: 74500,
        exitPrice: 74900,
        stopLoss: 74200,
        target: 75100,
        timestamp: getRandomDate(0),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 25,
        charges: 120,
        email: 'demo@urbanexchange.com'
    },
    {
        tradeId: 'TRD020',
        _id: 'TRD020',
        symbol: 'BANKNIFTY',
        instrument: 'BANKNIFTY JAN FUT',
        market: 'NSE',
        exchange: 'NSE',
        side: 'SELL',
        originalArray: 'sellOrders',
        quantity: 25,
        lot: 1,
        entryPrice: 51500,
        exitPrice: 51350,
        stopLoss: 51700,
        target: 51200,
        timestamp: getRandomDate(0),
        tradeStatus: 'COMPLETED',
        status: 'completed',
        brokerage: 20,
        charges: 95,
        email: 'demo@urbanexchange.com'
    }
];

/**
 * Get completed trades (filter only completed/executed trades with exit price)
 * Transforms real orders to analytics-compatible format
 */
export function getCompletedTrades(allTrades) {
    // Filter completed/executed trades that have an exit price (position closed)
    const completedFromAll = (allTrades || []).filter(t =>
        (t.status === 'completed' || t.status === 'executed') &&
        t.exitPrice // Must have exit price to be considered "completed" for analytics
    );

    // If we have real completed trades with exit prices, transform them
    if (completedFromAll.length > 0) {
        return completedFromAll.map(trade => ({
            ...trade,
            tradeId: trade._id?.toString() || trade.tradeId,
            _id: trade._id?.toString() || trade.tradeId,
            entryPrice: trade.entryPrice || trade.price,
            exitPrice: trade.exitPrice,
            side: trade.originalArray === 'buyOrders' ? 'BUY' : 'SELL',
            instrument: trade.symbol,
            brokerage: trade.brokerage || 20,
            charges: trade.charges || 0,
            stopLoss: trade.stopLoss || null,
            target: trade.target || null,
            tradeStatus: trade.tradeStatus || 'COMPLETED',
        }));
    }

    // Check if there are any open trades (completed/executed but no exit price yet)
    const openTrades = (allTrades || []).filter(t =>
        (t.status === 'completed' || t.status === 'executed') && !t.exitPrice
    );

    // If there are open trades but no closed ones, return empty
    // (user has placed orders but hasn't closed any positions yet)
    if (openTrades.length > 0) {
        return [];
    }

    // Only return mock data if there are no trades at all (demo mode)
    if (!allTrades || allTrades.length === 0) {
        return mockCompletedTrades;
    }

    return [];
}

/**
 * Get open positions (completed/executed trades without exit price)
 * These are trades that can still be closed
 */
export function getOpenPositions(allTrades) {
    const openPositions = (allTrades || []).filter(t =>
        (t.status === 'completed' || t.status === 'executed') &&
        !t.exitPrice && !t.closedAt
    );

    return openPositions.map(trade => ({
        ...trade,
        tradeId: trade._id?.toString() || trade.tradeId,
        _id: trade._id?.toString() || trade.tradeId,
        entryPrice: trade.entryPrice || trade.price,
        side: trade.originalArray === 'buyOrders' ? 'BUY' : 'SELL',
        instrument: trade.symbol,
        brokerage: trade.brokerage || 20,
        charges: trade.charges || 0,
        stopLoss: trade.stopLoss || null,
        target: trade.target || null,
        tradeStatus: trade.tradeStatus || 'OPEN',
    }));
}


/**
 * Get unique instruments from trades
 */
export function getUniqueInstruments(trades) {
    const symbols = new Set();
    trades.forEach(trade => {
        symbols.add(trade.symbol || trade.instrument);
    });
    return Array.from(symbols).filter(Boolean);
}

/**
 * Get unique trade dates
 */
export function getUniqueDates(trades) {
    const dates = new Set();
    trades.forEach(trade => {
        dates.add(new Date(trade.timestamp).toDateString());
    });
    return Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
}
