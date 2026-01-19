"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const sidebarItems = [
  { name: "Dashboard", path: "/user", icon: "DB" },
  { name: "WatchList", path: "/user/watchlist", icon: "WL" },
  {
    name: "Summary Report",
    path: "/user/summaryreport",
    icon: "SR",
  },
  {
    name: "Trading",
    path: "/user/trading",
    icon: "TR",
    dropdownKey: "trading",
    links: [
      { name: "Trades", path: "/user/trading/option1" },
      { name: "Trash", path: "/user/trading/option3" },
      { name: "Positions", path: "/user/trading/option2" },
    ],
  },
  {
    name: "Users",
    path: "/user/users",
    icon: "US",
    dropdownKey: "users",
    links: [
      { name: "Customer", path: "/user/users/customer" },
      { name: "Master", path: "/user/users/master" },
      { name: "Broker", path: "/user/users/broker" },
    ],
  },
  {
    name: "Accounts",
    path: "/user/accounts",
    icon: "AC",
    dropdownKey: "accounts",
    links: [
      { name: "Ledger Report", path: "/user/accounts/ledgerreport" },
      { name: "Account Option 2", path: "/user/accounts/option2" },
      { name: "Account Option 3", path: "/user/accounts/option3" },
    ],
  },
  {
    name: "Reports",
    path: "/user/reports",
    icon: "RP",
    dropdownKey: "reports",
    links: [
      { name: "Brokrage Report", path: "/user/reports/brokrage" },
      { name: "Report Option 2", path: "/user/reports/option2" },
      { name: "Report Option 3", path: "/user/reports/option3" },
    ],
  },
];

export default function Sidebar() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <div className="bg-darkgrayish text-white p-1 gap-3 z-40 flex flex-row md:flex-col w-full md:w-[20vw] h-auto md:h-screen border-b md:border-b-0 md:border-r border-gray-700">
      {/* Sidebar Navigation */}
      {sidebarItems.map((item, index) => (
        <div key={index}>
          {item.dropdownKey ? (
            <div>
              <div
                className="flex flex-row cursor-pointer hover:bg-gray-700 p-2 rounded"
                onClick={() => toggleDropdown(item.dropdownKey)}
              >
                <div className="w-5 h-5 bg-white text-black mr-2 text-sm flex items-center justify-center font-extraheavy p-4">
                  {item.icon}
                </div>
                <div className="flex justify-center items-center font-semibold">
                  {item.name}
                </div>
              </div>
              {openDropdown === item.dropdownKey && (
                <div className="ml-8 mt-2 flex flex-col">
                  {item.links.map((link, linkIndex) => (
                    <Link key={linkIndex} href={link.path}>
                      <div className="cursor-pointer hover:bg-gray-600 p-2 rounded">
                        {link.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link href={item.path}>
              <div className="flex flex-row cursor-pointer hover:bg-gray-700 p-2 rounded">
                <div className="w-5 h-5 bg-white text-black mr-2 text-sm flex items-center justify-center font-extraheavy p-4">
                  {item.icon}
                </div>
                <div className="flex justify-center items-center font-semibold">
                  {item.name}
                </div>
              </div>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
} 