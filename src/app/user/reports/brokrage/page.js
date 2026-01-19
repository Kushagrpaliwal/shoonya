'use client'
import React, { useState } from 'react'

const BrokerageReport = () => {
  const [market, setMarket] = useState('')
  const [script, setScript] = useState('')
  const [valan, setValan] = useState('')
  const [tradeAfter, setTradeAfter] = useState('')
  const [tradeBefore, setTradeBefore] = useState('')
  const [client, setClient] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState('15')
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = () => {
    console.log('Submitting search...')
  }

  const handleReset = () => {
    setMarket('')
    setScript('')
    setValan('')
    setTradeAfter('')
    setTradeBefore('')
    setClient('')
    setSearchTerm('')
  }

  return (
    <div className="bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <h1 className="text-xl font-semibold">Brokerage Report</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-700 text-white p-4 mt-3 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Market</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="">SELECT</option>
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
              <option value="MCX">MCX</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm mb-1">Script</label>
            <select
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="">SELECT</option>
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
              <option value="INFY">INFY</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm mb-1">Valan</label>
            <input
              type="text"
              placeholder="Valan"
              value={valan}
              onChange={(e) => setValan(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm mb-1">Trade After</label>
            <input
              type="date"
              value={tradeAfter}
              onChange={(e) => setTradeAfter(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm mb-1">Trade Before</label>
            <input
              type="date"
              value={tradeBefore}
              onChange={(e) => setTradeBefore(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm mb-1">Client</label>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="">SELECT</option>
              <option value="client1">Client 1</option>
              <option value="client2">Client 2</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="font-semibold">Total My Brokerage 0.00</span>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="p-4">
        {/* Table Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Search:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-1 rounded"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Trade Time ↓
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Client ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Script ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Trade Type ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Trade Rate ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Qty ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Lot ↑
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  My Brokerage ↑
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  No data available in table
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing 0 to 0 of 0 entries
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-gray-500 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 border rounded text-gray-500 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerageReport