"use client";
import React, { useEffect, useState } from 'react';
import { useWebSocket } from "@/app/lib/WebSocketContext";


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
  
  // Track which orders are subscribed to live data
  const [subscribedOrders, setSubscribedOrders] = useState(new Set());
  
  // Track which orders are being executed to prevent multiple executions
  const [executingOrders, setExecutingOrders] = useState(new Set());

  // State variables for filter inputs
  const [tradeAfter, setTradeAfter] = useState('');
  const [tradeBefore, setTradeBefore] = useState('');
  const [market, setMarket] = useState('');
  const [script, setScript] = useState('');
  const [orderType, setOrderType] = useState('');
  const [nextCleanup, setNextCleanup] = useState('');

  // Function to subscribe to a single order
  const subscribeToOrder = (order) => {
    if (!isConnected || !order.exchange || !order.token) return;
    
    const subscriptionKey = `${order.exchange}|${order.token}`;
    
    // Check if already subscribed
    if (subscribedOrders.has(subscriptionKey)) return;
    
    try {
      subscribe(subscriptionKey, "depth");
      setSubscribedOrders(prev => new Set(prev).add(subscriptionKey));
      console.log(`Subscribed to: ${subscriptionKey}`);
    } catch (error) {
      console.error(`Failed to subscribe to ${subscriptionKey}:`, error);
    }
  };

  // Subscribe to orders one by one when they become available
  useEffect(() => {
    if (isConnected && totalOrders.length > 0) {
      // Clear existing subscriptions
      setSubscribedOrders(new Set());
      
      // Get unique exchange|token combinations only for pending orders
      const uniqueInstruments = new Set();
      totalOrders.forEach(order => {
        if (order.exchange && order.token && order.status === 'pending') {
          uniqueInstruments.add(`${order.exchange}|${order.token}`);
        }
      });
      
      // Subscribe to each unique instrument
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

  // Monitor live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveData.length > 0) {
        console.log("Live data updated:", liveData.length, "items");
        // Force re-render to update prices
        setTotalOrders(prev => [...prev]);
      }
    }, 1000); // runs every 1 second
  
    return () => clearInterval(interval); // cleanup when component unmounts
  }, [liveData]);
  

  // Cleanup subscriptions when component unmounts
  useEffect(() => {
    return () => {
      // Unsubscribe from all orders
      totalOrders.forEach(order => {
        if (order.exchange && order.token) {
          unsubscribeFromOrder(order);
        }
      });
    };
  }, []);

    useEffect(() => {
    // Calculate next cleanup time (12am daily)
    const now = new Date();
    const nextCleanupTime = new Date(now);
    nextCleanupTime.setHours(24, 0, 0, 0); // Set to next day 12am
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

    const resetfilters = ()=>{
      setTradeAfter('')
      setTradeBefore('')
      setMarket('')
      setScript('')
      setOrderType('')
    }

  // const handleSearch = () => {
  //   setCurrentPage(1); // Reset to the first page on search
  // };

  useEffect(()=>{
    const fetchTrades = async() =>{
      const email = localStorage.getItem('TradingUserEmail');
      if(!email){
        setError("User  email not found. Please log in again.");
        return;
      }
      try{
        const response = await fetch(`/api/getUsers?email=${email}`);
        const result = await response.json();
        if(!response.ok){
          throw new Error(result.error);
        }
        const totalorder = result.users[0].totalOrders || [];
        const trades = totalorder.map((trade) => ({
          exchange: trade.exchange,
          token: trade.token,
        }));
        setWatchlist(trades)
        console.log("checkout the pending order trades", trades);
      }catch(err){
        console.error("Error fetching trades:", err);
        setError(err.message);
      }
    }
    fetchTrades();
  },[])

  useEffect(()=>{
    if(isConnected && watchlist.length > 0){
      // Only subscribe to pending orders in watchlist
      const pendingInstruments = watchlist.filter(inst => {
        const order = totalOrders.find(o => o.exchange === inst.exchange && o.token === inst.token);
        return order && order.status === 'pending';
      });
      
      if(pendingInstruments.length > 0){
        const instrumentsString = pendingInstruments.map(inst => `${inst.exchange}|${inst.token}`).join('#');
        subscribe(instrumentsString, "depth");
        console.log("Subscribing to Depth of the pending trades:", instrumentsString);
      }
    }
  },[watchlist, isConnected, subscribe, totalOrders])


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
    const matchesOrderType = orderType ? order.type?.toLowerCase() === orderType.toLowerCase() : true;

    return matchesSearchTerm && matchesPendingStatus && matchesExecutedStatus && matchesTradeAfter && matchesTradeBefore && matchesMarket && matchesScript && matchesOrderType;

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
        // Refresh the orders data
        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();
        
        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }
        
        alert('Order cancelled successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleRemoveOrder = async (orderId) => {
    try {
      const email = localStorage.getItem('TradingUserEmail');
      
      // Confirm before removing
      // const confirmRemove = window.confirm('Are you sure you want to remove this order? It will be moved to trash.');
      
      // if (!confirmRemove) {
      //   return;
      // }
      
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
        // Refresh the orders data
        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();
        
        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }
        
        // alert(`Order removed successfully! Moved to trash. (${result.trashCount} items in trash)`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing order:', error);
      alert('Failed to remove order. Please try again.');
    }
  };

  const hendaleExecuteOrder = async (orderId) =>{
    // Prevent multiple executions of the same order
    if (executingOrders.has(orderId)) {
      console.log(`Order ${orderId} is already being executed`);
      return;
    }

    try{
      // Mark order as being executed
      setExecutingOrders(prev => new Set(prev).add(orderId));
      
      const email = localStorage.getItem('TradingUserEmail');

      const response = await fetch('/api/executeOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({orderId,email})
      })

      const result = await response.json();
      if(response.ok){
        console.log("Order executed successfully!");
        
        // Refresh the orders data to get updated status
        const userResponse = await fetch(`/api/getUsers?email=${email}`);
        const userResult = await userResponse.json();
        
        if (userResult.users && userResult.users.length > 0) {
          setTotalOrders(userResult.users[0].totalOrders || []);
        }
        
        // Remove from executing orders set
        setExecutingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
        
        alert('Order executed successfully!');
      }else{
        console.error('Error executing order:', result.error);
        // Remove from executing orders set on error
        setExecutingOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }

    }catch(error){
      console.error('Error executing order:', error);
      // Remove from executing orders set on error
      setExecutingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      alert('Failed to execute order. Please try again.');
    }
  }

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <span className="font-black text-xl w-[65px]">Trades</span>
        <div className="marquee">
          <span className="text-red-600">
            Money involved. This is a Virtual Trading Application which has all
            the features to trade. This application is used for exchanging views
            on markets for India{" "}
          </span>
        </div>

        {/* <div className="ml-auto text-sm text-gray-600">
          <span className="font-semibold">Next cleanup:</span> {nextCleanup}
        </div> */}

      </div> 

      <div className="bg-[#2b3f54] p-4 mt-2 rounded-lg shadow-lg">
        <div className="text-white text-sm mb-2 italic">
          Note: Pending limit orders are automatically removed at 12am daily
        </div>
        <div className="flex flex-wrap items-center space-x-2 mb-4">
          <div className='flex flex-col gap-1 mr-6 mt-3'>
            <div className="flex space-x-2">
              <input 
                type="checkbox" 
                id="pendingOrders" 
                className="form-checkbox text-green-500" 
                checked={showPendingOrders} 
                onChange={() => setShowPendingOrders(!showPendingOrders)} 
              />
              <label htmlFor="pendingOrders" className="text-white">Pending Orders</label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="executedOrders" 
                className="form-checkbox text-green-500" 
                checked={showExecutedOrders} 
                onChange={() => setShowExecutedOrders(!showExecutedOrders)} 
              />
              <label htmlFor="executedOrders" className="text-white">Executed/Rejected Orders</label>
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="tradeAfter" className ="text-white">Trade After</label>
            <input 
              type="date" 
              id="tradeAfter" 
              className="form-input rounded-md p-2" 
              value={tradeAfter}
              onChange={(e) => setTradeAfter(e.target.value)} 
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tradeBefore" className="text-white">Trade Before</label>
            <input 
              type="date" 
              id="tradeBefore" 
              className="form-input rounded-md p-2" 
              value={tradeBefore}
              onChange={(e) => setTradeBefore(e.target.value)} 
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="market" className="text-white">Market</label>
            <input 
              type="text" 
              id="market" 
              placeholder="Market" 
              className="form-input rounded-md p-2" 
              value={market}
              onChange={(e) => setMarket(e.target.value)} 
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="script" className="text-white">Script</label>
            <input 
              type="text" 
              id="script" 
              placeholder="Script Name" 
              className="form-input rounded-md p-2" 
              value={script}
              onChange={(e) => setScript(e.target.value)} 
            />
          </div>
          <div className="flex flex-col ">
            <label htmlFor="orderType" className="text-white">Order Type</label>
            <input 
              type="text" 
              id="orderType" 
              placeholder="Order Type" 
              className="form-input rounded-md p-2" 
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)} 
            />

          </div>
          <div className="flex flex-col mt-6 border-b-4 border-orange-500 text-black bg-white rounded-lg w-[80px] h-[40px] p-4 text-center items-center justify-center">
            <button onClick={resetfilters}>Reset</button>
          </div>
        </div>
      </div>
      <div className="bg-[#2b3f54] p-4 rounded-lg shadow-lg mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center p-1 space-x-2">
            <input 
              type="text" 
              id="search" 
              className="form-input rounded-md p-3" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);  
              }} 
              placeholder='Search...' 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="max-h-[400px] overflow-y-auto bg-white">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-2">Index</th>
                <th className="p-2">Trade By</th>
                <th className="p-2">Time</th>
                <th className="p-2">Market</th>
                <th className="p-2">Symbol</th>
                <th className="p-2">Orders</th>
                <th className="p-2">Type</th>
                <th className="p-2">Lot</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Order Price</th>
                <th className="p-2">Net Price</th>
                <th className="p-2">Live Price</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remove</th>
                <th className="p-2">Cancel</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td className="p-2">{index + indexOfFirstItem + 1}</td>
                    <td className="p-2">{order.email}</td>  
                    <td className="p-2">{new Date(order.timestamp).toLocaleString()}</td>
                    <td className="p-2">{order.market}</td>  
                    <td className="p-2">{order.symbol}</td>  
                    <td className="p-2">{order.originalArray}</td>  
                    <td className="p-2">{order.type}</td>
                    <td className="p-2">{order.lot}</td>
                    <td className="p-2">{order.quantity}</td>
                    <td className="p-2">{order.price}</td>
                    <td className="p-2">{order.price}</td>  
                    <td className="p-2">
                       {(() => {
                         // Find live price for this order
                         const liveDataItem = liveData.find(data => 
                           data.tk === `${order.exchange}|${order.token}` || 
                           data.tk === `${order.exchange}_${order.token}` ||
                           data.ts === order.symbol
                         );

                         console.log("Looking for live data for:", order.exchange, order.token);
                         console.log("Available live data:", liveData);
                         
                         if (liveDataItem) {
                           console.log("Found live data item:", liveDataItem);
                           
                           // Get the appropriate price based on order type
                           let livePrice = 0;
                           const isLimitOrder = order.type === "limit" && order.status === "pending";
                           
                           if (order.originalArray === 'buyOrders') {
                             livePrice = liveDataItem.sp1 || liveDataItem.lp || 0; // Best buy price or last traded price
                           } else {
                             livePrice = liveDataItem.bsp1 || liveDataItem.lp || 0; // Best sell price or last traded price
                           }
                           
                           if (livePrice > 0) {
                             const isPriceMatch = isLimitOrder && (
                               (order.originalArray === 'buyOrders' && livePrice == order.price) ||
                               (order.originalArray === 'sellOrders' && livePrice == order.price)
                             );

                             // Only execute if price matches, order is pending, and not already being executed
                             if(isPriceMatch && order.status === 'pending' && !executingOrders.has(order._id)){
                              hendaleExecuteOrder(order._id);
                             }
                             
                             return (
                               <div className="flex flex-col items-center">
                                 <span className={`font-semibold ${
                                   isPriceMatch ? 'text-black' : 'text-green-600'
                                 }`}>
                                   {isPriceMatch ? `₹${livePrice}` : `₹${livePrice}`}
                                 </span>
                                 {executingOrders.has(order._id) && (
                                   <span className="text-xs text-orange-500">Executing...</span>
                                 )}
                               </div>
                             );
                           }
                         }
                         
                         // 
                         return (
                           <div className="text-center">
                             <span className="text-gray-400">--</span>
                           </div>
                         );
                       })()}
                     </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button 
                        onClick={() => handleRemoveOrder(order._id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        title="Remove this order (moves to trash)"
                      >
                        Remove
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        disabled={order.status !== "pending"}
                        onClick={() => handleCancelOrder(order._id)}
                        className={`p-1 rounded 
                          ${order.status === "pending" 
                            ? "bg-red-500 text-white hover:bg-red-600" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                        `}
                        title={order.status === "pending" ? "Cancel this order" : "Only pending orders can be cancelled"}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center p-4">No data available in table</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-white">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries</span>
          <div className="flex space-x-2">
            <button onClick={handlePrevious} disabled={currentPage === 1} className="bg-gray-500 text-white p-2 rounded-md disabled:opacity-50">Previous</button>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="bg-gray-500 text-white p-2 rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;