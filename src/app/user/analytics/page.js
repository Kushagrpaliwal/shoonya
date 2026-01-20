"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart2,
    AlertTriangle,
    Award,
    Activity,
} from "lucide-react";
import {
    calculateNetPnL,
    calculateWinRate,
    calculateMaxDrawdown,
    calculateEquityCurve,
    groupPnLByWeekday,
    groupPnLByTimeWindow,
    generateInsights,
    calculatePnL,
} from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades } from "@/app/lib/mockTradeData";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Stats Card Component
function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp }) {
    return (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">{title}</p>
                        <p className={`text-2xl font-bold mt-1 ${trendUp === true ? "text-green-600" :
                            trendUp === false ? "text-red-600" : "text-gray-900"
                            }`}>
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl ${trendUp === true ? "bg-green-50" :
                        trendUp === false ? "bg-red-50" : "bg-gray-100"
                        }`}>
                        <Icon className={`h-5 w-5 ${trendUp === true ? "text-green-500" :
                            trendUp === false ? "text-red-500" : "text-gray-500"
                            }`} />
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 mt-3 text-xs ${trendUp ? "text-green-600" : "text-red-600"
                        }`}>
                        {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{trend}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Insight Card Component
function InsightCard({ insight }) {
    const bgColors = {
        success: "bg-green-50 border-green-200",
        warning: "bg-amber-50 border-amber-200",
        info: "bg-blue-50 border-blue-200",
    };

    const textColors = {
        success: "text-green-700",
        warning: "text-amber-700",
        info: "text-blue-700",
    };

    return (
        <div className={`p-4 rounded-xl border ${bgColors[insight.type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <p className={`text-sm ${textColors[insight.type]}`}>
                    {insight.message}
                </p>
            </div>
        </div>
    );
}

export default function AnalyticsDashboard() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchTrades();
    }, []);

    // Calculate metrics
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => calculatePnL(t) > 0).length;
    const losingTrades = trades.filter((t) => calculatePnL(t) < 0).length;
    const winRate = calculateWinRate(trades);
    const netPnL = calculateNetPnL(trades);
    const maxDrawdown = calculateMaxDrawdown(trades);
    const equityCurve = calculateEquityCurve(trades);
    const weekdayPnL = groupPnLByWeekday(trades);
    const timeWindowPnL = groupPnLByTimeWindow(trades);
    const insights = generateInsights(trades);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: "rgba(0,0,0,0.05)",
                },
            },
        },
    };

    // Equity Curve Data
    const equityCurveData = {
        labels: equityCurve.map((point) => point.date),
        datasets: [
            {
                label: "Equity",
                data: equityCurve.map((point) => point.equity),
                fill: true,
                borderColor: netPnL >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                backgroundColor: netPnL >= 0
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: netPnL >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
            },
        ],
    };

    // Win/Loss Ratio Data
    const winLossData = {
        labels: ["Winning", "Losing"],
        datasets: [
            {
                data: [winningTrades, losingTrades],
                backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
                borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
                borderWidth: 2,
            },
        ],
    };

    // Weekday PnL Data
    const weekdayData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [
            {
                label: "PnL",
                data: [
                    weekdayPnL["Monday"]?.pnl || 0,
                    weekdayPnL["Tuesday"]?.pnl || 0,
                    weekdayPnL["Wednesday"]?.pnl || 0,
                    weekdayPnL["Thursday"]?.pnl || 0,
                    weekdayPnL["Friday"]?.pnl || 0,
                ],
                backgroundColor: [
                    weekdayPnL["Monday"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    weekdayPnL["Tuesday"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    weekdayPnL["Wednesday"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    weekdayPnL["Thursday"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    weekdayPnL["Friday"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                ],
                borderRadius: 8,
            },
        ],
    };

    // Time Window PnL Data
    const timeWindowData = {
        labels: ["9-11 AM", "11-1 PM", "1-3 PM", "3-5 PM"],
        datasets: [
            {
                label: "PnL",
                data: [
                    timeWindowPnL["9AM-11AM"]?.pnl || 0,
                    timeWindowPnL["11AM-1PM"]?.pnl || 0,
                    timeWindowPnL["1PM-3PM"]?.pnl || 0,
                    timeWindowPnL["3PM-5PM"]?.pnl || 0,
                ],
                backgroundColor: [
                    timeWindowPnL["9AM-11AM"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    timeWindowPnL["11AM-1PM"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    timeWindowPnL["1PM-3PM"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                    timeWindowPnL["3PM-5PM"]?.pnl >= 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                ],
                borderRadius: 8,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Empty state
    if (trades.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen p-4">
                <Card className="bg-white shadow-sm mb-6">
                    <CardContent className="p-4">
                        <h1 className="text-xl font-bold text-gray-900">Trade Analytics Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Learn from your trading patterns and improve performance
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Completed Trades Yet
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Start trading in the simulation to see your analytics here.
                            Complete a few trades and come back to track your performance!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            {/* Header */}
            <Card className="bg-white shadow-sm mb-6">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Trade Analytics Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Learn from your trading patterns and improve performance
                            </p>
                        </div>
                        <RefreshButton onRefresh={fetchTrades} />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatsCard
                    title="Total Trades"
                    value={totalTrades}
                    subtitle="Completed trades"
                    icon={BarChart2}
                />
                <StatsCard
                    title="Winning Trades"
                    value={winningTrades}
                    subtitle={`${losingTrades} losing`}
                    icon={Award}
                    trendUp={winningTrades > losingTrades}
                />
                <StatsCard
                    title="Win Rate"
                    value={`${winRate.toFixed(1)}%`}
                    subtitle={winRate >= 50 ? "Above average" : "Needs improvement"}
                    icon={Target}
                    trendUp={winRate >= 50}
                />
                <StatsCard
                    title="Net PnL"
                    value={`₹${netPnL.toFixed(2)}`}
                    subtitle="After charges"
                    icon={netPnL >= 0 ? TrendingUp : TrendingDown}
                    trendUp={netPnL >= 0}
                />
                <StatsCard
                    title="Max Drawdown"
                    value={`₹${maxDrawdown.toFixed(2)}`}
                    subtitle="Peak to trough"
                    icon={AlertTriangle}
                    trendUp={maxDrawdown < netPnL * 0.2 ? true : false}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Equity Curve */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Equity Curve
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Your cumulative profit/loss over time
                        </p>
                        <div className="h-64">
                            <Line data={equityCurveData} options={chartOptions} />
                        </div>
                    </CardContent>
                </Card>

                {/* Win/Loss Ratio */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Win vs Loss Ratio
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Distribution of winning and losing trades
                        </p>
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-48 h-48">
                                <Doughnut
                                    data={winLossData}
                                    options={{
                                        ...chartOptions,
                                        cutout: "65%",
                                        plugins: {
                                            legend: { display: true, position: "bottom" }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PnL by Weekday */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            PnL by Weekday
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Which days work best for your trading style
                        </p>
                        <div className="h-64">
                            <Bar data={weekdayData} options={chartOptions} />
                        </div>
                    </CardContent>
                </Card>

                {/* PnL by Time Window */}
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            PnL by Time Window
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            When during the day you trade best
                        </p>
                        <div className="h-64">
                            <Bar data={timeWindowData} options={chartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights Section */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📊 Trading Insights
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Personalized observations based on your trading data
                    </p>
                    {insights.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insights.map((insight, index) => (
                                <InsightCard key={index} insight={insight} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">
                            Complete more trades to see personalized insights
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
