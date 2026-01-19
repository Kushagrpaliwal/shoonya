"use client";
// Create a context for WebSocket state
import { createContext, useContext, useState, useEffect } from 'react';
import NorenRestApi from "@/app/lib/RestApi";
import { authenticator } from "otplib";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [api, setApi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiInstance = new NorenRestApi({});
    setApi(apiInstance);

    const twoFASecret = process.env.NEXT_PUBLIC_TWOFA;
    const code = authenticator.generate(twoFASecret);

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
        if (res && res.stat !== 'Ok') {
          setError('Login failed. Please check your credentials.');
          return;
        }

        const open = () => {
          console.log('WebSocket connection established.');
          setIsConnected(true);
        };

        const receiveDepth = (data) => {
          setLiveData((prevData) => {
            const existingIndex = prevData.findIndex(item => item.tk === data.tk);
            if (existingIndex > -1) {
              const updatedData = [...prevData];
              updatedData[existingIndex] = { ...updatedData[existingIndex], ...data };
              return updatedData;
            } else {
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
      .catch((err) => {
        setError('Error during login or WebSocket connection.');
      });

    // No cleanup function to keep the connection alive
  }, []);

  const subscribe = (instruments, type = "depth") => {
    if (api && isConnected) {
      api.subscribe(instruments, type);
    }
  };

  const unsubscribe = (instruments, type = "depth") => {
    if (api && isConnected) {
      api.unsubscribe(instruments, type);
    }
  };

  return (
    <WebSocketContext.Provider value={{
      api,
      isConnected,
      liveData,
      error,
      subscribe,
      unsubscribe
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
