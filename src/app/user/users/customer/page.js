"use client";
import React, { useState } from "react";

const ClientListing = () => {
  const [user, setUser] = useState("My user");
  const [master, setMaster] = useState("");
  const [broker, setBroker] = useState("");
  const [joinAfter, setJoinAfter] = useState("");
  const [joinBefore, setJoinBefore] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("15");
  const [searchTerm, setSearchTerm] = useState("");
  
  // User creation form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample data
  const clientData = [
    {
      name: "R01 - SANJAY JI O",
      loginId: "433853",
      broker: "446028 (SHIV)",
      master: "ROBIN AGRA(S.MASTER) - Super Master (597486)",
      onlyPosition: "No",
      action: "L",
      loginTime: "2025-03-03 12:43:46",
      loginIP: "2405:201:6809:e011:18e6:4880:4a68:6dad",
      joinTime: "2024-",
    },
    {
      name: "R10 - NG 10 JAKNAP O",
      loginId: "162608",
      broker: "446028 (SHIV)",
      master: "ROBIN AGRA(S.MASTER) - Super Master (597486)",
      onlyPosition: "No",
      action: "L",
      loginTime: "2025-03-31 17:31:39",
      loginIP: "2401:4900:883f:d157:9849:ce76:c075:149",
      joinTime: "2024-",
    },
  ];

  const handleSearch = () => {
    // Search functionality
    console.log("Searching...");
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.name) {
      errors.name = "Name is required";
    }
    

    

    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("User created successfully!");
        setShowCreateForm(false);
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: ""
        });
        setFormErrors({});
        // Optionally refresh the client list here
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className="bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white shadow-md rounded-lg p-3">
        <h1 className="text-xl font-semibold">Client Listing</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New User
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-700 text-white p-4 mt-3 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm mb-1">User</label>
            <select
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            >
              <option value="My user">My user</option>
              <option value="Other user">Other user</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Master</label>
            <input
              type="text"
              placeholder="Select Master"
              value={master}
              onChange={(e) => setMaster(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Broker</label>
            <input
              type="text"
              placeholder="Select Broker"
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Join After</label>
            <input
              type="date"
              value={joinAfter}
              onChange={(e) => setJoinAfter(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">Join Before</label>
            <input
              type="date"
              value={joinBefore}
              onChange={(e) => setJoinBefore(e.target.value)}
              className="px-3 py-2 text-black rounded border"
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Search
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
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name ↑
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Login ID ↑
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Broker
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Master
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Only Position
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Action
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Login Time ↑
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Login IP
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Join Time
                </th>
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {client.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {client.loginId}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-blue-600">
                    {client.broker}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {client.master}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className="text-red-600 font-semibold">
                      {client.onlyPosition}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                      {client.action}
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {client.loginTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-blue-600">
                    {client.loginIP}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {client.joinTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing 1 to 2 of 2 entries
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-gray-500 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 bg-teal-600 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 border rounded text-gray-500 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>  

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New User</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="user@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>




              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientListing;
