"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // User limits (from localStorage)
    const [limits, setLimits] = useState({
        maxDailyLoss: 5000,
        maxTradesPerDay: 10,
        maxConsecutiveLosses: 3,
    });

    // Temp limits for editing
    const [tempLimits, setTempLimits] = useState(limits);

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
                    const completedTrades = getCompletedTrades(allOrders);
                    setTrades(completedTrades);
                } else {
                    setTrades([]);
                }

                // 2. Fetch Risk Settings from Backend
                const responseSettings = await fetch(`/api/riskSettings?email=${email}`);
                if (responseSettings.ok) {
                    const settings = await responseSettings.json();
                    const newLimits = {
                        maxDailyLoss: settings.maxDailyLoss || 5000,
                        maxTradesPerDay: settings.maxTradesPerDay || 10,
                        maxConsecutiveLosses: settings.maxConsecutiveLosses || 3
                    };
                    setLimits(newLimits);
                    setTempLimits(newLimits);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setTrades([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCheck();
    }, []);

    // Calculate daily metrics
    const dailyMetrics = useMemo(() => {
        const today = new Date();
        const todayTrades = getTradesForDate(trades, today);
        const todayPnL = calculateNetPnL(todayTrades);
        const consecutiveLosses = calculateConsecutiveLosses(trades);

        return {
            todayPnL,
            todayTradeCount: todayTrades.length,
            consecutiveLosses: consecutiveLosses.current,
            maxConsecutiveLosses: consecutiveLosses.max,
        };
    }, [trades]);

    // Determine overall risk status
    const riskStatus = useMemo(() => {
        const { todayPnL, todayTradeCount, consecutiveLosses } = dailyMetrics;
        const { maxDailyLoss, maxTradesPerDay, maxConsecutiveLosses } = limits;

        let violations = 0;
        let messages = [];

        // Check daily loss
        if (todayPnL <= -maxDailyLoss) {
            violations += 2;
            messages.push("Daily loss limit exceeded");
        } else if (todayPnL <= -maxDailyLoss * 0.7) {
            violations += 1;
            messages.push("Approaching daily loss limit");
        }

        // Check trade count
        if (todayTradeCount >= maxTradesPerDay) {
            violations += 1;
            messages.push("Maximum trades per day reached");
        } else if (todayTradeCount >= maxTradesPerDay * 0.8) {
            violations += 0.5;
            messages.push("Approaching trade limit");
        }

        // Check consecutive losses
        if (consecutiveLosses >= maxConsecutiveLosses) {
            violations += 1;
            messages.push("Too many consecutive losses");
        }

        if (violations >= 2) {
            return {
                status: "LOCKED",
                title: "High Risk Behavior Detected",
                message: messages.join(". ") + ". Consider taking a break and reviewing your strategy.",
            };
        } else if (violations >= 1) {
            return {
                status: "WARNING",
                title: "Risk Increasing",
                message: messages.join(". ") + ". Stay disciplined and monitor your trades carefully.",
            };
        } else {
            return {
                status: "SAFE",
                title: "Good Discipline",
                message: "You're trading within your defined limits. Keep up the good work!",
            };
        }
    }, [dailyMetrics, limits]);

    // Individual metric statuses
    const metricStatuses = useMemo(() => {
        const { todayPnL, todayTradeCount, consecutiveLosses } = dailyMetrics;
        const { maxDailyLoss, maxTradesPerDay, maxConsecutiveLosses } = limits;

        return {
            dailyPnL:
                todayPnL <= -maxDailyLoss
                    ? "danger"
                    : todayPnL <= -maxDailyLoss * 0.7
                        ? "warning"
                        : "ok",
            tradeCount:
                todayTradeCount >= maxTradesPerDay
                    ? "danger"
                    : todayTradeCount >= maxTradesPerDay * 0.8
                        ? "warning"
                        : "ok",
            consecutiveLosses:
                consecutiveLosses >= maxConsecutiveLosses
                    ? "danger"
                    : consecutiveLosses >= maxConsecutiveLosses - 1
                        ? "warning"
                        : "ok",
        };
    }, [dailyMetrics, limits]);

    // Save limits
    const saveLimits = async () => {
        try {
            const email = localStorage.getItem("TradingUserEmail");
            if (!email) return;

            const response = await fetch('/api/riskSettings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    ...tempLimits
                })
            });

            if (response.ok) {
                setLimits(tempLimits);
                setShowSettings(false);
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving limits:", error);
            alert("Error saving settings");
        }
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
                            <ShieldAlert className="h-6 w-6 text-gray-700" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Risk Awareness Engine</h1>
                                <p className="text-sm text-gray-500">
                                    Educational feedback to help you trade responsibly
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSettings(!showSettings)}
                            className="gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
                <Card className="bg-white shadow-sm mb-6 border-2 border-blue-200">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ⚙️ Configure Your Learning Limits
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            These are practice limits to help you develop discipline. They don't block trading -
                            they only provide visual feedback.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-sm text-gray-700">Max Daily Loss (₹)</Label>
                                <Input
                                    type="number"
                                    value={tempLimits.maxDailyLoss}
                                    onChange={(e) =>
                                        setTempLimits({ ...tempLimits, maxDailyLoss: Number(e.target.value) })
                                    }
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Alert when daily loss exceeds this amount
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm text-gray-700">Max Trades Per Day</Label>
                                <Input
                                    type="number"
                                    value={tempLimits.maxTradesPerDay}
                                    onChange={(e) =>
                                        setTempLimits({ ...tempLimits, maxTradesPerDay: Number(e.target.value) })
                                    }
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Prevent overtrading by setting a daily limit
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm text-gray-700">Max Consecutive Losses</Label>
                                <Input
                                    type="number"
                                    value={tempLimits.maxConsecutiveLosses}
                                    onChange={(e) =>
                                        setTempLimits({ ...tempLimits, maxConsecutiveLosses: Number(e.target.value) })
                                    }
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Alert after this many losses in a row
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button onClick={saveLimits} className="gap-2 bg-gray-900 hover:bg-gray-800">
                                <Save className="h-4 w-4" />
                                Save Limits
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempLimits(limits);
                                    setShowSettings(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    icon={TrendingDown}
                    title="Today's PnL"
                    value={`₹${dailyMetrics.todayPnL.toFixed(2)}`}
                    limit={`₹-${limits.maxDailyLoss}`}
                    status={metricStatuses.dailyPnL}
                    note={
                        dailyMetrics.todayPnL < 0
                            ? "Losses today. Stay focused."
                            : "You're in profit today!"
                    }
                />

                <MetricCard
                    icon={Activity}
                    title="Trades Today"
                    value={dailyMetrics.todayTradeCount}
                    limit={limits.maxTradesPerDay}
                    status={metricStatuses.tradeCount}
                    note={
                        dailyMetrics.todayTradeCount >= limits.maxTradesPerDay
                            ? "Consider stopping for today"
                            : `${limits.maxTradesPerDay - dailyMetrics.todayTradeCount} trades remaining`
                    }
                />

                <MetricCard
                    icon={Repeat}
                    title="Consecutive Losses"
                    value={dailyMetrics.consecutiveLosses}
                    limit={limits.maxConsecutiveLosses}
                    status={metricStatuses.consecutiveLosses}
                    note={
                        dailyMetrics.consecutiveLosses >= limits.maxConsecutiveLosses
                            ? "Take a break and reassess"
                            : dailyMetrics.consecutiveLosses > 0
                                ? "Stay calm and stick to your plan"
                                : "No losing streak currently"
                    }
                />
            </div>

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
