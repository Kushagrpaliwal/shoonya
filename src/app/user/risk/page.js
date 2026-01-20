"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocket } from "@/app/lib/WebSocketContext";
import {
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    XCircle,
    TrendingDown,
    Activity,
    Clock,
    Repeat,
    Settings,
    Save,
    TrendingUp,
} from "lucide-react";
import {
    calculatePnL,
    calculateConsecutiveLosses,
    getTradesForDate,
    calculateNetPnL,
} from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades } from "@/app/lib/mockTradeData";

// Risk Status Component
function RiskStatusCard({ status, title, message }) {
    const statusConfig = {
        SAFE: {
            icon: ShieldCheck,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            label: "SAFE",
            labelBg: "bg-green-100 text-green-700",
        },
        WARNING: {
            icon: AlertTriangle,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            label: "WARNING",
            labelBg: "bg-amber-100 text-amber-700",
        },
        LOCKED: {
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            label: "HIGH RISK",
            labelBg: "bg-red-100 text-red-700",
        },
    };

    const config = statusConfig[status] || statusConfig.SAFE;
    const Icon = config.icon;

    return (
        <Card className={`${config.bgColor} ${config.borderColor} border-2 shadow-sm`}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${config.bgColor}`}>
                        <Icon className={`h-8 w-8 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.labelBg}`}>
                                {config.label}
                            </span>
                        </div>
                        <p className="text-gray-600">{message}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Metric Card Component
function MetricCard({ icon: Icon, title, value, limit, status, note }) {
    const statusColors = {
        ok: "border-green-200 bg-green-50",
        warning: "border-amber-200 bg-amber-50",
        danger: "border-red-200 bg-red-50",
    };

    return (
        <Card className={`border-2 ${statusColors[status] || "border-gray-200 bg-white"}`}>
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">{title}</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500 mt-1">Limit: {limit}</p>
                    </div>
                </div>
                {note && <p className="text-xs text-gray-500 mt-3">{note}</p>}
            </CardContent>
        </Card>
    );
}

export default function RiskMonitor() {
    const { isConnected, liveData, subscribe, unsubscribe } = useWebSocket();
    const [trades, setTrades] = useState([]);
    const [pendingTrades, setPendingTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxHighRiskTrades, setMaxHighRiskTrades] = useState(5);
    const [saving, setSaving] = useState(false);

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            const email = localStorage.getItem("TradingUserEmail");
            if (email) {
                try {
                    const response = await fetch(`/api/riskSettings?email=${email}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.maxHighRiskTrades) {
                            setMaxHighRiskTrades(data.maxHighRiskTrades);
                        }
                    }
                } catch (error) {
                    console.error("Failed to load settings:", error);
                }
            }
        };
        loadSettings();
    }, []);

    const saveLimit = async () => {
        setSaving(true);
        try {
            const email = localStorage.getItem("TradingUserEmail");
            if (!email) return;

            const response = await fetch('/api/riskSettings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    maxHighRiskTrades
                })
            });

            if (!response.ok) {
                alert("Failed to save limit");
            }
        } catch (error) {
            console.error("Error saving limit:", error);
            alert("Error saving limit");
        } finally {
            setSaving(false);
        }
    };

    // Load data
    useEffect(() => {
        const fetchCheck = async () => {
            const email = localStorage.getItem("TradingUserEmail");
            if (!email) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch User Trades
                const responseUsers = await fetch(`/api/getUsers?email=${email}`);
                const resultUsers = await responseUsers.json();
                if (resultUsers.users && resultUsers.users.length > 0) {
                    const allOrders = resultUsers.users[0].totalOrders || [];

                    // Get completed trades
                    const completedTrades = getCompletedTrades(allOrders);
                    setTrades(completedTrades);

                    // Get pending trades
                    const pending = allOrders.filter(order => order.status === 'pending');
                    setPendingTrades(pending);
                } else {
                    setTrades([]);
                    setPendingTrades([]);
                }

                // Risk settings fetch removed
            } catch (error) {
                console.error("Error fetching data:", error);
                setTrades([]);
                setPendingTrades([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCheck();
    }, []);

    // Subscribe to pending trades for live data  
    useEffect(() => {
        if (!isConnected || pendingTrades.length === 0) return;

        // Subscribe to all pending trade symbols
        const instrumentsString = pendingTrades
            .map(trade => `${trade.exchange || trade.market}|${trade.token}`)
            .join('#');

        if (instrumentsString) {
            subscribe(instrumentsString, "depth");
            console.log("Subscribed to pending trades:", instrumentsString);
        }

        // Cleanup: unsubscribe when component unmounts or pending trades change
        return () => {
            if (instrumentsString) {
                unsubscribe(instrumentsString, "depth");
                console.log("Unsubscribed from pending trades");
            }
        };
    }, [isConnected, pendingTrades, subscribe, unsubscribe]);

    // Calculate daily metrics
    const dailyMetrics = useMemo(() => {
        const today = new Date();
        const todayTrades = getTradesForDate(trades, today);
        const todayPnL = calculateNetPnL(todayTrades);
        const consecutiveLosses = calculateConsecutiveLosses(trades);

        // Calculate Total Buy and Total Sell for today's trades
        let totalBuyValue = 0;
        let totalSellValue = 0;

        todayTrades.forEach(trade => {
            if (trade.entryPrice && trade.exitPrice && trade.quantity) {
                const entryVal = trade.entryPrice * trade.quantity;
                const exitVal = trade.exitPrice * trade.quantity;
                const isLong = trade.side === "BUY" || trade.originalArray === "buyOrders";

                if (isLong) {
                    totalBuyValue += entryVal;
                    totalSellValue += exitVal;
                } else {
                    totalSellValue += entryVal;
                    totalBuyValue += exitVal;
                }
            }
        });

        // Add Pending Trades to Totals
        pendingTrades.forEach(trade => {
            const qty = Number(trade.quantity) || 0;
            const entry = Number(trade.entryPrice || trade.price) || 0;
            const val = qty * entry;
            const isLong = trade.side === "BUY" || trade.originalArray === "buyOrders";

            if (isLong) {
                totalBuyValue += val;
            } else {
                totalSellValue += val;
            }
        });

        return {
            todayPnL,
            todayTradeCount: todayTrades.length,
            consecutiveLosses: consecutiveLosses.current,
            maxConsecutiveLosses: consecutiveLosses.max,
            totalBuyValue,
            totalSellValue
        };
    }, [trades, pendingTrades]);

    // Determine overall risk status
    const riskStatus = useMemo(() => {
        // High risk check simplified

        // Check active high risk trades
        let highRiskTradesCount = 0;
        pendingTrades.forEach(trade => {
            const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";
            const entry = Number(trade.entryPrice || trade.price) || 0;

            // Find live data
            const liveDataItem = liveData.find(data =>
                data.tk === `${trade.exchange || trade.market}|${trade.token}` ||
                data.tk === `${trade.exchange || trade.market}_${trade.token}` ||
                data.tk === trade.token ||
                data.ts === trade.symbol
            );

            if (liveDataItem) {
                const live = liveDataItem;
                const high = parseFloat(live.h) || 0;
                const low = parseFloat(live.l) || 0;

                if (high > 0 && low > 0 && entry > 0) {
                    if (isBuy) {
                        if (low > entry) highRiskTradesCount++;
                    } else {
                        if (entry > high) highRiskTradesCount++;
                    }
                }
            }
        });

        if (highRiskTradesCount > maxHighRiskTrades) {
            return {
                status: "LOCKED",
                title: "High Risk Profile",
                message: `You have ${highRiskTradesCount} high risk trades (Limit: ${maxHighRiskTrades}). Please reduce exposure.`,
            };
        }

        return {
            status: "SAFE",
            title: "Low Risk Profile",
            message: "Your risk levels are within acceptable limits.",
        };
    }, [liveData, pendingTrades, maxHighRiskTrades]);

    // metricStatuses removed

    // Save limits removed

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
                            <ShieldAlert className="h-6 w-6 text-gray-700" />
                            <h1 className="text-xl font-bold text-gray-900">Risk Manager</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Max High Risk Limit:</span>
                            <Input
                                type="number"
                                value={maxHighRiskTrades}
                                onChange={(e) => setMaxHighRiskTrades(Number(e.target.value))}
                                className="w-20 h-8"
                            />
                            <Button
                                size="sm"
                                onClick={saveLimit}
                                disabled={saving}
                                className="h-8"
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Panel Removed */}

            {/* Risk Status Card */}
            <div className="mb-6">
                <RiskStatusCard
                    status={riskStatus.status}
                    title={riskStatus.title}
                    message={riskStatus.message}
                />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <MetricCard
                    icon={Activity}
                    title="Total Buy"
                    value={`₹${dailyMetrics.totalBuyValue.toFixed(2)}`}
                    status="ok"
                    note="Total value of buy legs today"
                />

                <MetricCard
                    icon={Activity}
                    title="Total Sell"
                    value={`₹${dailyMetrics.totalSellValue.toFixed(2)}`}
                    status="ok"
                    note="Total value of sell legs today"
                />

                <MetricCard
                    icon={dailyMetrics.totalSellValue - dailyMetrics.totalBuyValue >= 0 ? TrendingUp : TrendingDown}
                    title="Net Profit"
                    value={`₹${(dailyMetrics.totalSellValue - dailyMetrics.totalBuyValue).toFixed(2)}`}
                    status={(dailyMetrics.totalSellValue - dailyMetrics.totalBuyValue) >= 0 ? "ok" : "danger"}
                    note={
                        (dailyMetrics.totalSellValue - dailyMetrics.totalBuyValue) >= 0
                            ? "Gross profit for the day"
                            : "Gross loss for the day"
                    }
                />
            </div>

            {/* Pending Trades Table */}
            <Card className="bg-white shadow-sm mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Pending Trades
                            </h3>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            {pendingTrades.length} Pending
                        </span>
                    </div>

                    {pendingTrades.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Pending Trades
                            </h3>
                            <p className="text-gray-500">
                                All your trades are either completed or you haven't placed any orders yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1700px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">#</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Market</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Side</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Qty</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Entry Price</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Invested/Gains</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Risk Status</th>
                                        <th className="p-3 text-right text-sm font-medium text-blue-600">Live Price</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">LTP</th>
                                        <th className="p-3 text-right text-sm font-medium text-green-600">High</th>
                                        <th className="p-3 text-right text-sm font-medium text-red-600">Low</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Open</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Close</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingTrades.map((trade, index) => {
                                        const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";

                                        // Find live data using same logic as trading page
                                        const liveDataItem = liveData.find(data =>
                                            data.tk === `${trade.exchange || trade.market}|${trade.token}` ||
                                            data.tk === `${trade.exchange || trade.market}_${trade.token}` ||
                                            data.tk === trade.token ||
                                            data.ts === trade.symbol
                                        );

                                        const live = liveDataItem || {};
                                        // Ensure we parse to float as socket data might be string
                                        const livePrice = isBuy
                                            ? (parseFloat(live.sp1) || parseFloat(live.lp))
                                            : (parseFloat(live.bp1) || parseFloat(live.lp));

                                        // Calculate Invested
                                        const qty = Number(trade.quantity) || 0;
                                        const entry = Number(trade.entryPrice || trade.price) || 0;
                                        const invested = qty * entry;

                                        // Calculate Risk Status
                                        let riskStatus = "Unknown";
                                        let riskColor = "text-gray-400";

                                        const high = parseFloat(live.h) || 0;
                                        const low = parseFloat(live.l) || 0;

                                        if (high > 0 && low > 0 && entry > 0) {
                                            if (isBuy) {
                                                if (low > entry) {
                                                    riskStatus = "High Risk";
                                                    riskColor = "text-red-600 font-bold";
                                                } else if (entry > high) {
                                                    riskStatus = "Low Risk";
                                                    riskColor = "text-green-600 font-bold";
                                                } else {
                                                    riskStatus = "Moderate";
                                                    riskColor = "text-yellow-600 font-bold";
                                                }
                                            } else {
                                                // Sell Logic (Interchanged)
                                                if (entry > high) {
                                                    riskStatus = "High Risk";
                                                    riskColor = "text-red-600 font-bold";
                                                } else if (entry < low) {
                                                    riskStatus = "Low Risk";
                                                    riskColor = "text-green-600 font-bold";
                                                } else {
                                                    riskStatus = "Moderate";
                                                    riskColor = "text-yellow-600 font-bold";
                                                }
                                            }
                                        }

                                        return (
                                            <tr
                                                key={trade._id || index}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="p-3 text-sm text-gray-600">
                                                    {index + 1}
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {new Date(trade.timestamp).toLocaleDateString()}
                                                    <br />
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(trade.timestamp).toLocaleTimeString()}
                                                    </span>
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
                                                    ₹{Number(trade.entryPrice || trade.price || 0).toFixed(2)}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700 font-medium">
                                                    ₹{invested.toFixed(2)}
                                                </td>
                                                <td className={`p-3 text-center text-sm ${riskColor}`}>
                                                    {riskStatus}
                                                </td>
                                                <td className="p-3 text-right text-sm font-semibold text-blue-600">
                                                    {livePrice ? `₹${livePrice.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700">
                                                    {live.lp ? `₹${Number(live.lp).toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-sm text-green-600">
                                                    {live.h ? `₹${Number(live.h).toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-sm text-red-600">
                                                    {live.l ? `₹${Number(live.l).toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700">
                                                    {live.o ? `₹${Number(live.o).toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700">
                                                    {live.c ? `₹${Number(live.c).toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 text-center text-sm">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                        {trade.status || 'pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Educational Messages */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        💡 Risk Management Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">Daily Loss Limit</h4>
                            <p className="text-sm text-blue-700">
                                Setting a daily loss limit prevents emotional decision-making.
                                When you hit your limit, it's a signal to stop and review.
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">Trade Count Limit</h4>
                            <p className="text-sm text-green-700">
                                Quality over quantity. More trades don't mean more profits.
                                Focus on high-probability setups.
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-800 mb-2">Consecutive Losses</h4>
                            <p className="text-sm text-amber-700">
                                After multiple losses, emotions can cloud judgment.
                                Take a break, review your trades, then return fresh.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2">Discipline is Key</h4>
                            <p className="text-sm text-purple-700">
                                Successful traders follow rules consistently.
                                This monitor helps you develop that discipline.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                    ⚠️ This is a simulation for learning purposes only.
                    The risk monitor provides educational feedback and does NOT block trading.
                </p>
            </div>
        </div>
    );
}
