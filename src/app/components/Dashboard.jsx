"use client";

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
    // Add more sample orders as needed
  ];

  return (
    <div className="p-2 bg-white">
        <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-2">
          <span className="text-xl font-bold">Dashboard</span>
          <div className="marquee">
            <span className="text-red-600">
              Money involved. This is a Virtual Trading Application which has
              all the features to trade. This application is used for exchanging
              views on markets for India
            </span>
          </div>
        </div>

      <div className="flex flex-col mt-4">
        <div className="flex flex-row space-x-4 mb-6">
          {/* Latest Orders Table */}
          <div className="flex-1 bg-white shadow-md rounded-lg">
            <div className="flex flex-row bg-darkgrayish rounded-t-lg">
              <div className="p-2 text-white font-bold">Latest Orders</div>
            </div>
            <div className="h-1 bg-black w-full" />
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-left text-sm font-bold uppercase text-black">
                    {["Time", "Client", "Script", "Type", "Lot", "Qty", "Rate"].map((header) => (
                      <th key={header} className="p-3 border-b border-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={index} className="text-sm text-gray-700 hover:bg-gray-100 transition duration-200">
                        <td className="p-3 border-b border-gray-300">{order.time}</td>
                        <td className="p-3 border-b border-gray-300">{order.client}</td>
                        <td className="p-3 border-b border-gray-300">{order.script}</td>
                        <td className="p-3 border-b border-gray-300">{order.type}</td>
                        <td className="p-3 border-b border-gray-300">{order.lot}</td>
                        <td className="p-3 border-b border-gray-300">{order.qty}</td>
                        <td className="p-3 border-b border-gray-300">{order.rate.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="flex justify-center items-center bg-white font-extralight p-4 text-gray-500"
                      >
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Orders Table */}
          <div className="flex-1 bg-white shadow-md rounded-lg">
            <div className="flex flex-row bg-darkgrayish rounded-t-lg">
              <div className="p-2 text-white font-bold">Pending Orders</div>
            </div>
            <div className="h-1 bg-black w-full" />
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-200 text-left text-sm font-bold uppercase text-black">
                    {["Time", "Client", "Script", "Type", "Lot", "Qty", "Rate"].map((header) => (
                      <th key={header} className="p-3 border-b border-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={index} className="text-sm text-gray-700 hover:bg-gray-100 transition duration-200">
                        <td className="p-3 border-b border-gray-300">{order.time}</td>
                        <td className="p-3 border-b border-gray-300">{order.client}</td>
                        <td className="p-3 border-b border-gray-300">{order.script}</td>
                        <td className="p-3 border-b border-gray-300">{order.type}</td>
                        <td className="p-3 border-b border-gray-300">{order.lot}</td>
                        <td className="p-3 border-b border-gray-300">{order.qty}</td>
                        <td className="p-3 border-b border-gray-300">{order.rate.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="flex justify-center items-center bg-white font-extralight p-4 text-gray-500"
                      >
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rejection Logs Table */}
        <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="flex flex-row bg-darkgrayish rounded-t-lg">
            <div className="p-2 text-white font-bold">Rejection Logs</div>
          </div>
          <div className="h-1 bg-black w-full" />
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-left text-sm font-bold uppercase text-black">
                  {["Time", "Client", "Script", "Type", "Lot", "Qty", "Rate"].map((header) => (
                    <th key={header} className="p-3 border-b border-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={index} className="text-sm text-gray-700 hover:bg-gray-100 transition duration-200">
                      <td className="p-3 border-b border-gray-300">{order.time}</td>
                      <td className="p-3 border-b border-gray-300">{order.client}</td>
                      <td className="p-3 border-b border-gray-300">{order.script}</td>
                      <td className="p-3 border-b border-gray-300">{order.type}</td>
                      <td className="p-3 border-b border-gray-300">{order.lot}</td>
                      <td className="p-3 border-b border-gray-300">{order.qty}</td>
                      <td className="p-3 border-b border-gray-300">{order.rate.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="flex justify-center items-center bg-white font-extralight p-4 text-gray-500"
                    >
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="flex flex-row bg-darkgrayish rounded-t-lg">
            <div className="p-2 text-white font-bold">Rejection Logs</div>
          </div>
          <div className="h-1 bg-black w-full" />
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-left text-sm font-bold uppercase text-black">
                  {["Time", "Client", "Script", "Type", "Lot", "Qty", "Rate"].map((header) => (
                    <th key={header} className="p-3 border-b border-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={index} className="text-sm text-gray-700 hover:bg-gray-100 transition duration-200">
                      <td className="p-3 border-b border-gray-300">{order.time}</td>
                      <td className="p-3 border-b border-gray-300">{order.client}</td>
                      <td className="p-3 border-b border-gray-300">{order.script}</td>
                      <td className="p-3 border-b border-gray-300">{order.type}</td>
                      <td className="p-3 border-b border-gray-300">{order.lot}</td>
                      <td className="p-3 border-b border-gray-300">{order.qty}</td>
                      <td className="p-3 border-b border-gray-300">{order.rate.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="flex justify-center items-center bg-white font-extralight p-4 text-gray-500"
                    >
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;