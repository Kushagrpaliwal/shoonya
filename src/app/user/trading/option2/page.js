"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshButton } from "@/components/ui/refresh-button";

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
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-sm border-zinc-200">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-zinc-900">Position Report</CardTitle>
            <RefreshButton onRefresh={fetchusertransactions} />
          </div>
        </CardHeader>
      </Card>

      {/* Filter Section */}
      <Card className="bg-zinc-900 shadow-lg border-zinc-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="market" className="text-zinc-100 font-medium">Market</Label>
              <Input
                id="market"
                placeholder="Enter market"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="h-11 bg-white border-0 focus-visible:ring-zinc-400 text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="script" className="text-zinc-100 font-medium">Script Name</Label>
              <Input
                id="script"
                placeholder="Enter script name"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="h-11 bg-white border-0 focus-visible:ring-zinc-400 text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="text-zinc-100 font-medium">Client</Label>
              <select
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full h-11 px-3 rounded-md bg-white border-0 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="">Select Client</option>
                <option value="client1">Client 1</option>
                <option value="client2">Client 2</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-zinc-100 font-medium">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-11 bg-white border-0 focus-visible:ring-zinc-400 text-zinc-900 block"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-6">
              Get Position
            </Button>
            <Button variant="secondary" className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium h-10 px-6">
              NSE Rollover
            </Button>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-medium h-10 px-6">
              Exit Position
            </Button>
            <Button variant="outline" className="bg-transparent border-zinc-600 text-zinc-100 hover:bg-zinc-800 hover:text-white font-medium h-10 px-6">
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Area */}
      <Card className="shadow-sm border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-800 text-white uppercase text-xs tracking-wider">
              <tr>
                {positionsTitles.map((title) => (
                  <th className="px-6 py-4 font-semibold whitespace-nowrap" key={title.id}>
                    {title.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {user?.map((item, index) => {
                const totalBuyOrders = item.orders.filter(order => order.originalArray === "buyOrders").length;
                const totalSellOrders = item.orders.filter(order => order.originalArray === "sellOrders").length;
                const client = item.orders[0].email;
                const exchange = item.orders[0].market;
                const totalbuyquantity = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum, order) => sum + order.quantity, 0);
                const totalsellquantity = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum, order) => sum + order.quantity, 0);
                const totalbuylot = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum, order) => sum + order.lot, 0);
                const totalselllot = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum, order) => sum + order.lot, 0);
                const TotalBuyPrice = item.orders.filter(order => order.originalArray === "buyOrders").reduce((sum, order) => sum + order.price, 0);
                const TotalSellPrice = item.orders.filter(order => order.originalArray === "sellOrders").reduce((sum, order) => sum + order.price, 0);
                const buyAvgPrice = totalBuyOrders > 0 ? TotalBuyPrice / totalBuyOrders : 0;
                const sellAvgPrice = totalSellOrders > 0 ? TotalSellPrice / totalSellOrders : 0;
                const netLotQuantity = totalbuyquantity - totalsellquantity;
                const netLot = totalbuylot - totalselllot;
                const bea = netLotQuantity !== 0 ? (((buyAvgPrice * totalbuyquantity) - (sellAvgPrice * totalsellquantity)) / netLotQuantity) : 0;

                return (
                  <tr className="bg-white hover:bg-zinc-50 transition-colors" key={item.symbol || index}>
                    <td className="px-6 py-4 font-medium text-zinc-900 border-none">{exchange || "N/A"}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{client || "N/A"}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900 border-none">{item.symbol || "N/A"}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{totalbuyquantity || 0}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{buyAvgPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{totalsellquantity || 0}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{sellAvgPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">
                      <span className={netLotQuantity >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {netLotQuantity || 0}
                      </span>
                      <span className="text-zinc-500 ml-1">({netLot || 0})</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{bea.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{item.cr || 0}</td>
                    <td className="px-6 py-4 text-zinc-700 border-none">{item.mtmClose || 0}</td>
                  </tr>
                );
              })}
              {(!user || user.length === 0) && (
                <tr>
                  <td colSpan={positionsTitles.length} className="px-6 py-8 text-center text-zinc-500">
                    No positions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PositionReport;
