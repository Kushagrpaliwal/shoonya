"use client";
import React, { useState } from "react";

const LedgerReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [entryType, setEntryType] = useState("Both");
  const [billMarketType, setBillMarketType] = useState("");

  const handleFindLogs = () => {
    console.log("Finding logs...");
  };

  return (
    <div className="bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <h1 className="text-xl font-semibold">Ledger Wise</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-700 text-white p-4 mt-3 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-black rounded border"
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Entry Type</label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="Both">Both</option>
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Bill Market Type</label>
            <select
              value={billMarketType}
              onChange={(e) => setBillMarketType(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="">Select Market Type</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="MCX">MCX</option>
            </select>
          </div>

          <button
            onClick={handleFindLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Find Logs
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="font-semibold">Total Deposit: 0.00</span>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Sr No
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Remarks
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Debit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Credit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Balance
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-gray-300 px-4 py-3">1</td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3 font-semibold">
                  Total: 613,223.00
                </td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3"></td>
                <td className="border border-gray-300 px-4 py-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      <div className="p-8 text-center text-gray-500">
        <p>
          No additional ledger entries found. Use the filters above to search
          for specific transactions.
        </p>
      </div>
    </div>
  );
};

export default LedgerReport;
