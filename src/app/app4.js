// Dropdown.js
"use client";
import { useState, useEffect } from "react";
import { authenticator } from "otplib"; 
import NorenRestApi from "./lib/RestApi"; 

const mcxScripts = [
  "GOLD",
  "GOLDM",
  "SILVER",
  "SILVERM",
  "SILVERMIC",
  "ALUMINIUM",
  "CRUDEOIL",
  "LEAD",
  "NATURALGAS",
  "ZINC",
  "COPPER",
  "COTTONOIL",
  "NATGASMINI",
  "STEELREBAR",
  "LEADMINI",
  "MCXMETLDEX",
  "COTTONCNDY",
  "ALUMINI",
  "ZINCMINI",
  "MENTHAOIL",
  "NICKEL",
  "KAPAS",
  "GOLDPETAL",
];

const Dropdown = () => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedScript, setSelectedScript] = useState("");
  const [expiryOptions, setExpiryOptions] = useState([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [watchlist, setWatchlist] = useState([{ exchange: "MCX", token: "433350" }]);
  const [fetchedData, setFetchedData] = useState([]);
  const api = new NorenRestApi({});

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedScript("");
    setExpiryOptions([]);
    setFetchedData([]);
  };

  const handleScriptChange = async (event) => {
    const script = event.target.value;
    setSelectedScript(script);
    if (script) {
      await fetchExpiryOptions(script);
    } else {
      setExpiryOptions([]);
    }
  };

  const fetchExpiryOptions = async (script) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/downloadMCX?script=${script}`
      );
      const data = await response.json();
      setFetchedData(data);

      const expiryList = data
        .filter((item) => item.script === script)
        .map((item) => item.Expiry);
      setExpiryOptions(expiryList);
    } catch (error) {
      console.error("Error fetching expiry options:", error);
    }
  };

  const handleExpiryChange = (event) => {
    setSelectedExpiry(event.target.value);
  };

  const addToWatchlist = () => {
    if (selectedType && selectedScript && selectedExpiry) {
      const selectedData = fetchedData.find(
        (item) =>
          item.script === selectedScript && item.Expiry === selectedExpiry
      );

      if (selectedData) {
        const newWatchlistItem = {
          exchange: selectedData.Exchange,
          token: selectedData.Token,
        };
        setWatchlist([...watchlist, newWatchlistItem]);
        setSelectedType("");
        setSelectedScript("");
        setExpiryOptions([]);
        setSelectedExpiry("");
        setFetchedData([]);
      }
    } else {
      alert("Please select market, script, and expiry before adding to watchlist.");
    }
  };

  return (
    <div>
      <div className="flex flex-row p-10 gap-6">
        <div>
          <label htmlFor="marketDropdown">Market:</label>
          <select id="marketDropdown" onChange={handleTypeChange}>
            <option value="">Select an option</option>
            <option value="option1">INDEX</option>
            <option value="mcx">MCX</option>
          </select>
        </div>
        <div>
          <label htmlFor="scriptDropdown">Script:</label>
          <select id="scriptDropdown" onChange={handleScriptChange}>
            <option value="">Select an option</option>
            {selectedType === "mcx" ? (
              mcxScripts.map((script, index) => (
                <option key={index} value={script}>
                  {script}
                </option>
              ))
            ) : (
              <option value="">No MCX scripts available</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="expiryDropdown">Expiry:</label>
          <select id="expiryDropdown" onChange={handleExpiryChange}>
            <option value="">Select an option</option>
            {expiryOptions.length > 0 ? (
              expiryOptions.map((expiry, index) => (
                <option key={index} value={expiry}>
                  {expiry}
                </option>
              ))
            ) : (
              <option value="">No expiry options available</option>
            )}
          </select>
        </div>
        <div>
          <button
            className="bg-red-500 text-white rounded-lg w-[200px] h-[50px] cursor-pointer"
            onClick={addToWatchlist}
          >
            Add to Watchlist
          </button>
        </div>
      </div>
      <div className="p-10">
        <h3>Watchlist:</h3>
        <ul>
          {watchlist.map((item, index) => (
            <li key={index} className="mr-2">
              {item.exchange} - {item.token}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;