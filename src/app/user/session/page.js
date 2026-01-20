"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Clock,
    TrendingUp,
    TrendingDown,
    Star,
    AlertTriangle,
    ArrowRight,
    Play,
    Target,
    XCircle,
} from "lucide-react";
import { calculatePnL, getTradesForDate, calculateRiskRewardRatio } from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades, getUniqueDates } from "@/app/lib/mockTradeData";

// Timeline Trade Card
function TimelineCard({ trade, highlight, index }) {
    const pnl = calculatePnL(trade);
    const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";
    const rrRatio = calculateRiskRewardRatio(trade);

    const highlightStyles = {
        first: "border-blue-300 bg-blue-50",
        best: "border-green-300 bg-green-50",
        worst: "border-red-300 bg-red-50",
    };

    const highlightLabels = {
        first: { icon: Play, label: "First Trade", color: "text-blue-600 bg-blue-100" },
        best: { icon: Star, label: "Best Trade", color: "text-green-600 bg-green-100" },
        worst: { icon: AlertTriangle, label: "Biggest Loss", color: "text-red-600 bg-red-100" },
    };

    const highlightInfo = highlightLabels[highlight];

    return (
        <div className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${pnl >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}>
                    {index + 1}
                </div>
                <div className="w-0.5 flex-1 bg-gray-200 my-2"></div>
            </div>

            {/* Trade Card */}
            <Card className={`flex-1 mb-4 ${highlight ? highlightStyles[highlight] : "bg-white"} border-2 shadow-sm`}>
                <CardContent className="p-4">
                    {/* Highlight Badge */}
                    {highlightInfo && (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mb-3 ${highlightInfo.color}`}>
                            <highlightInfo.icon className="h-3 w-3" />
                            {highlightInfo.label}
                        </div>
                    )}

                    {/* Trade Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{trade.symbol}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isBuy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                {isBuy ? "BUY" : "SELL"}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Trade Flow */}
                    <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500">Entry</p>
                            <p className="font-semibold text-gray-900">₹{trade.entryPrice}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500">Exit</p>
                            <p className="font-semibold text-gray-900">₹{trade.exitPrice}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500">Outcome</p>
                            <p className={`font-bold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {pnl >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                                {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Trade Details */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-900">{trade.quantity}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <p className={`font-medium ${trade.tradeStatus === 'TARGET_HIT' ? 'text-green-600' :
                                trade.tradeStatus === 'SL_HIT' ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                {trade.tradeStatus === 'TARGET_HIT' && <Target className="h-3.5 w-3.5 inline mr-1" />}
                                {trade.tradeStatus === 'SL_HIT' && <XCircle className="h-3.5 w-3.5 inline mr-1" />}
                                {trade.tradeStatus || 'Completed'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">R:R Ratio</p>
                            <p className="font-medium text-gray-900">
                                {rrRatio !== null ? `1:${rrRatio.toFixed(2)}` : "N/A"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Day Summary Card
function DaySummaryCard({ trades }) {
    const totalPnL = trades.reduce((sum, t) => sum + calculatePnL(t), 0);
    const winningTrades = trades.filter(t => calculatePnL(t) > 0).length;
    const losingTrades = trades.filter(t => calculatePnL(t) < 0).length;
    const totalCharges = trades.reduce((sum, t) => (t.brokerage || 0) + (t.charges || 0) + sum, 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">{trades.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Win / Loss</p>
                <p className="text-2xl font-bold">
                    <span className="text-green-600">{winningTrades}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-red-600">{losingTrades}</span>
                </p>
            </div>
            <div className={`rounded-lg shadow-sm p-4 ${totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm text-gray-500">Day PnL</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
                </p>
            </div>
            <div className="bg-amber-50 rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Total Charges</p>
                <p className="text-2xl font-bold text-amber-600">₹{totalCharges.toFixed(2)}</p>
            </div>
        </div>
    );
}

export default function SessionSummary() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");

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

                        setTrades(trades);
                    } else {
                        setTrades([]);
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

    // Get available dates
    const availableDates = useMemo(() => getUniqueDates(trades), [trades]);

    // Set default date to most recent
    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    // Get trades for selected date
    const dayTrades = useMemo(() => {
        if (!selectedDate) return [];
        return getTradesForDate(trades, new Date(selectedDate));
    }, [trades, selectedDate]);

    // Determine highlights
    const highlights = useMemo(() => {
        if (dayTrades.length === 0) return {};

        const result = {};

        // First trade
        if (dayTrades.length > 0) {
            result[dayTrades[0].tradeId || dayTrades[0]._id] = "first";
        }

        // Best trade (highest profit)
        const sortedByProfit = [...dayTrades].sort((a, b) => calculatePnL(b) - calculatePnL(a));
        const bestTrade = sortedByProfit[0];
        if (bestTrade && calculatePnL(bestTrade) > 0) {
            result[bestTrade.tradeId || bestTrade._id] = "best";
        }

        // Worst trade (biggest loss)
        const worstTrade = sortedByProfit[sortedByProfit.length - 1];
        if (worstTrade && calculatePnL(worstTrade) < 0) {
            // Don't override if it's also the first trade
            const worstId = worstTrade.tradeId || worstTrade._id;
            if (!result[worstId]) {
                result[worstId] = "worst";
            }
        }

        return result;
    }, [dayTrades]);

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-gray-700" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Session Summary</h1>
                                <p className="text-sm text-gray-500">
                                    Review your trading day chronologically
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm text-gray-600">Select Date:</Label>
                            <Input
                                type="date"
                                value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ""}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-44"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Date Quick Select */}
            {availableDates.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {availableDates.slice(0, 7).map((date) => (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${new Date(selectedDate).toDateString() === date
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                                }`}
                        >
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </button>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {trades.length === 0 ? (
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Trading Sessions Yet
                        </h3>
                        <p className="text-gray-500">
                            Complete some trades to see your session summaries
                        </p>
                    </CardContent>
                </Card>
            ) : dayTrades.length === 0 ? (
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Trades on This Date
                        </h3>
                        <p className="text-gray-500">
                            Select a different date to view trades
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Day Summary */}
                    <DaySummaryCard trades={dayTrades} />

                    {/* Trade Timeline */}
                    <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Trade Timeline
                            </h3>
                            <div className="pl-2">
                                {dayTrades.map((trade, index) => {
                                    const tradeId = trade.tradeId || trade._id;
                                    return (
                                        <TimelineCard
                                            key={tradeId}
                                            trade={trade}
                                            index={index}
                                            highlight={highlights[tradeId]}
                                        />
                                    );
                                })}
                                {/* Timeline end */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-500">End of trading session</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Insights */}
                    <Card className="bg-white shadow-sm mt-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📊 Session Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {dayTrades.length > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800 font-medium mb-1">First Trade</p>
                                        <p className="text-blue-700 text-sm">
                                            Started with {dayTrades[0].symbol} at{" "}
                                            {new Date(dayTrades[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                )}

                                {(() => {
                                    const sortedByProfit = [...dayTrades].sort((a, b) => calculatePnL(b) - calculatePnL(a));
                                    const best = sortedByProfit[0];
                                    if (best && calculatePnL(best) > 0) {
                                        return (
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800 font-medium mb-1">Best Trade</p>
                                                <p className="text-green-700 text-sm">
                                                    {best.symbol} gave you +₹{calculatePnL(best).toFixed(2)} profit
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {(() => {
                                    const sortedByProfit = [...dayTrades].sort((a, b) => calculatePnL(a) - calculatePnL(b));
                                    const worst = sortedByProfit[0];
                                    if (worst && calculatePnL(worst) < 0) {
                                        return (
                                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-sm text-red-800 font-medium mb-1">Biggest Loss</p>
                                                <p className="text-red-700 text-sm">
                                                    {worst.symbol} caused -₹{Math.abs(calculatePnL(worst)).toFixed(2)} loss
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
