"use client";
import React, { useState } from "react";
import { AlertModal } from "@/components/ui/alert-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info"
  });

  const showAlert = (title, message, variant = "info") => {
    setAlertModal({ open: true, title, message, variant });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, open: false }));
  };

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
        showAlert("Success", "User created successfully!", "success");
        setShowCreateForm(false);
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: ""
        });
        setFormErrors({});
      } else {
        showAlert("Error", data.error || "Failed to create user", "error");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showAlert("Error", "An error occurred while creating the user", "error");
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen p-2 md:p-4">
        {/* Header */}
        <Card className="mb-4 bg-white shadow-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Client Listing</h1>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="h-11 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter Section */}
        <Card className="mb-4 bg-gray-800 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-1">
                <Label className="text-white text-sm">User</Label>
                <select
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-white border-0 text-gray-900"
                >
                  <option value="My user">My user</option>
                  <option value="Other user">Other user</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-white text-sm">Master</Label>
                <Input
                  type="text"
                  placeholder="Select Master"
                  value={master}
                  onChange={(e) => setMaster(e.target.value)}
                  className="h-11 bg-white border-0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white text-sm">Broker</Label>
                <Input
                  type="text"
                  placeholder="Select Broker"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="h-11 bg-white border-0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white text-sm">Join After</Label>
                <Input
                  type="date"
                  value={joinAfter}
                  onChange={(e) => setJoinAfter(e.target.value)}
                  className="h-11 bg-white border-0"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white text-sm">Join Before</Label>
                <Input
                  type="date"
                  value={joinBefore}
                  onChange={(e) => setJoinBefore(e.target.value)}
                  className="h-11 bg-white border-0"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full h-11 bg-white text-gray-900 hover:bg-gray-100"
                >
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table Section */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(e.target.value)}
                  className="h-9 px-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>

              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="max-w-xs h-10"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Login ID</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Broker</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Master</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700">Position Only</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-700">Action</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Login Time</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Login IP</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Join Time</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((client, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="p-3 text-gray-900 font-medium">{client.name}</td>
                      <td className="p-3 text-gray-700">{client.loginId}</td>
                      <td className="p-3 text-blue-600">{client.broker}</td>
                      <td className="p-3 text-gray-600 text-sm">{client.master}</td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-medium">{client.onlyPosition}</span>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="destructive" className="h-8">
                          {client.action}
                        </Button>
                      </td>
                      <td className="p-3 text-gray-600 text-sm">{client.loginTime}</td>
                      <td className="p-3 text-blue-600 text-sm">{client.loginIP}</td>
                      <td className="p-3 text-gray-600">{client.joinTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <span className="text-sm text-gray-600">
                Showing 1 to 2 of 2 entries
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled className="h-9">
                  Previous
                </Button>
                <Button size="sm" className="h-9 bg-gray-900 text-white">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled className="h-9">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal - Using shadcn Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-lg w-[calc(100%-1rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Create New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Email *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`h-12 ${formErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="user@example.com"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Password *</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`h-12 ${formErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter password"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Confirm Password *</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`h-12 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Full Name *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`h-12 ${formErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter full name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </>
  );
};

export default ClientListing;
