"use client";
import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/app/lib/WebSocketContext";
import { AlertModal } from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mcxScripts = [
  "GOLD", "GOLDM", "SILVER", "SILVERM", "SILVERMIC", "ALUMINIUM",
  "CRUDEOIL", "LEAD", "NATURALGAS", "ZINC", "COPPER", "COTTONOIL",
  "NATGASMINI", "STEELREBAR", "LEADMINI", "MCXMETLDEX", "COTTONCNDY",
  "ALUMINI", "ZINCMINI", "MENTHAOIL", "NICKEL", "KAPAS", "GOLDPETAL",
];

const LiveMarketData = () => {
  const {
    api,
    isConnected,
    liveData,
    error: wsError,
    subscribe,
    unsubscribe
  } = useWebSocket();

  const [selectedType, setSelectedType] = useState("");
  const [selectedScript, setSelectedScript] = useState("");
  const [expiryOptions, setExpiryOptions] = useState([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [fetchedData, setFetchedData] = useState([]);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ismodal, setismodal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [buy, setbuy] = useState(false);
  const [sell, setsell] = useState(false);
  const [lotvalue, setlotvalue] = useState(0);
  const [tradeDirection, setTradeDirection] = useState("");
  const [orderExecutionType, setOrderExecutionType] = useState("market");
  const [limitPrice, setLimitPrice] = useState(0);
  const [highlightedCells, setHighlightedCells] = useState({});
  const previousLiveDataRef = useRef([]);
  const [inventory, setInventory] = useState([]);
  const [availableLots, setAvailableLots] = useState(0);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setismodal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Highlight cells when data changes
  useEffect(() => {
    if (liveData.length > 0) {
      liveData.forEach(data => {
        if (data.tk) {
          const previousData = previousLiveDataRef.current.find(item => item.tk === data.tk);
          const updatedCells = [];

          if (previousData) {
            if (data.lp !== previousData.lp) updatedCells.push(2);
            if (data.bp1 !== previousData.bp1) updatedCells.push(3);
            if (data.sp1 !== previousData.sp1) updatedCells.push(4);
            if (data.h !== previousData.h) updatedCells.push(5);
            if (data.l !== previousData.l) updatedCells.push(6);
            if (data.o !== previousData.o) updatedCells.push(7);
            if (data.c !== previousData.c) updatedCells.push(8);
          } else {
            if (data.lp) updatedCells.push(2);
            if (data.bp1) updatedCells.push(3);
            if (data.sp1) updatedCells.push(4);
            if (data.h) updatedCells.push(5);
            if (data.l) updatedCells.push(6);
            if (data.o) updatedCells.push(7);
            if (data.c) updatedCells.push(8);
          }

          if (updatedCells.length > 0) {
            setHighlightedCells(prev => ({
              ...prev,
              [data.tk]: updatedCells
            }));

            setTimeout(() => {
              setHighlightedCells(prev => ({
                ...prev,
                [data.tk]: []
              }));
            }, 1000);
          }
        }
      });

      previousLiveDataRef.current = [...liveData];
    }
  }, [liveData]);

  useEffect(() => {
    const fetchTrades = async () => {
      const email = localStorage.getItem('TradingUserEmail');
      if (!email) {
        setError("User email not found. Please log in again.");
        return;
      }

      try {
        const response = await fetch(`/api/getWatchlist?email=${email}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        const trades = result.trades || [];
        setWatchlist(trades.map(trade => ({
          exchange: trade.exchange,
          token: trade.token,
        })));
      } catch (error) {
        console.error("Error fetching trades:", error);
        setError(error.message);
      }
    };

    fetchTrades();
  }, []);

  useEffect(() => {
    if (isConnected && watchlist.length > 0) {
      const instrumentsString = watchlist.map(inst => `${inst.exchange}|${inst.token}`).join('#');
      subscribe(instrumentsString, "depth");
      console.log("Subscribing to watchlist items:", instrumentsString);
    }
  }, [watchlist, isConnected, subscribe]);

  // Update modal data in real-time
  useEffect(() => {
    if (ismodal && modalData && liveData.length > 0) {
      const updatedData = liveData.find(item => item.tk === modalData.tk);
      if (updatedData) {
        setModalData(updatedData);
      }
    }
  }, [liveData, ismodal, modalData]);

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedScript("");
    setExpiryOptions([]);
    setFetchedData([]);
  };

  const handleScriptChange = async (event) => {
    const script = event.target.value;
    setSelectedScript(script);
    if (script) {
      await fetchExpiryOptions(script);
    } else {
      setExpiryOptions([]);
    }
  };

  const fetchExpiryOptions = async (script) => {
    try {
      const response = await fetch(`/api/downloadMCX?script=${script}`);
      const data = await response.json();
      setFetchedData(data);

      const expiryList = data.filter((item) => item.script === script).map((item) => item.Expiry);
      setExpiryOptions([...new Set(expiryList)]);
    } catch (error) {
      console.error("Error fetching expiry options:", error);
      setError("Failed to fetch expiry options. Please try again.");
    }
  };

  const handleExpiryChange = (event) => {
    setSelectedExpiry(event.target.value);
  };

  const addToWatchlist = async () => {
    if (!selectedScript || !selectedExpiry) {
      showAlert("Missing Selection", "Please select both a script and an expiry date.", "warning");
      return;
    }

    const selectedItem = fetchedData.find(
      (item) => item.script === selectedScript && item.Expiry === selectedExpiry
    );

    if (!selectedItem) {
      showAlert("Not Found", "Selected instrument not found.", "error");
      return;
    }

    const email = localStorage.getItem('TradingUserEmail');
    if (!email) {
      setError("User email not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch('/api/addToWatchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          exchange: selectedItem.Exchange,
          token: selectedItem.Token,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }

      const newItem = {
        exchange: selectedItem.Exchange,
        token: selectedItem.Token,
      };

      setWatchlist((prev) => {
        if (prev.some((item) => item.token === newItem.token)) {
          return prev;
        }
        return [...prev, newItem];
      });

      console.log(result.message);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError("Failed to add to watchlist. Please try again.");
    }
  };

  const showLiveFeed = () => {
    if (isConnected) {
      const instrumentsString = watchlist.map(inst => `${inst.exchange}|${inst.token}`).join('#');
      if (instrumentsString) {
        subscribe(instrumentsString, "depth");
        console.log("Subscribing to Depth:", instrumentsString);
      } else {
        showAlert("Empty Watchlist", "Your watchlist is empty. Please add items to the watchlist first.", "warning");
      }
    } else {
      showAlert("Not Connected", "WebSocket is not connected. Please wait for the connection to be established.", "warning");
    }
  };

  const unsubscribeFromWebSocket = () => {
    if (isConnected && watchlist.length > 0) {
      const instrumentsString = watchlist.map(inst => `${inst.exchange}|${inst.token}`).join('#');
      unsubscribe(instrumentsString, "depth");
      console.log("Unsubscribed from Depth:", instrumentsString);
    } else {
      console.error("Cannot unsubscribe: WebSocket not connected or watchlist empty");
    }
  };

  const handleRemoveItem = async (timestamp, token) => {
    const itemToRemove = watchlist.find(item => item.token === token);
    if (!itemToRemove) {
      console.error("Item not found in watchlist");
      return;
    }

    const instrumentString = `${itemToRemove.exchange}|${itemToRemove.token}`;
    unsubscribe(instrumentString, "depth");
    console.log("Unsubscribed from Depth:", instrumentString);

    setWatchlist((prevWatchlist) => prevWatchlist.filter(item => item.token !== token));

    const email = localStorage.getItem('TradingUserEmail');
    if (!email) {
      setError("User email not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch('/api/removeFromWatchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          exchange: itemToRemove.exchange,
          token: itemToRemove.token,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }
      console.log(result.message);
    } catch (error) {
      console.error("Error removing from database:", error);
      setError("Failed to remove from watchlist. Please try again.");
    }

    setSelectedType("");
    setSelectedScript("");
    setExpiryOptions([]);
    setSelectedExpiry("");
    setFetchedData([]);
  };

  // Fetch inventory for the user
  const fetchInventory = async () => {
    const email = localStorage.getItem('TradingUserEmail');
    if (!email) return;

    try {
      const response = await fetch(`/api/getInventory?email=${email}`);
      const result = await response.json();
      if (response.ok) {
        setInventory(result.inventory || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Get available lots for a symbol
  const getAvailableLots = (symbol, exchange) => {
    const inventoryItem = inventory.find(i =>
      i.symbol === symbol && (i.exchange === exchange || i.market === exchange)
    );
    return inventoryItem?.lots || 0;
  };

  const openmodalhandle = (data, type) => {
    setModalData(data);
    setismodal(true);

    // Get available lots for this symbol
    const lots = getAvailableLots(data.ts, data.e);
    setAvailableLots(lots);

    if (type === 'ask') {
      setTradeDirection('buy');
      setbuy(true);
      setsell(false);
    } else if (type === 'bid') {
      setTradeDirection('sell');
      setsell(true);
      setbuy(false);
    }
  };

  const closemodalhandle = () => {
    setismodal(false);
    setModalData(null);
  };

  const buyinput = () => {
    setTradeDirection("buy");
    setbuy(true);
    setsell(false);
  };

  const sellinput = () => {
    // Check if user has inventory for this symbol
    if (availableLots <= 0) {
      showAlert("No Inventory", `You don't own any lots of ${modalData?.ts}. Buy first before selling.`, "warning");
      return;
    }
    setTradeDirection("sell");
    setsell(true);
    setbuy(false);
  };

  const handlelotChange = (e) => {
    setlotvalue(e.target.value);
  };

  const getLotSize = (scriptName) => {
    if (scriptName && scriptName.includes('GOLDM')) {
      return 10;
    } else if (scriptName && scriptName.includes('GOLD')) {
      return 100;
    } else {
      return modalData?.ls;
    }
  };

  const calculateQuantity = (scriptName, lotValue) => {
    if (scriptName && (scriptName.includes('GOLD') || scriptName.includes('GOLDM'))) {
      const lotSize = getLotSize(scriptName);
      return lotSize * lotValue;
    } else {
      return (modalData?.ls) * lotValue;
    }
  };

  const placeOrder = async () => {
    if (!tradeDirection) {
      showAlert("Select Direction", "Please select Buy or Sell first", "warning");
      return;
    }

    // Validate sell order against available lots
    if (tradeDirection === 'sell') {
      if (availableLots <= 0) {
        showAlert("No Inventory", `You don't own any lots of ${modalData?.ts}. Buy first before selling.`, "warning");
        return;
      }
      if (Number(lotvalue) > availableLots) {
        showAlert("Insufficient Lots", `Available: ${availableLots} lots. Requested: ${lotvalue} lots.`, "warning");
        return;
      }
    }

    const selectedPrice = orderExecutionType === "Limit"
      ? Number(limitPrice)
      : (buy ? modalData.sp1 : modalData.bp1);

    const quantity = calculateQuantity(modalData.ts, lotvalue);

    const orderData = {
      email: localStorage.getItem('TradingUserEmail'),
      direction: tradeDirection,
      executionType: orderExecutionType.toLowerCase(),
      lot: Number(lotvalue),
      price: selectedPrice,
      quantity: Number(quantity),
      market: modalData.e,
      symbol: modalData.ts,
      netprice: modalData.lp,
      token: modalData.tk,
      token: modalData.tk,
      exchange: modalData.e,
      high: modalData.h,
      low: modalData.l,
      open: modalData.o,
      close: modalData.c,
      ltp: modalData.lp
    };

    try {
      const response = await fetch('/api/placeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to place order");
      }

      const result = await response.json();
      showAlert("Order Placed", "Order Placed Successfully", "success");
      console.log("Order placed successfully:", result.message);

      // Refresh inventory after order
      fetchInventory();

      // Reset form
      setLimitPrice(0);
      setlotvalue(0);
      setTradeDirection("");
      setOrderExecutionType("market");
      setbuy(false);
      setsell(false);
      setismodal(false);

    } catch (error) {
      console.error("Error placing order:", error);
      showAlert("Order Failed", `Order failed: ${error.message}`, "error");
    }
  };

  const filteredLiveData = liveData.filter(data =>
    watchlist.some(item => item.token === data.tk)
  );

  return (
    <>
      <div className="p-2 md:p-4 bg-gray-50 min-h-screen" key={refreshKey}>
        {/* Header */}
        <Card className="mb-4 bg-white shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-bold text-lg md:text-xl text-gray-900">Market Watch</span>
              <div className="marquee flex-1 overflow-hidden">
                <span className="text-red-600 text-sm">
                  Money involved. This is a Virtual Trading Application which has all
                  the features to trade. This application is used for exchanging views
                  on markets for India
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Section */}
        <Card className="mb-4 bg-gray-800 shadow-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketDropdown" className="text-white text-sm font-medium">Market</Label>
                <select
                  id="marketDropdown"
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full h-11 px-3 rounded-lg bg-white border-0 text-gray-900 focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select an option</option>
                  <option value="option1">INDEX</option>
                  <option value="mcx">MCX</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scriptDropdown" className="text-white text-sm font-medium">Script Name</Label>
                <select
                  id="scriptDropdown"
                  value={selectedScript}
                  onChange={handleScriptChange}
                  className="w-full h-11 px-3 rounded-lg bg-white border-0 text-gray-900 focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select an option</option>
                  {selectedType === "mcx" ? (
                    mcxScripts.map((script, index) => (
                      <option key={index} value={script}>
                        {script}
                      </option>
                    ))
                  ) : (
                    <option value="">No MCX scripts available</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDropdown" className="text-white text-sm font-medium">Expiry Date</Label>
                <select
                  id="expiryDropdown"
                  value={selectedExpiry}
                  onChange={handleExpiryChange}
                  className="w-full h-11 px-3 rounded-lg bg-white border-0 text-gray-900 focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select an option</option>
                  {expiryOptions.length > 0 ? (
                    expiryOptions.map((expiry, index) => (
                      <option key={index} value={expiry}>
                        {expiry}
                      </option>
                    ))
                  ) : (
                    <option value="">No expiry options available</option>
                  )}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={addToWatchlist}
                  className="flex-1 h-11 bg-white text-gray-900 hover:bg-gray-100 font-medium"
                >
                  Add to Watchlist
                </Button>
                <RefreshButton className="h-11 w-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(error || wsError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error || wsError}
          </div>
        )}

        {/* Connection Status */}
        <div className={`px-4 py-2 mb-4 rounded-lg text-sm font-medium ${isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          Status: {isConnected ? "Connected" : "Connecting to market data..."}
        </div>

        {/* Data Table */}
        {filteredLiveData.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium w-[180px]">MCX</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Change(%)</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Bid Rate</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Ask Rate</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">LTP</th>
                    <th className="p-3 text-center text-sm font-medium w-[110px]">Net Change</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">High</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Low</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Open</th>
                    <th className="p-3 text-center text-sm font-medium w-[100px]">Close</th>
                    <th className="p-3 text-center text-sm font-medium w-[80px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLiveData.map((data, index) => (
                    <tr key={index} className="text-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 bg-white text-left font-medium text-gray-900">{data.ts || "N/A"}</td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(2) ? 'bg-yellow-100 border border-yellow-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {data.lp && data.c ? (((data.lp - data.c) / data.c) * 100).toFixed(2) : "N/A"}
                      </td>
                      <td
                        className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(3) ? 'bg-red-100 border border-red-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'} cursor-pointer hover:bg-red-50`}
                        onClick={() => openmodalhandle(data, 'bid')}
                      >
                        {data.bp1 || "N/A"}
                      </td>
                      <td
                        className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(4) ? 'bg-green-100 border border-green-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'} cursor-pointer hover:bg-green-50`}
                        onClick={() => openmodalhandle(data, 'ask')}
                      >
                        {data.sp1 || "N/A"}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(2) ? 'bg-yellow-100 border border-yellow-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'} font-medium`}>
                        {data.lp || "N/A"}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(2) ? 'bg-yellow-100 border border-yellow-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {(data.lp - data.c).toFixed(2)}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(5) ? 'bg-blue-100 border border-blue-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {data.h || "N/A"}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(6) ? 'bg-purple-100 border border-purple-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {data.l || "N/A"}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(7) ? 'bg-indigo-100 border border-indigo-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {data.o || "N/A"}
                      </td>
                      <td className={`py-3 px-3 transition-colors duration-300 ${highlightedCells[data.tk]?.includes(8) ? 'bg-teal-100 border border-teal-300 text-gray-900' : 'bg-white text-gray-700 border border-transparent'}`}>
                        {data.c || "N/A"}
                      </td>
                      <td className="py-3 px-3 bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(data.ts, data.tk)}
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No data available. Add instruments to your watchlist.</p>
          </Card>
        )}
      </div>

      {/* Order Modal - Using Dialog */}
      <Dialog open={ismodal} onOpenChange={setismodal}>
        <DialogContent className="sm:max-w-2xl w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto p-0">
          <div className={`${sell ? 'bg-red-50' : 'bg-green-50'} p-4 rounded-t-lg border-b-2 ${sell ? 'border-red-500' : 'border-green-500'}`}>
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">{modalData?.ts}</DialogTitle>
            </DialogHeader>

            {/* Live Data Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">BID</div>
                <div className="text-lg font-bold mt-1 text-gray-900">{modalData?.bp1 || "N/A"}</div>
              </div>
              <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">ASK</div>
                <div className="text-lg font-bold mt-1 text-gray-900">{modalData?.sp1 || "N/A"}</div>
              </div>
              <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">LTP</div>
                <div className="text-lg font-bold mt-1 text-gray-900">{modalData?.lp || "N/A"}</div>
              </div>
              <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">HIGH</div>
                <div className="text-lg font-bold mt-1 text-gray-900">{modalData?.h || "N/A"}</div>
              </div>
              <div className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg text-center shadow-sm">
                <div className="text-xs font-semibold text-gray-500 uppercase">LOW</div>
                <div className="text-lg font-bold mt-1 text-gray-900">{modalData?.l || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="p-4 space-y-4">
            {/* Available Lots Display */}
            {availableLots > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-blue-800">Available to sell:</span>
                <span className="font-bold text-blue-900">{availableLots} lots</span>
              </div>
            )}

            {/* Buy/Sell Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setTradeDirection("buy");
                  setbuy(true);
                  setsell(false);
                }}
                className={`flex-1 h-12 font-medium ${buy ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Buy
              </Button>
              <Button
                type="button"
                onClick={sellinput}
                disabled={availableLots <= 0}
                className={`flex-1 h-12 font-medium ${sell ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} ${availableLots <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Sell {availableLots <= 0 ? '(No lots)' : ''}
              </Button>
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Order Type</Label>
              <select
                className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                onChange={(e) => setOrderExecutionType(e.target.value)}
                value={orderExecutionType}
              >
                <option value="market">Market</option>
                <option value="Limit">Limit</option>
              </select>
            </div>

            {/* Lot & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Lot</Label>
                <Input
                  type="number"
                  className="h-12 bg-gray-50 border-gray-200"
                  value={lotvalue}
                  onChange={handlelotChange}
                  placeholder="Enter lot"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Quantity</Label>
                <Input
                  type="number"
                  className="h-12 bg-gray-100 border-gray-200"
                  disabled
                  value={calculateQuantity(modalData?.ts, lotvalue)}
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Price</Label>
              {orderExecutionType === "Limit" ? (
                <Input
                  type="number"
                  placeholder="Enter price"
                  className="h-12 bg-gray-50 border-gray-200"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                />
              ) : (
                <Input
                  className="h-12 bg-gray-100 border-gray-200"
                  value={buy ? `${modalData?.sp1}` : `${modalData?.bp1}`}
                  disabled
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={placeOrder}
                className={`flex-1 h-12 font-medium ${sell ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                Place Order
              </Button>
              <Button
                variant="outline"
                onClick={closemodalhandle}
                className="flex-1 h-12 font-medium border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </>
  );
};

export default LiveMarketData;
