"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    BookOpen,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    TrendingUp,
    TrendingDown,
    Calendar,
    X,
    MessageSquare,
    Smile,
    Meh,
    Frown,
} from "lucide-react";
import {
    calculatePnL,
    calculateRiskRewardRatio,
} from "@/app/lib/tradeCalculations";
import { mockCompletedTrades, getCompletedTrades, getUniqueInstruments } from "@/app/lib/mockTradeData";

// Emotion options
const EMOTIONS = [
    { value: "calm", label: "Calm", icon: Smile, color: "text-green-500", bgColor: "bg-green-50 border-green-200" },
    { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500", bgColor: "bg-gray-50 border-gray-200" },
    { value: "stressed", label: "Stressed", icon: Frown, color: "text-red-500", bgColor: "bg-red-50 border-red-200" },
];

// Trade Detail Modal
function TradeDetailModal({ trade, isOpen, onClose, notes, emotions, onSaveNote, onSaveEmotion }) {
    const [localNote, setLocalNote] = useState(notes[trade?.tradeId || trade?._id] || "");
    const [localEmotion, setLocalEmotion] = useState(emotions[trade?.tradeId || trade?._id] || "");

    useEffect(() => {
        if (trade) {
            setLocalNote(notes[trade.tradeId || trade._id] || "");
            setLocalEmotion(emotions[trade.tradeId || trade._id] || "");
        }
    }, [trade, notes, emotions]);

    if (!trade) return null;

    const pnl = calculatePnL(trade);
    const rrRatio = calculateRiskRewardRatio(trade);
    const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";

    const handleSave = () => {
        onSaveNote(trade.tradeId || trade._id, localNote);
        onSaveEmotion(trade.tradeId || trade._id, localEmotion);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
                            {pnl >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        </span>
                        Trade Details - {trade.symbol}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Trade Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Side</p>
                            <p className={`font-semibold ${isBuy ? "text-green-600" : "text-red-600"}`}>
                                {isBuy ? "BUY" : "SELL"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="font-semibold text-gray-900">{trade.quantity}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Entry Price</p>
                            <p className="font-semibold text-gray-900">₹{trade.entryPrice}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Exit Price</p>
                            <p className="font-semibold text-gray-900">₹{trade.exitPrice}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Stop Loss</p>
                            <p className="font-semibold text-gray-900">
                                {trade.stopLoss ? `₹${trade.stopLoss}` : "Not set"}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">Target</p>
                            <p className="font-semibold text-gray-900">
                                {trade.target ? `₹${trade.target}` : "Not set"}
                            </p>
                        </div>
                    </div>

                    {/* PnL and R:R */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`rounded-lg p-4 ${pnl >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                            <p className="text-sm text-gray-600">Profit/Loss</p>
                            <p className={`text-2xl font-bold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ₹{pnl.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Risk-Reward Ratio</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {rrRatio !== null ? `1:${rrRatio.toFixed(2)}` : "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Charges */}
                    <div className="bg-amber-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Charges</p>
                        <div className="flex justify-between text-sm">
                            <span>Brokerage: ₹{trade.brokerage || 0}</span>
                            <span>Other: ₹{trade.charges || 0}</span>
                            <span className="font-semibold">
                                Total: ₹{(trade.brokerage || 0) + (trade.charges || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Emotion Selection */}
                    <div>
                        <Label className="text-sm text-gray-700 mb-2 block">
                            How did you feel during this trade?
                        </Label>
                        <div className="flex gap-3">
                            {EMOTIONS.map((emotion) => (
                                <button
                                    key={emotion.value}
                                    onClick={() => setLocalEmotion(emotion.value)}
                                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${localEmotion === emotion.value
                                        ? emotion.bgColor + " border-opacity-100"
                                        : "bg-white border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <emotion.icon className={`h-6 w-6 ${emotion.color}`} />
                                    <span className="text-xs font-medium">{emotion.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Learning Notes */}
                    <div>
                        <Label className="text-sm text-gray-700 mb-2 block">
                            Learning Notes
                        </Label>
                        <textarea
                            value={localNote}
                            onChange={(e) => setLocalNote(e.target.value)}
                            placeholder="What did you learn from this trade? What could you improve?"
                            className="w-full h-24 p-3 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Save Button */}
                    <Button onClick={handleSave} className="w-full bg-gray-900 hover:bg-gray-800">
                        Save Notes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function TradeJournal() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [instrumentFilter, setInstrumentFilter] = useState("");
    const [profitFilter, setProfitFilter] = useState("all"); // all, profit, loss
    const [sortBy, setSortBy] = useState("latest"); // latest, profit_high, loss_high

    // User data (localStorage)
    const [notes, setNotes] = useState({});
    const [emotions, setEmotions] = useState({});

    // Fetch trades function (extracted for reuse)
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

    // Load trades
    useEffect(() => {
        fetchTrades();

        // Load notes and emotions from localStorage
        const savedNotes = localStorage.getItem("tradeJournalNotes");
        const savedEmotions = localStorage.getItem("tradeJournalEmotions");
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedEmotions) setEmotions(JSON.parse(savedEmotions));
    }, []);

    // Save note
    const handleSaveNote = (tradeId, note) => {
        const updatedNotes = { ...notes, [tradeId]: note };
        setNotes(updatedNotes);
        localStorage.setItem("tradeJournalNotes", JSON.stringify(updatedNotes));
    };

    // Save emotion
    const handleSaveEmotion = (tradeId, emotion) => {
        const updatedEmotions = { ...emotions, [tradeId]: emotion };
        setEmotions(updatedEmotions);
        localStorage.setItem("tradeJournalEmotions", JSON.stringify(updatedEmotions));
    };

    // Get unique instruments
    const instruments = useMemo(() => getUniqueInstruments(trades), [trades]);

    // Filter and sort trades
    const filteredTrades = useMemo(() => {
        let result = [...trades];

        // Search filter
        if (searchTerm) {
            result = result.filter((t) =>
                (t.symbol || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.instrument || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Date filters
        if (dateFrom) {
            result = result.filter((t) => new Date(t.timestamp) >= new Date(dateFrom));
        }
        if (dateTo) {
            result = result.filter((t) => new Date(t.timestamp) <= new Date(dateTo + "T23:59:59"));
        }

        // Instrument filter
        if (instrumentFilter) {
            result = result.filter((t) => t.symbol === instrumentFilter);
        }

        // Profit/Loss filter
        if (profitFilter === "profit") {
            result = result.filter((t) => calculatePnL(t) > 0);
        } else if (profitFilter === "loss") {
            result = result.filter((t) => calculatePnL(t) < 0);
        }

        // Sort
        if (sortBy === "latest") {
            result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (sortBy === "oldest") {
            result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } else if (sortBy === "profit_high") {
            result.sort((a, b) => calculatePnL(b) - calculatePnL(a));
        } else if (sortBy === "loss_high") {
            result.sort((a, b) => calculatePnL(a) - calculatePnL(b));
        }

        return result;
    }, [trades, searchTerm, dateFrom, dateTo, instrumentFilter, profitFilter, sortBy]);

    const resetFilters = () => {
        setSearchTerm("");
        setDateFrom("");
        setDateTo("");
        setInstrumentFilter("");
        setProfitFilter("all");
        setSortBy("latest");
    };

    const openTradeDetail = (trade) => {
        setSelectedTrade(trade);
        setIsModalOpen(true);
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
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-gray-700" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Auto Trade Journal</h1>
                            <p className="text-sm text-gray-500">
                                Review and learn from your completed trades
                            </p>
                        </div>
                        <div className="ml-auto">
                            <RefreshButton onRefresh={fetchTrades} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-gray-800 shadow-lg mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <Label className="text-white text-sm mb-1 block">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search symbol..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white border-0 h-10"
                                />
                            </div>
                        </div>

                        {/* Date From */}
                        <div>
                            <Label className="text-white text-sm mb-1 block">From Date</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-white border-0 h-10"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <Label className="text-white text-sm mb-1 block">To Date</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-white border-0 h-10"
                            />
                        </div>

                        {/* Instrument */}
                        <div>
                            <Label className="text-white text-sm mb-1 block">Instrument</Label>
                            <select
                                value={instrumentFilter}
                                onChange={(e) => setInstrumentFilter(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-white text-gray-900 text-sm"
                            >
                                <option value="">All</option>
                                {instruments.map((inst) => (
                                    <option key={inst} value={inst}>{inst}</option>
                                ))}
                            </select>
                        </div>

                        {/* Profit/Loss Filter */}
                        <div>
                            <Label className="text-white text-sm mb-1 block">Outcome</Label>
                            <select
                                value={profitFilter}
                                onChange={(e) => setProfitFilter(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-white text-gray-900 text-sm"
                            >
                                <option value="all">All Trades</option>
                                <option value="profit">Profitable</option>
                                <option value="loss">Losing</option>
                            </select>
                        </div>
                    </div>

                    {/* Sort and Reset */}
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-9 px-3 rounded-md bg-white text-gray-900 text-sm"
                            >
                                <option value="latest">Latest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="profit_high">Highest Profit</option>
                                <option value="loss_high">Highest Loss</option>
                            </select>
                        </div>
                        <Button
                            onClick={resetFilters}
                            variant="secondary"
                            size="sm"
                            className="h-9"
                        >
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Trades Table */}
            <Card className="bg-white shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            Showing {filteredTrades.length} of {trades.length} trades
                        </p>
                    </div>

                    {trades.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Trades Yet
                            </h3>
                            <p className="text-gray-500">
                                Complete some trades to start building your journal
                            </p>
                        </div>
                    ) : filteredTrades.length === 0 ? (
                        <div className="text-center py-12">
                            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Trades Match Filters
                            </h3>
                            <Button onClick={resetFilters} variant="outline" className="mt-2">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Side</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Qty</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Entry</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">Exit</th>
                                        <th className="p-3 text-right text-sm font-medium text-gray-600">PnL</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Emotion</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Notes</th>
                                        <th className="p-3 text-center text-sm font-medium text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTrades.map((trade) => {
                                        const pnl = calculatePnL(trade);
                                        const tradeId = trade.tradeId || trade._id;
                                        const isBuy = trade.side === "BUY" || trade.originalArray === "buyOrders";
                                        const emotion = emotions[tradeId];
                                        const hasNote = notes[tradeId] && notes[tradeId].trim() !== "";

                                        return (
                                            <tr
                                                key={tradeId}
                                                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => openTradeDetail(trade)}
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
                                                <td className="p-3 text-center text-sm text-gray-700">
                                                    {trade.quantity}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700">
                                                    ₹{trade.entryPrice}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-700">
                                                    ₹{trade.exitPrice}
                                                </td>
                                                <td className={`p-3 text-right text-sm font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {emotion ? (
                                                        (() => {
                                                            const e = EMOTIONS.find((em) => em.value === emotion);
                                                            return e ? <e.icon className={`h-5 w-5 mx-auto ${e.color}`} /> : null;
                                                        })()
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {hasNote ? (
                                                        <MessageSquare className="h-5 w-5 mx-auto text-blue-500" />
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openTradeDetail(trade);
                                                        }}
                                                        className="h-8 text-xs"
                                                    >
                                                        View
                                                    </Button>
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

            {/* Trade Detail Modal */}
            <TradeDetailModal
                trade={selectedTrade}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                notes={notes}
                emotions={emotions}
                onSaveNote={handleSaveNote}
                onSaveEmotion={handleSaveEmotion}
            />
        </div>
    );
}
