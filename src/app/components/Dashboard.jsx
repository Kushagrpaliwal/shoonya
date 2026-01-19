"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  // Sample data for demonstration
  const orders = [
    {
      time: "10:00 AM",
      client: "Client A",
      script: "Script 1",
      type: "Buy",
      lot: 1,
      qty: 100,
      rate: 150.0,
    },
    {
      time: "10:05 AM",
      client: "Client B",
      script: "Script 2",
      type: "Sell",
      lot: 2,
      qty: 200,
      rate: 155.0,
    },
    {
      time: "10:10 AM",
      client: "Client C",
      script: "Script 3",
      type: "Buy",
      lot: 1,
      qty: 150,
      rate: 152.5,
    },
  ];

  const tableHeaders = ["Time", "Client", "Script", "Type", "Lot", "Qty", "Rate"];

  const TableComponent = ({ title, data }) => (
    <Card className="shadow-soft border-0 bg-white">
      <CardHeader className="pb-3 bg-zinc-800 rounded-t-xl">
        <CardTitle className="text-base font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200">
                {tableHeaders.map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.length > 0 ? (
                data.map((order, index) => (
                  <tr key={index} className="hover:bg-zinc-50 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-zinc-700">{order.time}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{order.client}</td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{order.script}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.type === "Buy"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{order.lot}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{order.qty}</td>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">₹{order.rate.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your trading activity</p>
        </div>

        {/* Marquee Notice */}

        {/* <div className="flex-1 max-w-xl overflow-hidden rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
          <div className="marquee">
            <span className="text-amber-700 text-sm font-medium">
              ⚠️ Money involved. This is a Virtual Trading Application for exchanging views on markets.
            </span>
          </div>
        </div> */}

      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: "156", change: "+12%", up: true },
          { label: "Pending Orders", value: "23", change: "-5%", up: false },
          { label: "Today's Volume", value: "₹2.4M", change: "+18%", up: true },
          { label: "Active Scripts", value: "42", change: "+3%", up: true },
        ].map((stat, index) => (
          <Card key={index} className="shadow-soft border-0 bg-white">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                <span className={`text-xs font-medium ${stat.up ? "text-emerald-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableComponent title="Latest Orders" data={orders} />
        <TableComponent title="Pending Orders" data={orders} />
      </div>

      {/* Rejection Logs */}
      <TableComponent title="Rejection Logs" data={orders} />
    </div>
  );
};

export default Dashboard;