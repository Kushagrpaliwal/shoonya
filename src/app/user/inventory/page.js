"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/ui/alert-modal";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useWebSocket } from "@/app/lib/WebSocketContext";
import {
    Package,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Search
} from "lucide-react";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { liveData, isConnected, subscribe } = useWebSocket();

    // Alert Modal State
    const [alertModal, setAlertModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "info"
    });

    const showAlert = (title, message, variant = "info") => {
        setAlertModal({ open: true, title, message, variant });
    };

    const closeAlert = () => {
        setAlertModal(prev => ({ ...prev, open: false }));
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const email = localStorage.getItem("TradingUserEmail");
            if (!email) {
                showAlert("Not Logged In", "Please log in to view your inventory", "warning");
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/getInventory?email=${email}`);
            const result = await response.json();

            if (response.ok) {
                setInventory(result.inventory || []);
            } else {
                console.error("Error fetching inventory:", result.error);
                showAlert("Error", result.error || "Failed to fetch inventory", "error");
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            showAlert("Error", "Failed to fetch inventory", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // Subscribe to live data for inventory items
    useEffect(() => {
        if (isConnected && inventory.length > 0) {
            const instruments = inventory
                .filter(item => item.exchange && item.token)
                .map(item => `${item.exchange}|${item.token}`)
                .join('#');
            if (instruments) {
                subscribe(instruments, "depth");
            }
        }
    }, [isConnected, inventory, subscribe]);

    const getLivePrice = (item) => {
        const liveDataItem = liveData.find(data =>
            data.tk === `${item.exchange}|${item.token}` ||
            data.ts === item.symbol
        );

        if (liveDataItem) {
            return parseFloat(liveDataItem.lp) || item.avgBuyPrice || 0;
        }
        return item.avgBuyPrice || 0;
    };

    const calculateUnrealizedPnL = (item) => {
        const currentPrice = getLivePrice(item);
        const avgBuyPrice = item.avgBuyPrice || 0;
        const quantity = item.quantity || 0;
        return (currentPrice - avgBuyPrice) * quantity;
    };

    const calculateTotalValue = (item) => {
        const currentPrice = getLivePrice(item);
        return currentPrice * (item.quantity || 0);
    };

    // Filter inventory based on search
    const filteredInventory = inventory.filter(item =>
        item.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.exchange?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate portfolio totals
    const totalInvested = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    const totalCurrentValue = inventory.reduce((sum, item) => sum + calculateTotalValue(item), 0);
    const totalUnrealizedPnL = totalCurrentValue - totalInvested;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <Card className="bg-white shadow-sm border-zinc-200">
                <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="h-6 w-6 text-zinc-700" />
                            <div>
                                <CardTitle className="text-xl font-bold text-zinc-900">Inventory</CardTitle>
                                <p className="text-sm text-zinc-500">Your owned symbols and available lots</p>
                            </div>
                        </div>
                        <RefreshButton onRefresh={fetchInventory} />
                    </div>
                </CardHeader>
            </Card>

            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-sm border-zinc-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Total Invested</p>
                                <p className="text-2xl font-bold text-zinc-900">₹{totalInvested.toFixed(2)}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-zinc-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Current Value</p>
                                <p className="text-2xl font-bold text-zinc-900">₹{totalCurrentValue.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm border-zinc-200 ${totalUnrealizedPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500">Unrealized P&L</p>
                                <p className={`text-2xl font-bold ${totalUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalUnrealizedPnL >= 0 ? '+' : ''}₹{totalUnrealizedPnL.toFixed(2)}
                                </p>
                            </div>
                            {totalUnrealizedPnL >= 0
                                ? <TrendingUp className="h-8 w-8 text-green-600" />
                                : <TrendingDown className="h-8 w-8 text-red-600" />
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="bg-white shadow-sm border-zinc-200">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search by symbol or exchange..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="bg-white shadow-sm border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-800 text-white uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Symbol</th>
                                <th className="px-6 py-4 font-semibold">Exchange</th>
                                <th className="px-6 py-4 font-semibold text-center">Lots Owned</th>
                                <th className="px-6 py-4 font-semibold text-center">Quantity</th>
                                <th className="px-6 py-4 font-semibold text-right">Avg Buy Price</th>
                                <th className="px-6 py-4 font-semibold text-right">Current Price</th>
                                <th className="px-6 py-4 font-semibold text-right">Current Value</th>
                                <th className="px-6 py-4 font-semibold text-right">Unrealized P&L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                                        <Package className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
                                        <p className="font-medium">No inventory found</p>
                                        <p className="text-sm">Buy some symbols to see them here</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item, index) => {
                                    const currentPrice = getLivePrice(item);
                                    const currentValue = calculateTotalValue(item);
                                    const unrealizedPnL = calculateUnrealizedPnL(item);

                                    return (
                                        <tr
                                            key={`${item.symbol}-${item.exchange}-${index}`}
                                            className="bg-white hover:bg-zinc-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-semibold text-zinc-900">{item.symbol}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {item.exchange}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-zinc-100 text-zinc-900">
                                                    {item.lots}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-zinc-700">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right text-zinc-700">₹{(item.avgBuyPrice || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-medium text-zinc-900">₹{currentPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-zinc-700">₹{currentValue.toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-right font-semibold ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <span className="flex items-center justify-end gap-1">
                                                    {unrealizedPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                    {unrealizedPnL >= 0 ? '+' : ''}₹{unrealizedPnL.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900">How Inventory Works</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Your inventory shows all symbols you currently own. When you buy, lots are added.
                                When you sell, lots are deducted. You can only sell symbols you own and up to the number of lots available.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alert Modal */}
            <AlertModal
                open={alertModal.open}
                onClose={closeAlert}
                title={alertModal.title}
                message={alertModal.message}
                variant={alertModal.variant}
            />
        </div>
    );
}
