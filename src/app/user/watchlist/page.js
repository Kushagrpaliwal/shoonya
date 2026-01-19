"use client";
import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/app/lib/WebSocketContext";

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
  const [tradeDirection, setTradeDirection] = useState(""); // 'buy' or 'sell'
  const [orderExecutionType, setOrderExecutionType] = useState("market"); // 'market' or 'limit'
  const [limitPrice, setLimitPrice] = useState(0); // New state for limit price
  const [highlightedCells, setHighlightedCells] = useState({}); // Local highlighting state
  const previousLiveDataRef = useRef([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setismodal(false); // Close the modal when Escape is pressed
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
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

          // Compare each field with previous value and highlight only changed cells
          if (previousData) {
            if (data.lp !== previousData.lp) updatedCells.push(2); // LTP changed
            if (data.bp1 !== previousData.bp1) updatedCells.push(3); // Bid Rate changed
            if (data.sp1 !== previousData.sp1) updatedCells.push(4); // Ask Rate changed
            if (data.h !== previousData.h) updatedCells.push(5); // High changed
            if (data.l !== previousData.l) updatedCells.push(6); // Low changed
            if (data.o !== previousData.o) updatedCells.push(7); // Open changed
            if (data.c !== previousData.c) updatedCells.push(8); // Close changed
          } else {
            // If no previous data, highlight all cells for new data
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

            // Clear highlighting after 1 second
            setTimeout(() => {
              setHighlightedCells(prev => ({
                ...prev,
                [data.tk]: []
              }));
            }, 1000);
          }
        }
      });

      // Update the previous data reference
      previousLiveDataRef.current = [...liveData];
    }
  }, [liveData]);

  useEffect(() => {
    const fetchTrades = async () => {
      const email = localStorage.getItem('TradingUserEmail');
      if (!email) {
        setError("User  email not found. Please log in again.");
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
      setExpiryOptions([...new Set(expiryList)]); // Remove duplicates
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
      alert("Please select both a script and an expiry date.");
      return;
    }

    const selectedItem = fetchedData.find(
      (item) => item.script === selectedScript && item.Expiry === selectedExpiry
    );

    if (!selectedItem) {
      alert("Selected instrument not found.");
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
        alert("Your watchlist is empty. Please add items to the watchlist first.");
      }
    } else {
      alert("WebSocket is not connected. Please wait for the connection to be established.");
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
      setError("User  email not found. Please log in again.");
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

  const openmodalhandle = (data, type) => {
    setModalData(data); // Set the data for the modal
    setismodal(true);

    // Set trade direction based on the type of rate clicked
    if (type === 'ask') {
      setTradeDirection('buy'); // Set to buy when Ask Rate is clicked
      setbuy(true);
      setsell(false);
    } else if (type === 'bid') {
      setTradeDirection('sell'); // Set to sell when Bid Rate is clicked
      setsell(true);
      setbuy(false);
    }
  };

  const closemodalhandle = () => {
    setismodal(false);
    setModalData(null); // Clear modal data when closing
  };

  const buyinput = () => {
    setTradeDirection("buy");
    setbuy(true);
    setsell(false);
  };

  const sellinput = () => {
    setTradeDirection("sell");
    setsell(true);
    setbuy(false);
  };

  const handlelotChange = (e) => {
    setlotvalue(e.target.value);
  };

  // Function to get lot size based on script type
  const getLotSize = (scriptName) => {
    if (scriptName && scriptName.includes('GOLDM')) {
      return 10; // GOLDM scripts: 1 lot = 10
    } else if (scriptName && scriptName.includes('GOLD')) {
      return 100; // GOLD scripts: 1 lot = 100
    } else {
      return modalData?.ls; // Use original lot size for other scripts
    }
  };

  // Function to calculate quantity based on script type and lot value
  const calculateQuantity = (scriptName, lotValue) => {
    if (scriptName && (scriptName.includes('GOLD') || scriptName.includes('GOLDM'))) {
      // For GOLD and GOLDM scripts, use custom lot size
      const lotSize = getLotSize(scriptName);
      return lotSize * lotValue;
    } else {
      // For other scripts, use original calculation (modalData.ls * lotvalue)
      return (modalData?.ls) * lotValue;
    }
  };

  const placeOrder = async () => {
    if (!tradeDirection) {
      alert("Please select Buy or Sell first");
      return;
    }

    const selectedPrice = orderExecutionType === "Limit"
      ? Number(limitPrice) // Use the inputted limit price
      : (buy ? modalData.bp1 : modalData.sp1); // Use live feed price

    // Calculate quantity using the new lot size logic
    const quantity = calculateQuantity(modalData.ts, lotvalue);

    const orderData = {
      email: localStorage.getItem('TradingUserEmail'),
      direction: tradeDirection,
      executionType: orderExecutionType.toLowerCase(),
      lot: Number(lotvalue), // Keep this for lot size
      price: selectedPrice,
      quantity: Number(quantity),
      market: modalData.e,
      symbol: modalData.ts,
      netprice: modalData.lp,
      token: modalData.tk,
      exchange: modalData.e
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
      alert("Order Placed Successfully");
      console.log("Order placed successfully:", result.message);

      // Reset form
      setLimitPrice(0); // Reset limit price
      setlotvalue(0); // Reset lot size
      setTradeDirection("");
      setOrderExecutionType("market");
      setbuy(false);
      setsell(false);
      setismodal(false);

    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Order failed: ${error.message}`);
    }
  };

  const filteredLiveData = liveData.filter(data =>
    watchlist.some(item => item.token === data.tk)
  );

  return (
    <div className="p-4" key={refreshKey}>
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <span className="font-black text-xl w-[160px]">Market Watch</span>
        <div className="marquee">
          <span className="text-red-600">
            Money involved. This is a Virtual Trading Application which has all
            the features to trade. This application is used for exchanging views
            on markets for India{" "}
          </span>
        </div>
      </div>

      <div className="flex flex-row p-4 gap-6 bg-[#2B3F54] mb-2 rounded-lg mt-2">
        <div className="flex flex-col">
          <label htmlFor="marketDropdown" className="ml-2 mb-1 text-white">Market</label>
          <select id="marketDropdown" value={selectedType} onChange={handleTypeChange} className="p-2 rounded-lg">
            <option value="">Select an option</option>
            <option value="option1">INDEX</option>
            <option value="mcx">MCX</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="scriptDropdown" className="ml-2 mb-1 text-white">Script Name</label>
          <select id="scriptDropdown" value={selectedScript} onChange={handleScriptChange} className="p-2 rounded-lg">
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
        <div className="flex flex-col">
          <label htmlFor="expiryDropdown" className="ml-2 mb-1 text-white">Expiry Date</label>
          <select id="expiryDropdown" value={selectedExpiry} onChange={handleExpiryChange} className="p-2 rounded-lg">
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
        <div className="flex justify-center items-end gap-4">
          <button
            className="flex justify-center items-center bg-white text-black w-[120px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm"
            onClick={addToWatchlist}
          >
            Add to Watchlist
          </button>
          {/* <button
            className="flex justify-center items-center bg-white text-black w-[120px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm"
            onClick={showLiveFeed}
          >
            Show Live Feed
          </button> */}
          <button
            className="flex justify-center items-center bg-white text-black w-[120px] h-[40px] font-semibold text-sm border-b-2 border-orange-400 rounded-sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>

      {(error || wsError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || wsError}
        </div>
      )}

      <div className={`px-4 py-2 mb-4 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
        Status: {isConnected ? "Connected" : "Connecting to market data..."}
      </div>

      {/* <div className="italic">
      bid - buy , 
      ask - sell
  </div> */}

      {filteredLiveData.length > 0 ? (
        <table className="w-full">
          <thead className="bg-[#2B3F54] text-white">
            <tr>
              <th className="p-2">MCX</th>
              <th>Change(%)</th>
              <th>Bid Rate</th>
              <th>Ask Rate</th>
              <th>LTP</th>
              <th>Net Change</th>
              <th>High</th>
              <th>Low</th>
              <th>Open</th>
              <th>Close</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {filteredLiveData.map((data, index) => (
              <tr key={index} className="text-center font-thin">
                <td className="py-2 px-2 bg-white">{data.ts || "N/A"}</td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(2) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.lp && data.c ? (((data.lp - data.c) / data.c) * 100).toFixed(2) : "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(3) ? 'bg-blue-500 text-white' : 'bg-white text-black'} cursor-pointer`} onClick={() => openmodalhandle(data, 'bid')}>
                  {data.bp1 || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(4) ? 'bg-blue-500 text-white' : 'bg-white text-black'} cursor-pointer`} onClick={() => openmodalhandle(data, 'ask')}>
                  {data.sp1 || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(2) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.lp || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(2) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {(data.lp - data.c).toFixed(2)}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(5) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.h || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(6) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.l || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(7) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.o || "N/A"}
                </td>
                <td className={`py-2 px-2 ${highlightedCells[data.tk]?.includes(8) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                  {data.c || "N/A"}
                </td>
                <td className="px-2 py-2 flex justify-center items-center ">
                  <button
                    className="flex justify-center items-center bg-black text-black w-[40px] h-[40px] font-semibold text-sm rounded-md "
                    onClick={() => handleRemoveItem(data.ts, data.tk)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}

      {/* <button onClick={unsubscribeFromWebSocket} className="mt-4 bg-red-500 text-white rounded px-4 py-2">
        Unsubscribe
      </button> */}

      {ismodal && modalData && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className={`w-xl mx-auto ${sell ? 'bg-red-600' : 'bg-blue-400'} p-4 pb-[40px] shadow-lg`}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-white font-bold text-lg ml-[50px]">{modalData.ts}</div>
              <div className="flex space-x-1 p-1 rounded-md bg-black">
                <div className="bg-red-600 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">BID RATE</div>
                  <div className="text-lg">{modalData.bp1 || "N/A"}</div>
                </div>
                <div className="bg-red-600 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">ASK RATE</div>
                  <div className="text-lg">{modalData.sp1 || "N/A"}</div>
                </div>
                <div className="bg-red-600 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">LTP</div>
                  <div className="text-lg">{modalData.lp || "N/A"}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">VOLUME</div>
                  <div className="text-lg">0.00</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">CHANGE %</div>
                  <div className="text-lg">{(((modalData.lp - modalData.c) / modalData.c) * 100).toFixed(2)}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">NET CHG</div>
                  <div className="text-lg flex items-center">
                    <i className="fas fa-arrow-up text-green-500 mr-1"></i>{(modalData.lp - modalData.c).toFixed(2)}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">HIGH</div>
                  <div className="text-lg">{modalData.h || "N/A"}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">LOW</div>
                  <div className="text-lg">{modalData.l || "N/A"}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">OPEN</div>
                  <div className="text-lg">{modalData.o || "N/A"}</div>
                </div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-center">
                  <div className="text-sm font-bold">CLOSE</div>
                  <div className="text-lg">{modalData.c || "N/A"}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-4 ml-[50px]">

              <div className="flex flex-col">
                <div className="flex flex-row items-center">
                  <label className="flex items-center mr-4 cursor-pointer">
                    <input
                      type="radio"
                      name="tradeType"
                      value="buy"
                      className="mr-1"
                      checked={buy}
                      onChange={() => {
                        setTradeDirection("buy");
                        setbuy(true);
                        setsell(false);
                      }} // Update state on change
                    />
                    <span className="text-white">Buy</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tradeType"
                      value="sell"
                      className="mr-1"
                      checked={sell}
                      onChange={() => {
                        setTradeDirection("sell");
                        setsell(true);
                        setbuy(false);
                      }} // Update state on change
                    />
                    <span className="text-white">Sell</span>
                  </label>
                </div>

                <div className="mt-1">
                  <select className="w-[150px] h-[32px] rounded-sm" onChange={(e) => setOrderExecutionType(e.target.value)}>
                    <option>Select the options</option>
                    <option>Market</option>
                    <option>Limit</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-row w-full text-center items-end justify-center text-white">
                  <p>Lot</p>
                </div>
                <div className="mt-1">
                  <input
                    className="p-1 w-[80px]"
                    value={lotvalue}
                    onChange={handlelotChange}
                  />
                </div>
                {/* <div className="text-white text-xs text-center mt-1">
              {modalData && modalData.ts ? (
                <>
                  {modalData.ts.includes('GOLDM') ? '1 Lot = 10' : 
                   modalData.ts.includes('GOLD') ? '1 Lot = 100' : 
                   `1 Lot = ${modalData.ls}`}
                </>
              ) : 'Select script'}
            </div> */}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-row w-full text-center items-end justify-center text-white">
                  <p>Qty</p>
                </div>
                <div className="mt-1">
                  <input
                    type="number"
                    className="p-1 w-[150px] bg-white text-black"
                    disabled
                    value={calculateQuantity(modalData.ts, lotvalue)}
                  />
                </div>
                {/* <div className="flex flex-row text-white text-sm">
                <div className="mr-10">Max: 0</div>
                <div className="">position: 0</div>
            </div> */}

              </div>

              <div className="flex flex-col">
                <div className="flex flex-row w-full text-center items-end justify-center text-white">
                  <p>Price</p>
                </div>
                <div className="mt-1">
                  {orderExecutionType === "Limit" ? (
                    <input
                      placeholder="Enter price"
                      className="p-1 w-[150px] bg-white"
                      value={limitPrice} // Bind to the new limit price state
                      onChange={(e) => setLimitPrice(e.target.value)} // Update the state with the input value
                    />
                  ) : (
                    <input
                      className="p-1 w-[150px] bg-white"
                      value={buy ? `${modalData.sp1}` : `${modalData.bp1}`}
                      disabled
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col mt-4">
                <button className="bg-white rounded-sm p-2 text-sm font-semibold border-4 border-b-green-500" onClick={placeOrder}>
                  Place Order
                </button>
              </div>
              <div className="flex flex-col mt-4">
                <button className="bg-white rounded-sm p-2 px-6 text-sm font-semibold border-4 border-b-red-400" onClick={closemodalhandle}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveMarketData;
