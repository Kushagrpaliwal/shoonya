"use client";
import React, { useEffect, useState } from 'react';

const TrashPage = () => {
  const [trashOrders, setTrashOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrashOrders();
  }, []);

  const fetchTrashOrders = async () => {
    try {
      const email = localStorage.getItem('TradingUserEmail');
      const response = await fetch(`/api/getTrash?email=${email}`);
      const result = await response.json();

      if (response.ok) {
        setTrashOrders(result.trash || []);
      } else {
        console.error("Error fetching trash:", result.error);
        setTrashOrders([]);
      }
    } catch (error) {
      console.error("Error fetching trash orders:", error);
      setTrashOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreOrder = async (orderId) => {
    try {
      const email = localStorage.getItem('TradingUserEmail');
      
      const response = await fetch('/api/restoreFromTrash', {
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
        alert('Order restored successfully!');
        fetchTrashOrders(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error restoring order:', error);
      alert('Failed to restore order. Please try again.');
    }
  };

  const handleDeletePermanently = async (orderId) => {
    try {
      const email = localStorage.getItem('TradingUserEmail');
      
      // Confirm permanent deletion
      const confirmDelete = window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.');
      
      if (!confirmDelete) {
        return;
      }
      
      const response = await fetch('/api/deleteFromTrash', {
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
        alert('Order permanently deleted!');
        fetchTrashOrders(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  const filteredOrders = trashOrders.filter(order => {
    const matchesSearchTerm = 
      order.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.market?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearchTerm;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading trash...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg p-3">
        <span className="font-black text-xl w-[65px]">Trash</span>
        {/* <div className="marquee">
          <span className="text-red-600">
            Removed orders are stored here. You can restore or permanently delete them.
          </span>
        </div> */}
        {/* <div className="ml-auto text-sm text-gray-600">
          <span className="font-semibold">Total items:</span> {trashOrders.length}
        </div> */}
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
              placeholder='Search in trash...' 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="max-h-[400px]  overflow-y-auto bg-white">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-2">Index</th>
                <th className="p-2">Trade By</th>
                <th className="p-2">Time</th>
                <th className="p-2">Market</th>
                <th className="p-2">Symbol</th>
                <th className="p-2">Type</th>
                <th className="p-2">Lot</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Order Price</th>
                <th className="p-2">Net Price</th>
                <th className="p-2">Status</th>
                {/* <th className="p-2">Original Array</th> */}
                <th className="p-2">Restore</th>
                <th className="p-2">Delete</th>
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
                    <td className="p-2">{order.type}</td>
                    <td className="p-2">{order.lot}</td>
                    <td className="p-2">{order.quantity}</td>
                    <td className="p-2">{order.price}</td>
                    <td className="p-2">{order.price}</td>  
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
                    {/* <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.originalArray === 'buyOrders' 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {order.originalArray || 'buyOrders'}
                      </span>
                    </td> */}
                    <td className="p-2">
                      <button 
                        onClick={() => handleRestoreOrder(order._id)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                        title={`Restore this order to ${order.originalArray || 'buyOrders'}`}
                      >
                        Restore
                      </button>
                    </td>
                    <td className="p-2">
                      <button 
                        onClick={() => handleDeletePermanently(order._id)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                        title="Permanently delete this order"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center p-4">
                    {trashOrders.length === 0 ? "No items in trash" : "No items match your search"}
                  </td>
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

export default TrashPage;
