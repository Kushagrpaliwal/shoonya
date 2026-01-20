"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
} from "lucide-react";
import { calculatePnL } from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades, getUniqueInstruments } from "@/app/lib/mockTradeData";

export default function BrokerageReport() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [market, setMarket] = useState("");
  const [script, setScript] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
            const completedTrades = getCompletedTrades(allOrders);
            setTrades(completedTrades);
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

  // Get unique instruments and markets
  const instruments = useMemo(() => getUniqueInstruments(trades), [trades]);
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

  // Calculate brokerage summary
  const summary = useMemo(() => {
    const totalBrokerage = filteredTrades.reduce((sum, t) => sum + (t.brokerage || 0), 0);
    const totalCharges = filteredTrades.reduce((sum, t) => sum + (t.charges || 0), 0);
    const totalCosts = totalBrokerage + totalCharges;
    const totalTrades = filteredTrades.length;
    const avgBrokerage = totalTrades > 0 ? totalBrokerage / totalTrades : 0;

    // Group by symbol
    const brokerageBySymbol = {};
    filteredTrades.forEach((t) => {
      const symbol = t.symbol || "Unknown";
      if (!brokerageBySymbol[symbol]) {
        brokerageBySymbol[symbol] = { brokerage: 0, charges: 0, trades: 0 };
      }
      brokerageBySymbol[symbol].brokerage += t.brokerage || 0;
      brokerageBySymbol[symbol].charges += t.charges || 0;
      brokerageBySymbol[symbol].trades += 1;
    });

    return {
      totalBrokerage,
      totalCharges,
      totalCosts,
      totalTrades,
      avgBrokerage,
      brokerageBySymbol,
    };
  }, [filteredTrades]);

  // Pagination
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
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Date", "Time", "Symbol", "Market", "Side", "Qty", "Lot", "Rate", "Brokerage", "Charges", "Total Cost"];
    const rows = filteredTrades.map((t) => {
      const isBuy = t.side === "BUY" || t.originalArray === "buyOrders";
      return [
        new Date(t.timestamp).toLocaleDateString(),
        new Date(t.timestamp).toLocaleTimeString(),
        t.symbol,
        t.market || t.exchange,
        isBuy ? "BUY" : "SELL",
        t.quantity,
        t.lot || 1,
        t.entryPrice,
        (t.brokerage || 0).toFixed(2),
        (t.charges || 0).toFixed(2),
        ((t.brokerage || 0) + (t.charges || 0)).toFixed(2),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brokerage_report_${new Date().toISOString().split("T")[0]}.csv`);
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
              <Receipt className="h-6 w-6 text-gray-700" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Brokerage Report</h1>
                <p className="text-sm text-gray-500">
                  Track all brokerage and trading costs
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
        <Card className="bg-amber-50 border-amber-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-gray-600">Total Brokerage</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">₹{summary.totalBrokerage.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Other Charges</p>
            <p className="text-2xl font-bold text-orange-600">₹{summary.totalCharges.toFixed(2)}</p>
            <p className="text-xs text-gray-400">STT, Exchange, GST</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Costs</p>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalCosts.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalTrades}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Avg Per Trade</p>
            <p className="text-2xl font-bold text-gray-900">₹{summary.avgBrokerage.toFixed(2)}</p>
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

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="secondary" className="h-10 gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {paginatedTrades.length} of {filteredTrades.length} entries
            </p>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Brokerage Data
              </h3>
              <p className="text-gray-500">
                {trades.length === 0
                  ? "Complete some trades to see brokerage report"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Trade Time</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Client</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Script</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Trade Type</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Trade Rate</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Qty</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600">Lot</th>
                      <th className="p-3 text-right text-sm font-medium text-amber-600">Brokerage</th>
                      <th className="p-3 text-right text-sm font-medium text-orange-600">Charges</th>
                      <th className="p-3 text-right text-sm font-medium text-red-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrades.map((trade, index) => {
                      const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";
                      const brokerage = trade.brokerage || 0;
                      const charges = trade.charges || 0;
                      const total = brokerage + charges;

                      return (
                        <tr
                          key={trade.tradeId || trade._id || index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-3 text-sm text-gray-600">
                            <div>
                              <p className="font-medium">{new Date(trade.timestamp).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {trade.email?.split("@")[0] || "Client"}
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-900">
                            {trade.symbol}
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
                          <td className="p-3 text-right text-sm text-gray-700">
                            ₹{trade.entryPrice}
                          </td>
                          <td className="p-3 text-center text-sm text-gray-700">
                            {trade.quantity}
                          </td>
                          <td className="p-3 text-center text-sm text-gray-700">
                            {trade.lot || 1}
                          </td>
                          <td className="p-3 text-right text-sm font-medium text-amber-600">
                            ₹{brokerage.toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-sm text-orange-600">
                            ₹{charges.toFixed(2)}
                          </td>
                          <td className="p-3 text-right text-sm font-semibold text-red-600">
                            ₹{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-900 text-white">
                      <td colSpan={7} className="p-3 text-sm font-medium">Total</td>
                      <td className="p-3 text-right text-sm font-bold">
                        ₹{summary.totalBrokerage.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-sm font-bold">
                        ₹{summary.totalCharges.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-sm font-bold">
                        ₹{summary.totalCosts.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
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