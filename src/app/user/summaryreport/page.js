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
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
            const allOrders = result.users[0].totalOrders || [];

            // Map all orders to match the expected structure
            const formattedTrades = allOrders.map(trade => ({
              ...trade,
              tradeId: trade._id?.toString() || trade.tradeId,
              entryPrice: parseFloat(trade.entryPrice || trade.price || 0),
              exitPrice: parseFloat(trade.exitPrice || 0),
              quantity: parseFloat(trade.quantity || 0),
              side: trade.originalArray === 'buyOrders' ? 'BUY' : 'SELL', // Force derivation from originalArray
              originalArray: trade.originalArray, // Ensure this is preserved
              instrument: trade.symbol,
              brokerage: parseFloat(trade.brokerage || 0),
              charges: parseFloat(trade.charges || 0),
              status: trade.status || 'unknown'
            }));

            setTrades(formattedTrades);
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

  // Filter trades
  const filteredTrades = useMemo(() => {
    let result = [...trades];

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

  // Calculate summary (Invested & Gains)
  const summary = useMemo(() => {
    const totalTrades = filteredTrades.length;
    // Invested Amount: Sum of (Entry Price * Quantity) for all trades
    const totalInvested = filteredTrades.reduce((sum, t) => sum + (t.entryPrice * t.quantity), 0);

    // Total Gains: Sum of (Exit Price - Entry Price) * Quantity * SideMultiplier (Gross PnL essentially)
    // Note: calculatePnL handles the side logic (Buy vs Sell short)
    const totalGains = filteredTrades.reduce((sum, t) => sum + calculatePnL(t), 0);

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

  // Symbol Analytics Grouping
  const symbolAnalytics = useMemo(() => {
    const grouped = {};

    filteredTrades.forEach(trade => {
      const sym = trade.symbol;
      if (!grouped[sym]) {
        grouped[sym] = {
          symbol: sym,
          trades: [],
          totalInvested: 0,
          totalGains: 0,
          count: 0
        };
      }

      const pnl = calculatePnL(trade);
      const invested = trade.entryPrice * trade.quantity;

      grouped[sym].trades.push(trade);
      grouped[sym].totalInvested += invested;
      grouped[sym].totalGains += pnl;
      grouped[sym].count += 1;
    });

    return Object.values(grouped).sort((a, b) => b.totalGains - a.totalGains); // Sort by gains descending
  }, [filteredTrades]);

  // Prepare chart data for selected symbol
  const chartData = useMemo(() => {
    if (!selectedSymbolAnalytics) return null;

    const symbolData = selectedSymbolAnalytics;
    // Sort trades by timestamp for the chart
    const sortedTrades = [...symbolData.trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedTrades.map((t, index) => `#${index + 1} (${t.side})`);
    const entryData = sortedTrades.map(t => t.entryPrice);
    const exitData = sortedTrades.map(t => t.exitPrice);

    return {
      labels,
      datasets: [
        {
          label: 'Entry Price',
          data: entryData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          label: 'Exit Price',
          data: exitData,
          backgroundColor: 'rgba(249, 115, 22, 0.7)', // Orange
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };
  }, [selectedSymbolAnalytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true, // Show legend for Entry vs Exit
      },
      title: {
        display: true,
        text: `Entry vs Exit Prices for ${selectedSymbolAnalytics?.symbol || ''}`,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          },
          afterBody: function (tooltipItems) {
            const dataIndex = tooltipItems[0].dataIndex;
            const trade = selectedSymbolAnalytics?.trades[dataIndex];
            if (trade) {
              const pnl = calculatePnL(trade);
              return `PnL: ₹${pnl.toFixed(2)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Trade Sequence'
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price (₹)'
        },
        ticks: {
          callback: function (value) {
            return '₹' + value;
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
    const headers = ["Date", "Symbol", "Market", "Side", "Qty", "Entry", "Exit", "Invested", "Gains"];
    const rows = filteredTrades.map((t) => [
      new Date(t.timestamp).toLocaleDateString(),
      t.symbol,
      t.market || t.exchange,
      t.side || (t.originalArray === "buyOrders" ? "BUY" : "SELL"),
      t.quantity,
      t.entryPrice,
      t.exitPrice,
      (t.entryPrice * t.quantity).toFixed(2), // Invested
      calculatePnL(t).toFixed(2),             // Gains
    ]);

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalTrades}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Invested Amount</p>
            <p className="text-2xl font-bold text-blue-600">₹{summary.totalInvested.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm ${summary.totalGains >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Total Gains</p>
            <p className={`text-2xl font-bold ${summary.totalGains >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.totalGains >= 0 ? "+" : ""}₹{summary.totalGains.toFixed(2)}
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
                      <span className={`font-bold ${item.totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.totalGains >= 0 ? '+' : ''}₹{item.totalGains.toFixed(0)}
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
              <Bar options={chartOptions} data={chartData} />
            ) : (
              <div className="text-center text-gray-400">
                <BarChart2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a symbol from the list to view PnL Bar Graph</p>
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
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Exit</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Invested</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Net Gains</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade, index) => {
                      const pnl = calculatePnL(trade);
                      const invested = trade.entryPrice * trade.quantity;
                      const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";

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
                          <td className="p-3 text-right text-sm text-gray-700">
                            ₹{trade.exitPrice}
                          </td>
                          <td className="p-3 text-right text-sm font-medium text-blue-600">
                            ₹{invested.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right text-sm font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
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