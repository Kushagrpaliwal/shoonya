"use client";
import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  FileText,
  TrendingUp,
  Users,
  Wallet,
  BarChart3,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  BarChart2,
  UserCircle,
  Crown,
  Briefcase,
  Receipt,
  Menu,
  X,
  LineChart,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  ClipboardList,
  Calendar,
  Package,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Sidebar context for managing state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Sidebar items configuration
const sidebarItems = [
  {
    name: "Dashboard",
    path: "/user/analytics",
    icon: LayoutDashboard
  },
  {
    name: "WatchList",
    path: "/user/watchlist",
    icon: Eye
  },
  {
    name: "Summary Report",
    path: "/user/summaryreport",
    icon: FileText,
  },
  {
    name: "Trading",
    path: "/user/trading",
    icon: TrendingUp,
    dropdownKey: "trading",
    links: [
      { name: "Trades", path: "/user/trading/option1", icon: BarChart2 },
      { name: "Trash", path: "/user/trading/option3", icon: Trash2 },
    ],
  },
  {
    name: "Accounts",
    path: "/user/accounts",
    icon: Wallet,
    dropdownKey: "accounts",
    links: [
      { name: "Inventory", path: "/user/inventory", icon: Package },
      { name: "Risk Monitor", path: "/user/risk", icon: ShieldAlert },
    ],
  },
  {
    name: "Reports",
    path: "/user/reports",
    icon: BarChart3,
    dropdownKey: "reports",
    links: [
      { name: "Ledger", path: "/user/ledger", icon: ClipboardList },
      { name: "Session Summary", path: "/user/session", icon: Calendar },
    ],
  },
];

// Navigation Item Component
function NavItem({ item, isCollapsed, openDropdown, onToggleDropdown }) {
  const pathname = usePathname();
  const isActive = pathname === item.path || (item.links && item.links.some(link => pathname === link.path));
  const isDropdownOpen = openDropdown === item.dropdownKey;
  const Icon = item.icon;

  if (item.dropdownKey) {
    return (
      <div className="w-full">
        <button
          onClick={() => onToggleDropdown(item.dropdownKey)}
          className={`
            flex items-center w-full gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200 ease-out
            ${isActive
              ? "bg-white/10 text-white"
              : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? item.name : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {/* Dropdown items */}
        {!isCollapsed && isDropdownOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-zinc-600 space-y-1">
            {item.links.map((link, linkIndex) => {
              const LinkIcon = link.icon;
              const isLinkActive = pathname === link.path;
              return (
                <Link key={linkIndex} href={link.path}>
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200 ease-out
                      ${isLinkActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <LinkIcon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{link.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.path}>
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-200 ease-out
          ${isActive
            ? "bg-white/10 text-white"
            : "text-zinc-300 hover:bg-white/5 hover:text-white"
          }
          ${isCollapsed ? "justify-center" : ""}
        `}
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium">{item.name}</span>
        )}
      </div>
    </Link>
  );
}

// Desktop Sidebar Component
function DesktopSidebar({ isCollapsed, onToggleCollapsed, openDropdown, onToggleDropdown }) {
  return (
    <aside
      className={`
        hidden md:flex flex-col
        bg-zinc-800 text-white
        h-full flex-shrink-0
        transition-all duration-300 ease-out
        ${isCollapsed ? "w-[72px]" : "w-[260px]"}
        border-r border-zinc-700
      `}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end p-3 border-b border-zinc-700">
        <button
          onClick={onToggleCollapsed}
          className="p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarItems.map((item, index) => (
          <NavItem
            key={index}
            item={item}
            isCollapsed={isCollapsed}
            openDropdown={openDropdown}
            onToggleDropdown={onToggleDropdown}
          />
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-700">
          <p className="text-xs text-zinc-500 text-center">UrbanExchange v1.0</p>
        </div>
      )}
    </aside>
  );
}

// Mobile Sidebar Component (Sheet)
function MobileSidebar({ isOpen, onOpenChange, openDropdown, onToggleDropdown }) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 bg-zinc-800 border-r border-zinc-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Image
              src="/image.png"
              width={32}
              height={32}
              alt="UrbanExchange Logo"
              className="h-8 w-auto rounded-md"
            />
            <span className="text-white font-bold text-lg">UrbanExchange</span>
          </div>
          <SheetClose asChild>
            <button className="p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </SheetClose>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <NavItem
              key={index}
              item={item}
              isCollapsed={false}
              openDropdown={openDropdown}
              onToggleDropdown={onToggleDropdown}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Mobile Header with Menu Button
export function MobileHeader({ onMenuClick }) {
  return (
    <div className="md:hidden flex items-center gap-3 p-3 bg-zinc-800 border-b border-zinc-700">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <span className="text-white font-semibold">UrbanExchange</span>
    </div>
  );
}

// Sidebar Provider Component
export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleCollapsed = () => setIsCollapsed(prev => !prev);
  const toggleMobile = () => setIsMobileOpen(prev => !prev);
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(prev => prev === dropdown ? null : dropdown);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        openDropdown,
        toggleCollapsed,
        toggleMobile,
        toggleDropdown,
        setIsMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Main Sidebar Export
export default function Sidebar() {
  const {
    isCollapsed,
    isMobileOpen,
    openDropdown,
    toggleCollapsed,
    toggleDropdown,
    setIsMobileOpen,
  } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        onToggleCollapsed={toggleCollapsed}
        openDropdown={openDropdown}
        onToggleDropdown={toggleDropdown}
      />

      {/* Mobile Sidebar (Sheet) */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onOpenChange={setIsMobileOpen}
        openDropdown={openDropdown}
        onToggleDropdown={toggleDropdown}
      />
    </>
  );
}