"use client";
import React, { useEffect, useState } from 'react';
import { AlertModal } from "@/components/ui/alert-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const TrashPage = () => {
  const [trashOrders, setTrashOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info"
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    orderId: null,
    isLoading: false
  });

  const showAlert = (title, message, variant = "info") => {
    setAlertModal({ open: true, title, message, variant });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, open: false }));
  };

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
        showAlert('Restored', 'Order restored successfully!', 'success');
        fetchTrashOrders();
      } else {
        showAlert('Error', `Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error restoring order:', error);
      showAlert('Error', 'Failed to restore order. Please try again.', 'error');
    }
  };

  const openDeleteConfirm = (orderId) => {
    setConfirmModal({
      open: true,
      title: "Permanent Delete",
      message: "Are you sure you want to permanently delete this order? This action cannot be undone.",
      orderId: orderId,
      isLoading: false
    });
  };

  const handleDeletePermanently = async () => {
    const orderId = confirmModal.orderId;
    if (!orderId) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      const email = localStorage.getItem('TradingUserEmail');

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

      setConfirmModal(prev => ({ ...prev, open: false, isLoading: false }));

      if (response.ok) {
        showAlert('Deleted', 'Order permanently deleted!', 'success');
        fetchTrashOrders();
      } else {
        showAlert('Error', `Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setConfirmModal(prev => ({ ...prev, open: false, isLoading: false }));
      showAlert('Error', 'Failed to delete order. Please try again.', 'error');
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
      <div className="bg-gray-50 p-4 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600 font-medium">Loading trash...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 p-2 md:p-4 min-h-screen">
        {/* Header */}
        <Card className="mb-4 bg-white shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg md:text-xl text-gray-900">Trash</h1>
                <p className="text-sm text-gray-500">{trashOrders.length} items in trash</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="bg-gray-800 shadow-lg">
          <CardContent className="p-4">
            {/* Search */}
            <div className="mb-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search in trash..."
                className="max-w-sm h-11 bg-white border-0"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full min-w-[800px] bg-white">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="p-3 text-left text-sm font-medium">#</th>
                    <th className="p-3 text-left text-sm font-medium">Trade By</th>
                    <th className="p-3 text-left text-sm font-medium">Time</th>
                    <th className="p-3 text-left text-sm font-medium">Market</th>
                    <th className="p-3 text-left text-sm font-medium">Symbol</th>
                    <th className="p-3 text-center text-sm font-medium">Type</th>
                    <th className="p-3 text-center text-sm font-medium">Lot</th>
                    <th className="p-3 text-center text-sm font-medium">Qty</th>
                    <th className="p-3 text-center text-sm font-medium">Price</th>
                    <th className="p-3 text-center text-sm font-medium">Status</th>
                    <th className="p-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-700">{index + indexOfFirstItem + 1}</td>
                        <td className="p-3 text-gray-700 text-sm">{order.email}</td>
                        <td className="p-3 text-gray-600 text-sm">{new Date(order.timestamp).toLocaleString()}</td>
                        <td className="p-3 text-gray-700">{order.market}</td>
                        <td className="p-3 font-medium text-gray-900">{order.symbol}</td>
                        <td className="p-3 text-center">
                          <span className="text-sm text-gray-600">{order.type}</span>
                        </td>
                        <td className="p-3 text-center text-gray-700">{order.lot}</td>
                        <td className="p-3 text-center text-gray-700">{order.quantity}</td>
                        <td className="p-3 text-center font-medium text-gray-900">₹{order.price}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRestoreOrder(order._id)}
                              className="h-9 bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteConfirm(order._id)}
                              className="h-9 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center p-8 text-gray-500">
                        {trashOrders.length === 0 ? (
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>No items in trash</span>
                          </div>
                        ) : "No items match your search"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <span className="text-white text-sm">
                Showing {filteredOrders.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  variant="secondary"
                  className="h-10"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  variant="secondary"
                  className="h-10"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleDeletePermanently}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </>
  );
}

export default TrashPage;
