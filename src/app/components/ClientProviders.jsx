"use client";
import { WebSocketProvider } from "../lib/WebSocketContext";

export default function ClientProviders({ children }) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
