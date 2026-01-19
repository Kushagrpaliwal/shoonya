"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from "./components/Sidebar";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-grayish`}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-row items-center bg-[#2B3F54] w-full">
            <Image
              src="/metro.png"
            width={120}
            height={120}
              alt="trading image"
              className="pt-1"
            />
          <div className="w-full justify-end items-center mt-4 flex flex-row gap-[30px]">
          </div>
          <div className="flex flex-row items-center mt-4">
            <div className="p-2">
              <Image src="/profile.jpg" width={40} height={40} alt="account" className="rounded-full" />
              </div>
            <div className="flex flex-col justify-center items-start ml-2 text-white">
            <div className="font-extraheavy">RKK</div>
            <div className="text-sm">qwertyuiop</div>
            </div>
          </div>
        </div>
        {/* Responsive Sidebar + Content */}
        <div className="flex flex-col md:flex-row w-full min-h-screen overflow-hidden">
          <Sidebar />
          <div className="w-full bg-white overflow-x-auto overflow-y-auto h-screen   md:max-h-screen">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}