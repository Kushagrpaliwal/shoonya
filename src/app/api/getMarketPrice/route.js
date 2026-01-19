import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { symbol, market } = await req.json();

    if (!symbol || !market) {
      return NextResponse.json(
        { error: "Symbol and market are required" },
        { status: 400 }
      );
    }

    // This is a mock implementation for testing
    // In a real application, you would fetch actual market data from your trading API
    const mockPrices = {
      'NIFTY': { 'NSE': 19500 + Math.random() * 100 },
      'BANKNIFTY': { 'NSE': 44500 + Math.random() * 200 },
      'RELIANCE': { 'NSE': 2500 + Math.random() * 50 },
      'TCS': { 'NSE': 3800 + Math.random() * 100 },
      'INFY': { 'NSE': 1500 + Math.random() * 30 },
      'HDFC': { 'NSE': 1600 + Math.random() * 40 },
      'GOLD': { 'MCX': 65000 + Math.random() * 1000 },
      'SILVER': { 'MCX': 75000 + Math.random() * 2000 },
      'CRUDEOIL': { 'MCX': 6500 + Math.random() * 200 },
      'COPPER': { 'MCX': 750 + Math.random() * 20 }
    };

    const currentPrice = mockPrices[symbol]?.[market] || (1000 + Math.random() * 500);

    return NextResponse.json({
      symbol: symbol,
      market: market,
      price: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error getting market price:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




