"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity
} from "lucide-react";
import { calculatePnL } from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getUniqueInstruments } from "@/app/lib/mockTradeData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function SummaryReport() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [market, setMarket] = useState("");
  const [script, setScript] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbolAnalytics, setSelectedSymbolAnalytics] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const email = localStorage.getItem("TradingUserEmail");
        if (email) {
          const response = await fetch(`/api/getUsers?email=${email}`);
          const result = await response.json();
          if (result.users && result.users.length > 0) {
            const user = result.users[0];
            const allOrders = (user.totalOrders && user.totalOrders.length > 0)
              ? user.totalOrders
              : [...(user.buyOrders || []), ...(user.sellOrders || [])];

            // Match orders to create trades (FIFO)
            const sortedOrders = allOrders
              .filter(o => {
                const status = (o.status || "").toLowerCase();
                return status === 'completed' || status === 'executed';
              })
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            const positions = {}; // { Symbol: [open_orders] }
            const trades = [];

            sortedOrders.forEach(order => {
              const sym = order.symbol;
              if (!sym) return;

              const side = order.originalArray === 'buyOrders' ? 'BUY' : 'SELL';
              const quantity = parseFloat(order.quantity || 0);
              const price = parseFloat(order.entryPrice || order.price || 0);

              if (!positions[sym]) positions[sym] = [];

              if (positions[sym].length > 0 && positions[sym][0].side !== side) {
                let remainingQty = quantity;

                while (remainingQty > 0 && positions[sym].length > 0) {
                  const matchOrder = positions[sym][0];
                  const matchQty = Math.min(remainingQty, matchOrder.remainingQty);

                  const isLong = matchOrder.side === 'BUY';
                  const entryPrice = matchOrder.price;
                  const exitPrice = price;

                  trades.push({
                    tradeId: `${matchOrder._id}-${order._id}`,
                    _id: matchOrder._id,
                    symbol: sym,
                    instrument: sym,
                    quantity: matchQty,
                    entryPrice: entryPrice,
                    exitPrice: exitPrice,
                    side: isLong ? 'BUY' : 'SELL',
                    originalArray: isLong ? 'buyOrders' : 'sellOrders',
                    timestamp: order.timestamp,
                    brokerage: ((matchOrder.brokerage || 20) / matchOrder.quantity * matchQty) + ((order.brokerage || 20) / order.quantity * matchQty),
                    charges: ((matchOrder.charges || 0) / matchOrder.quantity * matchQty) + ((order.charges || 0) / order.quantity * matchQty),
                    status: 'completed',
                    tradeStatus: 'COMPLETED'
                  });

                  remainingQty -= matchQty;
                  matchOrder.remainingQty -= matchQty;

                  if (matchOrder.remainingQty <= 0.0001) {
                    positions[sym].shift();
                  }
                }

                if (remainingQty > 0.0001) {
                  positions[sym].push({
                    ...order,
                    side: side,
                    price: price,
                    quantity: quantity,
                    remainingQty: remainingQty
                  });
                }

              } else {
                positions[sym].push({
                  ...order,
                  side: side,
                  price: price,
                  quantity: quantity,
                  remainingQty: quantity
                });
              }
            });

            // Add remaining open positions
            Object.keys(positions).forEach(sym => {
              positions[sym].forEach(pos => {
                trades.push({
                  ...pos,
                  tradeId: pos._id,
                  quantity: pos.remainingQty,
                  entryPrice: pos.price,
                  exitPrice: 0,
                  tradeStatus: 'OPEN',
                  originalArray: pos.originalArray || (pos.side === 'BUY' ? 'buyOrders' : 'sellOrders'),
                  // Ensure timestamp is preserved for sorting
                  timestamp: pos.timestamp,
                  status: 'completed' // It is a completed order
                });
              });
            });

            setTrades(trades);
          } else {
            setTrades(mockCompletedTrades);
          }
        } else {
          setTrades(mockCompletedTrades);
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
        setTrades(mockCompletedTrades);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Get unique instruments
  const instruments = useMemo(() => getUniqueInstruments(trades), [trades]);

  // Get unique markets
  const markets = useMemo(() => {
    const m = new Set();
    trades.forEach((t) => m.add(t.market || t.exchange));
    return Array.from(m).filter(Boolean);
  }, [trades]);

  // Filter trades - only show completed ones
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    // Filter to only include completed trades
    result = result.filter((t) => t.status === 'completed');

    if (searchTerm) {
      result = result.filter((t) =>
        (t.symbol || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (market) {
      result = result.filter((t) => (t.market || t.exchange) === market);
    }

    if (script) {
      result = result.filter((t) => t.symbol === script);
    }

    if (dateFrom) {
      result = result.filter((t) => new Date(t.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter((t) => new Date(t.timestamp) <= new Date(dateTo + "T23:59:59"));
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [trades, searchTerm, market, script, dateFrom, dateTo]);

  // Calculate summary (Invested for BUYs & Gains for SELLs)
  const summary = useMemo(() => {
    const totalTrades = filteredTrades.length;
    let totalInvested = 0;
    let totalGains = 0;

    filteredTrades.forEach(t => {
      const qty = t.quantity;
      const entryVal = t.entryPrice * qty;
      const exitVal = (t.exitPrice || 0) * qty;
      const isLong = t.side === 'BUY';

      if (isLong) {
        totalInvested += entryVal;
        totalGains += exitVal;
      } else {
        // Short
        totalGains += entryVal;
        totalInvested += exitVal;
      }
    });

    const winningTrades = filteredTrades.filter((t) => calculatePnL(t) > 0).length;
    const losingTrades = filteredTrades.filter((t) => calculatePnL(t) < 0).length;

    return {
      totalTrades,
      totalInvested,
      totalGains,
      winningTrades,
      losingTrades,
    };
  }, [filteredTrades]);

  // Symbol Analytics Grouping - Invested for BUYs, Gains for SELLs
  const symbolAnalytics = useMemo(() => {
    const grouped = {};

    filteredTrades.forEach(trade => {
      const sym = trade.symbol;
      const isLong = trade.side === 'BUY';
      const quantity = trade.quantity;
      const entryVal = trade.entryPrice * quantity;
      const exitVal = (trade.exitPrice || 0) * quantity;

      if (!grouped[sym]) {
        grouped[sym] = {
          symbol: sym,
          trades: [],
          totalInvested: 0,
          totalGains: 0,
          count: 0
        };
      }

      if (isLong) {
        // Long Trade: Entry is Invested, Exit is Gains
        grouped[sym].totalInvested += entryVal;
        grouped[sym].totalGains += exitVal;
      } else {
        // Short Trade: Entry (Sell) is Gains, Exit (Buy) is Invested
        grouped[sym].totalGains += entryVal;
        grouped[sym].totalInvested += exitVal;
      }

      grouped[sym].trades.push(trade);
      grouped[sym].count += 1;
    });

    return Object.values(grouped).sort((a, b) => b.totalGains - a.totalGains);
  }, [filteredTrades]);

  // Prepare chart data for selected symbol
  const chartData = useMemo(() => {
    if (!selectedSymbolAnalytics) return null;

    const symbolData = selectedSymbolAnalytics;

    return {
      labels: ['Total Invested (BUY)', 'Total Gains (SELL)'],
      datasets: [
        {
          label: 'Amount',
          data: [symbolData.totalInvested, symbolData.totalGains],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)', // Blue for Invested
            'rgba(34, 197, 94, 0.8)', // Green for Gains
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 2,
        }
      ]
    };
  }, [selectedSymbolAnalytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: true,
        labels: {
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `Invested vs Gains for ${selectedSymbolAnalytics?.symbol || ''}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };


  // Pagination settings
  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setMarket("");
    setScript("");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
    setCurrentPage(1);
    setSelectedSymbolAnalytics(null);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Date", "Symbol", "Market", "Side", "Qty", "Entry", "Invested/Gains"];
    const rows = filteredTrades.map((t) => {
      const isBuy = t.side === 'BUY' || t.originalArray === 'buyOrders';
      const value = (t.entryPrice * t.quantity).toFixed(2); // Same calculation for both BUY and SELL

      return [
        new Date(t.timestamp).toLocaleDateString(),
        t.symbol,
        t.market || t.exchange,
        t.side || (t.originalArray === "buyOrders" ? "BUY" : "SELL"),
        t.quantity,
        t.entryPrice,
        value,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `summary_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-gray-700" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Summary Report</h1>
                <p className="text-sm text-gray-500">
                  Overview of all your trading activity
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
              disabled={filteredTrades.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Trades (Completed)</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalTrades}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Invested (BUY Trades)</p>
            <p className="text-2xl font-bold text-blue-600">₹{summary.totalInvested.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Gains (SELL Trades)</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{summary.totalGains.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label className="text-white text-sm mb-1 block">Market</Label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white text-gray-900 text-sm"
              >
                <option value="">All Markets</option>
                {markets.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-white text-sm mb-1 block">Script</Label>
              <select
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white text-gray-900 text-sm"
              >
                <option value="">All Scripts</option>
                {instruments.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-white text-sm mb-1 block">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white border-0 h-10"
              />
            </div>

            <div>
              <Label className="text-white text-sm mb-1 block">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white border-0 h-10"
              />
            </div>

            <div>
              <Label className="text-white text-sm mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-0 h-10"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={resetFilters} variant="secondary" className="h-10 gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symbol Analytics & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Symbol List */}
        <Card className="bg-white shadow-sm lg:col-span-1 h-[500px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Symbol Performance</CardTitle>
            <p className="text-xs text-gray-500">Click a symbol to view chart</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {symbolAnalytics.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No data available</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {symbolAnalytics.map((item) => (
                  <div
                    key={item.symbol}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSymbolAnalytics?.symbol === item.symbol ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => setSelectedSymbolAnalytics(item)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{item.symbol}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.count} Trades</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Invest: <span className="text-gray-900 font-medium">₹{item.totalInvested.toFixed(0)}</span></span>
                      <span className="font-bold text-green-600">
                        ₹{item.totalGains.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart Area */}
        <Card className="bg-white shadow-sm lg:col-span-2 h-[500px]">
          <CardHeader>
            <CardTitle>Trade Analysis Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            {selectedSymbolAnalytics ? (
              <Pie options={chartOptions} data={chartData} />
            ) : (
              <div className="text-center text-gray-400">
                <BarChart2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a symbol from the list to view Invested vs Gains Pie Chart</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {paginatedTrades.length} of {filteredTrades.length} trades
            </p>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <BarChart2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Trades Found
              </h3>
              <p className="text-gray-500">
                {trades.length === 0
                  ? "Complete some trades to see your summary"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left text-sm font-medium text-gray-600">#</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Market</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Side</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Qty</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Entry</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Invested/Gains</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade, index) => {
                      const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";
                      const amount = trade.entryPrice * trade.quantity; // Same calculation for both

                      return (
                        <tr
                          key={trade.tradeId || trade._id || index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-3 text-sm text-gray-600">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-900">
                            {trade.symbol}
                          </td>
                          <td className="p-3 text-center text-sm text-gray-600">
                            {trade.market || trade.exchange}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${isBuy
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {isBuy ? "BUY" : "SELL"}
                            </span>
                          </td>
                          <td className="p-3 text-center text-sm text-gray-700">
                            {trade.quantity}
                          </td>
                          <td className="p-3 text-right text-sm text-gray-700">
                            ₹{trade.entryPrice}
                          </td>
                          <td className={`p-3 text-right text-sm font-semibold ${isBuy ? "text-blue-600" : "text-green-600"}`}>
                            ₹{amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-center text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${trade.status === 'completed' ? 'bg-green-100 text-green-700' :
                              trade.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                trade.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {trade.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}