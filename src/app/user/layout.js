"use client";
import "../globals.css";
import Sidebar, { SidebarProvider, MobileHeader, useSidebar } from "./components/Sidebar";
import Image from "next/image";

// Inner layout that can use the sidebar context
function LayoutContent({ children }) {
  const { toggleMobile } = useSidebar();

  return (
    <div className="flex flex-col h-screen bg-zinc-100 overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 z-50 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobile}
              className="md:hidden p-2 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/image.png"
                width={40}
                height={40}
                alt="UrbanExchange Logo"
                className="h-10 w-auto rounded-md"
              />
              <span className="text-white font-bold text-xl tracking-tight">UrbanExchange</span>
            </div>
          </div>

          {/* Right side - User profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">RKK</span>
              <span className="text-xs text-zinc-400">qwertyuiop</span>
            </div>
            <Image
              src="/profile.jpg"
              width={40}
              height={40}
              alt="User avatar"
              className="rounded-full border-2 border-zinc-600"
            />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed */}
        <Sidebar />

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UserLayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}