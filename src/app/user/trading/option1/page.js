"use client";
import React, { useEffect, useState } from 'react';
import { useWebSocket } from "@/app/lib/WebSocketContext";
import { AlertModal } from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
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
  Inbox
} from "lucide-react";

const Page = () => {

  const {
    api,
    isConnected,
    liveData,
    error: wsError,
    subscribe,
    unsubscribe
  } = useWebSocket();

  const [totalOrders, setTotalOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [showExecutedOrders, setShowExecutedOrders] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [subscribedOrders, setSubscribedOrders] = useState(new Set());
  const [executingOrders, setExecutingOrders] = useState(new Set());
  const [tradeAfter, setTradeAfter] = useState('');
  const [tradeBefore, setTradeBefore] = useState('');
  const [market, setMarket] = useState('');
  const [script, setScript] = useState('');
  const [orderType, setOrderType] = useState('All');
  const [side, setSide] = useState('All');
  const [nextCleanup, setNextCleanup] = useState('');

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

  const subscribeToOrder = (order) => {
    if (!isConnected || !order.exchange || !order.token) return;

    const subscriptionKey = `${order.exchange}|${order.token}`;

    if (subscribedOrders.has(subscriptionKey)) return;

    try {
      subscribe(subscriptionKey, "depth");
      setSubscribedOrders(prev => new Set(prev).add(subscriptionKey));
      console.log(`Subscribed to: ${subscriptionKey}`);
    } catch (error) {
      console.error(`Failed to subscribe to ${subscriptionKey}:`, error);
    }
  };

  useEffect(() => {
    if (isConnected && totalOrders.length > 0) {
      setSubscribedOrders(new Set());

      const uniqueInstruments = new Set();
      totalOrders.forEach(order => {
        if (order.exchange && order.token && order.status === 'pending') {
          uniqueInstruments.add(`${order.exchange}|${order.token}`);
        }
      });

      uniqueInstruments.forEach(instrument => {
        try {
          subscribe(instrument, "depth");
          setSubscribedOrders(prev => new Set(prev).add(instrument));
          console.log(`Subscribed to: ${instrument}`);
        } catch (error) {
          console.error(`Failed to subscribe to ${instrument}:`, error);
        }
      });

      console.log(`Total subscriptions: ${uniqueInstruments.size}`);
    }
  }, [isConnected, totalOrders, subscribe]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (liveData.length > 0) {
        console.log("Live data updated:", liveData.length, "items");
        setTotalOrders(prev => [...prev]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [liveData]);

  useEffect(() => {
    return () => {
      totalOrders.forEach(order => {
        if (order.exchange && order.token) {
          // unsubscribeFromOrder(order);
        }
      });
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const nextCleanupTime = new Date(now);
    nextCleanupTime.setHours(24, 0, 0, 0);
    setNextCleanup(nextCleanupTime.toLocaleString());

    const fetchOrders = async () => {
      const email = localStorage.getItem('TradingUserEmail');
      const response = await fetch(`/api/getUsers?email=${email}`);
      const res = await response.json();
      console.log(res);

      if (res.users && res.users.length > 0) {
        setTotalOrders(res.users[0].totalOrders || []);
      } else {
        console.error("No users found or users array is empty");
        setTotalOrders([]);
      }
    };

    fetchOrders();
  }, []);

  const resetfilters = () => {
    setTradeAfter('');
    setTradeBefore('');
    setMarket('');
    setScript('');
    setOrderType('All');
    setSide('All');
  };

  useEffect(() => {
    const fetchTrades = async () => {
      const email = localStorage.getItem('TradingUserEmail');
      if (!email) {
        return;
      }
      try {
        const response = await fetch(`/api/getUsers?email=${email}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error);
        }
        const totalorder = result.users[0].totalOrders || [];
        const trades = totalorder.map((trade) => ({
          exchange: trade.exchange,
          token: trade.token,
        }));
        setWatchlist(trades);
        console.log("checkout the pending order trades", trades);
      } catch (err) {
        console.error("Error fetching trades:", err);
      }
    };
    fetchTrades();
  }, []);

  useEffect(() => {
    if (isConnected && watchlist.length > 0) {
      const pendingInstruments = watchlist.filter(inst => {
        const order = totalOrders.find(o => o.exchange === inst.exchange && o.token === inst.token);
        return order && order.status === 'pending';
      });

      if (pendingInstruments.length > 0) {
        const instrumentsString = pendingInstruments.map(inst => `${inst.exchange}|${inst.token}`).join('#');
        subscribe(instrumentsString, "depth");
        console.log("Subscribing to Depth of the pending trades:", instrumentsString);
      }
    }
  }, [watchlist, isConnected, subscribe, totalOrders]);

  const filteredOrders = (totalOrders || []).filter(order => {
    const matchesSearchTerm =
      order.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.market?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPendingStatus = showPendingOrders ? order.status === "pending" : true;
    const matchesExecutedStatus = showExecutedOrders ? (order.status === "completed" || order.status === "rejected") : true;

    const matchesTradeAfter = tradeAfter ? new Date(order.timestamp) >= new Date(tradeAfter) : true;
    const matchesTradeBefore = tradeBefore ? new Date(order.timestamp) <= new Date(tradeBefore) : true;
    const matchesMarket = market ? order.market?.toLowerCase() === market.toLowerCase() : true;
    const matchesScript = script ? order.symbol?.toLowerCase() === script.toLowerCase() : true;
    const matchesOrderType = orderType && orderType !== 'All' ? order.type?.toLowerCase() === orderType.toLowerCase() : true;
    const matchesSide = side && side !== 'All'
      ? (side === 'Buy' ? order.originalArray === 'buyOrders' : order.originalArray === 'sellOrders')
      : true;

    return matchesSearchTerm && matchesPendingStatus && matchesExecutedStatus && matchesTradeAfter && matchesTradeBefore && matchesMarket && matchesScript && matchesOrderType && matchesSide;

  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  console.log("checkout the current orders", currentOrders);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const email = localStorage.getItem('TradingUserEmail');

      const response = await fetch('/api/cancelOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          email: email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();

        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }

        showAlert('Cancelled', 'Order cancelled successfully!', 'success');
      } else {
        showAlert('Error', `Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showAlert('Error', 'Failed to cancel order. Please try again.', 'error');
    }
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const email = localStorage.getItem('TradingUserEmail');

      const response = await fetch('/api/removeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          email: email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();

        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }
      } else {
        showAlert('Error', `Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error removing order:', error);
      showAlert('Error', 'Failed to remove order. Please try again.', 'error');
    }
  };

  const hendaleExecuteOrder = async (orderId) => {
    if (executingOrders.has(orderId)) {
      console.log(`Order ${orderId} is already being executed`);
      return;
    }

    try {
      setExecutingOrders(prev => new Set(prev).add(orderId));

      const email = localStorage.getItem('TradingUserEmail');

      const response = await fetch('/api/executeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, email })
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Order executed successfully!");

        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();

        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }

        setExecutingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });

        showAlert('Completed', 'Order completed successfully!', 'success');
      } else {
        console.error('Error executing order:', result.error);
        setExecutingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }

    } catch (error) {
      console.error('Error executing order:', error);
      setExecutingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      showAlert('Error', 'Failed to execute order. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Trades Overview</h1>
              <p className="text-sm text-gray-500">
                Manage your active and completed trades
              </p>
            </div>
            <div className="ml-auto marquee flex-1 overflow-hidden max-w-xl hidden md:block">
              <span className="text-red-600 text-sm">
                Money involved. This is a Virtual Trading Application which has all
                the features to trade. This application is used for exchanging views
                on markets for India
              </span>
            </div>
            <RefreshButton
              onRefresh={async () => {
                const email = localStorage.getItem('TradingUserEmail');
                const response = await fetch(`/api/getUsers?email=${email}`);
                const res = await response.json();
                if (res.users && res.users.length > 0) {
                  setTotalOrders(res.users[0].totalOrders || []);
                }
              }}
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gray-800 shadow-lg mb-6">
        <CardContent className="p-4">
          <p className="text-white text-sm mb-3 italic opacity-80 flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Note: Pending limit orders are automatically removed at 12am daily
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label className="text-white text-sm mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search symbol, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-white border-0 h-10"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <Label className="text-white text-sm mb-1 block">Trade After</Label>
              <Input
                type="date"
                value={tradeAfter}
                onChange={(e) => setTradeAfter(e.target.value)}
                className="bg-white border-0 h-10"
              />
            </div>

            {/* Date To */}
            <div>
              <Label className="text-white text-sm mb-1 block">Trade Before</Label>
              <Input
                type="date"
                value={tradeBefore}
                onChange={(e) => setTradeBefore(e.target.value)}
                className="bg-white border-0 h-10"
              />
            </div>

            {/* Market */}
            <div>
              <Label className="text-white text-sm mb-1 block">Market</Label>
              <Input
                type="text"
                placeholder="Market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="h-10 bg-white border-0"
              />
            </div>

            {/* Script */}
            <div>
              <Label className="text-white text-sm mb-1 block">Script</Label>
              <Input
                type="text"
                placeholder="Script Name"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="h-10 bg-white border-0"
              />
            </div>

            {/* Side Filter */}
            <div>
              <Label className="text-white text-sm mb-1 block">Side</Label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="w-full h-10 bg-white border-0 rounded-md px-3 text-sm"
              >
                <option value="All">All Sides</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <Label className="text-white text-sm mb-1 block">Order Type</Label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-10 bg-white border-0 rounded-md px-3 text-sm"
              >
                <option value="All">All Types</option>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>

            {/* Order Type Checkboxes as Filters */}
            <div className="lg:col-span-6 flex flex-wrap gap-4 pt-2 border-t border-gray-700 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm hover:text-gray-200 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  checked={showPendingOrders}
                  onChange={() => setShowPendingOrders(!showPendingOrders)}
                />
                <span>Show Pending Orders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white text-sm hover:text-gray-200 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  checked={showExecutedOrders}
                  onChange={() => setShowExecutedOrders(!showExecutedOrders)}
                />
                <span>Show Executed/Rejected</span>
              </label>

              <Button
                onClick={resetfilters}
                variant="secondary"
                size="sm"
                className="ml-auto h-8"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
            </p>
          </div>

          {currentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-sm font-medium text-gray-600">#</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Time</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Trade By</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Market</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Side</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Type</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Lot</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Qty</th>
                    <th className="p-3 text-right text-sm font-medium text-gray-600">Price</th>
                    <th className="p-3 text-right text-sm font-medium text-gray-600">Live Price</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Status</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-500 text-sm">{index + indexOfFirstItem + 1}</td>
                      <td className="p-3 text-gray-600 text-sm">{new Date(order.timestamp).toLocaleString()}</td>
                      <td className="p-3 text-gray-700 text-sm">{order.email}</td>
                      <td className="p-3 text-gray-700 text-sm">{order.market}</td>
                      <td className="p-3 font-medium text-gray-900 text-sm">{order.symbol}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.originalArray === 'buyOrders'
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}>
                          {order.originalArray === 'buyOrders' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-600 text-sm uppercase">{order.type}</td>
                      <td className="p-3 text-center text-gray-700 text-sm">{order.lot}</td>
                      <td className="p-3 text-center text-gray-700 text-sm">{order.quantity}</td>
                      <td className="p-3 text-right font-medium text-gray-900 text-sm">₹{order.price}</td>
                      <td className="p-3 text-right">
                        {(() => {
                          const liveDataItem = liveData.find(data =>
                            data.tk === `${order.exchange}|${order.token}` ||
                            data.tk === `${order.exchange}_${order.token}` ||
                            data.ts === order.symbol
                          );

                          if (liveDataItem) {
                            let livePrice = 0;
                            const isLimitOrder = order.type === "limit" && order.status === "pending";

                            if (order.originalArray === 'buyOrders') {
                              livePrice = liveDataItem.sp1 || liveDataItem.lp || 0;
                            } else {
                              livePrice = liveDataItem.bp1 || liveDataItem.lp || 0;
                            }

                            if (livePrice > 0) {
                              const isPriceMatch = isLimitOrder && (
                                (order.originalArray === 'buyOrders' && livePrice <= order.price) ||
                                (order.originalArray === 'sellOrders' && livePrice >= order.price)
                              );

                              if (isPriceMatch && order.status === 'pending' && !executingOrders.has(order._id)) {
                                hendaleExecuteOrder(order._id);
                              }

                              return (
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold text-green-600 text-sm">
                                    ₹{livePrice}
                                  </span>
                                  {executingOrders.has(order._id) && (
                                    <span className="text-[10px] text-orange-500 animate-pulse">Executing...</span>
                                  )}
                                </div>
                              );
                            }
                          }

                          return (
                            <span className="text-gray-400 text-sm">--</span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveOrder(order._id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Remove from Trash"
                          >
                            <Inbox className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            disabled={order.status !== "pending"}
                            onClick={() => handleCancelOrder(order._id)}
                            className={`h-8 w-8 p-0 ${order.status === "pending"
                              ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                              }`}
                            title={order.status === "pending" ? "Cancel order" : "Only pending orders can be cancelled"}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Orders Match Filters
              </h3>
              <Button onClick={resetfilters} variant="outline" className="mt-2">
                Clear Filters
              </Button>
            </div>
          )}
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex justify-end mt-4 gap-2">
              <Button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
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

export default Page;