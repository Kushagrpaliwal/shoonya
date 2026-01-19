"use client";
import React, { useEffect, useState } from "react";

const PositionReport = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [market, setMarket] = useState("");
  const [script, setScript] = useState("");
  const [client, setClient] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [user, setUser] = useState([]);

  const positionsTitles = [
    // { id: 0, text: "" },
    { id: 1, text: "Segment" },
    { id: 2, text: "Client" },
    { id: 3, text: "Symbol" },
    { id: 5, text: "T. Buy Q." },
    { id: 6, text: "Buy A.P." },
    { id: 7, text: "T.Sell Q." },
    { id: 8, text: "Sell A.P." },
    { id: 9, text: "Net Q. Net L" },
    { id: 10, text: "BEA" },
    { id: 11, text: "C.R." },
    { id: 12, text: "MTM Close" },
  ];

  const fetchusertransactions = async () => {
    const email = localStorage.getItem("TradingUserEmail");
    const res = await fetch(`/api/getUsers?email=${email}`);
    const result = await res.json();
    setUser(result.users[0].totalPositions || []);
    console.log("checkout the user", result.users[0].totalPositions);
  };

  useEffect(() => {
    fetchusertransactions();
  }, []);

  return (
    <div className="bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <h1 className="text-xl font-semibold">Position Report</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-700 text-white p-3 mt-2 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* Radio Buttons */}
          <div className="flex items-center gap-4">
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filter"
                value="All"
                checked={selectedFilter === "All"}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-4 h-4"
              />
              <span>All</span>
            </label> */}
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filter"
                value="Client Wise"
                checked={selectedFilter === "Client Wise"}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-4 h-4"
              />
              <span>Client Wise</span>
            </label> */}
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filter"
                value="Outstanding"
                checked={selectedFilter === "Outstanding"}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-4 h-4"
              />
              <span>Outstanding</span>
            </label> */}
            {/* <label className="flex items-center gap-2">
              <input
                type="radio"
                name="filter"
                value="Script Wise"
                checked={selectedFilter === "Script Wise"}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-4 h-4"
              />
              <span>Script Wise</span>
            </label> */}
          </div>

          {/* Input Fields */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1">Market</label>
              <input
                type="text"
                placeholder="Market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="px-3 py-1 text-black rounded border"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Script</label>
              <input
                type="text"
                placeholder="Script Name"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="px-3 py-1 text-black rounded border"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Client</label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="px-3 py-1 text-black rounded border"
              >
                <option value="">Select Client</option>
                <option value="client1">Client 1</option>
                <option value="client2">Client 2</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1">Expiry Date</label>
              <input
                type="date"
                placeholder="dd/mm/yyyy"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="px-3 py-1 text-black rounded border"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
            GET POSITION
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">
            NSE ROLLOVER
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
            EXIT POSITION
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">
            CLEAR FILTER
          </button>
        </div>
      </div>

      {/* Data Table Area */}
      <div className="py-2 ">
        <table className="w-full border rounded bg-gray-50 text-black">
          <thead className="bg-gray-200">
            <tr className="text-sm font-bold">
              {positionsTitles.map((title, index) => (
                <th className="px-4 py-2 text-left" key={title.id}>
                  {title.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {user?.map((item, index) => {
             const totalBuyOrders = item.orders.filter(order => order.originalArray === "buyOrders").length;
             const totalSellOrders = item.orders.filter(order => order.originalArray === "sellOrders").length;
             const client = item.orders[0].email; 
             const exchange = item.orders[0].market;
             const totalbuyquantity = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum,order)=> sum + order.quantity,0)
             const totalsellquantity = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum,order)=> sum + order.quantity,0)
             const totalbuylot = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum,order)=> sum + order.lot,0)
             const totalselllot = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum,order)=> sum + order.lot,0)
             const TotalBuyPrice = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum,order)=> sum + order.price,0);
             const TotalSellPrice = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum,order)=> sum + order.price,0);
             const buyAvgPrice = TotalBuyPrice / totalBuyOrders;
             const sellAvgPrice = TotalSellPrice / totalSellOrders;
             const netLotQuantity = totalbuyquantity - totalsellquantity;
             const netLot = totalbuylot - totalselllot ;
             const bea = (((buyAvgPrice * totalbuyquantity) - (sellAvgPrice * totalsellquantity))/netLotQuantity)

              return(
               <tr className="text-sm border-b bg-white" key={item.symbol}>
                 <td className="px-4 py-2">{exchange || "N/A"}</td>
                 <td className="px-4 py-2">{client || "N/A"}</td>
                 <td className="px-4 py-2">{item.symbol || "N/A"}</td>
                 <td className="px-4 py-2">{totalbuyquantity || 0}</td>
                 <td className="px-4 py-2">{buyAvgPrice.toFixed(2) === "NaN" ? 0 : buyAvgPrice.toFixed(2) }</td>
                 <td className="px-4 py-2">{totalsellquantity || 0}</td>
                 <td className="px-4 py-2">{sellAvgPrice.toFixed(2) === "NaN" ? 0 : sellAvgPrice.toFixed(2) }</td>
                 <td className="px-4 py-2">{netLotQuantity || 0}({ netLot || 0})</td>
                 <td className="px-4 py-2">{bea.toFixed(2) === "NaN" ? 0 : bea.toFixed(2)}</td>
                 <td className="px-4 py-2">{item.cr || 0}</td>
                 <td className="px-4 py-2">{item.mtmClose || 0}</td>
               </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionReport;
