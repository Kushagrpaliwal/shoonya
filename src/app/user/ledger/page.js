"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ClipboardList,
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
} from "lucide-react";
import {
    generateLedgerEntries,
    getDailySummary,
    getMonthlySummary,
} from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades } from "@/app/lib/mockTradeData";

// Summary Card Component
function SummaryCard({ title, value, subtitle, positive }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${positive === true ? "text-green-600" :
                positive === false ? "text-red-600" : "text-gray-900"
                }`}>
                {value}
            </p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

export default function Ledger() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ledger");

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
                        // Fallback to manual concat if totalOrders is missing or empty
                        // Check if totalOrders exists and is array, if not or empty, try the others
                        const allOrders = (user.totalOrders && user.totalOrders.length > 0)
                            ? user.totalOrders
                            : [...(user.buyOrders || []), ...(user.sellOrders || [])];

                        console.log("Ledger - All Orders found:", allOrders.length);

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

                            // Check if we can match against opposite side
                            if (positions[sym].length > 0 && positions[sym][0].side !== side) {
                                let remainingQty = quantity;

                                while (remainingQty > 0 && positions[sym].length > 0) {
                                    const matchOrder = positions[sym][0];
                                    const matchQty = Math.min(remainingQty, matchOrder.remainingQty);

                                    // Determine Entry/Exit based on which was first
                                    const isLong = matchOrder.side === 'BUY';
                                    const entryPrice = matchOrder.price;
                                    const exitPrice = price;

                                    trades.push({
                                        tradeId: `${matchOrder._id}-${order._id}`,
                                        _id: matchOrder._id, // Use entry ID as main ID
                                        symbol: sym,
                                        instrument: sym,
                                        quantity: matchQty,
                                        entryPrice: entryPrice,
                                        exitPrice: exitPrice,
                                        side: isLong ? 'BUY' : 'SELL', // Trade direction
                                        timestamp: order.timestamp, // Closing time
                                        brokerage: ((matchOrder.brokerage || 20) / matchOrder.quantity * matchQty) + ((order.brokerage || 20) / order.quantity * matchQty),
                                        charges: ((matchOrder.charges || 0) / matchOrder.quantity * matchQty) + ((order.charges || 0) / order.quantity * matchQty),
                                        status: 'completed',
                                        tradeStatus: 'COMPLETED',
                                        date: new Date(order.timestamp).toLocaleDateString()
                                    });

                                    remainingQty -= matchQty;
                                    matchOrder.remainingQty -= matchQty;

                                    if (matchOrder.remainingQty <= 0.0001) {
                                        positions[sym].shift(); // Fully closed
                                    }
                                }

                                // If any quantity left from current order (and we ran out of matches), add to pile (flip side)
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
                                // Same side or empty, add to positions
                                positions[sym].push({
                                    ...order,
                                    side: side,
                                    price: price,
                                    quantity: quantity,
                                    remainingQty: quantity
                                });
                            }
                        });

                        console.log("Ledger - Computed Trades:", trades);
                        setTrades(trades);
                    } else {
                        // User found but no orders, or user not found - set empty to avoid misleading mock data if user expects real data
                        // If you prefer mock data ONLY when user is not logged in:
                        setTrades([]);
                    }
                } else {
                    // No email, keep as empty or mock
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

    // Generate ledger and summaries
    const ledgerEntries = useMemo(() => generateLedgerEntries(trades), [trades]);
    const dailySummary = useMemo(() => getDailySummary(ledgerEntries), [ledgerEntries]);
    const monthlySummary = useMemo(() => getMonthlySummary(ledgerEntries), [ledgerEntries]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
        const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
        const netBalance = totalCredit - totalDebit;
        const totalBrokerage = ledgerEntries
            .filter((e) => e.type === "BROKERAGE")
            .reduce((sum, e) => sum + e.debit, 0);
        const totalCharges = ledgerEntries
            .filter((e) => e.type === "CHARGES")
            .reduce((sum, e) => sum + e.debit, 0);

        return {
            totalCredit,
            totalDebit,
            netBalance,
            totalBrokerage,
            totalCharges,
            totalCosts: totalBrokerage + totalCharges,
        };
    }, [ledgerEntries]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ["Date", "Description", "Debit", "Credit", "Balance"];
        const rows = ledgerEntries.map((entry) => [
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
        link.setAttribute("download", `ledger_${new Date().toISOString().split("T")[0]}.csv`);
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
                            <ClipboardList className="h-6 w-6 text-gray-700" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Ledger & Cost Reports</h1>
                                <p className="text-sm text-gray-500">
                                    Track your trading costs and account balance
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            className="gap-2"
                            disabled={ledgerEntries.length === 0}
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                        <SummaryCard
                            title="Total Credits"
                            value={`₹${totals.totalCredit.toFixed(2)}`}
                            subtitle="From profitable trades"
                            positive={true}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                        <SummaryCard
                            title="Total Debits"
                            value={`₹${totals.totalDebit.toFixed(2)}`}
                            subtitle="Losses & charges"
                            positive={false}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                        <SummaryCard
                            title="Net Balance"
                            value={`₹${totals.netBalance.toFixed(2)}`}
                            subtitle="Overall P&L"
                            positive={totals.netBalance >= 0}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                    <CardContent className="p-4">
                        <SummaryCard
                            title="Trading Costs"
                            value={`₹${totals.totalCosts.toFixed(2)}`}
                            subtitle={`Brokerage: ₹${totals.totalBrokerage.toFixed(2)}`}
                            positive={false}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Cost Awareness Banner */}
            {totals.totalCosts > 0 && (
                <Card className="bg-amber-50 border-amber-200 border-2 shadow-sm mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <DollarSign className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-800">Cost Awareness</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your trading costs (₹{totals.totalCosts.toFixed(2)}) represent{" "}
                                    <span className="font-bold">
                                        {totals.totalCredit > 0
                                            ? ((totals.totalCosts / totals.totalCredit) * 100).toFixed(1)
                                            : 0}%
                                    </span>{" "}
                                    of your total profits. Keep costs in mind when planning trades!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="ledger">Full Ledger</TabsTrigger>
                            <TabsTrigger value="daily">Daily Summary</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
                        </TabsList>

                        {/* Full Ledger */}
                        <TabsContent value="ledger">
                            {ledgerEntries.length === 0 ? (
                                <div className="text-center py-12">
                                    <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Entries Yet
                                    </h3>
                                    <p className="text-gray-500">
                                        Complete trades to see your ledger
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                                <th className="p-3 text-left text-sm font-medium text-gray-600">Description</th>
                                                <th className="p-3 text-right text-sm font-medium text-red-600">Debit</th>
                                                <th className="p-3 text-right text-sm font-medium text-green-600">Credit</th>
                                                <th className="p-3 text-right text-sm font-medium text-gray-600">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledgerEntries.map((entry, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-100 ${entry.type === "BROKERAGE" || entry.type === "CHARGES"
                                                        ? "bg-gray-50"
                                                        : ""
                                                        }`}
                                                >
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
                                                <td colSpan={2} className="p-3 text-sm font-medium">Total</td>
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
                            )}
                        </TabsContent>

                        {/* Daily Summary */}
                        <TabsContent value="daily">
                            {dailySummary.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Daily Data
                                    </h3>
                                    <p className="text-gray-500">
                                        Complete trades to see daily summaries
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                                <th className="p-3 text-center text-sm font-medium text-gray-600">Trades</th>
                                                <th className="p-3 text-right text-sm font-medium text-red-600">Debits</th>
                                                <th className="p-3 text-right text-sm font-medium text-green-600">Credits</th>
                                                <th className="p-3 text-right text-sm font-medium text-gray-600">Net PnL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailySummary.map((day, index) => (
                                                <tr key={index} className="border-b border-gray-100">
                                                    <td className="p-3 text-sm font-medium text-gray-900">{day.date}</td>
                                                    <td className="p-3 text-center text-sm text-gray-600">{day.trades}</td>
                                                    <td className="p-3 text-right text-sm text-red-600">
                                                        ₹{day.totalDebit.toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-right text-sm text-green-600">
                                                        ₹{day.totalCredit.toFixed(2)}
                                                    </td>
                                                    <td className={`p-3 text-right text-sm font-semibold ${day.netPnL >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}>
                                                        {day.netPnL >= 0 ? "+" : ""}₹{day.netPnL.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>

                        {/* Monthly Summary */}
                        <TabsContent value="monthly">
                            {monthlySummary.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Monthly Data
                                    </h3>
                                    <p className="text-gray-500">
                                        Complete trades to see monthly summaries
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-3 text-left text-sm font-medium text-gray-600">Month</th>
                                                <th className="p-3 text-center text-sm font-medium text-gray-600">Trades</th>
                                                <th className="p-3 text-right text-sm font-medium text-red-600">Debits</th>
                                                <th className="p-3 text-right text-sm font-medium text-green-600">Credits</th>
                                                <th className="p-3 text-right text-sm font-medium text-gray-600">Net PnL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlySummary.map((month, index) => (
                                                <tr key={index} className="border-b border-gray-100">
                                                    <td className="p-3 text-sm font-medium text-gray-900">{month.month}</td>
                                                    <td className="p-3 text-center text-sm text-gray-600">{month.trades}</td>
                                                    <td className="p-3 text-right text-sm text-red-600">
                                                        ₹{month.totalDebit.toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-right text-sm text-green-600">
                                                        ₹{month.totalCredit.toFixed(2)}
                                                    </td>
                                                    <td className={`p-3 text-right text-sm font-semibold ${month.netPnL >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}>
                                                        {month.netPnL >= 0 ? "+" : ""}₹{month.netPnL.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
