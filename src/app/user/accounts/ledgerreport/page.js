"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Receipt,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  generateLedgerEntries,
  getDailySummary,
} from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades } from "@/app/lib/mockTradeData";

export default function LedgerReport() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [entryType, setEntryType] = useState("all"); // all, debit, credit
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Generate ledger entries
  const allEntries = useMemo(() => generateLedgerEntries(trades), [trades]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = [...allEntries];

    if (searchTerm) {
      result = result.filter((e) =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      result = result.filter((e) => new Date(e.timestamp) >= new Date(dateFrom));
    }

    if (entryType === "debit") {
      result = result.filter((e) => e.debit > 0);
    } else if (entryType === "credit") {
      result = result.filter((e) => e.credit > 0);
    }

    return result;
  }, [allEntries, searchTerm, dateFrom, entryType]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const netBalance = totalCredit - totalDebit;

    const depositEntries = filteredEntries.filter((e) => e.type === "PROFIT");
    const withdrawalEntries = filteredEntries.filter((e) => e.type === "LOSS" || e.type === "BROKERAGE" || e.type === "CHARGES");

    const totalDeposits = depositEntries.reduce((sum, e) => sum + e.credit, 0);
    const totalWithdrawals = withdrawalEntries.reduce((sum, e) => sum + e.debit, 0);

    return {
      totalCredit,
      totalDebit,
      netBalance,
      totalDeposits,
      totalWithdrawals,
      entryCount: filteredEntries.length,
    };
  }, [filteredEntries]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setDateFrom("");
    setEntryType("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Sr No", "Date", "Description", "Debit", "Credit", "Balance"];
    const rows = filteredEntries.map((entry, index) => [
      index + 1,
      entry.date,
      entry.description,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      entry.balance.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ledger_report_${new Date().toISOString().split("T")[0]}.csv`);
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
                <h1 className="text-xl font-bold text-gray-900">Ledger Report</h1>
                <p className="text-sm text-gray-500">
                  Complete transaction history and account balance
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
              disabled={filteredEntries.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">Total Credits</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{totals.totalCredit.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-xs text-gray-600">Total Debits</p>
            </div>
            <p className="text-2xl font-bold text-red-600">₹{totals.totalDebit.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className={`border-2 shadow-sm ${totals.netBalance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <p className="text-xs text-gray-600">Net Balance</p>
            </div>
            <p className={`text-2xl font-bold ${totals.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{totals.netBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Deposits</p>
            <p className="text-2xl font-bold text-blue-600">₹{totals.totalDeposits.toFixed(2)}</p>
            <p className="text-xs text-gray-400">From profits</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200 border-2 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600 mb-1">Total Withdrawals</p>
            <p className="text-2xl font-bold text-amber-600">₹{totals.totalWithdrawals.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Losses & charges</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900">{totals.entryCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 shadow-lg mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label className="text-white text-sm mb-1 block">Entry Type</Label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white text-gray-900 text-sm"
              >
                <option value="all">All Entries</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <Label className="text-white text-sm mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-0 h-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilters} variant="secondary" className="h-10 w-full gap-2">
                Reset Filters
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
              Showing {paginatedEntries.length} of {filteredEntries.length} entries
            </p>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Ledger Entries
              </h3>
              <p className="text-gray-500">
                {allEntries.length === 0
                  ? "Complete some trades to see your ledger"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Sr No</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600">Remarks</th>
                      <th className="p-3 text-right text-sm font-medium text-red-600">Debit</th>
                      <th className="p-3 text-right text-sm font-medium text-green-600">Credit</th>
                      <th className="p-3 text-right text-sm font-medium text-gray-600">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEntries.map((entry, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${entry.type === "BROKERAGE" || entry.type === "CHARGES"
                            ? "bg-gray-50"
                            : ""
                          }`}
                      >
                        <td className="p-3 text-sm text-gray-600">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-3 text-sm text-gray-600">{entry.date}</td>
                        <td className="p-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {entry.type === "PROFIT" && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                            {entry.type === "LOSS" && (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            {(entry.type === "BROKERAGE" || entry.type === "CHARGES") && (
                              <Minus className="h-4 w-4 text-gray-400" />
                            )}
                            {entry.description}
                          </div>
                        </td>
                        <td className="p-3 text-right text-sm text-red-600">
                          {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : "—"}
                        </td>
                        <td className="p-3 text-right text-sm text-green-600">
                          {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : "—"}
                        </td>
                        <td className={`p-3 text-right text-sm font-medium ${entry.balance >= 0 ? "text-gray-900" : "text-red-600"
                          }`}>
                          ₹{entry.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-900 text-white">
                      <td colSpan={3} className="p-3 text-sm font-medium">Total</td>
                      <td className="p-3 text-right text-sm font-bold">
                        ₹{totals.totalDebit.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-sm font-bold">
                        ₹{totals.totalCredit.toFixed(2)}
                      </td>
                      <td className={`p-3 text-right text-sm font-bold ${totals.netBalance >= 0 ? "text-green-400" : "text-red-400"
                        }`}>
                        ₹{totals.netBalance.toFixed(2)}
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
