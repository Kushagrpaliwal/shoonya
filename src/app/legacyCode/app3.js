"use client";
import { useState, useEffect } from "react";
import { authenticator } from "otplib";
import NorenRestApi from "../lib/RestApi";

const instruments = [
  { exchange: "MCX", token: "433350" },
  { exchange: "MCX", token: "431876" },
  { exchange: "BSE", token: "1" },
  { exchange: "MCX", token: "442161" },
  { exchange: "MCX", token: "440576" },
];

const LiveData = () => {
  const [liveData, setLiveData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState({}); // Track highlighted cells
  const [api, setApi] = useState(null); // State to hold the API instance

  useEffect(() => {
    const apiInstance = new NorenRestApi({});
    setApi(apiInstance); // Set the API instance in state

    const twoFASecret = process.env.NEXT_PUBLIC_TWOFA;
    const code = authenticator.generate(twoFASecret);
    console.log("Generated 2FA Code:", code);

    const authparams = {
      userid: process.env.NEXT_PUBLIC_USERID,
      password: process.env.NEXT_PUBLIC_PASSWORD,
      twoFA: code,
      vendor_code: process.env.NEXT_PUBLIC_VENDOR_CODE,
      api_secret: process.env.NEXT_PUBLIC_API_SECRET,
      imei: process.env.NEXT_PUBLIC_IMEI,
    };

    apiInstance.login(authparams)
      .then((res) => {
        if (res.stat !== 'Ok') {
          console.error('Login failed:', res);
          setError('Login failed. Please check your credentials.');
          return;
        }

        const open = () => {
          const instrumentsString = instruments.map(inst => `${inst.exchange}|${inst.token}`).join('#');
          apiInstance.subscribe(instrumentsString, "depth");
          console.log("Subscribing to Depth:", instrumentsString);
        };

        const receiveDepth = (data) => {
          console.log("Depth Data Received:", data);
          setLiveData((prevData) => {
            const existingIndex = prevData.findIndex(item => item.tk === data.tk);
            if (existingIndex > -1) {
              // Update existing subscription
              const updatedData = [...prevData];
              updatedData[existingIndex] = { ...updatedData[existingIndex], ...data };
              highlightCell(data.tk, data); // Highlight the updated cells
              return updatedData;
            } else {
              // Add new subscription
              highlightCell(data.tk, data); // Highlight the new cells
              return [...prevData, data];
            }
          });
        };

        const params = {
          socket_open: open,
          depth: receiveDepth,
        };

        return apiInstance.start_websocket(params);
      })
      .then(() => {
        console.log('WebSocket connection established.');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('Error during login or WebSocket connection:', err);
        setError('Error during login or WebSocket connection.');
      });

    return () => {
      if (apiInstance.web_socket) {
        apiInstance.web_socket.close();
      }
    };
  }, []);

  const highlightCell = (token, data) => {
    const updatedCells = [];

    // Check which fields have changed and store their indices
    if (data.lp) updatedCells.push(2); // LTP
    if (data.bp1) updatedCells.push(3); // Best Buy Price 1
    if (data.sp1) updatedCells.push(4); // Best Sell Price 1
    if (data.h) updatedCells.push(5); // High Price
    if (data.l) updatedCells.push(6); // Low Price
    if (data.o) updatedCells.push(7); // Open Price
    if (data.c) updatedCells.push(8); // Close Price

    setHighlightedCells((prev) => ({
      ...prev,
      [token]: updatedCells,
    }));

    // Set a timeout to revert the highlight after 3 seconds
    setTimeout(() => {
      setHighlightedCells((prev) => ({
        ...prev,
        [token]: [],
      }));
    }, 3000);
  };

  const unsubscribeFromWebSocket = () => {
    if (api) {
      const instrumentsString = instruments.map(inst => `${inst.exchange}|${inst.token}`).join('#');
      api.unsubscribe(instrumentsString, "depth");
      console.log("Unsubscribed from Depth:", instrumentsString);
      setIsConnected(false);
    } else {
      console.error("API instance is not defined.");
    }
  };

  return (
    <div>
      <h1>Live Market Data</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {liveData.length > 0 ? (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th>Token</th>
              <th>Symbol Name</th>
              <th>LTP</th>
              <th>Best Buy Price 1</th>
              <th>Best Sell Price 1</th>
              <th>High Price</th>
              <th>Low Price</th>
              <th>Open Price</th>
              <th>Close Price</th>
            </tr>
          </thead>
          <tbody>
            {liveData.map((data, index) => (
              <tr key={index}>
                <td className="py-4 px-9">{data.tk || data.token || "N/A"}</td>
                <td className="py-4 px-9 bg-white">{data.ts || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(2) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.lp || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(3) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.bp1 || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(4) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.sp1 || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(5) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.h || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(6) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.l || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(7) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.o || "N/A"}</td>
                <td className={`py-4 px-9 ${highlightedCells[data.tk]?.includes(8) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>{data.c || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
      <button onClick={unsubscribeFromWebSocket} className="mt-4 bg-red-500 text-white rounded px-4 py-2">
        Unsubscribe
      </button>
    </div>
  );
};

export default LiveData;