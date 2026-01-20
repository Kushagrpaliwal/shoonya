"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    ShieldX,
    Timer,
    Target,
    TrendingDown,
    Info,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { detectMistakes, calculatePnL, calculateRiskRewardRatio } from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades } from "@/app/lib/mockTradeData";

// Severity Badge Component
function SeverityBadge({ severity }) {
    const config = {
        LOW: { color: "bg-blue-100 text-blue-700", label: "Low" },
        MEDIUM: { color: "bg-amber-100 text-amber-700", label: "Medium" },
        HIGH: { color: "bg-red-100 text-red-700", label: "High" },
    };

    const { color, label } = config[severity] || config.MEDIUM;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

// Mistake Type Card
function MistakeTypeCard({ icon: Icon, title, count, impact, description, severity, color }) {
    return (
        <Card className={`border-2 ${color.border}`}>
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${color.bg}`}>
                        <Icon className={`h-6 w-6 ${color.icon}`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            <SeverityBadge severity={severity} />
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{description}</p>
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{count}</p>
                                <p className="text-xs text-gray-400">occurrences</p>
                            </div>
                            <div className="border-l border-gray-200 pl-4">
                                <p className={`text-lg font-bold ${impact > 0 ? "text-red-600" : "text-gray-400"}`}>
                                    ₹{impact.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">estimated impact</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MistakeTracker() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMistakeType, setSelectedMistakeType] = useState("all");

    const [mistakeList, setMistakeList] = useState([]);

    // Load and Sync Data
    useEffect(() => {
        const syncMistakes = async () => {
            try {
                const email = localStorage.getItem("TradingUserEmail");
                if (!email) {
                    setLoading(false);
                    return;
                }

                // 1. Fetch Trades
                const responseUsers = await fetch(`/api/getUsers?email=${email}`);
                const resultUsers = await responseUsers.json();
                let completedTrades = [];


                if (resultUsers.users && resultUsers.users.length > 0) {
                    const allOrders = resultUsers.users[0].totalOrders || [];
                    completedTrades = getCompletedTrades(allOrders);
                } else {
                    completedTrades = [];
                }

                setTrades(completedTrades);

                // 2. Detect Mistakes locally
                const detected = detectMistakes(completedTrades);

                // Flatten detected mistakes for syncing
                const allDetected = [
                    ...detected.noStopLoss,
                    ...detected.poorRR,
                    ...detected.rapidReentry
                ];

                // 3. Sync to Backend (Only for REAL trades)
                if (allDetected.length > 0) {
                    await fetch('/api/mistakeLog', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            mistakes: allDetected
                        })
                    });
                }

                // 4. Set Mistake List (Fetch from Backend)
                const responseLog = await fetch(`/api/mistakeLog?email=${email}`);
                const resultLog = await responseLog.json();

                if (resultLog.mistakes) {
                    setMistakeList(resultLog.mistakes);
                } else {
                    setMistakeList([]);
                }

            } catch (error) {
                console.error("Error syncing mistakes:", error);
                setTrades([]);
            } finally {
                setLoading(false);
            }
        };

        syncMistakes();
    }, []);

    // Categorize mistakes from the flat list for statistics
    const mistakesStats = useMemo(() => {
        const stats = {
            noStopLoss: mistakeList.filter(m => m.mistakeType === 'NO_STOP_LOSS'),
            poorRR: mistakeList.filter(m => m.mistakeType === 'POOR_RR_RATIO'),
            rapidReentry: mistakeList.filter(m => m.mistakeType === 'RAPID_REENTRY'),
            total: mistakeList.length
        };
        return stats;
    }, [mistakeList]);

    // Calculate totals
    const totalMistakes = mistakesStats.total;
    const noStopLossCount = mistakesStats.noStopLoss.length;
    const poorRRCount = mistakesStats.poorRR.length;
    const rapidReentryCount = mistakesStats.rapidReentry.length;

    const noStopLossImpact = mistakesStats.noStopLoss.reduce((sum, m) => sum + (m.impact || 0), 0);
    const poorRRImpact = mistakesStats.poorRR.reduce((sum, m) => sum + (m.impact || 0), 0);
    const rapidReentryImpact = mistakesStats.rapidReentry.reduce((sum, m) => sum + (m.impact || 0), 0);
    const totalImpact = noStopLossImpact + poorRRImpact + rapidReentryImpact;

    // Get mistakes for table
    const mistakeTrades = useMemo(() => {
        let result = [];

        if (selectedMistakeType === "all") {
            result = mistakeList;
        } else if (selectedMistakeType === "noStopLoss") {
            result = mistakesStats.noStopLoss;
        } else if (selectedMistakeType === "poorRR") {
            result = mistakesStats.poorRR;
        } else if (selectedMistakeType === "rapidReentry") {
            result = mistakesStats.rapidReentry;
        }

        return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [mistakeList, mistakesStats, selectedMistakeType]);

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
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Rule Violation & Mistake Tracker</h1>
                            <p className="text-sm text-gray-500">
                                Identify and learn from common trading mistakes
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg mb-6">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm">Total Mistakes</p>
                            <p className="text-4xl font-bold">{totalMistakes}</p>
                            <p className="text-gray-400 text-xs mt-1">across all trades</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Impact</p>
                            <p className="text-4xl font-bold text-red-400">₹{totalImpact.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs mt-1">estimated loss from mistakes</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Mistake Rate</p>
                            <p className="text-4xl font-bold">
                                {trades.length > 0 ? ((totalMistakes / trades.length) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-gray-400 text-xs mt-1">of trades have issues</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mistake Type Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <MistakeTypeCard
                    icon={ShieldX}
                    title="No Stop Loss"
                    count={noStopLossCount}
                    impact={noStopLossImpact}
                    description="Trades executed without a stop loss order to limit losses"
                    severity="HIGH"
                    color={{
                        bg: "bg-red-50",
                        border: "border-red-200",
                        icon: "text-red-600",
                    }}
                />

                <MistakeTypeCard
                    icon={Target}
                    title="Poor Risk-Reward"
                    count={poorRRCount}
                    impact={poorRRImpact}
                    description="R:R ratio less than 1:1 - risking more than potential gain"
                    severity="MEDIUM"
                    color={{
                        bg: "bg-amber-50",
                        border: "border-amber-200",
                        icon: "text-amber-600",
                    }}
                />

                <MistakeTypeCard
                    icon={Timer}
                    title="Rapid Re-entry"
                    count={rapidReentryCount}
                    impact={rapidReentryImpact}
                    description="Entering new trade within 5 minutes after a loss"
                    severity="MEDIUM"
                    color={{
                        bg: "bg-purple-50",
                        border: "border-purple-200",
                        icon: "text-purple-600",
                    }}
                />
            </div>

            {/* Mistake Trades Table */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Mistake Details</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Filter:</span>
                            <select
                                value={selectedMistakeType}
                                onChange={(e) => setSelectedMistakeType(e.target.value)}
                                className="h-9 px-3 rounded-md border border-gray-200 text-sm"
                            >
                                <option value="all">All Mistakes</option>
                                <option value="noStopLoss">No Stop Loss</option>
                                <option value="poorRR">Poor R:R</option>
                                <option value="rapidReentry">Rapid Re-entry</option>
                            </select>
                        </div>
                    </div>

                    {mistakeTrades.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Mistakes Found!
                            </h3>
                            <p className="text-gray-500">
                                {trades.length === 0
                                    ? "Complete some trades to see mistake analysis"
                                    : "Great job! Your trades follow good practices."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Side</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Mistake Type</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Severity</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">PnL</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mistakeTrades.map((trade, index) => {
                                        const pnl = calculatePnL(trade);
                                        const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";

                                        const mistakeLabels = {
                                            NO_STOP_LOSS: { label: "No Stop Loss", icon: ShieldX, color: "text-red-600 bg-red-50" },
                                            POOR_RR_RATIO: { label: "Poor R:R", icon: Target, color: "text-amber-600 bg-amber-50" },
                                            RAPID_REENTRY: { label: "Rapid Re-entry", icon: Timer, color: "text-purple-600 bg-purple-50" },
                                        };

                                        const mistakeInfo = mistakeLabels[trade.mistakeType] || mistakeLabels.POOR_RR_RATIO;
                                        const MistakeIcon = mistakeInfo.icon;

                                        return (
                                            <tr
                                                key={`${trade.tradeId || trade._id}-${index}`}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="p-3 text-sm text-gray-600">
                                                    {new Date(trade.timestamp).toLocaleDateString()}
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
                                                <td className="p-3 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${mistakeInfo.color}`}>
                                                        <MistakeIcon className="h-3.5 w-3.5" />
                                                        {mistakeInfo.label}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <SeverityBadge severity={trade.severity} />
                                                </td>
                                                <td className={`p-3 text-right text-sm font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-center text-xs text-gray-500">
                                                    {trade.mistakeType === "POOR_RR_RATIO" && trade.rrRatio && (
                                                        <span>R:R = 1:{trade.rrRatio.toFixed(2)}</span>
                                                    )}
                                                    {trade.mistakeType === "RAPID_REENTRY" && trade.timeSinceLoss && (
                                                        <span>{trade.timeSinceLoss} min after loss</span>
                                                    )}
                                                    {trade.mistakeType === "NO_STOP_LOSS" && (
                                                        <span>SL not set</span>
                                                    )}
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

            {/* Educational Section */}
            <Card className="bg-white shadow-sm mt-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📚 How to Avoid These Mistakes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldX className="h-5 w-5 text-red-600" />
                                <h4 className="font-medium text-red-800">No Stop Loss</h4>
                            </div>
                            <p className="text-sm text-red-700">
                                Always set a stop loss before entering any trade. This protects your capital
                                and removes emotion from the exit decision.
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-amber-600" />
                                <h4 className="font-medium text-amber-800">Poor R:R Ratio</h4>
                            </div>
                            <p className="text-sm text-amber-700">
                                Aim for at least 1:2 risk-reward. Only take trades where potential
                                profit is at least twice your potential loss.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Timer className="h-5 w-5 text-purple-600" />
                                <h4 className="font-medium text-purple-800">Rapid Re-entry</h4>
                            </div>
                            <p className="text-sm text-purple-700">
                                After a loss, take a 15-30 minute break. Review what went wrong
                                before entering a new trade.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
